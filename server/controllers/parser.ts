import type { Request, Response } from 'express';
import { parseResumeText, parseCoverLetterMarkdown } from '../services/parser';

export const handleResumeParsing = async (req: Request, res: Response) => {
  try {
    const { resumeText, model } = req.body as {
      resumeText?: string;
      model?: 'gemini-2.5-pro' | 'gemini-2.5-flash';
    };

    if (!resumeText) {
      return res.status(400).json({ error: 'resumeText is required.' });
    }

    const parsed = await parseResumeText(resumeText, model ?? 'gemini-2.5-flash');
    return res.json(parsed);
  } catch (error) {
    console.error('Resume parsing failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to parse resume.' });
  }
};

export const handleCoverLetterParsing = async (req: Request, res: Response) => {
  try {
    const { coverLetterMarkdown } = req.body as { coverLetterMarkdown?: string };
    if (!coverLetterMarkdown) {
      return res.status(400).json({ error: 'coverLetterMarkdown is required.' });
    }
    const parsed = await parseCoverLetterMarkdown(coverLetterMarkdown);
    return res.json(parsed);
  } catch (error) {
    console.error('Cover letter parsing failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to parse cover letter.' });
  }
};
