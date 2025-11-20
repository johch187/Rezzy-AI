import type { ApplicationAnalysisResult, MentorMatch } from '../../types';
import { postJson } from '../apiClient';

export const analyzeApplicationFit = async (resumeText: string, jobDescription: string): Promise<ApplicationAnalysisResult> => {
    return postJson<ApplicationAnalysisResult>("/api/llm/analysis/application-fit", { resumeText, jobDescription });
};

export const findMentorMatch = async (thesisTopic: string, facultyList: string): Promise<MentorMatch[]> => {
    return postJson<MentorMatch[]>("/api/llm/analysis/mentor-match", { topic: thesisTopic, facultyList });
};

export const getNegotiationPrep = async (jobTitle: string, location: string): Promise<{ salaryRange: string; tips: string; }> => {
    return postJson<{ salaryRange: string; tips: string; }>("/api/llm/analysis/negotiation", { jobTitle, location });
};
