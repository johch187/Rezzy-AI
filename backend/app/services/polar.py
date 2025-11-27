"""Polar payment integration service."""

import hmac
import json
from hashlib import sha256
from typing import Optional

import httpx

from app.config import get_settings
from app.services.supabase import upsert_subscription_status


class PolarClient:
    """Client for Polar payment API."""

    def __init__(self) -> None:
        self.settings = get_settings()
        if not self.settings.polar_api_key:
            raise RuntimeError("Polar API key not configured.")
        self.base_url = "https://api.polar.sh/v1"
        self.headers = {
            "Authorization": f"Bearer {self.settings.polar_api_key}",
            "Content-Type": "application/json",
        }

    async def create_checkout_session(
        self,
        user_id: str,
        email: str,
        success_url: str,
        cancel_url: str,
        price_id: Optional[str] = None,
    ) -> str:
        """Create a Polar checkout session."""
        pid = price_id or self.settings.polar_product_price_id
        if not pid:
            raise RuntimeError("Polar price ID not configured.")

        payload = {
            "customer_email": email,
            "product_price_id": pid,
            "success_url": success_url,
            "cancel_url": cancel_url,
            "metadata": {"user_id": user_id},
        }

        async with httpx.AsyncClient(
            base_url=self.base_url,
            headers=self.headers,
            timeout=15,
        ) as client:
            resp = await client.post("/checkouts/", json=payload)

        if resp.status_code >= 300:
            raise RuntimeError(f"Polar checkout failed: {resp.text}")

        data = resp.json()
        return data.get("checkout_url") or data.get("url") or ""


def verify_webhook_signature(
    secret: str,
    raw_body: bytes,
    signature_header: str,
) -> bool:
    """Verify Polar webhook HMAC signature."""
    try:
        expected = hmac.new(secret.encode(), raw_body, sha256).hexdigest()
        return hmac.compare_digest(expected, signature_header.strip())
    except Exception:
        return False


async def handle_polar_webhook(
    raw_body: bytes,
    signature_header: Optional[str],
) -> None:
    """Process Polar webhook event."""
    settings = get_settings()

    if not settings.polar_webhook_secret:
        raise RuntimeError("Polar webhook secret not configured.")

    if not signature_header or not verify_webhook_signature(
        settings.polar_webhook_secret, raw_body, signature_header
    ):
        raise RuntimeError("Invalid webhook signature.")

    try:
        event = json.loads(raw_body.decode())
    except Exception as exc:
        raise RuntimeError(f"Invalid webhook payload: {exc}") from exc

    event_type = event.get("type")
    data = event.get("data", {})
    attributes = data.get("attributes", {}) if isinstance(data, dict) else {}
    metadata = attributes.get("metadata", {}) or {}
    user_id = metadata.get("user_id")

    if not user_id:
        return

    if event_type in {"subscription.active", "subscription.updated"}:
        await upsert_subscription_status(
            user_id=user_id,
            status=attributes.get("status") or "active",
            plan=attributes.get("product_price_id") or settings.polar_product_price_id,
            current_period_end=attributes.get("current_period_end"),
            polar_customer_id=attributes.get("customer_id"),
            polar_subscription_id=data.get("id"),
        )
    elif event_type in {"subscription.inactive", "subscription.canceled"}:
        await upsert_subscription_status(
            user_id=user_id,
            status="canceled",
            plan=None,
            current_period_end=None,
            polar_customer_id=None,
            polar_subscription_id=None,
        )
