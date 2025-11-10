import { generateCoffeeChatBrief, generateReachOutMessage, shapeInterviewStory, generateInterviewQuestions, generateCareerPath, getVideosForMilestone, findMentorMatch, reframeFeedback, getNegotiationPrep, } from '../services/aiTools.js';
export const handleCoffeeChatBrief = async (req, res) => {
    try {
        const { profile, counterpartInfo } = req.body;
        if (!profile || !counterpartInfo) {
            return res.status(400).json({ error: 'profile and counterpartInfo are required.' });
        }
        const brief = await generateCoffeeChatBrief(profile, counterpartInfo);
        return res.json({ content: brief });
    }
    catch (error) {
        console.error('Coffee chat brief failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to generate brief.' });
    }
};
export const handleReachOutMessage = async (req, res) => {
    try {
        const { profile, counterpartInfo } = req.body;
        if (!profile || !counterpartInfo) {
            return res.status(400).json({ error: 'profile and counterpartInfo are required.' });
        }
        const message = await generateReachOutMessage(profile, counterpartInfo);
        return res.json({ content: message });
    }
    catch (error) {
        console.error('Reach out message failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to craft message.' });
    }
};
export const handleInterviewStory = async (req, res) => {
    try {
        const { brainDump } = req.body;
        if (!brainDump) {
            return res.status(400).json({ error: 'brainDump is required.' });
        }
        const story = await shapeInterviewStory(brainDump);
        return res.json({ content: story });
    }
    catch (error) {
        console.error('Interview story failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to reframe story.' });
    }
};
export const handleInterviewQuestions = async (req, res) => {
    try {
        const { jobDescription } = req.body;
        if (!jobDescription) {
            return res.status(400).json({ error: 'jobDescription is required.' });
        }
        const questions = await generateInterviewQuestions(jobDescription);
        return res.json({ questions });
    }
    catch (error) {
        console.error('Interview questions failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to generate questions.' });
    }
};
export const handleCareerPath = async (req, res) => {
    try {
        const { profile, currentRole, targetRole } = req.body;
        if (!profile || !currentRole || !targetRole) {
            return res.status(400).json({ error: 'profile, currentRole, and targetRole are required.' });
        }
        const path = await generateCareerPath(profile, currentRole, targetRole);
        return res.json(path);
    }
    catch (error) {
        console.error('Career path generation failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to build career path.' });
    }
};
export const handleMilestoneVideos = async (req, res) => {
    try {
        const { targetRole, milestone } = req.body;
        if (!targetRole || !milestone) {
            return res.status(400).json({ error: 'targetRole and milestone are required.' });
        }
        const videos = await getVideosForMilestone(targetRole, milestone);
        return res.json({ videos });
    }
    catch (error) {
        console.error('Milestone videos failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to fetch milestone videos.' });
    }
};
export const handleMentorMatch = async (req, res) => {
    try {
        const { thesisTopic, facultyList } = req.body;
        if (!thesisTopic || !facultyList) {
            return res.status(400).json({ error: 'thesisTopic and facultyList are required.' });
        }
        const matches = await findMentorMatch(thesisTopic, facultyList);
        return res.json({ matches });
    }
    catch (error) {
        console.error('Mentor match failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to find mentor match.' });
    }
};
export const handleReframeFeedback = async (req, res) => {
    try {
        const { feedbackText } = req.body;
        if (!feedbackText) {
            return res.status(400).json({ error: 'feedbackText is required.' });
        }
        const reframed = await reframeFeedback(feedbackText);
        return res.json({ content: reframed });
    }
    catch (error) {
        console.error('Reframe feedback failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to reframe feedback.' });
    }
};
export const handleNegotiationPrep = async (req, res) => {
    try {
        const { jobTitle, location } = req.body;
        if (!jobTitle || !location) {
            return res.status(400).json({ error: 'jobTitle and location are required.' });
        }
        const prep = await getNegotiationPrep(jobTitle, location);
        return res.json(prep);
    }
    catch (error) {
        console.error('Negotiation prep failed:', error);
        return res.status(500).json({ error: error.message ?? 'Failed to prepare negotiation guidance.' });
    }
};
