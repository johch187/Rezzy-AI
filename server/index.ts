import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './routes';

const app = express();
const PORT = Number(process.env.PORT) || 8080;

app.disable('x-powered-by');
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

// Basic rate limiter to guard the API namespace.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.API_RATE_LIMIT ?? 60),
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter, apiRouter);

// Serve the Vite build output. Works for both ts-node (src) and compiled builds.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(process.cwd(), 'dist');

app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV !== 'test') {
  // Cloud Run requires binding to 0.0.0.0 to accept connections
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
