import { postJson } from '../apiClient';

export const shapeInterviewStory = async (brainDump: string): Promise<string> => {
    const response = await postJson<{ text: string }>("/api/llm/interview/story", { brainDump });
    return response.text;
};

export const generateInterviewQuestions = async (jobDescription: string): Promise<string[]> => {
    return postJson<string[]>("/api/llm/interview/questions", { jobDescription });
};

export const reframeFeedback = async (feedbackText: string): Promise<string> => {
    const response = await postJson<{ text: string }>("/api/llm/interview/reframe", { feedback: feedbackText });
    return response.text;
};
