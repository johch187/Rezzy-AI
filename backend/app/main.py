from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import health, llm, parse, workspace


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

    app.include_router(health.router)
    app.include_router(workspace.router)
    app.include_router(llm.router)
    app.include_router(parse.router)

    return app


app = create_app()
