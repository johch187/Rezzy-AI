# BigQuery Analytics Setup

1) Create dataset/table (example):
```
bq --project_id "$PROJECT_ID" mk --dataset --location=US keju_events
bq --project_id "$PROJECT_ID" mk --table keju_events.events \
  user_id:STRING,user_email:STRING,event_name:STRING,properties:JSON,ingested_at:TIMESTAMP
```

2) Grant Cloud Run runtime service account `roles/bigquery.dataEditor` on the dataset (or narrower).

3) Env vars required (Cloud Run / CI secrets):
- `GCP_PROJECT_ID`
- `BIGQUERY_DATASET`
- `BIGQUERY_TABLE`

4) Frontend emits `page_view` events to `/api/analytics/events` when authenticated. Extend as needed for additional events.
