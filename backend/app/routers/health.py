from fastapi import APIRouter
from app.config import get_settings

router = APIRouter()


@router.get("/healthz")
async def healthcheck():
    """Liveness probe - indicates the container is running."""
    return {"status": "ok"}


@router.get("/readyz")
async def readiness():
    """Readiness probe - indicates the app is ready to serve traffic."""
    try:
        settings = get_settings()
        checks = {
            "status": "ready",
            "checks": {
                "supabase_configured": bool(settings.supabase_url and settings.supabase_secret_key),
                "gcp_project_id": bool(settings.gcp_project_id),
                "llm_configured": bool(settings.gcp_project_id or settings.gemini_api_key),
            }
        }
        return checks
    except Exception as e:
        return {
            "status": "not_ready",
            "error": str(e),
            "checks": {
                "configuration": False
            }
        }
