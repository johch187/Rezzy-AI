# Quick Deployment Steps to Google Cloud Run

Follow these steps in order to deploy your application.

## Step 1: Install Google Cloud CLI

### macOS
```bash
brew install google-cloud-sdk
```

### Linux/Windows
Download from: https://cloud.google.com/sdk/docs/install

### Verify Installation
```bash
gcloud --version
```

## Step 2: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "rezzy-ai")
4. Note your Project ID (you'll need this)

## Step 3: Authenticate and Configure

```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Configure Docker authentication
gcloud auth configure-docker
```

## Step 4: Gather Your Environment Variables

You'll need these values:

### Build-Time Variables (for client-side Supabase)
- `VITE_SUPABASE_URL`: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

### Runtime Variables (for server-side)
- `GEMINI_API_KEY`: Your Google Gemini API key
- `SUPABASE_URL`: Your Supabase project URL (same as above)
- `SUPABASE_ANON_KEY`: Your Supabase anon key (same as above)

**Where to find these:**
- **Supabase**: Go to your Supabase project → Settings → API
- **Gemini API Key**: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Step 5: Deploy to Cloud Run

### Option A: Using the Deployment Script (Recommended)

```bash
# Set your environment variables
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
export GEMINI_API_KEY="your-gemini-api-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# Run the deployment script
./deploy-cloud-run.sh
```

### Option B: Manual Deployment

```bash
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
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=your-gemini-api-key,SUPABASE_URL=https://your-project.supabase.co,SUPABASE_ANON_KEY=your-anon-key"
```

## Step 6: Get Your Service URL

After deployment completes, you'll see output like:
```
Service URL: https://rezzy-ai-xxxxx-uc.a.run.app
```

Your application is now live at this URL!

## Step 7: Verify Deployment

1. Visit your service URL in a browser
2. Test the application functionality
3. Check logs if there are any issues:
   ```bash
   gcloud run services logs read rezzy-ai --region us-central1 --follow
   ```

## Troubleshooting

### Build Fails
- Check that all environment variables are set correctly
- Verify your Google Cloud project has billing enabled
- Check build logs: `gcloud builds list --limit=1`

### Service Won't Start
- Verify environment variables are set in Cloud Run
- Check logs: `gcloud run services logs read rezzy-ai --region us-central1`
- Ensure Supabase credentials are correct

### Authentication Issues
- Verify Supabase credentials are correct
- Check that Supabase project allows your Cloud Run domain
- Review Supabase logs in the Supabase dashboard

## Next Steps

- **Set up a custom domain**: See `CLOUD_RUN_DEPLOYMENT.md` for instructions
- **Configure CI/CD**: Set up Cloud Build triggers for automatic deployments
- **Monitor your service**: Use Cloud Monitoring to track performance
- **Set up alerts**: Configure alerts for errors and performance issues

## Useful Commands

```bash
# View service details
gcloud run services describe rezzy-ai --region us-central1

# Update environment variables
gcloud run services update rezzy-ai \
  --region us-central1 \
  --update-env-vars "KEY=VALUE"

# View logs
gcloud run services logs read rezzy-ai --region us-central1 --follow

# Delete service (if needed)
gcloud run services delete rezzy-ai --region us-central1
```

