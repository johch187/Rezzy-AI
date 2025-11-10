# 🔑 Where to Put Your API Keys

## Simple Answer: Use a `.env` File

**Create a `.env` file in the project root** (same directory as `package.json`)

## Step-by-Step:

### 1. Create the `.env` file

```bash
# Copy the example file
cp .env.example .env
```

### 2. Edit `.env` and add your keys

Open `.env` in your editor and replace the placeholder values:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-supabase-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-actual-supabase-anon-key
GEMINI_API_KEY=your-actual-gemini-api-key
```

### 3. That's it!

- **For local development**: The `.env` file is automatically used by Vite
- **For Cloud Run deployment**: The deployment script (`./deploy-keju.sh`) will automatically load from `.env`

## Important Security Notes

✅ **SAFE**: The `.env` file is already in `.gitignore` - it won't be committed to git
✅ **SAFE**: You can keep your keys in `.env` for local development
❌ **DANGEROUS**: Never commit `.env` to git (it's already protected)

## Where to Get Your Keys

### Supabase Keys:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → Use for `VITE_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`

### Gemini API Key:
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key → Use for `GEMINI_API_KEY`

## Quick Start

```bash
# 1. Create .env file
cp .env.example .env

# 2. Edit .env and add your keys
# (Open in your editor and fill in the values)

# 3. Deploy!
./deploy-keju.sh
```

The deployment script will automatically use the keys from your `.env` file!

## Alternative: Export in Terminal

If you prefer not to use a `.env` file, you can export variables in your terminal:

```bash
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export VITE_SUPABASE_ANON_KEY="your-key"
export GEMINI_API_KEY="your-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-key"

./deploy-keju.sh
```

## Summary

**Answer: Put your API keys in a `.env` file in the project root directory.**

- ✅ Create: `cp .env.example .env`
- ✅ Edit: Add your actual keys
- ✅ Use: Run `./deploy-keju.sh` (it automatically loads from `.env`)
- ✅ Safe: `.env` is in `.gitignore` and won't be committed

That's it! 🎉

