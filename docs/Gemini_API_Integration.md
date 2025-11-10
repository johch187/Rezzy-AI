# Google Gemini API Integration

The Google Gemini API is the core engine powering all intelligent features in the Keju application. This document details our integration strategy, from the low-level service wrapper to the high-level prompt engineering for each feature.

## 1. Service Layers

Our interaction with the Gemini API is organized into two main service layers to ensure modularity and reusability.

### a. `server/lib/genai.ts` (Low-Level Wrapper)

All direct Gemini calls now happen on the backend inside the Cloud Run container. The `server/lib/genai.ts` module exposes a single helper, `generateContentWithRetry`, that wraps `ai.models.generateContent`.

-   **Purpose:** Provide a hardened, server-side integration point that keeps API keys private.
-   **Key Features:**
    -   **Automatic Retries:** Implements exponential backoff for transient errors.
    -   **Centralized Error Handling:** Surfaces consistent errors to the Express controllers, which in turn relay user-friendly messages to the client.

### b. Feature Services + Client Gateway

-   **Backend:** Prompt engineering lives in dedicated service files such as `server/controllers/generation.ts`, `server/services/aiTools.ts`, `server/services/parser.ts`, and `server/services/scraper.ts`. Each service builds the prompt, defines optional JSON schemas, and calls `generateContentWithRetry`.
-   **Frontend:** The React app never touches Gemini directly. Instead, `services/aiGateway.ts` attaches the Supabase access token and calls the corresponding `/api/...` endpoint. This keeps credentials on the server while allowing the UI to stay simple.

## 2. Key Prompts & Schemas

Effective prompt engineering is critical to the success of the application.

### a. AI Career Coach (`server/controllers/coach.ts`)

-   **Goal:** To create a conversational agent that can provide advice and use tools to interact with the application.
-   **Prompt Strategy (System Prompt):** The backend generates the system prompt using the user's active profile and history for context. Crucially, it lists the tools the AI can use and provides explicit instructions on *when* and *how* to use each one.
-   **Tool Definitions:** Each available tool (e.g., `updateProfessionalSummary`, `startMockInterview`, `getNegotiationPrep`) is defined as a `FunctionDeclaration` with a name, description, and a parameter schema. This allows the Gemini model to understand the tool's purpose and required arguments.

### b. Resume Parsing (`server/services/parser.ts`)

-   **Goal:** To convert unstructured resume text into a structured `ProfileData` JSON object with maximum accuracy.
-   **Prompt Strategy:** The backend prompt instructs the AI to be a "hyper-attentive data extraction AI" with a goal of **completeness**. It enforces a multi-pass internal process to ensure all fields are filled.
-   **Schema:** A comprehensive JSON schema (`PARSING_SCHEMA`) mirrors the `ProfileData` type, ensuring the AI's output can be directly mapped to our application's state.

### c. Document Generation (`server/controllers/generation.ts`)

-   **Goal:** To generate a resume and/or cover letter that is perfectly tailored to a job description.
-   **Prompt Strategy:** The server-side prompt is structured with clear sections for the candidate's profile (as JSON), the job description, and strict "Directives & Constraints" that govern the output style and content.
-   **Schema:** The `responseSchema` requires a JSON object with two keys, `resume` and `coverLetter`, whose values are either the full markdown string or `null`.

### d. Interview Prep & Other Tools (`server/services/aiTools.ts`)

-   **Goal:** To power the various tools in the Interview Prep Center and other parts of the app.
-   **Strategy:** Each tool (e.g., `shapeInterviewStory`, `generateInterviewQuestions`) has a dedicated backend function with a highly specific prompt and, where necessary, a JSON schema to structure the output for easy rendering in the UI.

### e. Application Analysis & Mentor Matching (`server/controllers/generation.ts`)

-   **Goal:** To provide specialized, structured analysis for standalone tools.
-   **Strategy:**
    -   **`analyzeApplicationFit`**: The prompt asks the AI to act as a career analyst, comparing a resume to a job description. A strict JSON schema with keys like `fitScore`, `gapAnalysis`, and `keywordOptimization` is used to get a structured analysis object.
    -   **`findMentorMatch`**: The prompt instructs the AI to act as an academic advisor, comparing a thesis topic to faculty bios. It uses a JSON schema to return an array of `MentorMatch` objects, ensuring the data is correctly structured for ranking and display.

## 3. Model Selection Strategy

We strategically use different Gemini models to balance cost, speed, and quality:

-   **`gemini-2.5-flash`:** This is the default model for most interactive tasks.
    -   **Use Cases:** Standard document generation, URL scraping, YouTube recommendations, and the *first* resume parse from an uploaded file. Also used for grounded search tasks like salary lookup.
    -   **Reasoning:** Offers an excellent balance of speed and capability for user-initiated tasks where a quick response is important.

-   **`gemini-2.5-pro`:** This is our premium, high-quality model.
    -   **Use Cases:**
        -   Document generation when "Thinking Mode" is enabled.
        -   All AI Career Coach conversations and tool executions.
        -   Generating complex, structured content like the Career Path or Application Analysis.
        -   All Interview Prep tasks.
        -   Parsing *generated* documents back into structured data for the editor.
        -   Reparsing a resume from a file if the user uploads again within a 10-minute window (providing a higher-quality "second chance" parse).
        -   All Application Strength Analysis and Mentor Matcher tasks.
    -   **Reasoning:** Its superior reasoning and instruction-following are essential for our most complex and nuanced tasks, ensuring the highest quality output where it matters most.
