import { Agent, AgentTool } from "./agentKit";
import { Type } from "@google/genai";
import type { ProfileData, DocumentGeneration } from '../types';

// Define the interface for the "UI Callbacks" this agent needs to function
export interface AgentUICallbacks {
    navigate: (path: string, state?: any) => void;
    updateProfile: (updates: Partial<ProfileData>) => void;
    promptCareerPath: (data: { currentRole: string; targetRole: string; isReplacing: boolean }) => void;
}

/**
 * Factory function to create a fresh Career Agent instance.
 */
export const createCareerAgent = (callbacks: AgentUICallbacks, documentHistory: DocumentGeneration[]) => {
    
    // Define tools
    const tools: AgentTool[] = [
        {
            declaration: {
                name: 'updateProfessionalSummary',
                description: "Updates the user's main professional summary in their profile. Use this when the user explicitly agrees to a new summary suggestion.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        newSummary: { type: Type.STRING, description: "The new, improved professional summary text." },
                    },
                    required: ['newSummary'],
                },
            },
            execute: async ({ newSummary }: { newSummary: string }) => {
                callbacks.updateProfile({ summary: newSummary });
                return "Successfully updated the user's profile summary.";
            }
        },
        {
            declaration: {
                name: 'navigateToResumeGenerator',
                description: "Navigates the user to the resume/cover letter generation page. Use this when the user wants to create documents for a specific job.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        jobDescription: { type: Type.STRING, description: "The job description text." },
                    },
                    required: ['jobDescription'],
                },
            },
            execute: async ({ jobDescription }: { jobDescription: string }) => {
                callbacks.navigate('/generate', { state: { jobDescription } });
                return "Navigated user to the generation page with the job description pre-filled.";
            }
        },
        {
            declaration: {
                name: 'navigateToCoffeeChat',
                description: "Navigates the user to the Coffee Chat Prepper tool. Use this for networking advice.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        counterpartInfo: { type: Type.STRING, description: "Info about the person they are meeting." },
                        mode: { type: Type.STRING, enum: ['prep', 'reach_out'], description: "Mode: 'prep' for a brief, 'reach_out' for a message." },
                    },
                    required: ['counterpartInfo', 'mode'],
                },
            },
            execute: async ({ counterpartInfo, mode }: { counterpartInfo: string, mode: string }) => {
                callbacks.navigate('/coffee-chats', { state: { initialCounterpartInfo: counterpartInfo, initialMode: mode } });
                return `Navigated user to Coffee Chat tool in '${mode}' mode.`;
            }
        },
        {
            declaration: {
                name: 'promptToCreateCareerPath',
                description: "Triggers a UI prompt asking the user if they want to generate a long-term career path. Use when the user discusses career transitions.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        currentRole: { type: Type.STRING, description: "Current role." },
                        targetRole: { type: Type.STRING, description: "Target role." },
                    },
                    required: ['currentRole', 'targetRole'],
                },
            },
            execute: async ({ currentRole, targetRole }: { currentRole: string, targetRole: string }, context: { profile: ProfileData }) => {
                const isReplacing = !!context.profile?.careerPath;
                callbacks.promptCareerPath({ currentRole, targetRole, isReplacing });
                return "Displayed a confirmation prompt to the user to create a career path. Inform the user you've triggered this, and then immediately ask a relevant follow-up question (e.g., about their timeline, specific industry interests, or major concerns) to keep the conversation flowing while they decide.";
            }
        }
    ];

    const systemInstruction = `You are Keju, an expert Career Coach. 
    - Your goal is to provide personalized, actionable career advice.
    - You have access to tools to modify the user's profile and navigate the app.
    - **Always** use tools when they are relevant. Do not just say you will do something; actually call the function.
    - If you update the profile or navigate, briefly confirm this in your final text response.
    - **CRITICAL:** Always end your response with a relevant follow-up question or a call to action to encourage the user to continue the conversation. Do not let the chat end abruptly.
    - Be concise, encouraging, and professional.
    - Context: The user has generated ${documentHistory.length} documents recently.`;

    return new Agent({
        model: 'gemini-3-pro-preview', // Powerful model for reasoning
        systemInstruction,
        tools,
        thinkingBudget: 32768 // Allow deep thinking for complex career advice
    });
};