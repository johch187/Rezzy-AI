#!/bin/bash
# Quick deployment script for Google Cloud Run
# Usage: ./deploy-cloud-run.sh [service-name] [region]

set -e

# Configuration
SERVICE_NAME="${1:-rezzy-ai}"
REGION="${2:-us-central1}"
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No Google Cloud project set. Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Deploying $SERVICE_NAME to Cloud Run in $REGION (project: $PROJECT_ID)"
echo ""

# Check if required environment variables are set
BUILD_VARS=""
RUNTIME_VARS="NODE_ENV=production"

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "Warning: Build-time environment variables not set:"
    echo "  - VITE_SUPABASE_URL"
    echo "  - VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "These are required for client-side Supabase authentication."
    echo "Press Ctrl+C to cancel, or Enter to continue (you'll need to set them later)..."
    read
else
    BUILD_VARS="VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY"
fi

if [ -z "$GEMINI_API_KEY" ] || [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "Warning: Runtime environment variables not set:"
    echo "  - GEMINI_API_KEY"
    echo "  - SUPABASE_URL"
    echo "  - SUPABASE_ANON_KEY"
    echo ""
    echo "You can set them now or configure them in Cloud Run after deployment."
    echo "Press Ctrl+C to cancel, or Enter to continue..."
    read
else
    RUNTIME_VARS="$RUNTIME_VARS,GEMINI_API_KEY=$GEMINI_API_KEY,SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
fi

# Build and deploy
echo "Building and deploying..."
DEPLOY_CMD="gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --set-env-vars \"$RUNTIME_VARS\""

if [ -n "$BUILD_VARS" ]; then
    DEPLOY_CMD="$DEPLOY_CMD --set-build-env-vars \"$BUILD_VARS\""
fi

eval $DEPLOY_CMD

echo ""
echo "Deployment complete!"
echo ""
echo "To get your service URL, run:"
echo "  gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'"
echo ""
echo "To view logs, run:"
echo "  gcloud run services logs read $SERVICE_NAME --region $REGION --follow"
echo ""
echo "To update environment variables, run:"
echo "  gcloud run services update $SERVICE_NAME --region $REGION --update-env-vars KEY=VALUE"

