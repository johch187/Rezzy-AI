"""Resume parsing endpoint."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.deps.agent import get_agent_service
from app.deps.auth import CurrentUser

router = APIRouter(prefix="/api/parse", tags=["parse"])


class ParseRequest(BaseModel):
    text: str


@router.post("/resume")
async def parse_resume(req: ParseRequest, user: CurrentUser):
    """Parse resume text into structured data."""
    try:
        return await get_agent_service().parse_resume(req.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
