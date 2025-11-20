# Gemini API Integration

Keju utilizes the `@google/genai` SDK to interact directly with Google's Gemini models from the browser. This integration is abstracted through a custom `Agent` class that standardizes model configuration, prompt engineering, and tool execution.

## 1. The `Agent` Class Wrapper

Located in `services/agentKit.ts`, the `Agent` class is the core of the application's AI logic.

```typescript
// Simplified Agent Usage
const agent = new Agent({
  model: 'gemini-3-pro-preview',
  systemInstruction: "You are a career coach...",
  tools: [navTool, updateProfileTool],
  thinkingBudget: 32768
});

const response = await agent.chat("Help me fix my resume");
```

### Key Responsibilities:
1.  **Session Management:** Creates and maintains `ai.chats.create()` sessions.
2.  **Tool Loop Automation:** Automatically handles the `functionCall` response from Gemini. It looks up the local JavaScript function, executes it, and sends the result back to the model in a loop until a text response is generated.
3.  **Configuration:** Centralizes API key injection (from `process.env.API_KEY`) and model parameters.

## 2. Model Selection Strategy

The application dynamically selects models based on the complexity of the task:

-   **`gemini-2.5-flash`**: Used for high-speed, lower-complexity tasks like simple text generation or when the user opts out of "Thinking Mode".
-   **`gemini-3-pro-preview`**: The workhorse for complex reasoning. Used for:
    -   Resume Parsing (requires deep inference).
    -   Career Path Planning (requires strategic thinking).
    -   Application Analysis (requires critical evaluation).
    -   The AI Career Coach (requires tool use and nuanced conversation).

## 3. Thinking Budget

Keju explicitly configures the `thinkingBudget` parameter for tasks requiring deep reasoning.
-   **32k Tokens:** Used for Career Path generation and Resume Parsing to allow the model to perform "internal monologues" (e.g., multi-pass verification of parsed data).
-   **16k Tokens:** Used for specific coaching tasks.
-   **0 / Disabled:** Used for quick UI interactions to reduce latency.

## 4. Structured Outputs (JSON)

For features that require machine-readable data (Resume Parsing, Career Path, Analysis), the application uses `responseSchema` with `responseMimeType: "application/json"`.

-   **Type Safety:** The schemas are defined using the `Type` enum from `@google/genai`, ensuring the output matches the TypeScript interfaces used in the React components.
-   **Parsing:** A utility `parseAgentJson` handles the extraction of JSON from the model's response, including cleaning up any Markdown formatting (backticks).