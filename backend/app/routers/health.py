from fastapi import APIRouter

router = APIRouter()


@router.get("/healthz")
async def healthcheck():
    return {"status": "ok"}


@router.get("/readyz")
async def readiness():
    return {"status": "ready"}
