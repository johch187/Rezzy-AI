"""Workspace persistence endpoints."""

from fastapi import APIRouter, HTTPException

from app.deps.auth import CurrentUser
from app.services.supabase import fetch_workspace, persist_workspace

router = APIRouter(prefix="/api/workspace", tags=["workspace"])


@router.get("")
async def get_workspace(user: CurrentUser):
    """Fetch user's workspace data."""
    return await fetch_workspace(user["id"])


@router.post("")
async def save_workspace(payload: dict, user: CurrentUser):
    """Save user's workspace data."""
    try:
        await persist_workspace(
            user_id=user["id"],
            profile=payload.get("profile"),
            document_history=payload.get("documentHistory"),
            career_chat_history=payload.get("careerChatHistory"),
            tokens=payload.get("tokens"),
        )
        return {"ok": True}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
