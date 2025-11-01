import { GoogleGenAI, FunctionDeclaration, Type, Chat } from "@google/genai";
import type { ProfileData, DocumentHistoryItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Career Coach Service cannot be initialized.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the function that the AI can call
const updateSummaryFunctionDeclaration: FunctionDeclaration = {
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

const navigateToResumeGeneratorDeclaration: FunctionDeclaration = {
    name: 'navigateToResumeGenerator',
    description: "Navigates the user to the resume and cover letter generation page. Use this tool when the user wants to create application documents for a specific job.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            jobDescription: {
                type: Type.STRING,
                description: 'The full job description for the role the user wants to apply for. The AI should ask the user for this if not already provided in the chat.'
            }
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
            counterpartInfo: {
                type: Type.STRING,
                description: "All available information about the person the user wants to connect with (e.g., name, title, company, bio, LinkedIn profile text)."
            },
            mode: {
                type: Type.STRING,
                enum: ['prep', 'reach_out'],
                description: "The specific mode for the coffee chat tool. Use 'prep' for preparing for a chat, and 'reach_out' for crafting an initial message."
            }
        },
        required: ['counterpartInfo', 'mode']
    }
};

const generateAndSaveCareerPathDeclaration: FunctionDeclaration = {
    name: 'generateAndSaveCareerPath',
    description: "Generates a detailed career path roadmap for the user in the background and saves it. Use this when the user asks for long-term career advice, how to get to a specific role, or what steps they should take. Informs the user that the generation has started and that they can view the result on the 'Career Path' page when it's ready, allowing the conversation to continue.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            currentRole: {
                type: Type.STRING,
                description: "The user's current professional situation (e.g., 'University Student', 'Junior Software Engineer'). Infer this from the conversation or the user's profile."
            },
            targetRole: {
                type: Type.STRING,
                description: "The career goal or job title the user is aiming for (e.g., 'Investment Banker', 'Senior Product Manager')."
            }
        },
        required: ['currentRole', 'targetRole']
    }
};


/**
 * Creates and initializes a career coach chat session.
 * @param profile The user's profile data.
 * @param documentHistory The user's document generation history.
 * @returns An initialized Chat instance.
 */
export const createCareerCoachSession = (profile: ProfileData, documentHistory: DocumentHistoryItem[]): Chat => {
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
    You have access to special tools to help the user. You must call these functions when appropriate.

    1.  **Guiding to Resume/Cover Letter Generation:**
        -   **Tool:** \`navigateToResumeGenerator\`
        -   **When to Use:** If the user mentions applying for a job, wanting to create a resume or cover letter, or asks for help tailoring their documents for a specific role.
        -   **Action:** You MUST ask for the full job description. Once they provide it, call the \`navigateToResumeGenerator\` function with the job description. Then, inform the user you are taking them to the right place.

    2.  **Guiding to Networking & Outreach Help:**
        -   **Tool:** \`navigateToCoffeeChat\`
        -   **When to Use:** If the user talks about networking, preparing for a coffee chat/informational interview, or wanting to write a message to contact someone.
        -   **Action:** Ask for information about the person they're contacting. Also, clarify if they want to 'prepare for the chat' (mode: 'prep') or 'write an outreach message' (mode: 'reach_out'). Call the \`navigateToCoffeeChat\` function with this information.

    3.  **Updating the User's Profile:**
        -   **Tool:** \`updateProfessionalSummary\`
        -   **When to Use:** If the user explicitly asks you to write, rewrite, or improve their professional summary.
        -   **Action:** Call the \`updateProfessionalSummary\` function with the new summary text. Do NOT just output the text in the chat. Confirm the action after the tool is called.
    
    4.  **Guiding to Career Planning:**
        -   **Tool:** \`generateAndSaveCareerPath\`
        -   **When to Use:** If the user asks for long-term career advice, how to break into a new field, what steps to take to get a promotion, or expresses uncertainty about their career trajectory (e.g., "How do I become a Product Manager?").
        -   **Action:** Identify their current role (e.g., from their profile or the conversation) and their desired target role. Call the \`generateAndSaveCareerPath\` function. This will happen in the background. You should tell the user that you've started the process and they can continue chatting.

    **General Conversation Rules:**
    -   Always leverage the user's profile to make your advice specific.
    -   Provide concrete examples (e.g., write out a sample resume bullet point).
    -   If you suggest external resources, provide links.
    -   Be proactive. If a user's question hints at a task one of your tools can handle, suggest using it.
    -   **Crucially, if a user's request requires both a tool call (like generating a career path) and a direct answer to a question, you should provide the direct answer as a text response in the SAME turn that you make the tool call.**
  `;
  
  const chat = ai.chats.create({
    model: modelName,
    config: {
        systemInstruction,
        tools: [{ functionDeclarations: [updateSummaryFunctionDeclaration, navigateToResumeGeneratorDeclaration, navigateToCoffeeChatDeclaration, generateAndSaveCareerPathDeclaration] }],
    },
  });

  return chat;
};