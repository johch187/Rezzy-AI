from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from app.deps.auth import CurrentUser
from app.schemas.generation import GenerateDocumentsRequest
from app.services.agents import AgentService
from app.services.supabase import ensure_active_subscription

router = APIRouter(prefix="/api/llm", tags=["llm"])

# Lazy initialization - only create when needed to avoid startup failures
_agent_service: AgentService | None = None

def get_agent_service() -> AgentService:
    global _agent_service
    if _agent_service is None:
        _agent_service = AgentService()
    return _agent_service


@router.post("/generate-documents")
async def generate_documents(req: GenerateDocumentsRequest, user: CurrentUser):
    try:
        await ensure_active_subscription(user["id"])
    except PermissionError:
        raise HTTPException(status_code=402, detail="Subscription required for document generation.")
    try:
        agent_service = get_agent_service()
        result = await agent_service.generate_documents(profile=req.profile.model_dump(), options=req.options.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result


class CareerPathRequest(BaseModel):
    profile: dict
    currentRole: str
    targetRole: str


@router.post("/career-path")
async def career_path(req: CareerPathRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.career_path(req.profile, req.currentRole, req.targetRole)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result


class NetworkingRequest(BaseModel):
    profile: dict
    counterpartInfo: str


@router.post("/networking/brief")
async def networking_brief(req: NetworkingRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.networking_brief(req.profile, req.counterpartInfo)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"text": result}


@router.post("/networking/reach-out")
async def networking_reach_out(req: NetworkingRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.networking_reach_out(req.profile, req.counterpartInfo)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"text": result}


class ApplicationAnalysisRequest(BaseModel):
    resumeText: str
    jobDescription: str


@router.post("/analysis/application-fit")
async def application_fit(req: ApplicationAnalysisRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.analyze_application(req.resumeText, req.jobDescription)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result


class MentorMatchRequest(BaseModel):
    topic: str
    facultyList: str


@router.post("/analysis/mentor-match")
async def mentor_match(req: MentorMatchRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.mentor_match(req.topic, req.facultyList)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result


class NegotiationRequest(BaseModel):
    jobTitle: str
    location: str


@router.post("/analysis/negotiation")
async def negotiation(req: NegotiationRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.negotiation_prep(req.jobTitle, req.location)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result


class InterviewStoryRequest(BaseModel):
    brainDump: str


@router.post("/interview/story")
async def interview_story(req: InterviewStoryRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.interview_story(req.brainDump)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"text": result}


class InterviewQuestionsRequest(BaseModel):
    jobDescription: str


@router.post("/interview/questions")
async def interview_questions(req: InterviewQuestionsRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.interview_questions(req.jobDescription)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result


class ReframeFeedbackRequest(BaseModel):
    feedback: str


@router.post("/interview/reframe")
async def reframe(req: ReframeFeedbackRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.reframe_feedback(req.feedback)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"text": result}


class CareerChatRequest(BaseModel):
    message: str
    profile: dict
    documentHistory: Optional[List[Dict[str, Any]]] = None


@router.post("/career-chat")
async def career_chat(req: CareerChatRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.career_chat(req.message, req.profile, req.documentHistory or [])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return {"text": result}


class VideoRequest(BaseModel):
    targetRole: str
    milestone: dict


@router.post("/career/videos")
async def career_videos(req: VideoRequest, user: CurrentUser):
    try:
        agent_service = get_agent_service()
        result = await agent_service.video_recommendations(req.targetRole, req.milestone)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    return result
