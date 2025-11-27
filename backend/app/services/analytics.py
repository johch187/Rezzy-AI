"""BigQuery analytics service."""

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from app.config import get_settings

try:
    from google.cloud import bigquery
    BIGQUERY_AVAILABLE = True
except ImportError:
    bigquery = None
    BIGQUERY_AVAILABLE = False

logger = logging.getLogger(__name__)
_client: Optional[Any] = None


def _get_table_id() -> str:
    """Get fully qualified BigQuery table ID."""
    settings = get_settings()
    if not all([settings.gcp_project_id, settings.bigquery_dataset, settings.bigquery_table]):
        raise RuntimeError("BigQuery not configured.")
    return f"{settings.gcp_project_id}.{settings.bigquery_dataset}.{settings.bigquery_table}"


def _get_client() -> Any:
    """Get or create BigQuery client."""
    global _client
    if not BIGQUERY_AVAILABLE:
        raise RuntimeError("BigQuery library not installed.")
    if _client is None:
        settings = get_settings()
        if not settings.gcp_project_id:
            raise RuntimeError("GCP_PROJECT_ID required for BigQuery.")
        _client = bigquery.Client(project=settings.gcp_project_id)
    return _client


def log_event(
    user_id: str,
    user_email: Optional[str],
    event_name: str,
    properties: Optional[Dict[str, Any]] = None,
) -> bool:
    """
    Log analytics event to BigQuery.
    
    Returns True on success, False if analytics is skipped or fails.
    """
    try:
        client = _get_client()
        table = _get_table_id()
    except RuntimeError as exc:
        logger.debug("Analytics disabled: %s", exc)
        return False
    except Exception as exc:
        logger.warning("Analytics init failed: %s", exc)
        return False

    payload = {
        "user_id": user_id,
        "user_email": user_email,
        "event_name": event_name,
        "properties": properties or {},
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        errors = client.insert_rows_json(table, [payload])
        if errors:
            logger.warning("BigQuery insert failed: %s", errors)
            return False
        return True
    except Exception as exc:
        logger.warning("BigQuery insert error: %s", exc)
        return False
