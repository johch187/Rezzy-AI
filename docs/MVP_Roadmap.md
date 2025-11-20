# Keju Project Overview

This document provides a high-level overview of the Keju project, its current capabilities, and the future roadmap.

## Project Vision: Keju - The AI Career Navigator

Keju is an AI-powered platform designed to replace generic career advice with personalized, data-driven guidance. Our mission is to empower users to:

1.  **Understand their potential:** By building dynamic, comprehensive professional profiles.
2.  **Plan their future:** By generating actionable, long-term career roadmaps.
3.  **Seize opportunities:** By creating perfectly tailored application documents and preparing for critical networking and interview interactions.

## Current Status: Advanced Client-Side AI Application

The application is a feature-rich Single-Page Application (SPA). It utilizes the Google Gemini API directly from the client to provide sophisticated AI agents without a backend server.

### Key Implemented Features:
-   **Interactive AI Career Coach:** An agentic chat interface capable of navigating the app and updating user profiles via tool calls.
-   **Dynamic Profile Builder:** Comprehensive form with **Intelligent Resume Parsing** (PDF/TXT) powered by Gemini 2.5 Pro.
-   **Application Tailoring:** Generates job-specific resumes and cover letters with integrated **Fit Analysis**.
-   **Token Economy:** A simulated credit system with visual cost estimates for generation tasks.
-   **Rich Document Editor:** Drag-and-drop section reordering and real-time Markdown editing.
-   **Career Path Planner:** Generates multi-year roadmaps with curated YouTube video learning resources.
-   **Prep Tools:** Dedicated modules for Interview Storytelling (STAR method) and Networking/Coffee Chat preparation.
-   **Data Portability:** Full CSV export of generation history and local storage persistence.
-   **Interactive Sidebar:** Collapsible navigation with persistent state.

## Future Roadmap: Transition to Full-Stack

The next phase focuses on multi-user support and cloud persistence.

### Phase 1: Authentication & Database
-   **Goal:** Allow users to access their data across devices.
-   **Tasks:**
    1.  **Integrate Supabase Auth:** Replace local profile creation with secure sign-up/login.
    2.  **Database Migration:** Move `localStorage` data (profiles, history, paths) to a PostgreSQL database.
    3.  **Security:** Implement Row Level Security (RLS) to protect user data.

### Phase 2: Backend Proxy
-   **Goal:** Secure the API Key and centralized business logic.
-   **Tasks:**
    1.  **Server-Side Agent Execution:** Move the `Agent` and `AgentKit` logic to a Node.js or Python backend.
    2.  **API Proxying:** Ensure the frontend never exposes the Google Gemini API key.

### Phase 3: Community & Monetization
-   **Goal:** Build a sustainable platform.
-   **Tasks:**
    1.  **Stripe Integration:** Replace the mock token system with real payment processing.
    2.  **Mentor Marketplace:** Connect users with human mentors based on AI matching analysis.