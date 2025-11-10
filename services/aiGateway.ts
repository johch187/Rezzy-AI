import type {
  ProfileData,
  GenerationOptions,
  GeneratedContent,
  ApplicationAnalysisResult,
  CareerPath,
  YouTubeVideo,
  MentorMatch,
  CareerMilestone,
  DocumentGeneration,
  ParsedCoverLetter,
} from '../types';
import { supabase } from './supabaseClient';

const postWithAuth = async <T>(path: string, payload: unknown): Promise<T> => {
  if (!supabase) {
    throw new Error('Supabase client not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error('Failed to read auth session. Please sign in again.');
  }

  const token = data.session?.access_token;
  if (!token) {
    throw new Error('You must be signed in to use this feature.');
  }

  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const result = await response.json();
      message = result.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  return response.json();
};

export type CoachFunctionCall = {
  name: string;
  args: Record<string, unknown>;
};

export type CoachMessagePayload =
  | { role: 'user' | 'model'; content: string }
  | { role: 'function'; name: string; response: Record<string, unknown> | null };

export const generateDocumentsViaServer = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<{ documents: GeneratedContent; analysis: ApplicationAnalysisResult | null }> => {
  return postWithAuth('/generate/documents', { profile, options });
};

export const analyzeApplicationFitViaServer = async (
  resumeText: string,
  jobDescription: string
): Promise<ApplicationAnalysisResult> => {
  return postWithAuth('/applications/analyze', { resumeText, jobDescription });
};

export const generateCoffeeChatBriefViaServer = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
  const result = await postWithAuth<{ content: string }>('/coffee-chats/brief', { profile, counterpartInfo });
  return result.content;
};

export const generateReachOutMessageViaServer = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
  const result = await postWithAuth<{ content: string }>('/coffee-chats/outreach', { profile, counterpartInfo });
  return result.content;
};

export const shapeInterviewStoryViaServer = async (brainDump: string): Promise<string> => {
  const result = await postWithAuth<{ content: string }>('/interview/story', { brainDump });
  return result.content;
};

export const generateInterviewQuestionsViaServer = async (jobDescription: string): Promise<string[]> => {
  const result = await postWithAuth<{ questions: string[] }>('/interview/questions', { jobDescription });
  return result.questions;
};

export const generateCareerPathViaServer = async (
  profile: ProfileData,
  currentRole: string,
  targetRole: string
): Promise<CareerPath> => {
  return postWithAuth('/career-path', { profile, currentRole, targetRole });
};

export const getVideosForMilestoneViaServer = async (
  targetRole: string,
  milestone: CareerMilestone
): Promise<YouTubeVideo[]> => {
  const result = await postWithAuth<{ videos: YouTubeVideo[] }>('/career-path/videos', { targetRole, milestone });
  return result.videos;
};

export const findMentorMatchViaServer = async (
  thesisTopic: string,
  facultyList: string
): Promise<MentorMatch[]> => {
  const result = await postWithAuth<{ matches: MentorMatch[] }>('/mentor-match', { thesisTopic, facultyList });
  return result.matches;
};

export const reframeFeedbackViaServer = async (feedbackText: string): Promise<string> => {
  const result = await postWithAuth<{ content: string }>('/feedback/reframe', { feedbackText });
  return result.content;
};

export const getNegotiationPrepViaServer = async (
  jobTitle: string,
  location: string
): Promise<{ salaryRange: string; tips: string }> => {
  return postWithAuth('/negotiation/prep', { jobTitle, location });
};

export const parseResumeViaServer = async (
  resumeText: string,
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash'
): Promise<Partial<ProfileData>> => {
  return postWithAuth('/parser/resume', { resumeText, model });
};

export const parseCoverLetterViaServer = async (coverLetterMarkdown: string): Promise<ParsedCoverLetter> => {
  return postWithAuth('/parser/cover-letter', { coverLetterMarkdown });
};

export const scrapeJobDescriptionViaServer = async (url: string): Promise<string> => {
  const result = await postWithAuth<{ jobDescription: string }>('/scraper/job-description', { url });
  return result.jobDescription;
};

export const sendCoachMessageViaServer = async (
  profile: ProfileData,
  documentHistory: DocumentGeneration[],
  messages: CoachMessagePayload[]
): Promise<{ message: string; functionCalls: CoachFunctionCall[] }> => {
  return postWithAuth('/coach/message', { profile, documentHistory, messages });
};
