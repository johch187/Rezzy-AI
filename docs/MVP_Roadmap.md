# Keju MVP Roadmap & Overview

This document provides a high-level overview of the Keju project, its current capabilities as a Minimum Viable Product (MVP), and the core architectural decisions that guide its development.

## Project Vision: Keju - The AI Career Navigator

Keju is an AI-powered platform designed to replace generic career advice with personalized, data-driven guidance. Our mission is to empower users to:

1.  **Understand their potential:** By building a dynamic, comprehensive professional profile.
2.  **Plan their future:** By generating actionable, long-term career roadmaps.
3.  **Seize opportunities:** By creating perfectly tailored application documents (resumes, cover letters) and preparing for critical networking interactions.

The core principle is to use a user's detailed profile as the single source of truth, allowing the AI to provide context-aware, highly relevant assistance at every stage of their career journey.

## Current Status: MVP Features (What Works)

The application is currently at an MVP stage with the following core features fully implemented:

-   **Dynamic Profile Builder:** Users can create and edit a detailed professional profile, which serves as the foundation for all AI interactions.
-   **Resume Import:** Users can upload a PDF, TXT, or MD file to automatically parse and populate their profile, significantly speeding up the onboarding process.
-   **Tailored Document Generation:** The app can generate sophisticated, job-specific resumes and cover letters by combining the user's profile with a target job description.
-   **AI-Powered Coffee Chat Preparation:** Users can get help with networking by generating either a preparatory brief for an upcoming chat or a concise outreach message.
-   **Interactive AI Career Coach:** A conversational AI assistant that provides career advice, answers questions, and can perform actions like updating the user's profile or navigating them to other tools within the app.
-   **Personalized Career Path Generation:** Through the Career Coach, users can request and receive a detailed, multi-year career plan to guide them from their current role to a desired future role.
-   **Client-Side Persistence:** All user data (profile, document history, career path) is saved in the browser's `localStorage`, ensuring persistence between sessions without requiring a backend or user accounts.

## Core Architectural Decisions

To achieve the MVP quickly and effectively, several key architectural decisions were made:

1.  **Frontend Framework:** **React with TypeScript** was chosen for its robust ecosystem, component-based architecture, and the type safety provided by TypeScript, which is critical for managing complex data structures like the user profile.

2.  **Styling:** **Tailwind CSS** is used for its utility-first approach, enabling rapid and consistent UI development directly within the component markup.

3.  **State Management:** The **React Context API** is used for global state management. For the scale of this MVP, it provides a simple, built-in solution for sharing state (like the user profile and tokens) across the application without the overhead of external libraries like Redux or Zustand.

4.  **AI Engine:** The **Google Gemini API** (specifically the `gemini-2.5-flash` and `gemini-2.5-pro` models) is the exclusive AI engine. Its advanced capabilities in understanding context, following complex instructions, and providing structured JSON output are central to every feature.

5.  **Data Persistence:** All user data is stored in the browser's **`localStorage`**. This decision enables a fully functional client-side application without the complexity and cost of a dedicated backend and database, which is ideal for an MVP.

6.  **Modularity:** The codebase is organized by function and feature. `services/` contains all business logic and API interactions, `pages/` represent distinct application views, and `components/` contain reusable UI elements. This separation of concerns makes the application easier to maintain and scale.

For more detailed information, please refer to the other documents in this `docs` folder.
