# Keju - Your AI-Powered Career Navigator

Keju is an AI-powered career navigation platform, providing personalized, data-driven guidance to help you discover and achieve your dream career. It's a fully client-side application built with React and powered by the Google Gemini API.

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
-   **100% Client-Side**: All your data is stored securely in your browser's local storage. No backend, no accounts, no fuss.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **AI Engine**: [Google Gemini API](https://ai.google.dev/gemini-api) (`@google/genai`)
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
    ```
   Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
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

3. Add your environment variable:
   - Go to your project settings on Vercel
   - Navigate to "Environment Variables"
   - Add `VITE_API_KEY` with your Google Gemini API key

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Import your repository in Vercel
3. Vercel will automatically detect the Vite configuration
4. Add the `VITE_API_KEY` environment variable in your project settings
5. Deploy!

### Environment Variables

The following environment variable is required:

- `VITE_API_KEY`: Your Google Gemini API key (get it from [Google AI Studio](https://aistudio.google.com/app/apikey))

**⚠️ Security Note**: The API key will be exposed in the client-side bundle. For production applications, consider using a backend proxy to keep your API key secure.

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