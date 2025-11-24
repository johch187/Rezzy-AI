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
echo "Starting server on port ${PORT}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT}"
