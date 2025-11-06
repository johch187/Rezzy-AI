# Keju MVP Roadmap & Overview

This document provides a high-level overview of the Keju project, its current capabilities as a Minimum Viable Product (MVP), and the core architectural decisions that guide its development.

## Project Vision: Keju - The AI Career Navigator

Keju is an AI-powered platform designed to replace generic career advice with personalized, data-driven guidance. Our mission is to empower users to:

1.  **Understand their potential:** By building dynamic, comprehensive professional profiles.
2.  **Plan their future:** By generating actionable, long-term career roadmaps.
3.  **Seize opportunities:** By creating perfectly tailored application documents (resumes, cover letters) and preparing for critical networking interactions.

The core principle is to use a user's detailed profile as the single source of truth, allowing the AI to provide context-aware, highly relevant assistance at every stage of their career journey.

## Current Status: MVP Features (What Works)

The application is currently at an MVP stage with the following core features fully implemented:

-   **Multi-Profile Management:** Users can create, rename, delete, and switch between multiple distinct professional profiles (e.g., one for "Software Engineer," another for "Product Manager").
-   **Dynamic Profile Builder:** Users can edit a detailed professional profile for each identity, which serves as the foundation for all AI interactions.
-   **Resume Import:** Users can upload a PDF, TXT, or MD file to automatically parse and populate their currently active profile.
-   **Tailored Document Generation:** The app can generate sophisticated, job-specific resumes and cover letters by combining the user's active profile with a target job description.
-   **AI-Powered Coffee Chat Preparation:** Users can get help with networking by generating either a preparatory brief for an upcoming chat or a concise outreach message.
-   **Interactive AI Career Coach:** A conversational AI assistant that provides career advice and can perform actions like updating the user's profile or navigating them to other tools.
-   **Personalized Career Path Generation:** Through the Career Coach, users can request and receive a detailed, multi-year career plan.
-   **AI-Curated Video Recommendations:** The Career Path page automatically fetches and displays relevant YouTube videos to help users get started on their learning journey.
-   **Client-Side Persistence:** All user data (profiles, document history, career paths) is saved in the browser's `localStorage`, ensuring persistence between sessions without requiring a backend or user accounts.

## Core Architectural Decisions

To achieve the MVP quickly and effectively, several key architectural decisions were made:

1.  **Frontend Framework:** **React with TypeScript** was chosen for its robust ecosystem, component-based architecture, and the type safety provided by TypeScript, which is critical for managing complex data structures.

2.  **Styling:** **Tailwind CSS** is used for its utility-first approach, enabling rapid and consistent UI development.

3.  **State Management:** The **React Context API** is used for global state management. It provides a simple, built-in solution for sharing state (like all user profiles, the active profile, and tokens) across the application.

4.  **AI Engine:** The **Google Gemini API** (specifically the `gemini-2.5-flash` and `gemini-2.5-pro` models) is the exclusive AI engine. Its advanced capabilities are central to every feature.

5.  **Data Persistence:** All user data is stored in the browser's **`localStorage`**. This enables a fully functional client-side application without the complexity of a dedicated backend, ideal for an MVP.

For more detailed information, please refer to the other documents in this `docs` folder.
