import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent } from '../types';
import { parseError } from '../utils';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Some features will be disabled or mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const MOCK_RESPONSE: GeneratedContent = {
  resume: `# Alex Doe
(555) 123-4567 | alex.doe@example.com | alexdoe.dev | San Francisco, CA

**Summary**
A highly motivated Software Engineer with experience in building and maintaining web applications using modern technologies like React and Node.js. Proven ability to collaborate effectively in team environments to deliver high-quality software solutions.

**Experience**
**Software Engineer** | Tech Solutions Inc. | 2022 - Present
- Developed and maintained web applications using React and Node.js.
- Collaborated with cross-functional teams to deliver high-quality software.
- Optimized application performance, resulting in a 20% reduction in load times.

**Education**
**B.S. in Computer Science** | State University | 2018 - 2022

**Skills**
**Technical:** React, TypeScript, JavaScript, Node.js, HTML, CSS, Git
**Tools:** Docker, JIRA

**Languages**
English (Native), Spanish (Conversational)`,
  coverLetter: `Dear Hiring Manager,

I am writing to express my keen interest in the Software Engineer position I saw advertised. With a strong foundation in web development and hands-on experience with React and Node.js at Tech Solutions Inc., I am confident that I possess the skills and dedication to make a significant contribution to your team.

My work has focused on creating efficient, scalable, and user-friendly applications. I am particularly proud of my work in optimizing application performance, which demonstrates my commitment to quality and user experience.

I am excited by the opportunity to bring my technical skills and collaborative spirit to your company. Thank you for considering my application. I look forward to discussing how I can contribute to your success.

Sincerely,
Alex Doe`
};

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
  
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 1000;
  let lastError: Error | null = null;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
        const fetchPromise = new Promise<string>(async (resolve, reject) => {
            try {
                if (!process.env.API_KEY) {
                    return reject(new Error("API_KEY is not configured. Cannot fetch URL content. Please paste the job description manually."));
                }
            
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

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const extractedText = response.text.trim();

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
                // Catches errors from the ai.models.generateContent call itself
                return reject(error);
            }
        });
        
        const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => {
                reject(new Error(`The request timed out after ${FETCH_TIMEOUT_MS / 1000} seconds. The website might be slow or unreachable.`));
            }, FETCH_TIMEOUT_MS);
        });
        
        const result = await Promise.race([fetchPromise, timeoutPromise]);
        return result; // Success! Exit the loop and return.
    } catch (error: any) {
        lastError = error;
        const { message, isRetryable } = parseError(error);

        if (isRetryable && i < MAX_RETRIES - 1) {
            const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
            console.warn(`Attempt ${i + 1}/${MAX_RETRIES} failed: ${message}. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else {
            // Non-retryable error, or final attempt failed.
            throw new Error(message);
        }
    }
  }
  
  // This should theoretically not be reached if the catch block always throws.
  const { message } = parseError(lastError);
  throw new Error(message || `Failed to fetch URL after ${MAX_RETRIES} attempts.`);
};

export const generateTailoredDocuments = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<GeneratedContent> => {

  if (!process.env.API_KEY) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_RESPONSE), 1500));
  }

  const modelName = options.thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const prompt = `
    You are a world-class professional resume and cover letter writer. Your task is to create tailored application documents for a job application by synthesizing all of the following information.

    **1. Candidate's Profile Data:**
    This is a detailed JSON object of the candidate's professional profile. It includes their experience, skills, education, career goals, and more. Use this granular information to create highly specific and compelling content that accurately reflects the candidate.
    ${JSON.stringify(profile)}

    **2. Target Job Description:**
    This is the job the candidate is applying for. Analyze it meticulously to understand the required skills, responsibilities, and company culture.
    ${options.jobDescription}

    **3. Inspiration Documents (Style Guide):**
    The user has provided the following documents for stylistic inspiration. Analyze their structure, tone, and key phrases. Use them as a guide to match the candidate's personal style, but create entirely new, tailored content for the target job. Do not simply copy the old documents.
    ${options.uploadedResume ? `--- OLD RESUME FOR INSPIRATION ---\n${options.uploadedResume}\n--- END OLD RESUME ---` : ''}
    ${options.uploadedCoverLetter ? `--- OLD COVER LETTER FOR INSPIRATION ---\n${options.uploadedCoverLetter}\n--- END OLD COVER LETTER ---` : ''}

    **4. Detailed Generation Instructions & Constraints:**
    You MUST follow every instruction below to meet the user's requirements.

    - **Career Goals & Role Definition:**
      - **Target Job Title:** The candidate is applying for the role of "${profile.targetJobTitle}".
      - **Industry:** The candidate is targeting the "${profile.industry}" industry.
      - **Experience Level:** The role is at the "${profile.experienceLevel}" level.
      - **Company Keywords:** Pay attention to these keywords about the company's culture, products, or values: "${profile.companyKeywords}".
      - **Key Skills to Highlight:** The candidate wants to emphasize these specific skills: "${profile.keySkillsToHighlight}". Ensure these are prominent.
      - **Writing Style & Focus:** The documents must convey a professional vibe that is: "${profile.vibe}".

    - **Template & Formatting:**
      - **Resume Template:** The user chose the "${profile.selectedResumeTemplate}" template style. The resume's structure and feel should reflect this choice (e.g., 'classic' is traditional, 'tech' is modern and skill-focused).
      - **Cover Letter Template:** The user chose the "${profile.selectedCoverLetterTemplate}" template style. The cover letter must also align with this choice.
      - **Resume Length:** The resume's final length MUST NOT exceed ${options.resumeLength}.

    - **Content Rules:**
      - **Resume Summary:** ${options.includeSummary ? 'The resume MUST include a professional summary section at the top. Use the user-provided summary as a strong base, but refine it to perfectly match the job description.' : 'The resume MUST NOT include a professional summary section.'}
      - **Cover Letter Skills:** The cover letter should integrate skills naturally into the narrative and MUST NOT have a separate "Key Skills" section.

    - **Style & Tone:**
      - **Tone Scale:** On a scale of 0 (extremely formal) to 100 (very personal), the user selected: ${options.tone}. Adjust your writing accordingly.
      - **Language Style Scale:** On a scale of 0 (highly technical/jargon) to 100 (general audience), the user selected: ${options.technicality}.

    - **Documents to Generate:**
      - **Create Resume:** ${options.generateResume}
      - **Create Cover Letter:** ${options.generateCoverLetter}
    
    **Final Task:**
    Synthesize ALL the information provided above (Profile, Job Description, Inspiration Docs, and all Instructions). Create a resume and/or cover letter that strategically highlights the most relevant skills and experiences. Transform achievement bullet points into powerful, quantified statements. Write a compelling cover letter that tells a story and directly connects the candidate's experience to the company's needs.

    Structure your final output as a single JSON object with two keys: "resume" and "coverLetter". The value for each key should be the full document content in Markdown format. If a document was not requested, its value MUST be null.
  `;
  
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 1000;
  let lastError: Error | null = null;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              resume: {
                type: Type.STRING,
                description: "The full resume content in Markdown format. Null if not requested."
              },
              coverLetter: {
                type: Type.STRING,
                description: "The full cover letter content in Markdown format. Null if not requested."
              }
            },
            required: ["resume", "coverLetter"]
          },
          ...(options.thinkingMode && { thinkingConfig: { thinkingBudget: 32768 } })
        }
      });
  
      const jsonText = response.text.trim();
      const generatedContent = JSON.parse(jsonText);
      
      return {
        resume: generatedContent.resume || null,
        coverLetter: generatedContent.coverLetter || null,
      };
  
    } catch (error: any) {
      lastError = error;
      const { message, isRetryable } = parseError(error);

      if (isRetryable && i < MAX_RETRIES - 1) {
          const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
          console.warn(`API call failed (attempt ${i + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
      } else {
          console.error("Non-retryable or final error calling Gemini API:", error);
          throw new Error(message);
      }
    }
  }

  // If the loop finished without returning, it means all retries failed.
  const finalError = parseError(lastError).message || "The model is currently busy. We tried several times without success. Please try again in a few moments.";
  throw new Error(finalError);
};