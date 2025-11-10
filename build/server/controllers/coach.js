import { Type } from '@google/genai';
import { requireGeminiClient } from '../lib/genai.js';
const updateSummaryFunctionDeclaration = {
    name: 'updateProfessionalSummary',
    description: "Updates the user's professional summary in their main profile. Use this whenever the user asks to write, rewrite, improve, or change their summary.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            newSummary: {
                type: Type.STRING,
                description: 'The new, complete professional summary text to be saved to the user profile.',
            },
        },
        required: ['newSummary'],
    },
};
const navigateToResumeGeneratorDeclaration = {
    name: 'navigateToResumeGenerator',
    description: "Navigates the user to the resume and cover letter generation page. Use this tool when the user wants to create application documents for a specific job.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            jobDescription: {
                type: Type.STRING,
                description: 'The full job description for the role the user wants to apply for. The AI should ask the user for this if not already provided in the chat.',
            },
        },
        required: ['jobDescription'],
    },
};
const navigateToCoffeeChatDeclaration = {
    name: 'navigateToCoffeeChat',
    description: 'Navigates the user to the Coffee Chat helper page. Use this when the user wants help preparing for a networking chat or wants to write an outreach message.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            counterpartInfo: {
                type: Type.STRING,
                description: "All available information about the person the user wants to connect with (e.g., name, title, company, bio, LinkedIn profile text).",
            },
            mode: {
                type: Type.STRING,
                enum: ['prep', 'reach_out'],
                description: "The specific mode for the coffee chat tool. Use 'prep' for preparing for a chat, and 'reach_out' for crafting an initial message.",
            },
        },
        required: ['counterpartInfo', 'mode'],
    },
};
const promptToCreateCareerPathDeclaration = {
    name: 'promptToCreateCareerPath',
    description: "Displays a special UI prompt to the user asking for their permission to generate a new career path. Call this function INSTEAD of asking the user with text in the chat.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            currentRole: {
                type: Type.STRING,
                description: "The user's current professional situation (e.g., 'University Student', 'Junior Software Engineer'). Infer this from the conversation or the user's profile.",
            },
            targetRole: {
                type: Type.STRING,
                description: "The career goal or job title the user is aiming for (e.g., 'Investment Banker', 'Senior Product Manager').",
            },
            isReplacing: {
                type: Type.BOOLEAN,
                description: 'Set to true if the user already has a career path and this would replace it. This allows the UI to show the correct confirmation message.',
            },
        },
        required: ['currentRole', 'targetRole', 'isReplacing'],
    },
};
const startMockInterviewDeclaration = {
    name: 'startMockInterview',
    description: 'Initiates a text-based mock interview session within the chat. Call this when the user wants to practice for an interview.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            role: { type: Type.STRING, description: 'The job title or role the user is interviewing for.' },
        },
        required: ['role'],
    },
};
const quantifyImpactDeclaration = {
    name: 'quantifyImpact',
    description: "Analyzes a user's project or work experience description and suggests relevant metrics to quantify their impact.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            projectDescription: { type: Type.STRING, description: 'The description of the project or work experience.' },
        },
        required: ['projectDescription'],
    },
};
const reframeFeedbackDeclaration = {
    name: 'reframeFeedback',
    description: 'Helps the user reframe constructive or negative feedback into actionable opportunities for growth.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            feedbackText: { type: Type.STRING, description: 'The feedback the user has received.' },
        },
        required: ['feedbackText'],
    },
};
const getNegotiationPrepDeclaration = {
    name: 'getNegotiationPrep',
    description: 'Provides salary negotiation preparation, including average salary data and specific talking points based on the role and location.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            jobTitle: { type: Type.STRING, description: 'The role the user is negotiating for.' },
            location: { type: Type.STRING, description: 'The geographic location relevant to compensation.' },
        },
        required: ['jobTitle', 'location'],
    },
};
const coachTools = [
    updateSummaryFunctionDeclaration,
    navigateToResumeGeneratorDeclaration,
    navigateToCoffeeChatDeclaration,
    promptToCreateCareerPathDeclaration,
    startMockInterviewDeclaration,
    quantifyImpactDeclaration,
    reframeFeedbackDeclaration,
    getNegotiationPrepDeclaration,
];
const buildSystemInstruction = (profile, documentHistory) => `
    You are an expert career coach and an integrated application assistant. Your primary goal is to provide personalized, actionable advice and seamlessly guide the user to the best tool within this application to help them achieve their goals. Your tone is encouraging, insightful, and highly practical.

    You have been provided with the user's comprehensive professional profile and their recent application history. You MUST use this context to provide deeply personalized advice.

    **User's Profile Data:**
    \`\`\`json
    ${JSON.stringify(profile, null, 2)}
    \`\`\`

    **User's Recent Application History (for context on roles they've targeted):**
    \`\`\`json
    ${JSON.stringify(documentHistory.slice(0, 5), null, 2)}
    \`\`\`

    **Your Tools & Directives:**
    1. Use \`navigateToResumeGenerator\` when the user wants new application documents.
    2. Use \`navigateToCoffeeChat\` for networking or outreach help.
    3. Use \`promptToCreateCareerPath\` for long-term planning. Do not duplicate this request in plain text — the UI handles the confirmation.
    4. Use \`updateProfessionalSummary\` or \`quantifyImpact\` when the user asks for specific writing improvements.
    5. Use \`startMockInterview\` and \`getNegotiationPrep\` for interview or salary prep.
    6. Use \`reframeFeedback\` to help process and learn from feedback.
    Always provide a direct answer using the user's profile context, even when you call a tool.
`;
export const handleCareerCoachMessage = async (req, res) => {
    try {
        const { profile, documentHistory, messages } = req.body;
        if (!profile || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'profile and messages are required.' });
        }
        const ai = requireGeminiClient();
        const history = messages.slice(-20).map(message => {
            if (message.role === 'function') {
                const responsePayload = message.response && typeof message.response === 'object'
                    ? message.response
                    : { output: message.response ?? null };
                return {
                    role: 'function',
                    parts: [
                        {
                            functionResponse: {
                                name: message.name,
                                response: responsePayload,
                            },
                        },
                    ],
                };
            }
            return {
                role: message.role,
                parts: [{ text: message.content }],
            };
        });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            systemInstruction: buildSystemInstruction(profile, documentHistory ?? []),
            contents: history,
            tools: [{ functionDeclarations: coachTools }],
        });
        const candidates = response.candidates ?? [];
        const combinedText = candidates
            .map(candidate => candidate.content?.parts?.map(part => part.text ?? '').join('') ?? '')
            .join('\n')
            .trim();
        const functionCalls = candidates.flatMap(candidate => candidate.content?.parts
            ?.map(part => part.functionCall)
            .filter((call) => Boolean(call)) ?? []);
        return res.json({ message: combinedText, functionCalls });
    }
    catch (error) {
        console.error('Career coach message failed:', error);
        return res.status(500).json({ error: 'The career coach is unavailable right now. Please try again later.' });
    }
};
