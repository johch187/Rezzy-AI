from datetime import datetime, timezone
from typing import Any, Dict, Optional

from google.cloud import bigquery

from app.config import get_settings

_client: Optional[bigquery.Client] = None


def _table_id() -> str:
    settings = get_settings()
    if not settings.gcp_project_id or not settings.bigquery_dataset or not settings.bigquery_table:
        raise RuntimeError("BigQuery is not configured. Set GCP_PROJECT_ID, BIGQUERY_DATASET, BIGQUERY_TABLE.")
    return f"{settings.gcp_project_id}.{settings.bigquery_dataset}.{settings.bigquery_table}"


def _get_client() -> bigquery.Client:
    global _client
    if _client is None:
        settings = get_settings()
        if not settings.gcp_project_id:
            raise RuntimeError("GCP_PROJECT_ID is required for BigQuery.")
        _client = bigquery.Client(project=settings.gcp_project_id)
    return _client


def log_event(user_id: str, user_email: Optional[str], event_name: str, properties: Optional[Dict[str, Any]] = None) -> None:
    """
    Insert a single analytics event into BigQuery. Keep payloads small to avoid quota issues.
    """
    client = _get_client()
    table = _table_id()
    payload = {
        "user_id": user_id,
        "user_email": user_email,
        "event_name": event_name,
        "properties": properties or {},
        "ingested_at": datetime.now(timezone.utc).isoformat(),
    }
    errors = client.insert_rows_json(table, [payload])
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
