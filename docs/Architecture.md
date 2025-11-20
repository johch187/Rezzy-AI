# Keju Application Architecture

This document details the technical architecture of the Keju web application, outlining both the current frontend structure and the planned backend integration.

## 1. System Overview

Keju is architected as a modern web application with a clear separation of concerns:

1.  **Frontend:** A React-based Single-Page Application (SPA) responsible for all user interface rendering and client-side state management.
2.  **Backend (Future):** A Python-based API server that will handle all business logic, communication with third-party services (like the Google Gemini API), and data persistence.

This separation allows for a secure, scalable, and maintainable system.

## 2. Frontend Architecture

### Core Technologies
-   **React 19 & TypeScript:** Provides a robust, type-safe foundation for building a dynamic and component-based user interface.
-   **Tailwind CSS:** A utility-first CSS framework for rapid and consistent UI development.
-   **React Router DOM (`HashRouter`):** Manages all client-side navigation, chosen for its simplicity and compatibility with static hosting environments.
-   **Vite:** The build tool used for development and creating optimized production builds.

### Application Structure
-   **`pages/`**: Top-level components for each route (e.g., `HomePage`, `GeneratePage`).
-   **`components/`**: Reusable UI elements (e.g., `ProfileForm`, `Button`).
-   **`services/`**: Modules that abstract communication with the backend API. Each function in these services corresponds to a specific backend endpoint (e.g., `generateTailoredDocuments` calls `POST /api/v1/generate/documents`).
-   **`utils.ts`**: Contains client-side helper functions, including a centralized `apiService` for making `fetch` requests to the backend.
-   **`App.tsx`**: The root component managing global state via `ProfileContext` and routing.

### State Management
-   **React Context API:** The `ProfileContext` provides global state (like the active user profile, tokens, and history) to the entire application.
-   **`localStorage` (Current):** For the unauthenticated, client-only version, all user data is persisted in the browser's `localStorage`. This is a temporary solution that will be replaced.

## 3. Backend Architecture (Planned)

The backend will be a separate service responsible for all secure operations and heavy lifting.

### Core Technologies
-   **Python 3.11+:** The primary programming language.
-   **Web Framework (FastAPI/Flask):** A Python framework will be used to build the RESTful API endpoints that the frontend consumes. FastAPI is recommended for its performance and automatic documentation.
-   **Google Gemini API:** The backend will securely store the API key and be the sole point of communication with Google's AI services.
-   **Deployment:** The Python application will be containerized using **Docker** and deployed as a scalable service on **Google Cloud Run**.

### Key Responsibilities
1.  **Security:** Exposing a set of controlled API endpoints to the frontend, ensuring the Google Gemini API key and other sensitive logic are never exposed to the client.
2.  **AI Logic:** Constructing prompts, calling the Gemini API, handling streaming responses (for features like the coach), and parsing the AI's output.
3.  **Data Persistence:** Interfacing with the Supabase database to perform all CRUD (Create, Read, Update, Delete) operations for user profiles, history, and other data.
4.  **User Authentication:** Validating JWTs provided by Supabase Auth to secure endpoints and ensure users can only access their own data.

## 4. Data Persistence & Authentication (Planned)

The current `localStorage` model will be migrated to a robust solution using Supabase.

-   **Supabase Auth:** Will handle user registration, login (including social providers), and session management. The frontend will receive a JWT upon successful login.
-   **Supabase Database (PostgreSQL):** Will store all user data, including profiles, document history, and career paths.
-   **Data Flow:**
    1.  User logs in via the frontend using Supabase Auth.
    2.  The frontend stores the JWT securely.
    3.  Every request from the frontend to the Python backend includes the JWT in the `Authorization` header.
    4.  The Python backend validates the JWT with Supabase and retrieves the user's ID.
    5.  All database queries on the backend are scoped to the authenticated user's ID, ensuring data privacy.

This architecture enables a full-fledged, multi-user application with cross-device data synchronization.
