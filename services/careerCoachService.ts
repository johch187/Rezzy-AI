import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import type { ProfileData, DocumentGeneration } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set. Career Coach Service cannot be initialized.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Tool Definitions for Career Coach ---

const updateSummaryFunctionDeclaration: FunctionDeclaration = {
  name: 'updateProfessionalSummary',
  description: "Updates the user's professional summary in their main profile. Use this whenever the user asks to write, rewrite, improve, or change their summary.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      newSummary: { type: Type.STRING, description: 'The new, complete professional summary text to be saved to the user profile.' },
    },
    required: ['newSummary'],
  },
};

const navigateToResumeGeneratorDeclaration: FunctionDeclaration = {
    name: 'navigateToResumeGenerator',
    description: "Navigates the user to the resume and cover letter generation page. Use this tool when the user wants to create application documents for a specific job.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            jobDescription: { type: Type.STRING, description: 'The full job description for the role the user wants to apply for. The AI should ask the user for this if not already provided in the chat.' }
        },
        required: ['jobDescription']
    }
};

const navigateToCoffeeChatDeclaration: FunctionDeclaration = {
    name: 'navigateToCoffeeChat',
    description: "Navigates the user to the Coffee Chat helper page. Use this when the user wants help preparing for a networking chat or wants to write an outreach message.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            counterpartInfo: { type: Type.STRING, description: "All available information about the person the user wants to connect with (e.g., name, title, company, bio, LinkedIn profile text)." },
            mode: { type: Type.STRING, enum: ['prep', 'reach_out'], description: "The specific mode for the coffee chat tool. Use 'prep' for preparing for a chat, and 'reach_out' for crafting an initial message." }
        },
        required: ['counterpartInfo', 'mode']
    }
};

const promptToCreateCareerPathDeclaration: FunctionDeclaration = {
    name: 'promptToCreateCareerPath',
    description: "Displays a special UI prompt to the user asking for their permission to generate a new career path. Call this function INSTEAD of asking the user with text in the chat. The UI will handle the user's 'yes' or 'no' response. After calling this, your job is to wait for the user's next text input.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            currentRole: { type: Type.STRING, description: "The user's current professional situation (e.g., 'University Student', 'Junior Software Engineer'). Infer this from the conversation or the user's profile." },
            targetRole: { type: Type.STRING, description: "The career goal or job title the user is aiming for (e.g., 'Investment Banker', 'Senior Product Manager')." },
            isReplacing: { type: Type.BOOLEAN, description: "Set to 'true' if the user already has a career path and this would replace it. This allows the UI to show the correct confirmation message." }
        },
        required: ['currentRole', 'targetRole', 'isReplacing']
    }
};

const startMockInterviewDeclaration: FunctionDeclaration = {
    name: 'startMockInterview',
    description: "Initiates a text-based mock interview session within the chat. Call this when the user wants to practice for an interview.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            role: { type: Type.STRING, description: "The job title or role the user is interviewing for, e.g., 'Business Analyst'."}
        },
        required: ['role']
    }
};

const quantifyImpactDeclaration: FunctionDeclaration = {
    name: 'quantifyImpact',
    description: "Analyzes a user's project or work experience description and suggests relevant metrics to quantify their impact. Use when the user asks for help making their resume sound more impressive or data-driven.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            projectDescription: { type: Type.STRING, description: "The description of the project or work experience the user wants to quantify." }
        },
        required: ['projectDescription']
    }
};

const reframeFeedbackDeclaration: FunctionDeclaration = {
    name: 'reframeFeedback',
    description: "Helps the user reframe constructive or negative feedback into actionable opportunities for growth.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            feedbackText: { type: Type.STRING, description: "The feedback the user has received." }
        },
        required: ['feedbackText']
    }
};

const getNegotiationPrepDeclaration: FunctionDeclaration = {
    name: 'getNegotiationPrep',
    description: "Provides salary negotiation preparation, including average salary data and specific talking points based on the user's background.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            jobTitle: { type: Type.STRING, description: "The job title for the negotiation." },
            location: { type: Type.STRING, description: "The city and state/country for the job." }
        },
        required: ['jobTitle', 'location']
    }
};

/**
 * Creates and initializes a career coach chat session.
 * @param profile The user's profile data.
 * @param documentHistory The user's document generation history.
 * @returns An initialized Chat instance.
 */
export const createCareerCoachSession = (profile: ProfileData, documentHistory: DocumentGeneration[]): Chat => {
  const modelName = 'gemini-2.5-pro'; // Use the more advanced model for coaching

  const systemInstruction = `
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
    You have access to special tools to help the user. You must call these functions when appropriate. Your default behavior should be to answer questions directly, but use a tool when a user's request maps to a specific, powerful action.

    1.  **Guiding to Document Generation:**
        -   **Tool:** \`navigateToResumeGenerator\`
        -   **When to Use:** If the user mentions applying for a job, wanting to create a resume or cover letter for a specific role.
        -   **Action:** You MUST ask for the full job description. Once they provide it, call the \`navigateToResumeGenerator\` function.

    2.  **Guiding to Networking & Outreach:**
        -   **Tool:** \`navigateToCoffeeChat\`
        -   **When to Use:** If the user talks about networking, preparing for a coffee chat, or wanting to write an outreach message.
        -   **Action:** Ask for information about the person they're contacting and clarify if they want to 'prepare for the chat' (mode: 'prep') or 'write an outreach message' (mode: 'reach_out'). Then call the tool.

    3.  **Guiding to Career Planning:**
        -   **Tool:** \`promptToCreateCareerPath\`
        -   **When to Use:** If the user asks for long-term career advice, how to break into a new field, or what steps to take to get to a specific role.
        -   **Action:** Determine if this will replace an existing path by checking the context. Call the \`promptToCreateCareerPath\` tool. DO NOT ask the user with text. The tool handles the UI prompt.

    4.  **Improving Profile & Documents:**
        -   **Tool:** \`updateProfessionalSummary\`
        -   **When to Use:** If the user explicitly asks you to write, rewrite, or improve their professional summary.
        -   **Tool:** \`quantifyImpact\`
        -   **When to Use:** When a user wants to make their experience sound more impactful or asks for help with metrics for their resume.

    5.  **Interview & Negotiation Prep:**
        -   **Tool:** \`startMockInterview\`
        -   **When to Use:** When the user explicitly asks to "practice for an interview" or "start a mock interview".
        -   **Action:** After calling the tool, you will adopt the persona of an interviewer for the specified role. Start by asking the first question.
        -   **Tool:** \`getNegotiationPrep\`
        -   **When to Use:** When the user asks about salary, negotiation tactics, or how to ask for a raise.

    6.  **Personal Development & Strategy:**
        -   **Tool:** \`reframeFeedback\`
        -   **When to Use:** When a user shares negative or tough feedback and asks how to handle it or what to learn from it.
        -   **Direct Answer First:** For general career exploration questions like "What should I do for a career?" or "What are my strengths?", first provide a direct, insightful answer based on their profile. You can then suggest a deeper dive using a tool if appropriate.

    **General Conversation Rules:**
    -   Always leverage the user's profile to make your advice specific. Refer to their experiences and skills.
    -   Be proactive. If a user's question hints at a task one of your tools can handle, suggest using it.
    -   If a request requires both a tool call and a direct answer, provide the direct answer as a text response in the SAME turn that you make the tool call.
  `;
  
  const chat = ai.chats.create({
    model: modelName,
    config: {
        systemInstruction,
        tools: [{ functionDeclarations: [
            updateSummaryFunctionDeclaration, 
            navigateToResumeGeneratorDeclaration, 
            navigateToCoffeeChatDeclaration, 
            promptToCreateCareerPathDeclaration,
            startMockInterviewDeclaration,
            quantifyImpactDeclaration,
            reframeFeedbackDeclaration,
            getNegotiationPrepDeclaration,
        ] }],
    },
  });

  return chat;
};