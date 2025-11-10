import { GoogleGenAI, type GenerateContentParameters } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY not set. AI features will return mock data.');
}

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

export const generateContentWithRetry = async (request: GenerateContentParameters): Promise<string> => {
  if (!ai) {
    throw new Error('Gemini API not configured.');
  }

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent(request);
      const text = response.text.trim();
      if (!text) {
        throw new Error('The AI returned an empty response.');
      }
      return text;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_BACKOFF_MS * 2 ** attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      break;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Gemini request failed after multiple attempts.');
};

export const hasGeminiKey = Boolean(GEMINI_API_KEY);

export const requireGeminiClient = (): GoogleGenAI => {
  if (!ai) {
    throw new Error('Gemini API not configured.');
  }
  return ai;
};
