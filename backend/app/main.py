import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import analytics, health, latex, llm, parse, payments, workspace


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

    app.include_router(health.router)
    app.include_router(workspace.router)
    app.include_router(llm.router)
    app.include_router(parse.router)
    app.include_router(latex.router)
    app.include_router(analytics.router)
    app.include_router(payments.router)

    frontend_dir = Path(settings.frontend_dist_dir) if settings.frontend_dist_dir else None
    index_file: Path | None = None
    if frontend_dir and frontend_dir.exists():
        assets_dir = frontend_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        candidate_index = frontend_dir / "index.html"
        if candidate_index.exists():
            index_file = candidate_index

    if index_file:
        @app.get("/")
        async def serve_root():
            return FileResponse(index_file)
        
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # Don't serve frontend for API routes or health check routes
            if full_path.startswith("api/") or full_path in ["healthz", "readyz"]:
                raise HTTPException(status_code=404, detail="Not found")
            return FileResponse(index_file)

    return app


app = create_app()
