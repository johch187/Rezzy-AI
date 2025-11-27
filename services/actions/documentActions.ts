import type { ProfileData, GenerationOptions, GeneratedContent } from '../../types';
import { postJson } from '../apiClient';

export const generateTailoredDocuments = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<{ documents: GeneratedContent; analysis: any }> => {
  const response = await postJson<{ resume: string | null; coverLetter: string | null; analysis: any }>(
    "/api/llm/generate-documents",
    { profile, options }
  );
  
  return {
    documents: {
      resume: response.resume,
      coverLetter: response.coverLetter,
    },
    analysis: response.analysis ?? null,
  };
};
