import type { Request, Response } from 'express';
import { fetchJobDescriptionFromUrl } from '../services/scraper';

export const handleJobDescriptionScrape = async (req: Request, res: Response) => {
  try {
    const { url } = req.body as { url?: string };
    if (!url) {
      return res.status(400).json({ error: 'url is required.' });
    }

    const text = await fetchJobDescriptionFromUrl(url);
    return res.json({ jobDescription: text });
  } catch (error) {
    console.error('Job description scrape failed:', error);
    const message = (error as any)?.code
      ? `Scraping failed with code: ${(error as any).code}`
      : (error as Error).message ?? 'Failed to scrape job description.';
    return res.status(500).json({ error: message });
  }
};
