"""Analytics event ingestion endpoint."""

from typing import Any, Dict, Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.deps.auth import CurrentUser
from app.services.analytics import log_event

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class AnalyticsEvent(BaseModel):
    eventName: str = Field(..., examples=["page_view", "button_click"])
    properties: Dict[str, Any] = Field(default_factory=dict)
    workspaceId: Optional[str] = None
    plan: Optional[str] = None


@router.post("/events")
async def ingest_event(event: AnalyticsEvent, user: CurrentUser):
    """Persist analytics event to BigQuery."""
    properties = {**event.properties}
    if event.workspaceId:
        properties["workspaceId"] = event.workspaceId
    if event.plan:
        properties["plan"] = event.plan

    success = log_event(
        user_id=user["id"],
        user_email=user.get("email"),
        event_name=event.eventName,
        properties=properties,
    )

    if not success:
        return {"ok": False, "logged": False, "message": "Analytics skipped."}
    return {"ok": True, "logged": True}
