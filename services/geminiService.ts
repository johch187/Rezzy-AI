import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import { parseError } from '../utils';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set. Gemini Service cannot be initialized.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

/**
 * A robust wrapper for the Gemini API's generateContent method.
 * It includes automatic retries with exponential backoff for retryable errors.
 * @param request The complete request object for the generateContent call.
 * @returns A promise that resolves with the AI's response text.
 * @throws An error with a user-friendly message if the request fails after all retries.
 */
// FIX: Replaced deprecated `GenerateContentRequest` with `GenerateContentParameters`.
export const generateContentWithRetry = async (request: GenerateContentParameters): Promise<string> => {
    let lastError: Error | null = null;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await ai.models.generateContent(request);
            const text = response.text.trim();
            if (!text) {
                // Throw an error that can be caught and potentially retried
                throw new Error("The AI returned an empty response.");
            }
            return text; // Success
        } catch (error: any) {
            lastError = error;
            const { message, isRetryable } = parseError(error);

            if (isRetryable && i < MAX_RETRIES - 1) {
                const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
                console.warn(`Gemini API call failed (attempt ${i + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`, { error: message });
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error(`Non-retryable or final error calling Gemini API:`, error);
                // Throw the parsed, user-friendly error message
                throw new Error(message);
            }
        }
    }

    // This path should not be reachable if the loop logic is correct, but as a fallback:
    const finalError = parseError(lastError).message || `The model is currently busy. We tried several times without success. Please try again in a few moments.`;
    throw new Error(finalError);
};