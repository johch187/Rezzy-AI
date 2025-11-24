from typing import Any, Dict, Optional

import httpx

from app.config import get_settings


EMPTY_WORKSPACE = {"profile": None, "documentHistory": [], "careerChatHistory": [], "tokens": 65}
FREE_PLAN_TOKENS = 10
PAID_PLAN_TOKENS = 200


def _headers():
    """
    Returns headers for Supabase admin API calls.
    Uses new secret key format (sb_secret_...) for admin operations.
    """
    settings = get_settings()
    return {
        "apikey": settings.supabase_secret_key,  # Secret key (sb_secret_...)
        "Authorization": f"Bearer {settings.supabase_secret_key}",  # Secret key for authorization
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


async def upsert_subscription_status(
    user_id: str,
    status: str,
    plan: Optional[str],
    current_period_end: Optional[str],
    polar_customer_id: Optional[str],
    polar_subscription_id: Optional[str],
) -> None:
    settings = get_settings()
    payload = {
        "user_id": user_id,
        "status": status,
        "plan": plan,
        "current_period_end": current_period_end,
        "polar_customer_id": polar_customer_id,
        "polar_subscription_id": polar_subscription_id,
        "updated_at": "now()",
    }
    async with httpx.AsyncClient(base_url=str(settings.supabase_url), headers=_headers(), timeout=10) as client:
        resp = await client.post("/rest/v1/subscriptions", params={"on_conflict": "user_id"}, json=payload)
    resp.raise_for_status()


async def fetch_subscription_status(user_id: str) -> Dict[str, Any]:
    settings = get_settings()
    async with httpx.AsyncClient(base_url=str(settings.supabase_url), headers=_headers(), timeout=10) as client:
        resp = await client.get(
            "/rest/v1/subscriptions",
            params={"user_id": f"eq.{user_id}", "select": "status,plan,current_period_end", "limit": 1},
        )
    if resp.status_code != 200:
        return {"status": "free", "plan": "free", "tokens": FREE_PLAN_TOKENS}
    data = resp.json()
    if isinstance(data, list) and data:
        row = data[0]
        status = row.get("status") or "free"
        plan = row.get("plan") or "free"
        tokens = PAID_PLAN_TOKENS if status == "active" else FREE_PLAN_TOKENS
        return {"status": status, "plan": plan, "tokens": tokens, "current_period_end": row.get("current_period_end")}
    return {"status": "free", "plan": "free", "tokens": FREE_PLAN_TOKENS}


async def ensure_active_subscription(user_id: str) -> Dict[str, Any]:
    sub = await fetch_subscription_status(user_id)
    if sub.get("status") != "active":
        raise PermissionError("Subscription inactive or missing.")
    return sub
