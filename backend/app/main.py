from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.routers import analytics, health, latex, llm, parse, payments, workspace


def create_app() -> FastAPI:
    settings = get_settings()
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
        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            if full_path.startswith("api/"):
                raise HTTPException(status_code=404, detail="Not found")
            return FileResponse(index_file)

    return app


app = create_app()
