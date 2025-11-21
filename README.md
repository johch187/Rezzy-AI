# Keju - Your AI-Powered Career Navigator

Keju is an AI-powered career navigation platform, providing personalized, data-driven guidance to help you discover and achieve your dream career. It's a scalable web application with a React frontend, a Python FastAPI backend, and is powered by Google Vertex AI (Gemini) via service-account credentials.

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
-   **Secure & Scalable**: User authentication and data are handled by Supabase, with a containerized backend ready for scalable deployment on Google Cloud Run.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **Backend (Future)**: [Python](https://www.python.org/) (e.g., with FastAPI or Flask)
-   **Database & Auth (Future)**: [Supabase](https://supabase.io/)
-   **AI Engine**: [Google Vertex AI (Gemini)](https://cloud.google.com/vertex-ai) via service accounts (ADC); API key fallback supported for local dev
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Routing**: [React Router](https://reactrouter.com/) (using `HashRouter`)
-   **Deployment**: [Docker](https://www.docker.com/) & [Google Cloud Run](https://cloud.google.com/run) via [GitHub Actions](https://github.com/features/actions)

## 🚀 Getting Started

### Frontend
1. Clone the repository and navigate to the project directory.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Build for production: `npm run build` (outputs to `dist/`).

### Backend (FastAPI)
1. Create/activate a Python 3.11+ virtualenv.
2. Install deps: `pip install -r backend/requirements.txt`
3. Set environment variables (see `.env.example` for required keys such as Supabase, Vertex AI project/region, BigQuery, Polar, CORS/CSP). Vertex AI uses Application Default Credentials (service account) by default; optional `GEMINI_API_KEY` is only needed for local fallback.
4. Run locally: `uvicorn app.main:app --host 0.0.0.0 --port 8000` from the `backend` directory (PYTHONPATH should include `/app/backend` in Docker).

### Docker / Cloud Run
- Multi-stage Dockerfile builds the frontend and serves it via the backend container.
- GitHub Actions workflow (`.github/workflows/cloudrun.yml`) builds, pushes to Artifact Registry, and deploys to Cloud Run. Secrets must be provided via GitHub/Cloud Run (do not commit real env files).
- Vertex AI is accessed via the Cloud Run service account (Application Default Credentials). Ensure that service account has at least `roles/aiplatform.user` and `roles/serviceusage.serviceUsageConsumer` on the project. No API key is required in Cloud Run; `GEMINI_API_KEY` is only for local fallback.

## 📂 Project Structure

The project is organized to separate concerns and improve maintainability:

```
/
├── .github/workflows/  # CI/CD workflows for deployment
├── components/         # Reusable React components
├── docs/               # Deployment, Supabase schema/RLS, analytics, etc.
├── pages/              # Top-level page components for each route
├── services/           # Business logic and backend API communication
├── types.ts            # Centralized TypeScript type definitions
├── App.tsx             # Root component with routing and global context
├── Dockerfile          # Docker configuration for production deployment
├── index.html          # Main HTML file
├── index.tsx           # Application entry point
└── README.md           # You are here!
```

## 📖 Documentation

For a deeper dive into the project's vision, architecture, and feature implementation, please see the documents in `/docs` folder.
