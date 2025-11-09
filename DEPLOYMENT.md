# Deployment Guide for Vercel

This guide will help you deploy your Keju application to Vercel.

## Prerequisites

1. A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. A Supabase project (free tier is fine) with the `profiles` table created (see instructions below)
3. A Vercel account (sign up at [vercel.com](https://vercel.com))
4. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Important: Root Directory Configuration

**If your project is in a subdirectory** (e.g., `Rezzy-AI/`), you **must** configure Vercel to use that directory as the root:

1. Go to your Vercel project settings
2. Navigate to "General" → "Root Directory"
3. Set the root directory to `Rezzy-AI` (or whatever your project folder is named)
4. Save the changes
5. Redeploy your project

This ensures Vercel builds from the correct directory where your `package.json` and source files are located.

## Quick Deployment Steps

### 1. Prepare Your Repository

Make sure your code is committed and pushed to your Git repository.

### 2. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect your Vite configuration
5. Configure the project:
   - **Framework Preset**: Vite (should be auto-detected)
   - **Root Directory**: `Rezzy-AI` (if your project is in a subdirectory)
   - **Build Command**: `npm run build` (should be auto-detected)
   - **Output Directory**: `dist` (should be auto-detected)
6. Add Environment Variables:
   - Click "Environment Variables"
   - Add:
     - `VITE_API_KEY` → Google Gemini API key
     - `VITE_SUPABASE_URL` → Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` → Supabase anon/public key
   - Select all environments (Production, Preview, Development)
7. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd Rezzy-AI
   vercel
   ```

4. Follow the prompts to configure your project

5. Add environment variables:
   ```bash
   vercel env add VITE_API_KEY
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```
   Paste each value when prompted.

6. Redeploy to apply the environment variables:
   ```bash
   vercel --prod
   ```

## Environment Variables

### Required Variables

- `VITE_API_KEY`: Google Gemini API key
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/public key

### Setting Environment Variables in Vercel

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add each variable:
   - `VITE_API_KEY` → Google Gemini API key
   - `VITE_SUPABASE_URL` → Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` → Supabase anon/public key
   - **Environments**: Select all (Production, Preview, Development)
4. Click "Save"
5. Redeploy your project for the changes to take effect

## Supabase Setup

Follow these steps once per Supabase project:

1. In the Supabase dashboard, open the SQL editor and run:
    ```sql
    create table if not exists public.profiles (
      id uuid primary key references auth.users(id) on delete cascade,
      profile jsonb,
      document_history jsonb default '[]'::jsonb,
      career_chat_history jsonb default '[]'::jsonb,
      tokens integer default 65,
      updated_at timestamptz default now()
    );
    ```
2. Enable Row Level Security on `public.profiles`.
3. Add a policy so users can only read/write their own row:
    ```sql
    create policy "Users manage their own profile"
      on public.profiles
      for all
      using (auth.uid() = id)
      with check (auth.uid() = id);
    ```
4. (Optional) Enable OAuth providers such as Google under **Authentication → Providers**.
5. Connect Supabase to Vercel using the [official integration](https://supabase.com/partners/integrations/vercel) so preview deployments share the same credentials.

## Post-Deployment

After deployment:

1. Your app will be available at `https://your-project.vercel.app`
2. Test all features to ensure the API key is working
3. Set up a custom domain (optional) in your Vercel project settings

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Ensure Node.js version is >= 18.0.0 (specified in `package.json`)
- Check the build logs in Vercel for specific error messages

### API Key Not Working

- Verify the environment variable is set correctly in Vercel
- Ensure the variable name is exactly `VITE_API_KEY` (case-sensitive)
- Check that the environment variable is set for the correct environment (Production/Preview/Development)
- Redeploy after adding/changing environment variables

### Routing Issues

- This project uses HashRouter, so all routes are handled client-side
- No server-side configuration is needed for routing
- If you experience routing issues, clear your browser cache

## Security Considerations

⚠️ **Important**: The `VITE_API_KEY` will be exposed in the client-side bundle. This means anyone can view your API key in the browser's developer tools.

For production applications, consider:
1. Using a backend proxy to keep your API key secure
2. Implementing API key restrictions in Google Cloud Console
3. Setting up rate limiting and usage quotas
4. Using environment-specific API keys with different quotas

## Continuous Deployment

Vercel automatically deploys your app when you push to your Git repository:
- Push to `main`/`master` → Production deployment
- Push to other branches → Preview deployment
- Create a pull request → Preview deployment

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
