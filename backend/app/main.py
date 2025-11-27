"""FastAPI application entry point."""

import os
import sys
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
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


def find_frontend_dir() -> Optional[Path]:
    """Find the frontend directory, trying multiple locations."""
    # Check environment variable first (both names for compatibility)
    env_path = os.environ.get("FRONTEND_DIST_DIR") or os.environ.get("FRONTEND_DIST")
    
    # Try paths in order of preference
    candidates = []
    
    if env_path:
        candidates.append(Path(env_path))
    
    # Common locations
    candidates.extend([
        Path("/app/frontend"),
        Path("/app/dist"),
        Path("../dist"),
        Path("../../dist"),
        Path("../frontend"),
    ])
    
    for candidate in candidates:
        if candidate.exists() and (candidate / "index.html").exists():
            print(f"✓ Found frontend at: {candidate}", file=sys.stderr)
            return candidate
        else:
            print(f"  Checked {candidate}: exists={candidate.exists()}", file=sys.stderr)
    
    return None


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

    # Register API routers FIRST (before catch-all)
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

    # Frontend serving
    print(f"Environment FRONTEND_DIST_DIR: {os.environ.get('FRONTEND_DIST_DIR', 'not set')}", file=sys.stderr)
    print(f"Settings frontend_dist_dir: {settings.frontend_dist_dir}", file=sys.stderr)
    
    frontend_dir = find_frontend_dir()
    
    if frontend_dir:
        index_file = frontend_dir / "index.html"
        
        # Mount static assets
        assets_dir = frontend_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
            print(f"✓ Mounted /assets from {assets_dir}", file=sys.stderr)
        
        # Serve index.html for root
        @app.get("/")
        async def serve_root():
            return FileResponse(str(index_file))
        
        # SPA catch-all - serve index.html for any non-API route
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            # Don't catch API routes
            if full_path.startswith(("api/", "healthz", "readyz", "assets/")):
                raise HTTPException(status_code=404, detail="Not found")
            
            # Check if it's a static file request
            static_file = frontend_dir / full_path
            if static_file.exists() and static_file.is_file():
                return FileResponse(str(static_file))
            
            # Otherwise serve index.html for SPA routing
            return FileResponse(str(index_file))
        
        print(f"✓ Frontend serving enabled from {frontend_dir}", file=sys.stderr)
    else:
        print("✗ No frontend directory found - API-only mode", file=sys.stderr)
        
        # Root endpoint for API-only mode
        @app.get("/")
        async def api_root():
            return JSONResponse({
                "name": "Keju API",
                "version": "1.0.0",
                "status": "running",
                "frontend": "not configured",
                "endpoints": {
                    "docs": "/docs",
                    "health": "/healthz",
                    "ready": "/readyz"
                }
            })

    return app


# Create application instance
_init_error: Optional[str] = None

try:
    app = create_app()
    print("✓ Application created successfully", file=sys.stderr)
except Exception as e:
    _init_error = str(e)
    print(f"CRITICAL: App creation failed: {_init_error}", file=sys.stderr)
    # Minimal fallback for health checks
    app = FastAPI(title="Keju API (Error)", version="1.0.0")

    @app.get("/healthz")
    async def healthcheck_error():
        return {"status": "error", "message": "App failed to initialize."}

    @app.get("/readyz")
    async def readiness_error():
        return {"status": "not_ready"}
    
    @app.get("/")
    async def root_error():
        return JSONResponse({
            "status": "error",
            "message": "Application failed to initialize",
            "error": _init_error
        }, status_code=500)
