# Keju - Your AI-Powered Career Navigator

Keju is an AI-powered career navigation platform, providing personalized, data-driven guidance to help you discover and achieve your dream career. It's a fully client-side application built with React and powered by the Google Gemini API.

## ✨ Key Features

-   **Dynamic Profile Builder**: Create comprehensive professional profiles that act as the single source of truth for the AI. Manage multiple profiles for different career targets.
-   **Intelligent Resume Import**: Upload a PDF, TXT, or MD file to automatically parse and populate your profile in seconds.
-   **Tailored Document Generation**: Generate job-specific resumes and cover letters by combining your profile with a target job description.
-   **AI Career Coach**: Chat with an interactive AI assistant for personalized career advice, resume feedback, negotiation prep, and more. The coach can directly update your profile and guide you to other tools.
-   **Personalized Career Path**: Get a detailed, multi-year career roadmap to guide you from your current role to your dream job.
-   **Interview Prep Center**: A full suite of tools to prepare for interviews:
    -   **Story Shaper**: Transform a "brain dump" into a clear interview story using the STAR method.
    -   **Rapport Builder**: Get talking points and questions to build rapport with your interviewer.
    -   **Question Bank**: Generate a list of likely interview questions based on a job description.
-   **Networking Assistant**: Prepare for coffee chats with AI-generated briefs or craft the perfect outreach message.
-   **100% Client-Side**: All your data is stored securely in your browser's local storage. No backend, no accounts, no fuss.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **AI Engine**: [Google Gemini API](https://ai.google.dev/gemini-api) (`@google/genai`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Routing**: [React Router](https://reactrouter.com/) (using `HashRouter`)
-   **Client-Side Storage**: Browser `localStorage`

## 🚀 Getting Started

This is a static web application with no build step required.

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/keju.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd keju
    ```
3.  Open the `index.html` file in your favorite web browser.

That's it! The application will run locally.

*Note: For the AI features to work, you will need to provide a Google Gemini API key. This project is configured to read the key from a `process.env.API_KEY` variable, which is typically handled by the hosting environment.*

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