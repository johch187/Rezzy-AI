"""LLM-powered endpoints for document generation and career assistance."""

from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.deps.agent import get_agent_service
from app.deps.auth import CurrentUser
from app.schemas.generation import GenerateDocumentsRequest
from app.services.supabase import ensure_active_subscription

router = APIRouter(prefix="/api/llm", tags=["llm"])


# ============================================================================
# Request Models
# ============================================================================

class CareerPathRequest(BaseModel):
    profile: dict
    currentRole: str
    targetRole: str


class NetworkingRequest(BaseModel):
    profile: dict
    counterpartInfo: str


class ApplicationAnalysisRequest(BaseModel):
    resumeText: str
    jobDescription: str


class MentorMatchRequest(BaseModel):
    topic: str
    facultyList: str


class NegotiationRequest(BaseModel):
    jobTitle: str
    location: str


class InterviewStoryRequest(BaseModel):
    brainDump: str


class InterviewQuestionsRequest(BaseModel):
    jobDescription: str


class ReframeFeedbackRequest(BaseModel):
    feedback: str


class CareerChatRequest(BaseModel):
    message: str
    profile: dict
    documentHistory: Optional[List[Dict[str, Any]]] = None


class VideoRequest(BaseModel):
    targetRole: str
    milestone: dict


# ============================================================================
# Endpoints
# ============================================================================

@router.post("/generate-documents")
async def generate_documents(req: GenerateDocumentsRequest, user: CurrentUser):
    """Generate tailored resume and cover letter."""
    try:
        await ensure_active_subscription(user["id"])
    except PermissionError:
        raise HTTPException(status_code=402, detail="Subscription required.")
    
    try:
        return await get_agent_service().generate_documents(
            profile=req.profile.model_dump(),
            options=req.options.model_dump(),
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/career-path")
async def career_path(req: CareerPathRequest, user: CurrentUser):
    """Build career path from current to target role."""
    try:
        return await get_agent_service().career_path(
            req.profile, req.currentRole, req.targetRole
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/networking/brief")
async def networking_brief(req: NetworkingRequest, user: CurrentUser):
    """Generate networking coffee chat brief."""
    try:
        result = await get_agent_service().networking_brief(
            req.profile, req.counterpartInfo
        )
        return {"text": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/networking/reach-out")
async def networking_reach_out(req: NetworkingRequest, user: CurrentUser):
    """Draft personalized outreach message."""
    try:
        result = await get_agent_service().networking_reach_out(
            req.profile, req.counterpartInfo
        )
        return {"text": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/analysis/application-fit")
async def application_fit(req: ApplicationAnalysisRequest, user: CurrentUser):
    """Analyze resume fit for job description."""
    try:
        return await get_agent_service().analyze_application(
            req.resumeText, req.jobDescription
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/analysis/mentor-match")
async def mentor_match(req: MentorMatchRequest, user: CurrentUser):
    """Match thesis topic to faculty mentors."""
    try:
        return await get_agent_service().mentor_match(req.topic, req.facultyList)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/analysis/negotiation")
async def negotiation(req: NegotiationRequest, user: CurrentUser):
    """Prepare salary negotiation info."""
    try:
        return await get_agent_service().negotiation_prep(req.jobTitle, req.location)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/interview/story")
async def interview_story(req: InterviewStoryRequest, user: CurrentUser):
    """Refine story into STAR format."""
    try:
        result = await get_agent_service().interview_story(req.brainDump)
        return {"text": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/interview/questions")
async def interview_questions(req: InterviewQuestionsRequest, user: CurrentUser):
    """Generate likely interview questions."""
    try:
        return await get_agent_service().interview_questions(req.jobDescription)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/interview/reframe")
async def reframe(req: ReframeFeedbackRequest, user: CurrentUser):
    """Reframe feedback into growth plan."""
    try:
        result = await get_agent_service().reframe_feedback(req.feedback)
        return {"text": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/career-chat")
async def career_chat(req: CareerChatRequest, user: CurrentUser):
    """Career coaching chat."""
    try:
        result = await get_agent_service().career_chat(
            req.message, req.profile, req.documentHistory
        )
        return {"text": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/career/videos")
async def career_videos(req: VideoRequest, user: CurrentUser):
    """Get video recommendations for career milestone."""
    try:
        return await get_agent_service().video_recommendations(
            req.targetRole, req.milestone
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
