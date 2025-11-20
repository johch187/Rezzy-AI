import type { ProfileData, GenerationOptions, GeneratedContent } from '../../types';
import { postJson } from '../apiClient';

const MOCK_RESPONSE: GeneratedContent = {
    resume: `# Mock Resume`,
    coverLetter: `Dear Hiring Manager, This is a mock response.`
};

export const generateTailoredDocuments = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<{ documents: GeneratedContent; analysis: any }> => {
  try {
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
  } catch (err) {
    console.error("Document generation failed, falling back to mock.", err);
    return { documents: MOCK_RESPONSE, analysis: null };
  }
};
