import { Router, type Request, type Response, type NextFunction } from 'express';
import { verifySupabaseUser } from './supabaseAuth.js';
import { handleGenerateDocuments, handleApplicationAnalysis } from './controllers/generation.js';
import {
  handleCoffeeChatBrief,
  handleReachOutMessage,
  handleInterviewStory,
  handleInterviewQuestions,
  handleCareerPath,
  handleMilestoneVideos,
  handleMentorMatch,
  handleReframeFeedback,
  handleNegotiationPrep,
} from './controllers/tools.js';
import { handleResumeParsing, handleCoverLetterParsing } from './controllers/parser.js';
import { handleJobDescriptionScrape } from './controllers/scraper.js';
import { handleCareerCoachMessage } from './controllers/coach.js';
import { handleGetWorkspace, handleUpsertWorkspace } from './controllers/workspace.js';

export interface AuthedRequest extends Request {
  user?: any;
}

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const allowAnonymousPaths = new Set(['/health', '/parser/resume', '/parser/cover-letter']);

router.use(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (allowAnonymousPaths.has(req.path)) {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer', '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const user = await verifySupabaseUser(token);
    req.user = user;
    return next();
  } catch (error) {
    console.error('Supabase auth verification failed:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

router.post('/generate/documents', handleGenerateDocuments);
router.post('/applications/analyze', handleApplicationAnalysis);
router.post('/coffee-chats/brief', handleCoffeeChatBrief);
router.post('/coffee-chats/outreach', handleReachOutMessage);
router.post('/interview/story', handleInterviewStory);
router.post('/interview/questions', handleInterviewQuestions);
router.post('/career-path', handleCareerPath);
router.post('/career-path/videos', handleMilestoneVideos);
router.post('/mentor-match', handleMentorMatch);
router.post('/feedback/reframe', handleReframeFeedback);
router.post('/negotiation/prep', handleNegotiationPrep);
router.post('/parser/resume', handleResumeParsing);
router.post('/parser/cover-letter', handleCoverLetterParsing);
router.post('/scraper/job-description', handleJobDescriptionScrape);
router.post('/coach/message', handleCareerCoachMessage);
router.get('/workspace', handleGetWorkspace);
router.put('/workspace', handleUpsertWorkspace);

export default router;
