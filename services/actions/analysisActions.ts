import { Type } from "@google/genai";
import type { ApplicationAnalysisResult, MentorMatch } from '../../types';
import { Agent, parseAgentJson } from '../agentKit';

export const analyzeApplicationFit = async (resumeText: string, jobDescription: string): Promise<ApplicationAnalysisResult> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a Senior HR Analyst Agent.
        - Critically evaluate the fit between a resume and a job description.
        - Be honest but constructive.
        - Calculate a "fitScore" (0-100) based on skills, experience, and keywords.
        - Provide specific Markdown feedback for gaps, keywords, and impact.`,
        thinkingBudget: 32768, // Max thinking for deep analysis
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                fitScore: { type: Type.NUMBER },
                gapAnalysis: { type: Type.STRING },
                keywordOptimization: { type: Type.STRING },
                impactEnhancer: { type: Type.STRING }
            },
            required: ['fitScore', 'gapAnalysis', 'keywordOptimization', 'impactEnhancer']
        }
    });

    const prompt = `Analyze this application:
    **Resume:** ${resumeText}
    **Job Description:** ${jobDescription}`;

    const result = await agent.chat(prompt);
    return parseAgentJson<ApplicationAnalysisResult>(result);
};

export const findMentorMatch = async (thesisTopic: string, facultyList: string): Promise<MentorMatch[]> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are an Academic Advisor Agent.
        - Match a student's thesis topic with the most suitable faculty mentors from a provided list.
        - Rank the top 3 matches.
        - Provide a clear "reasoning" for why they are a good fit based on research interests.`,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    reasoning: { type: Type.STRING }
                },
                required: ['name', 'score', 'reasoning']
            }
        }
    });

    const prompt = `Find mentors for this topic:
    **Topic:** ${thesisTopic}
    **Faculty List:** ${facultyList}`;

    const result = await agent.chat(prompt);
    return parseAgentJson<MentorMatch[]>(result);
};

export const getNegotiationPrep = async (jobTitle: string, location: string): Promise<{ salaryRange: string; tips: string; }> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a Salary Negotiation Coach. Provide a realistic salary range and negotiation tips.`,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                salaryRange: { type: Type.STRING },
                tips: { type: Type.STRING }
            }
        }
    });

    const result = await agent.chat(`Role: ${jobTitle}, Location: ${location}`);
    return parseAgentJson(result);
};