import { GoogleGenAI, Type } from "@google/genai";
import type { ParsedCoverLetter } from '../types';
import { parseError } from '../utils';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Some features will be disabled or mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

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