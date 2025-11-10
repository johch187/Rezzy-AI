import type { ProfileData, ParsedCoverLetter } from '../types';
import { readFileContent } from '../utils';
import { parseResumeViaServer, parseCoverLetterViaServer } from './aiGateway';

const LAST_PARSE_TIMESTAMP_KEY = 'lastResumeParseTimestamp';
const PRO_MODEL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const chooseModelForUpload = (): 'gemini-2.5-pro' | 'gemini-2.5-flash' => {
  const now = Date.now();
  const lastParseTimeStr = localStorage.getItem(LAST_PARSE_TIMESTAMP_KEY);
  const lastParseTime = lastParseTimeStr ? parseInt(lastParseTimeStr, 10) : 0;

  const shouldUsePro = lastParseTime && now - lastParseTime < PRO_MODEL_WINDOW_MS;
  localStorage.setItem(LAST_PARSE_TIMESTAMP_KEY, now.toString());
  return shouldUsePro ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
};

export const importAndParseResume = async (file: File): Promise<Partial<ProfileData>> => {
  const resumeText = await readFileContent(file);
  const model = chooseModelForUpload();
  return parseResumeViaServer(resumeText, model);
};

export const parseGeneratedResume = async (resumeMarkdown: string): Promise<Partial<ProfileData>> => {
  if (!resumeMarkdown || resumeMarkdown.trim().length < 20) {
    throw new Error('The generated resume content is too short to parse.');
  }
  return parseResumeViaServer(resumeMarkdown, 'gemini-2.5-pro');
};

export const parseGeneratedCoverLetter = async (coverLetterMarkdown: string): Promise<ParsedCoverLetter> => {
  if (!coverLetterMarkdown || coverLetterMarkdown.trim().length < 20) {
    throw new Error('The generated cover letter content is too short to parse.');
  }
  return parseCoverLetterViaServer(coverLetterMarkdown);
};
