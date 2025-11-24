from datetime import datetime, timezone
from typing import Any, Dict, Optional

try:
    from google.cloud import bigquery
except ImportError:  # pragma: no cover - optional dependency guard
    bigquery = None

from app.config import get_settings

_client: Optional[Any] = None


def _table_id() -> str:
    settings = get_settings()
    if not settings.gcp_project_id or not settings.bigquery_dataset or not settings.bigquery_table:
        raise RuntimeError("BigQuery is not configured. Set GCP_PROJECT_ID, BIGQUERY_DATASET, BIGQUERY_TABLE.")
    return f"{settings.gcp_project_id}.{settings.bigquery_dataset}.{settings.bigquery_table}"


def _get_client() -> Any:
    global _client
    if bigquery is None:
        raise RuntimeError("BigQuery client library not installed.")
    if _client is None:
        settings = get_settings()
        if not settings.gcp_project_id:
            raise RuntimeError("GCP_PROJECT_ID is required for BigQuery.")
        _client = bigquery.Client(project=settings.gcp_project_id)
    return _client


def log_event(user_id: str, user_email: Optional[str], event_name: str, properties: Optional[Dict[str, Any]] = None) -> None:
    """
    Insert a single analytics event into BigQuery. Keep payloads small to avoid quota issues.
    
    For JSON fields in BigQuery, pass the Python dict directly - the client handles serialization.
    """
    client = _get_client()
    table = _table_id()
    
    payload = {
        "user_id": user_id,
        "user_email": user_email,
        "event_name": event_name,
        "properties": properties or {},  # Pass dict directly for JSON field type
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }
    errors = client.insert_rows_json(table, [payload])
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
