import type { ProfileData, DocumentGeneration } from '../types';
import { postJson } from './apiClient';

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
    return {
        chat: async (userMessage: string, context: { profile: ProfileData }, onStatus?: (status: string) => void) => {
            try {
                onStatus?.('Thinking...');
                const response = await postJson<{ text: string }>("/api/llm/career-chat", {
                    message: userMessage,
                    profile: context.profile,
                    documentHistory,
                });
                onStatus?.('');
                return response.text;
            } catch (err: any) {
                onStatus?.('');
                console.error("Career chat failed", err);
                throw new Error(err?.message || 'Unable to reach the career coach right now.');
            }
        }
    };
};
