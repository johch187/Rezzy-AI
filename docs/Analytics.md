# BigQuery Analytics Setup

1) Create dataset/table (example):
```bash
# Create dataset
bq --project_id "$PROJECT_ID" mk --dataset --location=US keju_events

# Create table with correct schema (properties must be JSON type, not RECORD)
bq --project_id "$PROJECT_ID" mk --table keju_events.events \
  user_id:STRING,user_email:STRING,event_name:STRING,properties:JSON,ingested_at:TIMESTAMP
```

**Important:** The `properties` field must be of type `JSON`, not `RECORD`. If you created the table with the wrong type, you can update it:
```bash
# Check current schema
bq show --schema --format=prettyjson "$PROJECT_ID:keju_events.events"

# If properties is RECORD, you need to recreate the table or alter it
# Option 1: Delete and recreate (loses data)
bq rm -f -t "$PROJECT_ID:keju_events.events"
bq --project_id "$PROJECT_ID" mk --table keju_events.events \
  user_id:STRING,user_email:STRING,event_name:STRING,properties:JSON,ingested_at:TIMESTAMP

# Option 2: Create new table and migrate data (preserves data)
bq --project_id "$PROJECT_ID" mk --table keju_events.events_v2 \
  user_id:STRING,user_email:STRING,event_name:STRING,properties:JSON,ingested_at:TIMESTAMP
```

2) Grant Cloud Run runtime service account `roles/bigquery.dataEditor` on the dataset (or narrower).

3) Env vars required (Cloud Run / CI secrets):
- `GCP_PROJECT_ID`
- `BIGQUERY_DATASET`
- `BIGQUERY_TABLE`

4) Frontend emits `page_view` events to `/api/analytics/events` when authenticated. Extend as needed for additional events.
