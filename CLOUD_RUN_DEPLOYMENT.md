# Google Cloud Run Deployment Guide

This guide will help you deploy your Rezzy-AI application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud Project**: Create a new project or use an existing one
3. **Google Cloud CLI**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install)
4. **Docker**: Install [Docker](https://www.docker.com/get-started) (for local testing)
5. **API Keys**:
   - Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Supabase project URL and anon key

## Initial Setup

### 1. Install Google Cloud CLI

```bash
# macOS
brew install google-cloud-sdk

# Or download from https://cloud.google.com/sdk/docs/install
```

### 2. Authenticate and Configure

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 3. Configure Docker for Google Container Registry

```bash
# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker
```

## Deployment Options

### Option 1: Deploy Using gcloud CLI (Quick Start)

#### Step 1: Build and Deploy

```bash
# From the project root directory
# Note: Build-time vars (VITE_*) are embedded in client, runtime vars are for server
gcloud run deploy rezzy-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-build-env-vars "VITE_SUPABASE_URL=https://your-project.supabase.co,VITE_SUPABASE_ANON_KEY=your-anon-key" \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=your-gemini-api-key,SUPABASE_URL=your-supabase-url,SUPABASE_ANON_KEY=your-supabase-anon-key"
```

This command will:
- Build your Docker image automatically
- Push it to Google Container Registry
- Deploy it to Cloud Run
- Set environment variables

#### Step 2: Get Your Service URL

After deployment, you'll receive a URL like:
```
https://rezzy-ai-xxxxx-uc.a.run.app
```

### Option 2: Deploy Using Docker (Manual Build)

#### Step 1: Build Docker Image

```bash
# Build the image
docker build -t gcr.io/YOUR_PROJECT_ID/rezzy-ai:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/rezzy-ai:latest
```

#### Step 2: Deploy to Cloud Run

```bash
# Build with build-time environment variables for client-side Supabase
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  -t gcr.io/YOUR_PROJECT_ID/rezzy-ai:latest .

# Push to Google Container Registry
docker push gcr.io/YOUR_PROJECT_ID/rezzy-ai:latest

# Deploy to Cloud Run with runtime environment variables
gcloud run deploy rezzy-ai \
  --image gcr.io/YOUR_PROJECT_ID/rezzy-ai:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=your-key,SUPABASE_URL=your-url,SUPABASE_ANON_KEY=your-key"
```

### Option 3: Deploy Using Cloud Build (CI/CD)

#### Step 1: Create Cloud Build Trigger

1. Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
2. Click "Create Trigger"
3. Connect your repository (GitHub, GitLab, or Cloud Source Repositories)
4. Configure the trigger:
   - **Name**: `rezzy-ai-deploy`
   - **Event**: Push to a branch (e.g., `main`)
   - **Configuration**: Cloud Build configuration file
   - **Location**: `cloudbuild.yaml`
   - **Substitution variables**:
     - `_SERVICE_NAME`: `rezzy-ai`
     - `_REGION`: `us-central1`

#### Step 2: Set Environment Variables

You need to set environment variables in two places:

**1. Build-time variables (for client-side Supabase):**
These are set during the Cloud Build process. Update your `cloudbuild.yaml` or set them in Cloud Build trigger settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**2. Runtime variables (for server-side):**
Set these in Cloud Run:

```bash
# Set environment variables for your Cloud Run service
gcloud run services update rezzy-ai \
  --region us-central1 \
  --set-env-vars "GEMINI_API_KEY=your-gemini-api-key" \
  --set-env-vars "SUPABASE_URL=your-supabase-url" \
  --set-env-vars "SUPABASE_ANON_KEY=your-supabase-anon-key" \
  --set-env-vars "NODE_ENV=production"
```

**Alternative: Set build-time variables in Cloud Build**

If using Cloud Build, you can set build-time variables in your trigger or `cloudbuild.yaml`:

```yaml
substitutions:
  _VITE_SUPABASE_URL: 'https://your-project.supabase.co'
  _VITE_SUPABASE_ANON_KEY: 'your-anon-key'
```

Then update your Dockerfile to accept these as build args, or set them as environment variables during the build step.

Or use the Cloud Console:
1. Go to [Cloud Run Services](https://console.cloud.google.com/run)
2. Click on your service
3. Click "Edit & Deploy New Revision"
4. Go to "Variables & Secrets" tab
5. Add environment variables:
   - `GEMINI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `NODE_ENV` = `production`

#### Step 3: Push to Trigger Deployment

```bash
git push origin main
```

Cloud Build will automatically:
- Build your Docker image
- Push it to Container Registry
- Deploy to Cloud Run

## Environment Variables

### Required Server-Side Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (server-side, secure)
- `SUPABASE_URL`: Your Supabase project URL (used by server for auth verification)
- `SUPABASE_ANON_KEY`: Your Supabase anon/public key (used by server for auth verification)
- `NODE_ENV`: Set to `production` (automatically set)

### Required Build-Time Variables (for client-side)

The client needs Supabase credentials for authentication. These are embedded at build time:

- `VITE_SUPABASE_URL`: Your Supabase project URL (public, safe to expose)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key (public, safe to expose)

**Note**: These `VITE_` prefixed variables are used during the build process and embedded in the client bundle. They are public keys and safe to expose in the browser.

### Optional Variables

- `API_RATE_LIMIT`: Rate limit per minute (default: 60)
- `PORT`: Server port (default: 8080, automatically set by Cloud Run)

### Setting Environment Variables

#### Using gcloud CLI

```bash
gcloud run services update rezzy-ai \
  --region us-central1 \
  --update-env-vars "GEMINI_API_KEY=your-key,SUPABASE_URL=your-url,SUPABASE_ANON_KEY=your-key"
```

#### Using Cloud Console

1. Go to [Cloud Run Services](https://console.cloud.google.com/run)
2. Click on your service
3. Click "Edit & Deploy New Revision"
4. Go to "Variables & Secrets" tab
5. Add or update environment variables
6. Click "Deploy"

#### Using Secret Manager (Recommended for Production)

For sensitive data like API keys, use Google Secret Manager:

```bash
# Create secrets
echo -n "your-gemini-api-key" | gcloud secrets create gemini-api-key --data-file=-
echo -n "your-supabase-url" | gcloud secrets create supabase-url --data-file=-
echo -n "your-supabase-anon-key" | gcloud secrets create supabase-anon-key --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run service to use secrets
gcloud run services update rezzy-ai \
  --region us-central1 \
  --update-secrets "GEMINI_API_KEY=gemini-api-key:latest,SUPABASE_URL=supabase-url:latest,SUPABASE_ANON_KEY=supabase-anon-key:latest"
```

## Configuration Options

### Memory and CPU

Adjust based on your needs:

```bash
gcloud run services update rezzy-ai \
  --region us-central1 \
  --memory 1Gi \
  --cpu 2
```

### Auto-scaling

```bash
# Set minimum and maximum instances
gcloud run services update rezzy-ai \
  --region us-central1 \
  --min-instances 1 \
  --max-instances 100
```

### Timeout

```bash
# Increase timeout for long-running requests (max 300s for HTTP, 3600s for gRPC)
gcloud run services update rezzy-ai \
  --region us-central1 \
  --timeout 300
```

### Concurrency

```bash
# Set number of concurrent requests per instance
gcloud run services update rezzy-ai \
  --region us-central1 \
  --concurrency 80
```

## Custom Domain

### Step 1: Map Custom Domain

```bash
gcloud run domain-mappings create \
  --service rezzy-ai \
  --domain your-domain.com \
  --region us-central1
```

### Step 2: Update DNS

Follow the instructions provided by the command to update your DNS records.

## Monitoring and Logging

### View Logs

```bash
# View logs in real-time
gcloud run services logs read rezzy-ai --region us-central1 --follow

# View logs in Cloud Console
# Go to: https://console.cloud.google.com/run/detail/us-central1/rezzy-ai/logs
```

### Set Up Alerts

1. Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
2. Create alerting policies for:
   - High error rates
   - High latency
   - Resource usage

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version (>= 18.0.0)
- Check build logs in Cloud Build

### Service Won't Start

- Verify environment variables are set correctly
- Check logs: `gcloud run services logs read rezzy-ai --region us-central1`
- Verify the server binds to `0.0.0.0` and listens on `PORT`

### High Latency

- Increase memory and CPU allocation
- Enable minimum instances to avoid cold starts
- Check for external API bottlenecks (Gemini, Supabase)

### Out of Memory

- Increase memory allocation: `--memory 1Gi` or `--memory 2Gi`
- Optimize application code
- Check for memory leaks

### Authentication Issues

- Verify Supabase credentials are correct
- Check CORS settings in Supabase
- Verify the authorization header is being sent correctly

## Cost Optimization

### Reduce Costs

1. **Set minimum instances to 0** (default): Pay only for requests
2. **Use appropriate memory/CPU**: Start with 512Mi and 1 CPU
3. **Set request timeouts**: Prevent long-running requests
4. **Monitor usage**: Use Cloud Monitoring to track costs

### Pricing

Cloud Run pricing is based on:
- **CPU**: Charged per vCPU-second
- **Memory**: Charged per GB-second
- **Requests**: First 2 million requests per month are free
- **Network**: Egress charges apply

See [Cloud Run Pricing](https://cloud.google.com/run/pricing) for details.

## Security Best Practices

1. **Use Secret Manager** for API keys and sensitive data
2. **Enable IAM authentication** if you don't need public access
3. **Set up VPC** for private services
4. **Enable Cloud Armor** for DDoS protection
5. **Regular security updates** for base images
6. **Scan container images** for vulnerabilities

## Supabase Setup

Follow the same Supabase setup as described in `DEPLOYMENT.md`:

1. Create the `profiles` table in Supabase
2. Enable Row Level Security
3. Configure authentication providers
4. Update CORS settings to allow your Cloud Run domain

## Continuous Deployment

With Cloud Build triggers configured:
- Push to `main` branch → Automatic deployment to production
- Create pull requests → Can trigger preview deployments
- Tag releases → Deploy specific versions

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Registry Documentation](https://cloud.google.com/container-registry/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)

## Support

For issues or questions:
- Check [Cloud Run Troubleshooting](https://cloud.google.com/run/docs/troubleshooting)
- Review application logs
- Check Cloud Build logs for deployment issues

