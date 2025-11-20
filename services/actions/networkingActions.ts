import type { ProfileData } from '../../types';
import { Agent } from '../agentKit';

export const generateCoffeeChatBrief = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(`## Mock Brief\nThis is a mock brief because the API key is not configured.`);
    }

    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a world-class Networking Coach Agent. 
        - Your goal is to make the user feel confident and prepared.
        - Analyze the user's profile and the counterpart's info to find genuine connection points.
        - Produce a "Coffee Chat Brief" in Markdown.
        - Tone: Warm, strategic, insightful.
        - Sections: "Quick Overview", "Shared Touchpoints", "Smart Conversation Starters", "Industry Context", "Closing Ideas".`,
        thinkingBudget: 16000 // Moderate thinking for connecting dots
    });

    const prompt = `Prepare a brief for this meeting:
    **User Profile:** ${JSON.stringify(profile)}
    **Counterpart Info:** ${counterpartInfo}`;

    return agent.chat(prompt);
};

export const generateReachOutMessage = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are an Expert Communicator Agent.
        - Write a cold outreach message (e.g., LinkedIn/Email).
        - It must be concise, professional, and warm.
        - **Crucial:** Avoid generic templates. Use the specific details provided to personalize the hook.
        - Do not include subject lines unless asked. Just the message body.`,
        thinkingBudget: 8000
    });

    const prompt = `Write a reach-out message to this person based on my profile:
    **User Profile:** ${JSON.stringify(profile)}
    **Counterpart Info:** ${counterpartInfo}`;

    return agent.chat(prompt);
};