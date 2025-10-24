import { GoogleGenAI, Type } from "@google/genai";
import type { ParsedCoverLetter } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Some features will be disabled or mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Parses a caught error object from an API call and returns a user-friendly message
 * and a flag indicating if the operation is retryable.
 * @param error The caught error object.
 * @returns An object with a user-friendly `message` and a boolean `isRetryable`.
 */
const parseError = (error: any): { message: string, isRetryable: boolean } => {
    const errorMessage = String(error?.message || error).toLowerCase();

    // --- Gemini API & Network Errors ---

    // Non-Retryable Errors (User action required or permanent failure)
    if (errorMessage.includes('api key not valid')) {
        return { message: "Invalid API Key: The API key provided is not valid. Please ensure you have configured it correctly.", isRetryable: false };
    }
    if (errorMessage.includes('content has been blocked') || errorMessage.includes('safety policy')) {
        return { message: "Content Blocked: Your request was blocked due to safety settings. Please modify your input and try again.", isRetryable: false };
    }
    if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
        return { message: "Invalid Request: The data sent to the AI was malformed. This could be due to a bug. Please try again, and if the problem persists, contact support.", isRetryable: false };
    }
    
    // Retryable Errors (Temporary issues)
    if (errorMessage.includes('rate limit') || errorMessage.includes('resource has been exhausted')) {
        return { message: "Service Busy: The AI service is currently experiencing high traffic. Please wait a moment before trying again.", isRetryable: true };
    }
    if (errorMessage.includes('503') || errorMessage.includes('500') || errorMessage.includes('unavailable') || errorMessage.includes('internal error')) {
        return { message: "Service Unavailable: The AI service is temporarily unavailable. This is usually a short-term issue. Please try again in a few moments.", isRetryable: true };
    }
    if (errorMessage.includes('network request failed') || errorMessage.includes('fetch') || errorMessage.includes('network error') || errorMessage.includes('timed out')) {
         return { message: "Network Error: We couldn't connect to the service. Please check your internet connection and try again.", isRetryable: true };
    }
    if (error instanceof SyntaxError || errorMessage.includes('json')) {
        return { message: "Invalid AI Response: The model returned a response in an unexpected format. This can be a temporary issue, please try again.", isRetryable: true };
    }
    
    // Default/Unknown Errors
    console.error("Unhandled API Error:", error);
    const displayMessage = `An unexpected error occurred. Please try again. Details: ${error.message || 'No additional details available.'}`;
    return { message: displayMessage, isRetryable: false };
};


export const parseGeneratedCoverLetter = async (coverLetterMarkdown: string): Promise<ParsedCoverLetter> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured. Cannot parse cover letter.");
    }

    if (!coverLetterMarkdown || coverLetterMarkdown.trim().length < 20) {
        throw new Error("The generated cover letter content is too short to parse.");
    }
    
    const prompt = `
        You are an expert data extraction system. Your task is to meticulously analyze the provided cover letter, which is in MARKDOWN format, and extract its components into a structured JSON object.

        **Cover Letter Markdown to Parse:**
        ---
        ${coverLetterMarkdown}
        ---
        
        **Detailed Parsing Instructions:**

        1.  **Sender Information**:
            - \`senderName\`: The full name of the person sending the letter.
            - \`senderAddress\`: The full street address, city, state, and zip code of the sender. Consolidate into a single string. If parts are on multiple lines, join them.
            - \`senderContact\`: The sender's email and/or phone number. Consolidate into a single string.

        2.  **Date**: Extract the date the letter was written.

        3.  **Recipient Information**:
            - \`recipientName\`: The full name of the hiring manager or recipient. If not specified, use "Hiring Manager".
            - \`recipientTitle\`: The job title of the recipient.
            - \`companyName\`: The name of the company.
            - \`companyAddress\`: The full address of the company. Consolidate into a single string.

        4.  **Letter Content**:
            - \`salutation\`: The opening greeting (e.g., "Dear Ms. Jones,").
            - \`body\`: The entire main content of the letter, from the first paragraph after the salutation to the last paragraph before the closing. Preserve paragraph breaks by using "\\n\\n".
            - \`closing\`: The closing phrase (e.g., "Sincerely," or "Best regards,").
            - \`signature\`: The sender's name as it appears at the very end.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        senderName: { type: Type.STRING },
                        senderAddress: { type: Type.STRING },
                        senderContact: { type: Type.STRING },
                        date: { type: Type.STRING },
                        recipientName: { type: Type.STRING },
                        recipientTitle: { type: Type.STRING },
                        companyName: { type: Type.STRING },
                        companyAddress: { type: Type.STRING },
                        salutation: { type: Type.STRING },
                        body: { type: Type.STRING },
                        closing: { type: Type.STRING },
                        signature: { type: Type.STRING },
                    },
                },
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error: any) {
        console.error("Error parsing generated cover letter:", error);
        const { message } = parseError(error);
        throw new Error(message);
    }
};