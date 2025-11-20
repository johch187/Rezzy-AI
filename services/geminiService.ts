import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters } from "@google/genai";

let ai: GoogleGenAI;

// Initialize the GoogleGenAI instance.
const getGenAI = (): GoogleGenAI => {
  if (!ai) {
    if (!process.env.API_KEY) {
      console.warn("API_KEY is not set. AI features will rely on mock data where available.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  }
  return ai;
};

/**
 * A wrapper for the generateContent call with basic retry logic that returns only the text.
 * @param params The parameters for the generateContent call.
 * @param retries The number of times to retry on failure.
 * @returns The generated content text.
 * @throws An error if the API call fails after all retries.
 */
export const generateContentWithRetry = async (params: GenerateContentParameters, retries = 2): Promise<string> => {
    const genAI = getGenAI();
    let lastError: Error | undefined;

    for (let i = 0; i < retries; i++) {
        try {
            const response = await genAI.models.generateContent(params);
            return response.text;
        } catch (error: any) {
            console.error(`Gemini API call attempt ${i + 1} failed:`, error);
            lastError = error;
            // Wait for a short period before retrying
            if (i < retries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    if (lastError) {
        const message = lastError.message?.toLowerCase().includes('api key not valid')
            ? 'The provided API Key is invalid. Please check your key in the environment settings.'
            : `The AI model failed to generate a response after ${retries} attempts. Please try again later. Details: ${lastError.message}`;
        throw new Error(message);
    }
    
    throw new Error('An unknown error occurred while communicating with the AI model.');
};

/**
 * A wrapper for the generateContent call that returns the full response object.
 * Useful for when function calls or other metadata are needed.
 * @param params The parameters for the generateContent call.
 * @returns The full GenerateContentResponse object.
 * @throws An error if the API call fails.
 */
export const generateContentFullResponse = async (params: GenerateContentParameters): Promise<GenerateContentResponse> => {
    const genAI = getGenAI();
    try {
        const response = await genAI.models.generateContent(params);
        return response;
    } catch (error: any) {
         console.error(`Gemini API call failed:`, error);
         const message = error.message?.toLowerCase().includes('api key not valid')
            ? 'The provided API Key is invalid. Please check your key in the environment settings.'
            : `The AI model failed to generate a response. Details: ${error.message}`;
        throw new Error(message);
    }
};