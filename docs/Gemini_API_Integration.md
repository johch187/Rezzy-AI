# Google Gemini API Integration

The Google Gemini API is the core engine powering all intelligent features in the Keju application. This document details our integration strategy, from the low-level service wrapper to the high-level prompt engineering for each feature.

## 1. Service Layers

Our interaction with the Gemini API is organized into two main service layers to ensure modularity and reusability.

### a. `geminiService.ts` (Low-Level Wrapper)

This service provides a single, robust function, `generateContentWithRetry`, that acts as a wrapper around the `ai.models.generateContent` call.

-   **Purpose:** To handle all direct communication with the Gemini API and manage common operational concerns.
-   **Key Features:**
    -   **Automatic Retries:** It implements an exponential backoff strategy to automatically retry API calls that fail due to transient, retryable issues (e.g., rate limiting, temporary server errors).
    -   **Centralized Error Handling:** It catches all API errors and uses the `parseError` utility to convert them into user-friendly, consistent error messages. This prevents raw API errors from propagating to the UI.

### b. `generationService.ts` (High-Level Abstraction)

This service sits on top of `geminiService.ts` and contains the business logic for specific generative tasks.

-   **Purpose:** To abstract the complexities of prompt engineering away from the page components.
-   **Implementation:** Each function in this service (e.g., `generateTailoredDocuments`, `generateCareerPath`) is responsible for:
    1.  Accepting application-specific data (like the user profile and options).
    2.  Constructing a detailed, highly-specific prompt tailored to the task.
    3.  Defining a `responseSchema` to instruct the Gemini API to return a valid, structured JSON object.
    4.  Calling `generateContentWithRetry` from the `geminiService`.
    5.  Parsing the JSON response and returning it in the expected format.

## 2. Key Prompts & Schemas

Effective prompt engineering is critical to the success of the application. Below are the strategies for our key features.

### a. Resume Parsing (`parserService.ts`)

-   **Goal:** To convert unstructured resume text (from PDF, TXT) into a structured `ProfileData` JSON object with maximum accuracy and completeness.
-   **Prompt Strategy:**
    -   The prompt instructs the AI to act as a "hyper-attentive data extraction AI" with a primary goal of **completeness**.
    -   It explicitly tells the model to infer data where possible, translate content to English, and handle multi-column layouts correctly.
    -   It includes a mandatory three-pass internal process (extract, analyze gaps, re-scan) to force the model to be thorough.
-   **Schema:** A comprehensive JSON schema (`PARSING_SCHEMA`) mirrors the `ProfileData` type, ensuring the AI's output can be directly mapped to our application's state.

### b. Document Generation (`generationService.ts`)

-   **Goal:** To generate a resume and/or cover letter that is perfectly tailored to a job description.
-   **Prompt Strategy:**
    -   The prompt is structured with clear sections: Candidate Profile (JSON), Target Job Description (Text), and optional inspiration documents.
    -   A "Generation Directives & Constraints" section gives the model strict rules regarding document length, tone, inclusion of a summary, and template style.
-   **Schema:** The `responseSchema` requires a JSON object with two keys, `resume` and `coverLetter`, whose values are either the full markdown string or `null`.

### c. AI Career Coach (`careerCoachService.ts`)

-   **Goal:** To create a conversational agent that can provide advice and use tools to interact with the application.
-   **Prompt Strategy (System Prompt):**
    -   The system prompt defines the AI's persona ("expert career coach"), gives it access to the user's full profile and history for context, and explicitly lists the tools it can use.
    -   For each tool, it describes *when* to use it and *what actions* to take (e.g., "You MUST ask for the full job description" before calling `navigateToResumeGenerator`).
-   **Tool Definitions:** Each available tool (e.g., `updateProfessionalSummary`) is defined as a `FunctionDeclaration` with a name, description, and a parameter schema. This allows the Gemini model to understand what the tool does and what arguments it requires.

## 3. Model Selection Strategy

We strategically use different Gemini models to balance cost, speed, and quality:

-   **`gemini-2.5-flash`:** This is the default model for most tasks.
    -   **Use Cases:** Initial resume parsing, URL scraping, and standard document generation.
    -   **Reasoning:** It offers an excellent balance of speed and capability, making it ideal for interactive, user-initiated tasks where a quick response is important.

-   **`gemini-2.5-pro`:** This is our premium, high-quality model.
    -   **Use Cases:**
        -   Document generation when "Thinking Mode" is enabled.
        -   The AI Career Coach chat session.
        -   Generating complex, long-form content like the Career Path.
        -   Reparsing a resume if a user re-uploads within a short time frame.
    -   **Reasoning:** Its superior reasoning and instruction-following capabilities are essential for our most complex and nuanced tasks, ensuring the highest quality output where it matters most.
