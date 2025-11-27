#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="/app/backend:${PYTHONPATH:-}"
cd /app/backend

# Validate required environment variables before starting
if [ -z "${SUPABASE_URL:-}" ]; then
    echo "ERROR: SUPABASE_URL environment variable is not set" >&2
    exit 1
fi

if [ -z "${SUPABASE_SECRET_KEY:-}" ]; then
    echo "ERROR: SUPABASE_SECRET_KEY environment variable is not set" >&2
    echo "       This must be set to a Supabase secret key (format: sb_secret_...)" >&2
    echo "       Get it from: Supabase Dashboard → Project Settings → API → Secret Keys" >&2
    exit 1
fi

if [[ ! "${SUPABASE_SECRET_KEY}" =~ ^sb_secret_ ]]; then
    echo "ERROR: SUPABASE_SECRET_KEY must start with 'sb_secret_'" >&2
    echo "       Current value starts with: ${SUPABASE_SECRET_KEY:0:20}..." >&2
    echo "       Legacy service_role keys are no longer supported." >&2
    exit 1
fi

PORT="${PORT:-8080}"
echo "==========================================" >&2
echo "Starting Keju API Server" >&2
echo "==========================================" >&2
echo "Port: ${PORT}" >&2
echo "Python: $(python --version)" >&2
echo "Working directory: $(pwd)" >&2
echo "" >&2
echo "Environment check:" >&2
echo "  - SUPABASE_URL: ${SUPABASE_URL:0:30}..." >&2
echo "  - GCP_PROJECT_ID: ${GCP_PROJECT_ID:-not set}" >&2
echo "  - GCP_REGION: ${GCP_REGION:-not set}" >&2
echo "  - GEMINI_API_KEY: ${GEMINI_API_KEY:+set (hidden)}${GEMINI_API_KEY:-not set}" >&2
echo "  - FRONTEND_DIST_DIR: ${FRONTEND_DIST_DIR:-not set}" >&2
echo "" >&2
echo "Checking Python imports..." >&2
python -c "import fastapi; import uvicorn; print('✓ Core dependencies OK')" 2>&1 || echo "✗ Core dependencies missing!" >&2
echo "" >&2
echo "Starting uvicorn..." >&2
echo "==========================================" >&2

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}" --log-level info --access-log
