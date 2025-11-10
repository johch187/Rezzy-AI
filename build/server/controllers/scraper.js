import { fetchJobDescriptionFromUrl } from '../services/scraper.js';
export const handleJobDescriptionScrape = async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'url is required.' });
        }
        const text = await fetchJobDescriptionFromUrl(url);
        return res.json({ jobDescription: text });
    }
    catch (error) {
        console.error('Job description scrape failed:', error);
        const message = error?.code
            ? `Scraping failed with code: ${error.code}`
            : error.message ?? 'Failed to scrape job description.';
        return res.status(500).json({ error: message });
    }
};
