import { Type } from "@google/genai";
import { Agent, parseAgentJson } from '../agentKit';

export const shapeInterviewStory = async (brainDump: string): Promise<string> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a Storytelling Coach Agent.
        - Take raw, unstructured "brain dumps" and structure them into compelling interview answers using the STAR method (Situation, Task, Action, Result).
        - Be concise but impactful.
        - Use bolding for key metrics and actions.
        - Output strictly Markdown.`,
        thinkingBudget: 16000
    });

    return agent.chat(`Refine this story into a STAR answer:\n\n${brainDump}`);
};

export const generateInterviewQuestions = async (jobDescription: string): Promise<string[]> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a Hiring Manager Agent.
        - Based on a job description, predict the 5-7 most likely and challenging interview questions.
        - Include a mix of behavioral and technical questions.`,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
    });

    const result = await agent.chat(`Generate interview questions for this role:\n\n${jobDescription}`);
    return parseAgentJson<string[]>(result);
};

export const reframeFeedback = async (feedbackText: string): Promise<string> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a Growth Mindset Coach Agent.
        - Reframe negative/constructive feedback into a positive, forward-looking action plan.
        - Focus on "areas for growth" rather than "weaknesses".`
    });

    return agent.chat(`Reframe this feedback:\n\n${feedbackText}`);
};