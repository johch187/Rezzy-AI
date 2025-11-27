"""FastAPI application entry point."""

import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import get_settings

# Import routers
try:
    from app.routers import analytics, health, latex, llm, parse, payments, workspace
    ROUTERS_LOADED = True
except Exception as e:
    print(f"⚠ Router import failed: {e}", file=sys.stderr)
    try:
        from app.routers import health
    except Exception:
        health = None
    analytics = latex = llm = parse = payments = workspace = None
    ROUTERS_LOADED = False


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    try:
        settings = get_settings()
    except Exception as e:
        print(f"ERROR: Configuration failed: {e}", file=sys.stderr)
        raise

    app = FastAPI(title="Keju API", version="1.0.0")

    # CORS middleware
    if settings.allowed_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.allowed_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # CSP middleware
    if settings.csp_policy:
        @app.middleware("http")
        async def add_csp_header(request: Request, call_next):
            response: Response = await call_next(request)
            response.headers["Content-Security-Policy"] = settings.csp_policy
            return response

    # Register routers
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

    # Frontend serving (optional)
    frontend_dir = Path(settings.frontend_dist_dir) if settings.frontend_dist_dir else None
    index_file = None

    print(f"Frontend config: frontend_dist_dir={settings.frontend_dist_dir}", file=sys.stderr)
    
    if frontend_dir:
        print(f"Frontend directory: {frontend_dir}, exists={frontend_dir.exists()}", file=sys.stderr)
        if frontend_dir.exists():
            # List contents for debugging
            try:
                contents = list(frontend_dir.iterdir())
                print(f"Frontend contents: {[c.name for c in contents]}", file=sys.stderr)
            except Exception as e:
                print(f"Error listing frontend dir: {e}", file=sys.stderr)
            
            assets_dir = frontend_dir / "assets"
            if assets_dir.exists():
                app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
                print("✓ Mounted /assets", file=sys.stderr)

            candidate = frontend_dir / "index.html"
            if candidate.exists():
                index_file = candidate
                print(f"✓ Found index.html at {candidate}", file=sys.stderr)
            else:
                print(f"✗ index.html not found at {candidate}", file=sys.stderr)
    else:
        print("Frontend directory not configured", file=sys.stderr)

    if index_file:
        @app.get("/")
        async def serve_root():
            return FileResponse(index_file)

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # Skip API routes
            if full_path.startswith(("api/", "healthz", "readyz", "assets/")):
                raise HTTPException(status_code=404, detail="Not found")
            return FileResponse(index_file)
        
        print("✓ Frontend routes registered", file=sys.stderr)
    else:
        print("✗ Frontend serving disabled (no index.html found)", file=sys.stderr)
        
        # Add a helpful root route when frontend is not available
        @app.get("/")
        async def root_no_frontend():
            return {
                "status": "ok",
                "message": "Keju API is running. Frontend not configured.",
                "docs": "/docs",
                "health": "/healthz"
            }

    return app


# Create application instance
try:
    app = create_app()
except Exception as e:
    print(f"CRITICAL: App creation failed: {e}", file=sys.stderr)
    # Minimal fallback for health checks
    app = FastAPI(title="Keju API (Error)", version="1.0.0")

    @app.get("/healthz")
    async def healthcheck_error():
        return {"status": "error", "message": "App failed to initialize."}

    @app.get("/readyz")
    async def readiness_error():
        return {"status": "not_ready"}
