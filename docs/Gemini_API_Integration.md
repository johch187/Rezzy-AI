# Backend & AI Integration

In the new architecture, all communication with the Google Gemini API is handled exclusively by the Python backend. This is a critical security measure to protect the API key and allows for more complex, stateful AI interactions. This document outlines the new data flow and the backend's responsibilities.

## 1. High-Level Data Flow

The interaction between the user, frontend, backend, and Gemini API follows this sequence:

1.  **User Action (Frontend):** The user interacts with the UI, for example, by clicking "Generate Documents" on the `GeneratePage`.
2.  **Frontend Service Call:** The React component calls a function in one of the `services/` modules (e.g., `generateTailoredDocuments` in `generationService.ts`).
3.  **API Request to Backend:** The service function uses the `apiService` utility to make a `fetch` request to a specific endpoint on the Python backend (e.g., `POST /api/v1/generate/documents`). The request body contains the necessary data (user profile, job description, etc.) as a JSON payload.
4.  **Backend Processing:** The Python backend receives the request. It validates the data and, if applicable, the user's authentication token (JWT from Supabase).
5.  **Secure Gemini API Call:** The backend constructs a detailed, secure prompt using the data from the frontend. It then makes a server-to-server call to the Google Gemini API using its stored API key.
6.  **Response to Frontend:** The backend processes the response from the Gemini API. It might format the data, save results to the database (via Supabase), and then sends a clean JSON response back to the frontend.
7.  **UI Update (Frontend):** The frontend receives the JSON response from the backend and updates the UI accordingly (e.g., displays the generated documents or analysis results).

## 2. Backend Responsibilities

The Python backend is the "brain" of the operation and is responsible for all aspects of the AI integration.

### a. Prompt Engineering

The backend will contain all the prompt engineering logic. For each feature, it will have a dedicated function that takes the frontend's raw data and constructs the highly detailed, instruction-rich prompts previously found in the frontend's `generationService.ts` and `careerCoachService.ts`.

-   **Example (`/api/v1/generate/documents`):** This endpoint will receive the user's `profile` and `options`. The backend code will then assemble the multi-part prompt, including the system instruction, the JSON-stringified profile, the job description, and the final output format requirements, before sending it to Gemini.

### b. Model Selection

The backend will be responsible for selecting the appropriate Gemini model for each task to balance cost, speed, and quality.

-   **`gemini-2.5-flash`** will be used for simpler, high-volume tasks.
-   **`gemini-2.5-pro`** will be used for complex reasoning, such as the AI Career Coach, career path generation, and application analysis.

### c. Tool (Function Calling) Implementation

For the AI Career Coach, the backend will manage the entire function-calling loop.

1.  The backend defines the tool schemas (e.g., `navigateToResumeGenerator`, `updateProfessionalSummary`) that it sends to the Gemini API.
2.  When Gemini responds with a `functionCall`, the backend does **not** execute the function itself. Instead, it translates the AI's intent into a structured response for the frontend.
3.  **Example:** If Gemini returns a `functionCall` for `navigateToResumeGenerator`, the backend's response to the frontend might look like this:
    ```json
    {
      "text": "Great! Let's get that resume tailored. I'm taking you to the generator now...",
      "action": {
        "type": "navigate",
        "payload": {
          "path": "/generate",
          "state": { "jobDescription": "..." }
        }
      }
    }
    ```
4.  The frontend receives this response and is responsible for performing the navigation. This keeps the backend stateless while still allowing the AI to "control" the application's UI.

### d. State Management for Conversations

The AI Career Coach requires a stateful conversation. The backend will manage this by:
1.  Receiving the entire chat history from the frontend with each new message.
2.  Passing this history to the Gemini API to maintain context.
3.  This ensures that even if the backend is deployed as a stateless service (as is common on Cloud Run), the conversation's context is preserved across requests.
