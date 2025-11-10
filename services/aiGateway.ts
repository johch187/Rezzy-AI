import type { ProfileData, GenerationOptions, GeneratedContent, ApplicationAnalysisResult } from '../types';
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
