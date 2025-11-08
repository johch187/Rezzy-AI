# Google Gemini API Integration

The Google Gemini API is the core engine powering all intelligent features in the Keju application. This document details our integration strategy, from the low-level service wrapper to the high-level prompt engineering for each feature.

## 1. Service Layers

Our interaction with the Gemini API is organized into two main service layers to ensure modularity and reusability.

### a. `geminiService.ts` (Low-Level Wrapper)

This service provides a single, robust function, `generateContentWithRetry`, that acts as a wrapper around the `ai.models.generateContent` call.

-   **Purpose:** To handle all direct communication with the Gemini API and manage common operational concerns.
-   **Key Features:**
    -   **Automatic Retries:** It implements an exponential backoff strategy to automatically retry API calls that fail due to transient, retryable issues.
    -   **Centralized Error Handling:** It catches all API errors and uses the `parseError` utility to convert them into user-friendly, consistent error messages.

### b. `generationService.ts` (High-Level Abstraction)

This service sits on top of `geminiService.ts` and contains the business logic for specific generative tasks.

-   **Purpose:** To abstract the complexities of prompt engineering away from the page components.
-   **Implementation:** Each function in this service (e.g., `generateTailoredDocuments`, `analyzeApplicationFit`) is responsible for constructing a detailed prompt, defining a `responseSchema` for structured JSON output, calling `generateContentWithRetry`, and processing the response.

## 2. Key Prompts & Schemas

Effective prompt engineering is critical to the success of the application.

### a. AI Career Coach (`careerCoachService.ts`)

-   **Goal:** To create a conversational agent that can provide advice and use tools to interact with the application.
-   **Prompt Strategy (System Prompt):** The system prompt defines the AI's persona and provides the user's full active profile and history for context. Crucially, it lists the tools the AI can use and provides explicit instructions on *when* and *how* to use each one.
-   **Tool Definitions:** Each available tool (e.g., `updateProfessionalSummary`, `startMockInterview`, `getNegotiationPrep`) is defined as a `FunctionDeclaration` with a name, description, and a parameter schema. This allows the Gemini model to understand the tool's purpose and required arguments.

### b. Resume Parsing (`parserService.ts`)

-   **Goal:** To convert unstructured resume text into a structured `ProfileData` JSON object with maximum accuracy.
-   **Prompt Strategy:** The prompt instructs the AI to be a "hyper-attentive data extraction AI" with a goal of **completeness**. It enforces a multi-pass internal process to ensure all fields are filled.
-   **Schema:** A comprehensive JSON schema (`PARSING_SCHEMA`) mirrors the `ProfileData` type, ensuring the AI's output can be directly mapped to our application's state.

### c. Document Generation (`generationService.ts`)

-   **Goal:** To generate a resume and/or cover letter that is perfectly tailored to a job description.
-   **Prompt Strategy:** The prompt is structured with clear sections for the candidate's profile (as JSON), the job description, and strict "Directives & Constraints" that govern the output style and content.
-   **Schema:** The `responseSchema` requires a JSON object with two keys, `resume` and `coverLetter`, whose values are either the full markdown string or `null`.

### d. Interview Prep & Other Tools (`generationService.ts`)

-   **Goal:** To power the various tools in the Interview Prep Center and other parts of the app.
-   **Strategy:** Each tool (e.g., `shapeInterviewStory`, `generateInterviewQuestions`) has a dedicated function with a highly specific prompt and, where necessary, a JSON schema to structure the output for easy rendering in the UI.

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
    -   **Reasoning:** Its superior reasoning and instruction-following are essential for our most complex and nuanced tasks, ensuring the highest quality output where it matters most.