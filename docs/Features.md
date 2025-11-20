# Keju Feature Breakdown

This document provides a detailed look at the major features of Keju and their technical implementation using the Client-Side Agent Architecture.

## 1. Profile Management

-   **Location:** `HomePage.tsx`, `components/ProfileForm.tsx`
-   **Purpose:** A comprehensive source of truth for the user's professional identity.
-   **AI Feature:** **Resume Parsing**
    -   **Implementation:** The `parserService.ts` reads uploaded files (PDF/TXT). It sends the raw text to a specific `gemini-3-pro-preview` model with a strict JSON schema (`PARSING_SCHEMA`).
    -   **Reasoning:** A high `thinkingBudget` is enabled to allow the model to perform a multi-pass analysis (Extraction -> Gap Analysis -> Final Verification) before returning the JSON.

## 2. Application Tailoring & Analysis

### a. Document Generation
-   **Location:** `GeneratePage.tsx`
-   **Purpose:** Create job-specific resumes and cover letters.
-   **Implementation:**
    -   **Token Cost:** Users spend tokens to generate. Costs are calculated dynamically based on selected options (e.g., +10 tokens for "Thinking Mode").
    -   **Agent:** A `DocumentAgent` is instantiated with specific directives to act as a "Career Writer." It receives the user profile and job description and outputs structured Markdown via a JSON schema.

### b. Application Fit Analysis
-   **Location:** `GeneratePage.tsx` & `ApplicationAnalysisPage.tsx`
-   **Purpose:** Evaluate resume strength against a job description.
-   **Implementation:**
    -   An **HR Evaluator Agent** compares the resume text to the job description.
    -   It returns a `fitScore` (0-100), `gapAnalysis`, and optimization tips.

## 3. AI Career Coach

-   **Location:** `CareerCoachPage.tsx`
-   **Purpose:** A persistent, interactive guide.
-   **Architecture:**
    -   Uses `createCareerAgent` (`services/careerAgent.ts`).
    -   **Tools:** The coach is equipped with client-side tools:
        -   `navigateToResumeGenerator`: Redirects the user to the generation page with context.
        -   `updateProfessionalSummary`: Directly modifies the React Context state to update the user's profile.
        -   `promptToCreateCareerPath`: Triggers a UI modal for career planning.
    -   **Context:** The agent receives the user's profile and document history as context for every message.

## 4. Career Path Planner

-   **Location:** `CareerPathPage.tsx`
-   **Purpose:** Visual roadmap generation.
-   **Implementation:**
    -   The `generateCareerPath` action calls a high-reasoning Agent to break down a transition from Role A to Role B into milestones.
    -   **Video Recommendations:** A separate "Resource Curator" Agent searches for specific YouTube video IDs that match the learning objectives of each milestone.

## 5. Preparation Tools

### Interview & Networking
-   **Location:** `InterviewPrepPage.tsx`, `CoffeeChatPrepperPage.tsx`
-   **Implementation:**
    -   **Story Shaper:** Converts unstructured "brain dumps" into STAR-formatted stories.
    -   **Coffee Chat Brief:** Generates a dossier on a person based on their bio/LinkedIn, suggesting conversation starters and shared touchpoints.
    -   **Reach Out Message:** Drafts personalized cold messages.

## 6. Data Management

-   **CSV Export:** Users can export their entire document generation history to CSV for external tracking.
-   **Token System:** A mock currency system manages usage limits, simulating a SaaS tier structure (Intern, Associate, Senior plans).