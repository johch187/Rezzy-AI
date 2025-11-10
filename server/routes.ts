import { Router, type Request, type Response, type NextFunction } from 'express';
import { verifySupabaseUser } from './supabaseAuth';
import { handleGenerateDocuments, handleApplicationAnalysis } from './controllers/generation';

export interface AuthedRequest extends Request {
  user?: any;
}

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use(async (req: AuthedRequest, res: Response, next: NextFunction) => {
  if (req.path === '/health') {
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

export default router;
