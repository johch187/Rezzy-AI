# Keju Project Overview

This document provides a high-level overview of the Keju project, its current capabilities, and the future roadmap involving a full backend implementation.

## Project Vision: Keju - The AI Career Navigator

Keju is an AI-powered platform designed to replace generic career advice with personalized, data-driven guidance. Our mission is to empower users to:

1.  **Understand their potential:** By building dynamic, comprehensive professional profiles.
2.  **Plan their future:** By generating actionable, long-term career roadmaps.
3.  **Seize opportunities:** By creating perfectly tailored application documents and preparing for critical networking and interview interactions.

## Current Status: A Comprehensive Client-Side Application

The application is a feature-complete, client-side SPA (Single-Page Application). It operates without a backend, with all data stored in the browser's `localStorage` and all AI calls made directly from the client to the Google Gemini API (via a provided API key).

### Key Implemented Features:
-   **Dynamic Profile Builder:** A detailed, multi-section form serves as the foundation for all AI interactions.
-   **Resume Import:** Users can upload a PDF, TXT, or MD file to automatically parse and populate their profile.
-   **Application Tailoring & Analysis:** The app generates job-specific resumes/cover letters and provides an integrated **Application Fit Analysis**.
-   **Rich Document Editor:** Generated documents can be edited in a rich, form-based editor with drag-and-drop reordering.
-   **Interactive AI Career Coach:** A conversational AI assistant that provides career advice and can trigger navigation to other tools within the app.
-   **Personalized Career Path Generation:** The coach can generate a detailed career plan, visualized as an interactive timeline with curated video recommendations.
-   **Standalone Prep Tools:** A full suite of tools for interview prep, networking (coffee chats), application analysis, and academic mentor matching.

## Future Roadmap: Transition to a Full-Stack Application

The next major phase of development is to transition Keju from a client-side application to a full-stack, production-ready platform. This involves building and deploying a backend service.

### Phase 1: Backend Implementation & API Migration (In Progress)
-   **Goal:** Move all business logic and third-party API calls from the frontend to a secure backend.
-   **Tasks:**
    1.  **Develop a Python Backend:** Create a RESTful API using a framework like FastAPI or Flask.
    2.  **Migrate AI Logic:** Transfer all prompt engineering and calls to the Google Gemini API from the frontend services (`generationService`, etc.) to the backend. The frontend will now call endpoints like `/api/v1/generate/documents`.
    3.  **Secure API Key:** The Google Gemini API key will be stored securely on the backend, removing it entirely from the client-side code.
    4.  **Containerize & Deploy:** The backend will be containerized using Docker and deployed to a scalable platform like **Google Cloud Run**. The frontend will also be containerized and deployed.

### Phase 2: User Authentication & Database Integration
-   **Goal:** Implement multi-user support with persistent, cross-device data storage.
-   **Tasks:**
    1.  **Integrate Supabase:**
        -   Use **Supabase Auth** for user registration, login, and session management.
        -   Use the **Supabase (PostgreSQL) Database** to store all user data (profiles, document history, etc.).
    2.  **Replace `localStorage`:** Refactor the frontend to fetch and save all user data via authenticated API calls to the backend, which will then interact with Supabase.
    3.  **Secure Endpoints:** The Python backend will validate user authentication tokens (JWTs) on all relevant endpoints to ensure users can only access their own data.

This roadmap will transform Keju into a secure, scalable, and commercially viable product.
