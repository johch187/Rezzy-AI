"""Health check endpoints for Cloud Run."""

from fastapi import APIRouter

from app.config import get_settings

router = APIRouter(tags=["health"])


@router.get("/healthz")
async def healthcheck():
    """Liveness probe - container is running."""
    return {"status": "ok"}


@router.get("/readyz")
async def readiness():
    """Readiness probe - app is ready to serve traffic."""
    try:
        settings = get_settings()
        return {
            "status": "ready",
            "checks": {
                "supabase": bool(settings.supabase_url and settings.supabase_secret_key),
                "gcp_project": bool(settings.gcp_project_id),
                "llm": bool(settings.gcp_project_id or settings.gemini_api_key),
            },
        }
    except Exception as e:
        return {
            "status": "not_ready",
            "error": str(e),
        }
