/**
 * Frontend Gemini access is disabled. Route all model calls through the backend.
 */
export const generateContentWithRetry = async () => {
    throw new Error("Frontend Gemini client is disabled. Use backend LLM endpoints.");
};

export const generateContentFullResponse = async () => {
    throw new Error("Frontend Gemini client is disabled. Use backend LLM endpoints.");
};
