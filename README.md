# Keju - Your AI-Powered Career Navigator

Keju is an AI-powered career navigation platform, providing personalized, data-driven guidance to help you discover and achieve your dream career. It's a React + Vite SPA powered by the Google Gemini API with Supabase-backed authentication and storage for seamless sync across devices.

## ✨ Key Features

-   **Dynamic Profile Builder**: Create comprehensive professional profiles that act as the single source of truth for the AI. Manage multiple profiles for different career targets.
-   **Intelligent Resume Import**: Upload a PDF, TXT, or MD file to automatically parse and populate your profile in seconds.
-   **AI-Powered Application Tailoring**: Generate job-specific resumes and cover letters by combining your profile with a target job description, complete with an integrated **Application Fit Analysis**.
-   **AI Career Coach**: Chat with an interactive AI assistant for personalized career advice. The coach can directly update your profile, start mock interviews, provide negotiation prep, and guide you to other tools.
-   **Personalized Career Path**: Get a detailed, multi-year career roadmap to guide you from your current role to your dream job, complete with AI-curated video recommendations.
-   **Interview Prep Center**: A full suite of tools to prepare for interviews:
    -   **Story Shaper**: Transform a "brain dump" into a clear interview story using the STAR method.
    -   **Rapport Builder**: Get talking points and questions to build rapport with your interviewer.
    -   **Question Bank**: Generate a list of likely interview questions based on a job description.
-   **Networking Assistant**: Prepare for coffee chats with AI-generated briefs or craft the perfect outreach message.
-   **Supabase Sync (Optional offline fallback)**: Authenticated users have their profile, document history, and chat summaries synced to Supabase. When Supabase is not configured, the app gracefully falls back to browser `localStorage`.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **AI Engine**: [Google Gemini API](https://ai.google.dev/gemini-api) (`@google/genai`)
-   **Authentication & Database**: [Supabase](https://supabase.com/) (`@supabase/supabase-js`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Routing**: [React Router](https://reactrouter.com/) (using `HashRouter`)
-   **Client-Side Storage**: Browser `localStorage`

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Local Development

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/keju.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd keju/Rezzy-AI
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Create a `.env` file in the root directory:
    ```bash
    VITE_API_KEY=your_google_gemini_api_key_here
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
   - Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Grab the Supabase values from **Project Settings → API** inside the Supabase dashboard
5.  Start the development server:
    ```bash
    npm run dev
    ```
6.  Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 🚀 Deployment to Vercel

This project is configured for easy deployment to Vercel.

### Option 1: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add your environment variables:
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add `VITE_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect the Vite configuration
4. Add the `VITE_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` environment variables in your project settings
5. Deploy!

### Environment Variables

The following environment variables are required:

- `VITE_API_KEY`: Your Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anon/public API key

**⚠️ Security Note**: The API key will be exposed in the client-side bundle. For production applications, consider using a backend proxy to keep your API key secure.

### Supabase Setup

1. Create a Supabase project (the free tier is plenty).
2. In the SQL editor, create the `profiles` table used by the app:
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
3. Enable Row Level Security and add a policy such as:
    ```sql
    create policy "Users manage their own profile"
      on public.profiles
      for all
      using (auth.uid() = id)
      with check (auth.uid() = id);
    ```
4. (Optional) Configure OAuth providers (e.g., Google) under **Authentication → Providers**.
5. Connect Supabase to Vercel following the [Vercel × Supabase integration guide](https://supabase.com/partners/integrations/vercel) so preview deployments share the same credentials.
6. Need a copy-paste friendly version? See `docs/SUPABASE_SCHEMA.md` for the complete schema, policies, and triggers.

### Vercel Configuration

The project includes a `vercel.json` file with the following configuration:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Routing: Configured to handle client-side routing with HashRouter

## 📂 Project Structure

The project is organized to separate concerns and improve maintainability:

```
/
├── components/       # Reusable React components
├── docs/             # Detailed project documentation (Roadmap, Architecture, etc.)
├── pages/            # Top-level page components for each route
├── services/         # Business logic and API communication (Gemini, parsing, etc.)
├── types.ts          # Centralized TypeScript type definitions
├── App.tsx           # Root component with routing and global context
├── index.html        # Main HTML file
├── index.tsx         # Application entry point
└── README.md         # You are here!
```

## 📖 Documentation

For a deeper dive into the project's vision, architecture, and feature implementation, please see the documents in the `/docs` folder.
