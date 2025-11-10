import type { Request, Response } from 'express';
import type {
  ProfileData,
  CareerMilestone,
} from '../../types.js';
import {
  generateCoffeeChatBrief,
  generateReachOutMessage,
  shapeInterviewStory,
  generateInterviewQuestions,
  generateCareerPath,
  getVideosForMilestone,
  findMentorMatch,
  reframeFeedback,
  getNegotiationPrep,
} from '../services/aiTools.js';

export const handleCoffeeChatBrief = async (req: Request, res: Response) => {
  try {
    const { profile, counterpartInfo } = req.body as { profile?: ProfileData; counterpartInfo?: string };
    if (!profile || !counterpartInfo) {
      return res.status(400).json({ error: 'profile and counterpartInfo are required.' });
    }
    const brief = await generateCoffeeChatBrief(profile, counterpartInfo);
    return res.json({ content: brief });
  } catch (error) {
    console.error('Coffee chat brief failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to generate brief.' });
  }
};

export const handleReachOutMessage = async (req: Request, res: Response) => {
  try {
    const { profile, counterpartInfo } = req.body as { profile?: ProfileData; counterpartInfo?: string };
    if (!profile || !counterpartInfo) {
      return res.status(400).json({ error: 'profile and counterpartInfo are required.' });
    }
    const message = await generateReachOutMessage(profile, counterpartInfo);
    return res.json({ content: message });
  } catch (error) {
    console.error('Reach out message failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to craft message.' });
  }
};

export const handleInterviewStory = async (req: Request, res: Response) => {
  try {
    const { brainDump } = req.body as { brainDump?: string };
    if (!brainDump) {
      return res.status(400).json({ error: 'brainDump is required.' });
    }
    const story = await shapeInterviewStory(brainDump);
    return res.json({ content: story });
  } catch (error) {
    console.error('Interview story failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to reframe story.' });
  }
};

export const handleInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { jobDescription } = req.body as { jobDescription?: string };
    if (!jobDescription) {
      return res.status(400).json({ error: 'jobDescription is required.' });
    }
    const questions = await generateInterviewQuestions(jobDescription);
    return res.json({ questions });
  } catch (error) {
    console.error('Interview questions failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to generate questions.' });
  }
};

export const handleCareerPath = async (req: Request, res: Response) => {
  try {
    const { profile, currentRole, targetRole } = req.body as {
      profile?: ProfileData;
      currentRole?: string;
      targetRole?: string;
    };
    if (!profile || !currentRole || !targetRole) {
      return res.status(400).json({ error: 'profile, currentRole, and targetRole are required.' });
    }
    const path = await generateCareerPath(profile, currentRole, targetRole);
    return res.json(path);
  } catch (error) {
    console.error('Career path generation failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to build career path.' });
  }
};

export const handleMilestoneVideos = async (req: Request, res: Response) => {
  try {
    const { targetRole, milestone } = req.body as { targetRole?: string; milestone?: CareerMilestone };
    if (!targetRole || !milestone) {
      return res.status(400).json({ error: 'targetRole and milestone are required.' });
    }
    const videos = await getVideosForMilestone(targetRole, milestone);
    return res.json({ videos });
  } catch (error) {
    console.error('Milestone videos failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to fetch milestone videos.' });
  }
};

export const handleMentorMatch = async (req: Request, res: Response) => {
  try {
    const { thesisTopic, facultyList } = req.body as { thesisTopic?: string; facultyList?: string };
    if (!thesisTopic || !facultyList) {
      return res.status(400).json({ error: 'thesisTopic and facultyList are required.' });
    }
    const matches = await findMentorMatch(thesisTopic, facultyList);
    return res.json({ matches });
  } catch (error) {
    console.error('Mentor match failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to find mentor match.' });
  }
};

export const handleReframeFeedback = async (req: Request, res: Response) => {
  try {
    const { feedbackText } = req.body as { feedbackText?: string };
    if (!feedbackText) {
      return res.status(400).json({ error: 'feedbackText is required.' });
    }
    const reframed = await reframeFeedback(feedbackText);
    return res.json({ content: reframed });
  } catch (error) {
    console.error('Reframe feedback failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to reframe feedback.' });
  }
};

export const handleNegotiationPrep = async (req: Request, res: Response) => {
  try {
    const { jobTitle, location } = req.body as { jobTitle?: string; location?: string };
    if (!jobTitle || !location) {
      return res.status(400).json({ error: 'jobTitle and location are required.' });
    }
    const prep = await getNegotiationPrep(jobTitle, location);
    return res.json(prep);
  } catch (error) {
    console.error('Negotiation prep failed:', error);
    return res.status(500).json({ error: (error as Error).message ?? 'Failed to prepare negotiation guidance.' });
  }
};
