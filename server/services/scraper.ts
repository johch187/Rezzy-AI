import { generateContentWithRetry, hasGeminiKey } from '../lib/genai';

const FETCH_TIMEOUT_MS = 15000;
const PROTECTED_SITES = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com'];

const validateUrl = (rawUrl: string): URL => {
  const withProtocol = /^(https?:\/\/)/.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(withProtocol);
  const hostname = parsed.hostname;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

  if (!hostname.includes('.') && hostname !== 'localhost' && !isIp) {
    throw new Error(`The URL hostname "${hostname}" seems to be missing a top-level domain.`);
  }

  return parsed;
};

export const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
  if (!hasGeminiKey) {
    throw new Error('Job description scraping requires a configured Gemini API key.');
  }

  let urlObject: URL;
  try {
    urlObject = validateUrl(url);
  } catch (error) {
    throw new Error('The URL you entered appears to be invalid. Please double-check it.');
  }

  if (PROTECTED_SITES.some(site => urlObject.hostname.replace('www.', '').includes(site))) {
    console.warn('Attempting to fetch from a protected site; extraction may fail.');
  }

  const timeoutPromise = new Promise<string>((_, reject) => {
    setTimeout(() => reject(new Error(`The request timed out after ${FETCH_TIMEOUT_MS / 1000} seconds.`)), FETCH_TIMEOUT_MS);
  });

  const scrapePromise = (async () => {
    const prompt = `
        You are a web content extraction engine. Visit the URL below and return the cleaned job description as plain text. Follow these steps:
        1. Locate the main job description body (ignore nav, footer, cookie banners, related job lists).
        2. Preserve paragraphs and headings using simple markdown.
        3. If content loads via JSON (e.g., application/ld+json), extract its description field.
        4. If all extraction attempts fail, return a single failure code prefixed with "FETCH_ERROR:" using one of NOT_FOUND, ACCESS_DENIED, SERVER_ERROR, NO_CONTENT, TIMEOUT.

        URL: ${urlObject.href}
    `;

    const extractedText = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    if (extractedText.startsWith('FETCH_ERROR:')) {
      const code = extractedText.replace('FETCH_ERROR:', '').trim();
      const err = new Error(`Scraping failed with code: ${code}`);
      (err as any).code = code;
      throw err;
    }

    if (!extractedText || extractedText.length < 50) {
      throw new Error('The AI returned very little content from the URL. Please paste the job description manually.');
    }

    return extractedText;
  })();

  return Promise.race([scrapePromise, timeoutPromise]);
};
