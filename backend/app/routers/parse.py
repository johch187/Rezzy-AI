from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.deps.auth import CurrentUser
from app.services.agents import AgentService

router = APIRouter(prefix="/api/parse", tags=["parse"])
agent_service = AgentService()


class ParseRequest(BaseModel):
    text: str


@router.post("/resume")
async def parse_resume(req: ParseRequest, user: CurrentUser):
    try:
        parsed = await agent_service.parse_resume(req.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return parsed
