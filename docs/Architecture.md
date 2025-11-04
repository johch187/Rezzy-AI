# Keju Application Architecture

This document details the technical architecture of the Keju web application.

## 1. Frontend Stack

The application is a modern Single-Page Application (SPA) built with the following core technologies:

-   **React 19:** We use the latest version of React to leverage its features for building dynamic and efficient user interfaces with a component-based model.
-   **TypeScript:** All code is written in TypeScript to enforce type safety. This is crucial for managing the complex `ProfileData` object and other data structures, reducing runtime errors, and improving developer experience.
-   **Tailwind CSS:** Styling is handled via Tailwind CSS. This utility-first framework allows for rapid UI development and ensures a consistent design system without writing custom CSS. The configuration is defined directly in `index.html`.

## 2. Application Structure

The project is organized into a modular structure to promote separation of concerns and maintainability:

-   **`index.tsx`**: The main entry point of the application which renders the `App` component into the DOM.
-   **`App.tsx`**: The root component that manages global state via `ProfileContext` and sets up the application's routing structure.
-   **`pages/`**: Contains top-level components that correspond to a specific URL route (e.g., `HomePage.tsx`, `GeneratePage.tsx`). These components are responsible for the overall layout and data flow of a given page.
-   **`components/`**: A collection of reusable UI components used across different pages (e.g., `Header.tsx`, `AccordionItem.tsx`, `ProfileForm.tsx`). This promotes code reuse and consistency.
-   **`services/`**: Holds modules responsible for business logic and external API interactions. This abstracts complex operations away from the UI components.
    -   `geminiService.ts`: A low-level wrapper for the Google Gemini API, including robust error handling and retry logic.
    -   `generationService.ts`: Contains functions that build specific prompts and call the Gemini service for high-level tasks like generating documents or career paths.
    -   `parserService.ts`: Handles the logic for parsing uploaded resumes and converting generated markdown back into structured data.
    -   `careerCoachService.ts`: Manages the setup and interaction logic for the AI Career Coach chat session.
-   **`types.ts`**: A central file for all TypeScript type and interface definitions, providing a single source of truth for the application's data models.
-   **`utils.ts`**: A collection of helper functions, such as error parsing and file utilities, used throughout the application.

## 3. State Management

-   **React Context API (`ProfileContext`):** Global application state is managed using React's built-in Context API. This was chosen for its simplicity and to avoid dependencies on external state management libraries for an application of this scale.
-   **Managed State:** The `ProfileContext`, defined in `App.tsx`, provides the following global state and functions to the entire component tree:
    -   `profile`: The user's complete professional profile data.
    -   `tokens`: The number of available generation tokens.
    -   `documentHistory`: A list of recently generated documents.
    -   `careerPath`: The user's generated career roadmap.
    -   Functions to modify this state (e.g., `setProfile`, `addDocumentToHistory`).
-   **Local State (`useState`):** Component-level state (e.g., form inputs, UI toggles) is managed using the `useState` hook within individual components.

## 4. Routing

-   **React Router DOM:** Navigation within the SPA is handled by `react-router-dom`.
-   **`HashRouter`:** We use `HashRouter` as the routing strategy. This is a deliberate choice for the MVP as it works seamlessly with static file hosting (like GitHub Pages or Vercel) without requiring any server-side configuration for URL rewriting.

## 5. Data Persistence

-   **Browser `localStorage`:** All user-facing data is persisted directly in the user's browser using the `localStorage` API. This includes the main `userProfile`, `documentHistory`, and `careerPath`.
-   **Strategy:** This client-side persistence model was chosen to enable a fully-featured experience without the need for a backend database or user authentication, which simplifies the architecture and reduces operational overhead for the MVP.
-   **Trade-offs:** The primary trade-off is that user data is tied to a specific browser on a specific device and is not shareable or accessible across devices. This is an acceptable limitation for the MVP.
