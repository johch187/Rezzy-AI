# 🚀 Quick Start: Deploy to Google Cloud Run

## Prerequisites Checklist

- [ ] Google Cloud account created
- [ ] Google Cloud project created
- [ ] Google Cloud CLI installed (`gcloud`)
- [ ] Supabase project set up
- [ ] Gemini API key obtained
- [ ] Billing enabled on Google Cloud project

## Step-by-Step Deployment

### 1. Install Google Cloud CLI (if not installed)

```bash
# macOS
brew install google-cloud-sdk

# Verify installation
gcloud --version
```

### 2. Set Up Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
# Replace 'rezzy-ai-project' with your preferred project name
gcloud projects create rezzy-ai-project --name="Rezzy AI"

# Set as active project
gcloud config set project rezzy-ai-project

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Enable billing (required for Cloud Run)
# Go to: https://console.cloud.google.com/billing
# Link your billing account to the project
```

### 3. Prepare Environment Variables

Collect these values before deploying:

```bash
# Build-time variables (for client-side)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Runtime variables (for server-side)
GEMINI_API_KEY="your-gemini-api-key"
SUPABASE_URL="https://your-project.supabase.co"  # Same as VITE_SUPABASE_URL
SUPABASE_ANON_KEY="your-supabase-anon-key"      # Same as VITE_SUPABASE_ANON_KEY
```

### 4. Deploy!

**Option A: Using the deployment script (easiest)**

```bash
# Set environment variables
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
export GEMINI_API_KEY="your-gemini-api-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-supabase-anon-key"

# Deploy
./deploy-cloud-run.sh
```

**Option B: Manual deployment**

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

### 5. Get Your Service URL

After deployment, you'll see:
```
Service URL: https://rezzy-ai-xxxxx-uc.a.run.app
```

Visit this URL to access your application!

## Common Issues & Solutions

### Issue: "gcloud: command not found"
**Solution**: Install Google Cloud CLI (see Step 1)

### Issue: "Permission denied" errors
**Solution**: Run `gcloud auth login` and verify you have the right permissions

### Issue: "Billing not enabled"
**Solution**: Enable billing for your Google Cloud project at https://console.cloud.google.com/billing

### Issue: Build fails
**Solution**: 
- Check that all environment variables are set correctly
- Verify your project has the required APIs enabled
- Check build logs: `gcloud builds list --limit=1`

### Issue: Service returns errors
**Solution**: 
- Check logs: `gcloud run services logs read rezzy-ai --region us-central1 --follow`
- Verify environment variables are set correctly in Cloud Run
- Check Supabase and Gemini API credentials

## Next Steps After Deployment

1. **Test your application** at the service URL
2. **Set up a custom domain** (optional)
3. **Configure CI/CD** with Cloud Build triggers
4. **Set up monitoring** and alerts
5. **Review costs** in Google Cloud Console

## Useful Commands

```bash
# View service details
gcloud run services describe rezzy-ai --region us-central1

# View logs
gcloud run services logs read rezzy-ai --region us-central1 --follow

# Update environment variables
gcloud run services update rezzy-ai \
  --region us-central1 \
  --update-env-vars "KEY=VALUE"

# Get service URL
gcloud run services describe rezzy-ai --region us-central1 --format 'value(status.url)'
```

## Need Help?

- See `CLOUD_RUN_DEPLOYMENT.md` for detailed documentation
- See `DEPLOY_STEPS.md` for step-by-step instructions
- Check Google Cloud Run docs: https://cloud.google.com/run/docs

