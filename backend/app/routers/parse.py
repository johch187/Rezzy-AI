from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.deps.auth import CurrentUser
from app.services.agents import AgentService

router = APIRouter(prefix="/api/parse", tags=["parse"])

# Lazy initialization - only create when needed to avoid startup failures
_agent_service: AgentService | None = None

def get_agent_service() -> AgentService:
    global _agent_service
    if _agent_service is None:
        _agent_service = AgentService()
    return _agent_service


class ParseRequest(BaseModel):
    text: str


@router.post("/resume")
async def parse_resume(req: ParseRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        parsed = await agent_service.parse_resume(req.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return parsed
