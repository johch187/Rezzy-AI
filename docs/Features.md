# Keju Feature Breakdown

This document provides a detailed look at the major features of the Keju application, their purpose, and their technical implementation.

## 1. Profile Builder & Resume Import

-   **Location:** `HomePage.tsx`, `components/ProfileForm.tsx`
-   **Purpose:** To create a single, comprehensive source of truth for the user's professional identity. This profile is the foundational context for all subsequent AI interactions.
-   **Key Features:**
    -   **Comprehensive Form:** A multi-section accordion form allows users to input everything from personal info and work experience to custom-defined sections.
    -   **Live Validation:** The form provides real-time validation for critical fields like email and URLs to ensure data quality.
    -   **Resume Import:** Users can upload a `.pdf`, `.txt`, or `.md` file. The `parserService.ts` reads the file, sends the text to the Gemini API with a specialized prompt and schema, and receives structured JSON back to automatically populate the profile form.
    -   **Autosave & Manual Save:** The profile is automatically saved to `localStorage` every two minutes, and a "Save Changes" bar appears for immediate manual saves, providing a seamless user experience.

## 2. Document Generation

-   **Location:** `GeneratePage.tsx`
-   **Purpose:** To generate resumes and cover letters that are highly tailored to a specific job application.
-   **Workflow:**
    1.  **Input:** The user provides a job posting URL (which is scraped via `scrapingService.ts`) or pastes the job description text directly.
    2.  **Configuration:** The user selects which documents to generate (resume, cover letter), chooses templates, and fine-tunes options like tone, length, and technicality.
    3.  **Content Selection:** A `ProfileContentSelector` component allows the user to cherry-pick which specific items from their profile (e.g., which jobs, skills, or projects) to include in this specific generation.
    4.  **Generation:** The `generationService.ts` compiles the user's filtered profile, the job description, and all selected options into a detailed prompt. It then calls the Gemini API (`gemini-2.5-flash` or `gemini-2.5-pro` if "Thinking Mode" is on) to generate the documents.

## 3. Generation Results & Editor

-   **Location:** `GenerationResultPage.tsx`, `components/EditableDocument.tsx`
-   **Purpose:** To allow users to review, refine, and export their AI-generated documents.
-   **Key Features:**
    -   **Smart Parsing:** Upon receiving the generated markdown, the app immediately uses `parserService.ts` to parse it back into a structured format (`ParsedResume`, `ParsedCoverLetter`).
    -   **Rich Editing:** If parsing is successful, the document is displayed in a rich, form-based editor where users can edit individual fields, reorder sections via drag-and-drop, and see a live preview.
    -   **Fallback to Text:** If the AI's output can't be parsed into the structured editor, it gracefully falls back to a standard markdown text editor.
    -   **Export Options:** Users can download their final document as a PDF (using the browser's print functionality) or copy the content to paste into Google Docs.

## 4. Coffee Chat Prepper

-   **Location:** `CoffeeChatPrepperPage.tsx`, `CoffeeChatResultPage.tsx`
-   **Purpose:** To help users excel at professional networking.
-   **Modes:**
    -   **Prep Mode:** The user provides information about the person they're meeting. The AI generates a "Coffee Chat Brief" containing talking points, shared connections, and conversation starters.
    -   **Reach Out Mode:** The user provides the same information, and the AI generates a concise, professional outreach message for platforms like LinkedIn or email.
-   **Service:** `generationService.ts` contains the `generateCoffeeChatBrief` and `generateReachOutMessage` functions, which use specialized prompts to produce the desired output.

## 5. AI Career Coach

-   **Location:** `CareerCoachPage.tsx`
-   **Purpose:** To provide an interactive, conversational interface for personalized career advice.
-   **Implementation:**
    -   **Session-Based Chat:** `careerCoachService.ts` initializes a chat session using the Gemini API's chat functionality (`ai.chats.create`).
    -   **Contextual System Prompt:** The session is initialized with a detailed system prompt that includes the user's full profile and document history, enabling the AI to give highly contextual advice.
    -   **Tool Calling (Function Calling):** The coach is configured with a set of tools it can use. For example, it can call functions to:
        -   `updateProfessionalSummary`: Directly modify the user's profile.
        -   `navigateToResumeGenerator`: Send the user to the document generator with a pre-filled job description.
        -   `navigateToCoffeeChat`: Send the user to the networking tool.
        -   `generateAndSaveCareerPath`: Trigger a long-running background task to create a career plan.

## 6. Career Path Planner

-   **Location:** `CareerPathPage.tsx`
-   **Purpose:** To visualize the long-term career roadmap generated by the AI.
-   **Workflow:**
    1.  The user requests a career path from the **AI Career Coach** (e.g., "How do I become a Senior Product Manager?").
    2.  The coach calls the `generateAndSaveCareerPath` tool.
    3.  `generationService.ts` sends a highly detailed prompt and a strict JSON schema to the Gemini API (`gemini-2.5-pro`) to generate a multi-year plan with quarterly action items.
    4.  The result is saved to `localStorage` via the `ProfileContext`.
    5.  The `CareerPathPage` reads this data and displays it as an interactive, scroll-aware timeline.
