from typing import Any, Dict, Optional

import httpx

from app.config import get_settings


EMPTY_WORKSPACE = {"profile": None, "documentHistory": [], "careerChatHistory": [], "tokens": 65}


def _headers():
    settings = get_settings()
    return {
        "apikey": settings.supabase_service_role_key,
        "Authorization": f"Bearer {settings.supabase_service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }


async def fetch_workspace(user_id: str) -> Dict[str, Any]:
    """
    Fetch workspace data (profile, histories, tokens) from the 'workspaces' table.
    """
    settings = get_settings()
    async with httpx.AsyncClient(base_url=str(settings.supabase_url), headers=_headers(), timeout=10) as client:
        resp = await client.get(
            "/rest/v1/workspaces",
            params={"user_id": f"eq.{user_id}", "select": "profile,document_history,career_chat_history,tokens", "limit": 1},
        )

    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list) and data:
            row = data[0]
            return {
                "profile": row.get("profile"),
                "documentHistory": row.get("document_history") or [],
                "careerChatHistory": row.get("career_chat_history") or [],
                "tokens": row.get("tokens", 65),
            }
        return EMPTY_WORKSPACE

    # Non-200: return empty workspace but log upstream if desired
    return EMPTY_WORKSPACE


async def persist_workspace(
    user_id: str,
    profile: Optional[dict],
    document_history: Optional[list],
    career_chat_history: Optional[list],
    tokens: Optional[int],
) -> None:
    """
    Upsert workspace data into the 'workspaces' table (PK: user_id).
    """
    settings = get_settings()
    payload = {
        "user_id": user_id,
        "profile": profile,
        "document_history": document_history,
        "career_chat_history": career_chat_history,
        "tokens": tokens,
        "updated_at": "now()",
    }

    async with httpx.AsyncClient(base_url=str(settings.supabase_url), headers=_headers(), timeout=10) as client:
        resp = await client.post("/rest/v1/workspaces", params={"on_conflict": "user_id"}, json=payload)
    resp.raise_for_status()
