import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import get_settings

# Import routers defensively - if one fails, we can still start with others
try:
    from app.routers import analytics, health, latex, llm, parse, payments, workspace
    _routers_loaded = True
except Exception as e:
    print(f"⚠ Warning: Failed to import some routers: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    # Import what we can
    try:
        from app.routers import health
    except:
        health = None
    analytics = latex = llm = parse = payments = workspace = None
    _routers_loaded = False


def create_app() -> FastAPI:
    try:
        settings = get_settings()
    except Exception as e:
        # Log configuration errors clearly before crashing
        error_msg = str(e)
        print(f"ERROR: Failed to load application settings: {error_msg}", file=sys.stderr)
        print("\n" + "="*80, file=sys.stderr)
        print("CONFIGURATION ERROR - Required Environment Variables:", file=sys.stderr)
        print("="*80, file=sys.stderr)
        if "supabase_secret_key" in error_msg.lower() or "sb_secret_" in error_msg.lower():
            print("\n❌ SUPABASE_SECRET_KEY is missing or invalid!", file=sys.stderr)
            print("   Required format: sb_secret_...", file=sys.stderr)
            print("   Get it from: Supabase Dashboard → Project Settings → API → Secret Keys", file=sys.stderr)
            print("   Update your GitHub secret: SUPABASE_SECRET_KEY", file=sys.stderr)
        elif "supabase_publishable_key" in error_msg.lower() or "sb_publishable_" in error_msg.lower():
            print("\n❌ SUPABASE_PUBLISHABLE_KEY is invalid!", file=sys.stderr)
            print("   Required format: sb_publishable_...", file=sys.stderr)
            print("   Get it from: Supabase Dashboard → Project Settings → API → Publishable Keys", file=sys.stderr)
        elif "supabase_url" in error_msg.lower():
            print("\n❌ SUPABASE_URL is missing or invalid!", file=sys.stderr)
            print("   Format: https://your-project.supabase.co", file=sys.stderr)
        elif "allowed_origins" in error_msg.lower():
            print("\n❌ ALLOWED_ORIGINS is invalid!", file=sys.stderr)
            print("   Supported formats:", file=sys.stderr)
            print("   - JSON: [\"https://example.com\",\"https://another.com\"]", file=sys.stderr)
            print("   - Comma-separated: https://example.com,https://another.com", file=sys.stderr)
            print("   - Single value: https://example.com", file=sys.stderr)
            print("   - Empty (no CORS): leave unset or set to empty string", file=sys.stderr)
        print("\n" + "="*80, file=sys.stderr)
        raise
    app = FastAPI(title="Keju API", version="0.1.0")

    if settings.allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    if settings.csp_policy:
        @app.middleware("http")
        async def add_csp_header(request: Request, call_next):
            response: Response = await call_next(request)
            response.headers["Content-Security-Policy"] = settings.csp_policy
            return response

    # Include routers - health check should always be available
    if health:
        app.include_router(health.router)
    if workspace:
        app.include_router(workspace.router)
    if llm:
        app.include_router(llm.router)
    if parse:
        app.include_router(parse.router)
    if latex:
        app.include_router(latex.router)
    if analytics:
        app.include_router(analytics.router)
    if payments:
        app.include_router(payments.router)
    
    if not _routers_loaded:
        print("⚠ Warning: Some routers failed to load. Application may have limited functionality.", file=sys.stderr)

    frontend_dir = Path(settings.frontend_dist_dir) if settings.frontend_dist_dir else None
    index_file: Path | None = None
    assets_mounted = False
    
    if frontend_dir and frontend_dir.exists():
        assets_dir = frontend_dir / "assets"
        if assets_dir.exists():
            try:
                app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
                assets_mounted = True
                print(f"✓ Mounted assets directory: {assets_dir}", file=sys.stderr)
            except Exception as e:
                print(f"⚠ Warning: Failed to mount assets directory: {e}", file=sys.stderr)
        else:
            print(f"⚠ Warning: Assets directory not found: {assets_dir}", file=sys.stderr)
        
        candidate_index = frontend_dir / "index.html"
        if candidate_index.exists():
            index_file = candidate_index
            print(f"✓ Found index.html: {candidate_index}", file=sys.stderr)
        else:
            print(f"⚠ Warning: index.html not found: {candidate_index}", file=sys.stderr)
    else:
        print(f"⚠ Warning: Frontend directory not configured or doesn't exist: {frontend_dir}", file=sys.stderr)

    if index_file:
        @app.get("/")
        async def serve_root():
            return FileResponse(index_file)
        
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str, request: Request):
            # Don't serve frontend for API routes, assets (if mounted), or health check routes
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="Not found")
            if full_path in ["healthz", "readyz"]:
                raise HTTPException(status_code=404, detail="Not found")
            # If assets are mounted, they'll be handled by the mount; otherwise let it fall through
            if assets_mounted and full_path.startswith("assets/"):
                raise HTTPException(status_code=404, detail="Asset not found")
            return FileResponse(index_file)

    return app


# Create app instance - wrap in try-except to ensure we can at least start and show errors
try:
    app = create_app()
    print("✓ Application initialized successfully", file=sys.stderr)
except Exception as e:
    print(f"✗ CRITICAL: Failed to create application: {e}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    # Create a minimal app that at least responds to health checks
    app = FastAPI(title="Keju API (Error State)", version="0.1.0")
    
    @app.get("/healthz")
    async def healthcheck_error():
        return {"status": "error", "message": "Application failed to initialize. Check logs."}
    
    @app.get("/readyz")
    async def readiness_error():
        return {"status": "not_ready", "message": "Application failed to initialize. Check logs."}
    
    @app.get("/{full_path:path}")
    async def error_handler():
        return {"error": "Application initialization failed. Check Cloud Run logs for details."}
