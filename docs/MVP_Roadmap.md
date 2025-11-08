# Keju Project Overview & Roadmap

This document provides a high-level overview of the Keju project, its current capabilities beyond the initial MVP, and the core architectural decisions that guide its development.

## Project Vision: Keju - The AI Career Navigator

Keju is an AI-powered platform designed to replace generic career advice with personalized, data-driven guidance. Our mission is to empower users to:

1.  **Understand their potential:** By building dynamic, comprehensive professional profiles.
2.  **Plan their future:** By generating actionable, long-term career roadmaps.
3.  **Seize opportunities:** By creating perfectly tailored application documents (resumes, cover letters) and preparing for critical networking and interview interactions.

The core principle is to use a user's detailed profile as the single source of truth, allowing the AI to provide context-aware, highly relevant assistance at every stage of their career journey.

## Current Status: A Comprehensive Career Platform

The application has evolved significantly beyond its initial MVP and now includes a full suite of integrated tools for job seekers and professionals.

### Core Foundation Features:
-   **Multi-Profile Management:** Users can create, rename, delete, and switch between multiple distinct professional profiles.
-   **Dynamic Profile Builder:** A detailed, multi-section form serves as the foundation for all AI interactions.
-   **Resume Import:** Users can upload a PDF, TXT, or MD file to automatically parse and populate their currently active profile.
-   **Client-Side Persistence:** All user data is saved in the browser's `localStorage`, ensuring privacy and persistence between sessions without a backend.

### Application & Preparation Suite:
-   **Tailored Document Generation:** The app generates sophisticated, job-specific resumes and cover letters by combining the user's profile with a target job description.
-   **Rich Document Editor:** Generated documents can be edited in a rich, form-based editor with drag-and-drop section reordering for resumes.

### Interview & Networking Suite:
-   **Interactive AI Career Coach:** A conversational AI assistant that provides career advice and can perform actions like updating the user's profile or navigating them to other tools. It's now equipped with advanced capabilities for mock interviews, negotiation prep, and personal development.
-   **Interview Prep Center:** A dedicated hub with tools to:
    -   **Shape Interview Stories:** Transform unstructured "brain dumps" into clear narratives using the STAR method.
    -   **Build Rapport:** Generate talking points and questions based on an interviewer's profile.
    -   **Create Question Banks:** Generate likely interview questions from a job description.
-   **Coffee Chat Prepper:** Specialized tools to generate either a preparatory brief for a networking chat or a concise outreach message.

### Career Planning & Development Suite:
-   **Personalized Career Path Generation:** Through the Career Coach, users can request and receive a detailed, multi-year career plan, which is visualized as an interactive timeline.
-   **AI-Curated Video Recommendations:** The Career Path page automatically fetches and displays relevant, verified YouTube videos for the user's target role.

## Core Architectural Decisions

The architecture is designed for a robust, client-side experience:

1.  **Frontend Framework:** **React with TypeScript** was chosen for its robust ecosystem, component-based architecture, and type safety.
2.  **Styling:** **Tailwind CSS** is used for its utility-first approach, enabling rapid and consistent UI development.
3.  **State Management:** The **React Context API** is used for global state management (profiles, tokens, history).
4.  **AI Engine:** The **Google Gemini API** (`gemini-2.5-flash` and `gemini-2.5-pro`) is the exclusive AI engine, strategically used to balance speed and power.
5.  **Data Persistence:** All user data is stored in the browser's **`localStorage`**, enabling a full-featured, private, client-side application.

For more detailed information, please refer to the other documents in this `docs` folder.