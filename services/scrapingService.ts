import { generateContentWithRetry } from './geminiService';
import { parseError } from '../utils';

const FETCH_TIMEOUT_MS = 15000; // Increased timeout for potentially slow AI responses

export const fetchJobDescriptionFromUrl = async (url: string): Promise<string> => {
  // 1. Improved client-side validation for URLs.
  let urlObject: URL;
  try {
    const urlWithProtocol = /^(https?:\/\/)/.test(url) ? url : `https://${url}`;
    urlObject = new URL(urlWithProtocol);
  } catch (_) {
    throw new Error('The URL you entered appears to be invalid. Please double-check it. It should look like "company.com/careers/job".');
  }

  const { hostname } = urlObject;
  const isIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  if (!hostname.includes('.') && hostname !== 'localhost' && !isIpAddress) {
     throw new Error(`The URL hostname "${hostname}" seems to be missing a top-level domain like '.com' or '.org'. Please provide a full and valid URL.`);
  }

  const protectedSites = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com'];
  if (protectedSites.some(site => hostname.replace('www.', '').includes(site))) {
     console.warn("Attempting to fetch from a protected site. This may fail due to login requirements or bot protection.");
  }
  
  const fetchPromise = new Promise<string>(async (resolve, reject) => {
      try {
          const prompt = `
              You are a highly advanced web content extraction engine. Your sole purpose is to visit a URL, pinpoint the main job description content, and return it as clean, readable text.

              URL to process: ${urlObject.href}

              **Primary Extraction Protocol:**

              1.  **Initial Scan & Content Identification:**
                  -   Access the URL and perform an initial scan of the HTML structure.
                  -   Identify the primary content container. Look for semantic tags like \`<main>\`, \`<article>\`, or elements with IDs/classes like \`job-description\`, \`job-details\`, \`job-content\`. Prioritize these over generic \`<div>\`s.
                  -   Be aware of common website layouts. Intelligently ignore headers, footers, navigation bars, sidebars, "related jobs" widgets, and cookie consent banners.

              2.  **Deep Content Extraction & Cleaning:**
                  -   Once the main content block is identified, extract all relevant text.
                  -   Look for standard job description sections with headings like "Responsibilities", "Qualifications", "Requirements", "What you'll do", "Who you are", "Skills".
                  -   Aggressively remove any remaining non-essential text, such as social media links, application form fields, or boilerplate company info that isn't part of the core description.
                  -   Preserve line breaks and paragraph structure for readability. Use simple markdown for headings (e.g., \`## Responsibilities\`) if it enhances clarity.

              3.  **Handling Complex Scenarios:**
                  -   **Dynamic Content (JavaScript):** If you detect that the main content is loaded via JavaScript and is not present in the initial HTML, look for embedded JSON data, especially \`application/ld+json\` scripts which often contain structured \`JobPosting\` schema. Extract the 'description' field from this JSON if available. If you cannot execute JS or find this data, and the page is mostly empty, you must fail with the \`NO_CONTENT\` error code.
                  -   **iFrames:** If the job description appears to be within an \`<iframe>\`, analyze its \`src\` attribute. If it's a direct link to a job board (e.g., Greenhouse, Lever), attempt to fetch and process that \`src\` URL instead.

              4.  **Final Output:**
                  -   Return ONLY the cleaned and formatted plain text of the job description. Your output should begin directly with the job title or the first line of the description. Do not add any introductory phrases like "Here is the job description:".

              **Strict Error Reporting Protocol:**

              - If you cannot successfully extract a valid job description for ANY reason, you MUST return a single line containing ONLY a specific error code, prefixed with "FETCH_ERROR:".
              - Do not provide any explanation, just the code.
              - Use one of the following codes:
                  - \`FETCH_ERROR: NOT_FOUND\`: The URL results in a 404 Not Found error.
                  - \`FETCH_ERROR: ACCESS_DENIED\`: You are blocked by a login wall, CAPTCHA, or a 403 Forbidden error.
                  - \`FETCH_ERROR: SERVER_ERROR\`: The website's server returns an error (e.g., 500, 502, 503, 504).
                  - \`FETCH_ERROR: NO_CONTENT\`: The page loads successfully, but after applying all extraction rules, you cannot find a discernible job description (e.g., the page is blank, it's a list of jobs, or an expired posting).
                  - \`FETCH_ERROR: TIMEOUT\`: The connection to the server timed out.

              - Example of a failure response: \`FETCH_ERROR: ACCESS_DENIED\`
          `;

          const extractedText = await generateContentWithRetry({
              model: 'gemini-2.5-flash',
              contents: prompt,
          });

          if (extractedText.startsWith('FETCH_ERROR:')) {
              const errorCode = extractedText.replace('FETCH_ERROR:', '').trim();
              const error = new Error(`Scraping failed with code: ${errorCode}`);
              (error as any).code = errorCode; // Attach code for parseError to handle
              return reject(error);

          } else if (!extractedText || extractedText.length < 50) {
              return reject(new Error("The AI returned very little content from the URL. It's likely not a valid job description. Please paste the full description manually."));
          } else {
              return resolve(extractedText);
          }
      } catch (error) {
          // Catches errors from the generateContentWithRetry call itself
          const { message } = parseError(error);
          return reject(new Error(message));
      }
  });
  
  const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => {
          reject(new Error(`The request timed out after ${FETCH_TIMEOUT_MS / 1000} seconds. The website might be slow or unreachable.`));
      }, FETCH_TIMEOUT_MS);
  });
  
  return Promise.race([fetchPromise, timeoutPromise]);
};
