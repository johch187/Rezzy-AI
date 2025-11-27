"""Supabase service for workspace and subscription management."""

from typing import Any, Dict, Optional

import httpx

from app.config import get_settings

# Default values
EMPTY_WORKSPACE = {
    "profile": None,
    "documentHistory": [],
    "careerChatHistory": [],
    "tokens": 50,
}
FREE_PLAN_TOKENS = 50
PAID_PLAN_TOKENS = 200
MAX_ROLLOVER_TOKENS = 200  # Max tokens that can roll over (1 month worth)


def _headers() -> Dict[str, str]:
    """Get headers for Supabase admin API calls using service role."""
    settings = get_settings()
    # Service role uses the secret key as Bearer token
    return {
        "apikey": settings.supabase_secret_key,
        "Authorization": f"Bearer {settings.supabase_secret_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal,resolution=merge-duplicates",
    }


async def fetch_workspace(user_id: str, check_replenish: bool = True) -> Dict[str, Any]:
    """Fetch user's workspace data. Optionally checks for token replenishment."""
    settings = get_settings()
    
    # First, try to replenish tokens if 30 days have passed
    if check_replenish:
        await replenish_tokens_if_due(user_id)

    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=10,
    ) as client:
        resp = await client.get(
            "/rest/v1/workspaces",
            params={
                "user_id": f"eq.{user_id}",
                "select": "profile,document_history,career_chat_history,tokens,tokens_replenished_at,rolled_over_tokens",
                "limit": 1,
            },
        )

    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list) and data:
            row = data[0]
            return {
                "profile": row.get("profile"),
                "documentHistory": row.get("document_history") or [],
                "careerChatHistory": row.get("career_chat_history") or [],
                "tokens": row.get("tokens", FREE_PLAN_TOKENS),
                "tokensReplenishedAt": row.get("tokens_replenished_at"),
                "rolledOverTokens": row.get("rolled_over_tokens", 0),
            }

    return EMPTY_WORKSPACE.copy()


async def persist_workspace(
    user_id: str,
    profile: Optional[dict],
    document_history: Optional[list],
    career_chat_history: Optional[list],
    tokens: Optional[int],
) -> None:
    """Upsert user's workspace data."""
    settings = get_settings()
    
    # Build payload only with provided values
    payload: Dict[str, Any] = {"user_id": user_id}
    
    if profile is not None:
        payload["profile"] = profile
    if document_history is not None:
        payload["document_history"] = document_history
    if career_chat_history is not None:
        payload["career_chat_history"] = career_chat_history
    if tokens is not None:
        payload["tokens"] = tokens

    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=15,
    ) as client:
        resp = await client.post(
            "/rest/v1/workspaces",
            params={"on_conflict": "user_id"},
            json=payload,
        )
    
    if resp.status_code >= 400:
        raise Exception(f"Failed to save workspace: {resp.text}")
    resp.raise_for_status()


async def upsert_subscription_status(
    user_id: str,
    status: str,
    plan: Optional[str],
    current_period_end: Optional[str],
    polar_customer_id: Optional[str],
    polar_subscription_id: Optional[str],
) -> None:
    """Upsert user's subscription status."""
    settings = get_settings()
    
    payload: Dict[str, Any] = {
        "user_id": user_id,
        "status": status,
    }
    
    if plan is not None:
        payload["plan"] = plan
    if current_period_end is not None:
        payload["current_period_end"] = current_period_end
    if polar_customer_id is not None:
        payload["polar_customer_id"] = polar_customer_id
    if polar_subscription_id is not None:
        payload["polar_subscription_id"] = polar_subscription_id

    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=15,
    ) as client:
        resp = await client.post(
            "/rest/v1/subscriptions",
            params={"on_conflict": "user_id"},
            json=payload,
        )
    
    if resp.status_code >= 400:
        raise Exception(f"Failed to save subscription: {resp.text}")
    resp.raise_for_status()


async def fetch_subscription_status(user_id: str) -> Dict[str, Any]:
    """Fetch user's subscription status."""
    settings = get_settings()

    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=10,
    ) as client:
        resp = await client.get(
            "/rest/v1/subscriptions",
            params={
                "user_id": f"eq.{user_id}",
                "select": "status,plan,current_period_end",
                "limit": 1,
            },
        )

    if resp.status_code != 200:
        return {"status": "free", "plan": "free", "tokens": FREE_PLAN_TOKENS}

    data = resp.json()
    if isinstance(data, list) and data:
        row = data[0]
        status = row.get("status") or "free"
        plan = row.get("plan") or "free"
        tokens = PAID_PLAN_TOKENS if status == "active" else FREE_PLAN_TOKENS
        return {
            "status": status,
            "plan": plan,
            "tokens": tokens,
            "current_period_end": row.get("current_period_end"),
        }

    return {"status": "free", "plan": "free", "tokens": FREE_PLAN_TOKENS}


async def ensure_active_subscription(user_id: str) -> Dict[str, Any]:
    """Verify user has active subscription."""
    sub = await fetch_subscription_status(user_id)
    if sub.get("status") != "active":
        raise PermissionError("Subscription inactive.")
    return sub


async def replenish_tokens_if_due(user_id: str) -> Dict[str, Any]:
    """
    Check if 30 days have passed since last replenishment and replenish tokens.
    Allows roll-over of up to 1 month worth of unused tokens.
    
    Returns dict with new_tokens and was_replenished.
    """
    settings = get_settings()
    
    # Call the database function to handle replenishment
    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=10,
    ) as client:
        resp = await client.post(
            "/rest/v1/rpc/replenish_user_tokens",
            json={"p_user_id": user_id},
        )
    
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list) and data:
            row = data[0]
            return {
                "newTokens": row.get("new_tokens", FREE_PLAN_TOKENS),
                "wasReplenished": row.get("was_replenished", False),
            }
    
    return {"newTokens": FREE_PLAN_TOKENS, "wasReplenished": False}


async def deduct_tokens(user_id: str, amount: int) -> Dict[str, Any]:
    """
    Deduct tokens from user's balance.
    
    Returns dict with success, remaining_tokens, and error_message.
    """
    settings = get_settings()
    
    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=10,
    ) as client:
        resp = await client.post(
            "/rest/v1/rpc/deduct_tokens",
            json={"p_user_id": user_id, "p_amount": amount},
        )
    
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, list) and data:
            row = data[0]
            return {
                "success": row.get("success", False),
                "remainingTokens": row.get("remaining_tokens", 0),
                "errorMessage": row.get("error_message"),
            }
    
    return {"success": False, "remainingTokens": 0, "errorMessage": "Failed to deduct tokens"}


async def get_token_status(user_id: str) -> Dict[str, Any]:
    """
    Get detailed token status for a user including subscription info.
    """
    settings = get_settings()
    
    async with httpx.AsyncClient(
        base_url=str(settings.supabase_url),
        headers=_headers(),
        timeout=10,
    ) as client:
        # Get workspace data
        workspace_resp = await client.get(
            "/rest/v1/workspaces",
            params={
                "user_id": f"eq.{user_id}",
                "select": "tokens,tokens_replenished_at,rolled_over_tokens",
                "limit": 1,
            },
        )
        
        # Get subscription data
        sub_resp = await client.get(
            "/rest/v1/subscriptions",
            params={
                "user_id": f"eq.{user_id}",
                "select": "status,plan,current_period_end",
                "limit": 1,
            },
        )
    
    result = {
        "tokens": FREE_PLAN_TOKENS,
        "tokensReplenishedAt": None,
        "rolledOverTokens": 0,
        "subscriptionStatus": "free",
        "plan": "free",
        "baseTokens": FREE_PLAN_TOKENS,
        "maxRollover": FREE_PLAN_TOKENS,
    }
    
    if workspace_resp.status_code == 200:
        data = workspace_resp.json()
        if isinstance(data, list) and data:
            row = data[0]
            result["tokens"] = row.get("tokens", FREE_PLAN_TOKENS)
            result["tokensReplenishedAt"] = row.get("tokens_replenished_at")
            result["rolledOverTokens"] = row.get("rolled_over_tokens", 0)
    
    if sub_resp.status_code == 200:
        data = sub_resp.json()
        if isinstance(data, list) and data:
            row = data[0]
            status = row.get("status", "free")
            result["subscriptionStatus"] = status
            result["plan"] = row.get("plan", "free")
            if status == "active":
                result["baseTokens"] = PAID_PLAN_TOKENS
                result["maxRollover"] = MAX_ROLLOVER_TOKENS
    
    return result
