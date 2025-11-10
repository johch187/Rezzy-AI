#!/bin/bash
# Deployment script for Keju project on Google Cloud Run
# Project ID: static-athlete-476014-j7
# This script automatically loads environment variables from .env file if it exists

set -e

PROJECT_ID="static-athlete-476014-j7"
SERVICE_NAME="keju"
REGION="us-central1"

echo "=========================================="
echo "Deploying Keju to Google Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo "=========================================="
echo ""

# Set the project
gcloud config set project $PROJECT_ID

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "📄 Loading environment variables from .env file..."
    # Export variables from .env file (ignoring comments and empty lines)
    export $(grep -v '^#' .env | grep -v '^$' | xargs)
    echo "✅ Loaded variables from .env"
    echo ""
fi

# Check if environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] || \
   [ -z "$GEMINI_API_KEY" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ] || \
   [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Environment variables not set!"
    echo ""
    echo "You can set them in two ways:"
    echo ""
    echo "Option 1: Create a .env file (recommended)"
    echo "  1. Copy .env.example to .env:  cp .env.example .env"
    echo "  2. Edit .env and add your keys"
    echo "  3. Run this script again"
    echo ""
    echo "Option 2: Export in terminal"
    echo "  export VITE_SUPABASE_URL='https://your-project.supabase.co'"
    echo "  export VITE_SUPABASE_ANON_KEY='your-supabase-anon-key'"
    echo "  export GEMINI_API_KEY='your-gemini-api-key'"
    echo "  export SUPABASE_URL='https://your-project.supabase.co'"
    echo "  export SUPABASE_ANON_KEY='your-supabase-anon-key'"
    echo "  ./deploy-keju.sh"
    echo ""
    echo "See API_KEYS_GUIDE.md for more details."
    exit 1
fi

echo "✅ Environment variables detected"
echo ""

# Build and deploy
echo "🚀 Building and deploying..."
echo ""

gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-build-env-vars "VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY,SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY"

echo ""
echo "=========================================="
echo "✅ Deployment complete!"
echo "=========================================="
echo ""
echo "📋 Service URL:"
gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID --format 'value(status.url)'
echo ""
echo "📊 Useful commands:"
echo "  View logs:     gcloud run services logs read $SERVICE_NAME --region $REGION --follow"
echo "  View service:  gcloud run services describe $SERVICE_NAME --region $REGION"
echo "  Open in browser: gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)' | xargs open"
echo ""
