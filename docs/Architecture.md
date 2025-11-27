# Keju Application Architecture

This document details the technical architecture of the Keju web application. Currently, Keju operates as a sophisticated **Client-Side AI Application**, leveraging the Google Gemini API directly from the browser via a custom Agent abstraction layer.

## 1. System Overview

Keju is architected as a React-based Single-Page Application (SPA) that contains all business logic, state management, and AI orchestration within the client.

1.  **Frontend (React 19):** Handles UI, routing, and local state.
2.  **AI Orchestration Layer (`AgentKit`):** A custom TypeScript layer that manages stateful conversations, tool execution, and API communication with Google Gemini.
3.  **Data Persistence:** Uses browser `localStorage` for user profiles and history, with CSV export capabilities for data portability.

## 2. Frontend Architecture

### Core Technologies
-   **React 19 & TypeScript:** Provides a robust, type-safe foundation.
-   **Tailwind CSS:** Utility-first styling.
-   **React Router DOM:** Client-side routing.
-   **Vite:** Build tool and dev server.
-   **@google/genai:** The official SDK used to communicate with Gemini models.

### Application Structure
-   **`pages/`**: Top-level views (e.g., `CareerCoachPage`, `GeneratePage`).
-   **`components/`**: Reusable UI elements.
-   **`services/`**:
    -   **`agentKit.ts`**: The core class wrapping `GoogleGenAI`. It handles the chat loop, tool calls, and retries.
    -   **`careerAgent.ts`**: Defines the specific tools (navigation, profile updates) and persona for the Career Coach.
    -   **`actions/`**: Specialized functions for specific tasks (e.g., `documentActions.ts`, `networkingActions.ts`) that instantiate one-off Agents.
-   **`context/ProfileContext.tsx`**: Manages global application state (UserProfile, Token Balance, Document History).

### State Management
-   **React Context API:** The `ProfileContext` serves as the central store.
-   **Persistence:** State is automatically synchronized to `localStorage` to persist data across sessions without a database.

## 3. AI Architecture: The Agent Kit

Instead of a traditional backend, Keju uses a "Thick Client" approach where the frontend creates and manages AI Agents.

### The `Agent` Class
Located in `services/agentKit.ts`, this class abstracts the complexity of the Gemini API:
1.  **Initialization:** Accepts a model config (e.g., `gemini-3-pro`), system instructions, and a `thinkingBudget`.
2.  **Tool Registry:** Maps function declarations (sent to the model) to executable JavaScript functions (running in the browser).
3.  **Autonomous Loop:** When `agent.chat(message)` is called:
    -   It sends the message to Gemini.
    -   If Gemini requests a tool call (e.g., `updateProfile`), the Agent executes the corresponding TypeScript function.
    -   The result is fed back to Gemini.
    -   This loop continues until Gemini produces a final text response.

## 4. Future Roadmap: Backend Integration

While the current architecture is fully functional client-side, future iterations will introduce a backend for:
-   **Authentication:** Secure user accounts via Supabase.
-   **Cloud Persistence:** Storing profiles and history in a PostgreSQL database.
-   **API Key Security:** Proxying Gemini calls through a server to hide the API key in production environments.