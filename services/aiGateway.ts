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
  CareerChatSummary,
} from '../types';
import { supabase } from './supabaseClient';
import type { CareerChatSummary } from '../types';

type RequestWithAuthOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
};

const requestWithAuth = async <T>(path: string, options: RequestWithAuthOptions = {}): Promise<T> => {
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

  const method = options.method ?? 'POST';
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  let body: string | undefined;

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`/api${path}`, {
    method,
    headers,
    body,
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
  return requestWithAuth('/generate/documents', { body: { profile, options } });
};

export const analyzeApplicationFitViaServer = async (
  resumeText: string,
  jobDescription: string
): Promise<ApplicationAnalysisResult> => {
  return requestWithAuth('/applications/analyze', { body: { resumeText, jobDescription } });
};

export const generateCoffeeChatBriefViaServer = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
  const result = await requestWithAuth<{ content: string }>('/coffee-chats/brief', { body: { profile, counterpartInfo } });
  return result.content;
};

export const generateReachOutMessageViaServer = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
  const result = await requestWithAuth<{ content: string }>('/coffee-chats/outreach', { body: { profile, counterpartInfo } });
  return result.content;
};

export const shapeInterviewStoryViaServer = async (brainDump: string): Promise<string> => {
  const result = await requestWithAuth<{ content: string }>('/interview/story', { body: { brainDump } });
  return result.content;
};

export const generateInterviewQuestionsViaServer = async (jobDescription: string): Promise<string[]> => {
  const result = await requestWithAuth<{ questions: string[] }>('/interview/questions', { body: { jobDescription } });
  return result.questions;
};

export const generateCareerPathViaServer = async (
  profile: ProfileData,
  currentRole: string,
  targetRole: string
): Promise<CareerPath> => {
  return requestWithAuth('/career-path', { body: { profile, currentRole, targetRole } });
};

export const getVideosForMilestoneViaServer = async (
  targetRole: string,
  milestone: CareerMilestone
): Promise<YouTubeVideo[]> => {
  const result = await requestWithAuth<{ videos: YouTubeVideo[] }>('/career-path/videos', { body: { targetRole, milestone } });
  return result.videos;
};

export const findMentorMatchViaServer = async (
  thesisTopic: string,
  facultyList: string
): Promise<MentorMatch[]> => {
  const result = await requestWithAuth<{ matches: MentorMatch[] }>('/mentor-match', { body: { thesisTopic, facultyList } });
  return result.matches;
};

export const reframeFeedbackViaServer = async (feedbackText: string): Promise<string> => {
  const result = await requestWithAuth<{ content: string }>('/feedback/reframe', { body: { feedbackText } });
  return result.content;
};

export const getNegotiationPrepViaServer = async (
  jobTitle: string,
  location: string
): Promise<{ salaryRange: string; tips: string }> => {
  return requestWithAuth('/negotiation/prep', { body: { jobTitle, location } });
};

export const parseResumeViaServer = async (
  resumeText: string,
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash'
): Promise<Partial<ProfileData>> => {
  return requestWithAuth('/parser/resume', { body: { resumeText, model } });
};

export const parseCoverLetterViaServer = async (coverLetterMarkdown: string): Promise<ParsedCoverLetter> => {
  return requestWithAuth('/parser/cover-letter', { body: { coverLetterMarkdown } });
};

export const scrapeJobDescriptionViaServer = async (url: string): Promise<string> => {
  const result = await requestWithAuth<{ jobDescription: string }>('/scraper/job-description', { body: { url } });
  return result.jobDescription;
};

export const sendCoachMessageViaServer = async (
  profile: ProfileData,
  documentHistory: DocumentGeneration[],
  messages: CoachMessagePayload[]
): Promise<{ message: string; functionCalls: CoachFunctionCall[] }> => {
  return requestWithAuth('/coach/message', { body: { profile, documentHistory, messages } });
};

type WorkspaceSnapshot = {
  profile: ProfileData | null;
  documentHistory: DocumentGeneration[];
  careerChatHistory: CareerChatSummary[];
  tokens: number;
};

export const fetchWorkspaceViaServer = async (): Promise<WorkspaceSnapshot> => {
  return requestWithAuth('/workspace', { method: 'GET' });
};

export const persistWorkspaceViaServer = async (payload: WorkspaceSnapshot): Promise<void> => {
  await requestWithAuth('/workspace', { method: 'PUT', body: payload });
};
