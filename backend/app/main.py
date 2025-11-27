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

    if frontend_dir and frontend_dir.exists():
        assets_dir = frontend_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        candidate = frontend_dir / "index.html"
        if candidate.exists():
            index_file = candidate

    if index_file:
        @app.get("/")
        async def serve_root():
            return FileResponse(index_file)

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            if full_path.startswith(("api/", "healthz", "readyz", "assets/")):
                raise HTTPException(status_code=404, detail="Not found")
            return FileResponse(index_file)

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
