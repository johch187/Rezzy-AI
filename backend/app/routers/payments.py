"""Payment and subscription endpoints using Polar."""

from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

from app.deps.auth import CurrentUser
from app.services.polar import PolarClient, handle_polar_webhook
from app.services.supabase import fetch_subscription_status, get_token_status, deduct_tokens

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CheckoutRequest(BaseModel):
    successUrl: str
    cancelUrl: str
    priceId: Optional[str] = None


@router.post("/checkout")
async def create_checkout(req: CheckoutRequest, user: CurrentUser):
    """Create Polar checkout session."""
    client = PolarClient()
    url = await client.create_checkout_session(
        user_id=user["id"],
        email=user.get("email") or "",
        success_url=req.successUrl,
        cancel_url=req.cancelUrl,
        price_id=req.priceId,
    )
    if not url:
        raise HTTPException(status_code=500, detail="Failed to create checkout.")
    return {"url": url}


@router.get("/status")
async def get_subscription_status(user: CurrentUser):
    """Get user's subscription status."""
    return await fetch_subscription_status(user["id"])


@router.get("/tokens")
async def get_tokens(user: CurrentUser):
    """Get detailed token status including replenishment info."""
    return await get_token_status(user["id"])


@router.post("/webhook")
async def polar_webhook(
    request: Request,
    polar_signature: Optional[str] = Header(default=None, alias="Polar-Signature"),
):
    """Handle Polar webhook events."""
    raw = await request.body()
    try:
        await handle_polar_webhook(raw, polar_signature)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"ok": True}
