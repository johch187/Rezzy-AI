import { parseResumeText, parseCoverLetterMarkdown } from '../services/parser.js';
export const handleResumeParsing = async (req, res) => {
    try {
        const { resumeText, model } = req.body;
        if (!resumeText) {
            return res.status(400).json({ error: 'resumeText is required.' });
        }
        const parsed = await parseResumeText(resumeText, model ?? 'gemini-2.5-flash');
        return res.json(parsed);
    }
    catch (error) {
        console.error('Resume parsing failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to parse resume.' });
    }
};
export const handleCoverLetterParsing = async (req, res) => {
    try {
        const { coverLetterMarkdown } = req.body;
        if (!coverLetterMarkdown) {
            return res.status(400).json({ error: 'coverLetterMarkdown is required.' });
        }
        const parsed = await parseCoverLetterMarkdown(coverLetterMarkdown);
        return res.json(parsed);
    }
    catch (error) {
        console.error('Cover letter parsing failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to parse cover letter.' });
    }
};
