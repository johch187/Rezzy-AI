# 🚀 Deploy Keju to Google Cloud Run - Ready to Go!

Your Google Cloud project is already configured:
- **Project ID**: `static-athlete-476014-j7`
- **Project Name**: Keju
- **Project Number**: 493845692702

## Quick Deploy (3 Steps)

### Step 1: Set Your Environment Variables

You need to gather these values:

1. **Supabase Credentials** (from your Supabase project):
   - Supabase URL: `https://xxxxx.supabase.co`
   - Supabase Anon Key: `eyJhbGc...` (starts with `eyJ`)

2. **Gemini API Key** (from Google AI Studio):
   - Get it from: https://aistudio.google.com/app/apikey

### Step 2: Export Environment Variables

```bash
# Replace with your actual values
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
export GEMINI_API_KEY="your-gemini-api-key"
export SUPABASE_URL="https://your-project.supabase.co"  # Same as VITE_SUPABASE_URL
export SUPABASE_ANON_KEY="your-supabase-anon-key"      # Same as VITE_SUPABASE_ANON_KEY
```

### Step 3: Deploy!

```bash
# Use the custom deployment script
./deploy-keju.sh
```

Or deploy manually:

```bash
gcloud run deploy keju \
  --source . \
  --platform managed \
  --region us-central1 \
  --project static-athlete-476014-j7 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-build-env-vars "VITE_SUPABASE_URL=$VITE_SUPABASE_URL,VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY" \
  --set-env-vars "NODE_ENV=production,GEMINI_API_KEY=$GEMINI_API_KEY,SUPABASE_URL=$SUPABASE_URL,SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
```

## What Happens Next?

1. **Build**: Cloud Build will build your Docker image (takes 5-10 minutes)
2. **Deploy**: Your app will be deployed to Cloud Run
3. **Get URL**: You'll receive a URL like `https://keju-xxxxx-uc.a.run.app`

## After Deployment

### View Your Service URL
```bash
gcloud run services describe keju --region us-central1 --format 'value(status.url)'
```

### View Logs
```bash
gcloud run services logs read keju --region us-central1 --follow
```

### Open in Browser
```bash
gcloud run services describe keju --region us-central1 --format 'value(status.url)' | xargs open
```

## Troubleshooting

### If deployment fails:
1. Check that billing is enabled: https://console.cloud.google.com/billing
2. Verify environment variables are set: `echo $VITE_SUPABASE_URL`
3. Check build logs: `gcloud builds list --limit=1`

### If service won't start:
1. Check logs: `gcloud run services logs read keju --region us-central1 --follow`
2. Verify environment variables in Cloud Run console
3. Check that Supabase and Gemini API credentials are correct

## Need Help?

- Check `CLOUD_RUN_DEPLOYMENT.md` for detailed documentation
- View your project: https://console.cloud.google.com/run?project=static-athlete-476014-j7

