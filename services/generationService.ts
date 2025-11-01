import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent } from '../types';
import { parseError } from '../utils';
// Fix: Import generateContentWithRetry to resolve undefined function error.
import { generateContentWithRetry } from './geminiService';

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

  const inspirationDocsText = `
    ${options.uploadedResume ? `--- EXISTING RESUME (FOR STYLE REFERENCE ONLY) ---\n${options.uploadedResume}\n--- END EXISTING RESUME ---` : ''}
    ${options.uploadedCoverLetter ? `--- EXISTING COVER LETTER (FOR STYLE REFERENCE ONLY) ---\n${options.uploadedCoverLetter}\n--- END EXISTING COVER LETTER ---` : 'No inspiration documents were provided.'}
    `;

  const prompt = `
    You are an expert career consultant and writer, tasked with creating tailored application documents. Your goal is to synthesize the provided information to generate the best possible resume and/or cover letter.

    ### Primary Inputs

    **1. Candidate Profile (JSON):**
    This contains the candidate's complete professional background.
    \`\`\`json
    ${JSON.stringify(profile, null, 2)}
    \`\`\`

    **2. Target Job Description (Text):**
    This is the job the candidate is applying for.
    \`\`\`text
    ${options.jobDescription}
    \`\`\`

    **3. Stylistic Inspiration Documents (Text):**
    Use these ONLY to understand the candidate's personal writing style, tone, and formatting preferences. DO NOT copy content directly. Create new, tailored content based on the Candidate Profile and Job Description.
    ${inspirationDocsText}

    ### Generation Directives & Constraints

    You MUST adhere to every instruction below.

    - **Core Task:** Analyze the **Job Description** to identify key requirements. Then, use the **Candidate Profile** to find matching experiences and skills. Weave these into the documents, prioritizing what the job description asks for.
    - **Document(s) to Generate:**
      - Generate a resume: \`${options.generateResume}\`
      - Generate a cover letter: \`${options.generateCoverLetter}\`
    - **Style & Tone:**
      - Overall Tone: \`${options.tone}\`.
      - Language Technicality (0=General, 100=Expert): \`${options.technicality}\`.
      - Candidate's Desired Vibe: "${profile.vibe}". Embody this.
    - **Resume-Specific Rules:**
      - Template Style: \`${profile.selectedResumeTemplate}\`. Structure and tone should reflect this.
      - Length: MUST NOT exceed \`${options.resumeLength}\`. Be concise.
      - Professional Summary: A summary section is \`${options.includeSummary ? 'REQUIRED' : 'FORBIDDEN'}\`. If required, use the candidate's summary as a base but heavily tailor it to the job.
    - **Cover Letter-Specific Rules:**
      - Template Style: \`${profile.selectedCoverLetterTemplate}\`.
      - Length: Keep it \`${options.coverLetterLength}\`.
      - Skills: Integrate skills into the narrative. DO NOT use a separate bulleted list of skills.

    ### Final Output

    Your final output MUST be a single, valid JSON object with two keys: "resume" and "coverLetter".
    - The value for each key must be the full document content as a single Markdown string.
    - If a document was not requested (e.g., "Generate a resume: \`false\`"), its value in the JSON MUST be \`null\`.
  `;
  
  // Refactor: Use the robust generateContentWithRetry function to handle API calls.
  const jsonText = await generateContentWithRetry({
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

  let generatedContent;

  try {
    generatedContent = JSON.parse(jsonText);
  } catch (jsonError) {
      console.error("Failed to parse JSON response from Gemini:", jsonText);
      throw new Error("The AI returned a response in an unexpected format. Please try again.");
  }
  
  return {
    resume: generatedContent.resume || null,
    coverLetter: generatedContent.coverLetter || null,
  };
};

export const generateCoffeeChatBrief = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    // Return a mock response for development without an API key.
    return Promise.resolve(`
## Quick Overview
You're meeting with Sarah Chen, a Senior Product Manager at Innovate Inc., who previously worked at your alma mater's rival, a fun point of connection. The most interesting angle here is her transition from engineering to product, which mirrors your own career aspirations.

- - -

### Shared Touchpoints
*   **Shared Industry:** You both have a deep background in the SaaS technology space.
*   **Company Overlap:** Her previous role was at a company that is a key partner of your current employer.
*   **Geographic Connection:** You both lived in the Bay Area during the same time period.
*   **Skillset Synergy:** You've both highlighted "user-centric design" and "data-driven decisions" in your public profiles.

- - -

### Smart Conversation Starters
*   "I was really intrigued by your career path from software engineering into product management at Innovate. What was the most surprising part of that transition for you?"
*   "Given your experience with both large-scale enterprise products and nimble startups, what are some of the key differences you've noticed in how product decisions get made?"
*   "I saw that you volunteered with 'Code for Kids.' As someone passionate about mentorship, I'd love to hear what you learned from that experience."

- - -

### Industry or Context Insights
*   **Recent Launch:** Innovate Inc. just launched their new AI-powered analytics tool last month. It's a great opportunity to ask about the challenges and successes of that launch.
*   **Market Trend:** The conversational AI space is rapidly evolving. Mentioning a recent development or asking her opinion on it could show you're up-to-date.

- - -

### Closing or Follow-Up Ideas
A great way to close would be to ask, "Based on our chat, is there anyone else in your network you think would be insightful for me to connect with as I explore this path?" For follow-up, you could send a relevant article about a topic you discussed.
    `);
  }

  const prompt = `
    **Role:** You are a friendly and insightful coffee chat coach. Your job is to help people feel confident and prepared before networking conversations by creating a personalized "Coffee Chat Brief".
    
    **Tone:** Your tone should be warm, curious, and professional — like a smart, encouraging friend helping someone prep for an important chat. Avoid clichés, overly formal language, or generic advice. Be insightful and specific.

    ---

    **INPUT DATA:**

    **1. The User's Professional Profile:**
    This is the person you are coaching.
    \`\`\`json
    ${JSON.stringify(profile, null, 2)}
    \`\`\`

    **2. Information About the Counterpart:**
    This is the person the user is meeting with. It's a collection of notes, links, or a bio.
    \`\`\`text
    ${counterpartInfo}
    \`\`\`

    ---

    **YOUR TASK:**

    Analyze both inputs and create a "Coffee Chat Brief" with the following sections. Make it sound authentic, confident, and tailored. Use markdown for formatting (e.g., bolding, bullet points, and headers).

    **1. Quick Overview (2–3 sentences):**
    Summarize who the other person is, what connects them to the user, and what the most interesting conversation angle could be.

    **2. Shared Touchpoints (3-5 bullet points):**
    Highlight commonalities or points of connection between the user and the counterpart (e.g., shared university, past employers, skills, values, goals, location).

    **3. Smart Conversation Starters (3–4 bullet points):**
    Suggest open-ended, specific questions that will spark engaging discussion. These should be based on the user’s goals and the counterpart’s background. Go deeper than surface-level questions.

    **4. Industry or Context Insights (2–3 bullet points):**
    Add a few short, timely insights or fun facts about the counterpart’s industry or recent company news that could make the user sound well-prepared and genuinely interested.

    **5. Closing or Follow-Up Ideas (1–2 sentences):**
    Suggest a natural way the user could wrap up the conversation or continue the connection afterward.

    ---

    **FINAL OUTPUT:**
    Produce only the formatted "Coffee Chat Brief". Do not include any introductory text like "Here is your brief:".
  `;

  // Refactor: Use the robust generateContentWithRetry function to handle API calls.
  const brief = await generateContentWithRetry({
    model: 'gemini-2.5-pro', // Use the more powerful model for this task
    contents: prompt,
    config: {
      temperature: 0.6, // A bit of creativity but still grounded
      topP: 0.9,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  return brief;
};

export const generateReachOutMessage = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve(`Hi Sarah,

My name is Alex Doe, and I came across your profile while exploring careers in Product Management. I was really inspired by your journey from engineering to your current role at Innovate Inc.

I'm currently a Software Engineer and aspiring to make a similar transition. I would be incredibly grateful for the opportunity to hear about your experience.

Would you be open to a brief 15-20 minute virtual coffee chat in the coming weeks? I'm flexible and happy to work around your schedule.

Thanks so much for your time and consideration.

Best,
Alex`);
    }

    const prompt = `
        **Role:** You are a world-class professional communication coach. Your task is to write a concise, warm, and effective outreach message for a user who wants to request a coffee chat with a professional contact.

        **Tone:** Your tone must be respectful, confident, and friendly, but still professional. Avoid overly casual language or corporate jargon. The message should sound authentic and human.

        ---

        **INPUT DATA:**

        **1. The User's Professional Profile (who is sending the message):**
        \`\`\`json
        ${JSON.stringify(profile, null, 2)}
        \`\`\`

        **2. Information About the Counterpart (who is receiving the message):**
        This is a collection of notes, a bio, or a LinkedIn profile summary.
        \`\`\`text
        ${counterpartInfo}
        \`\`\`

        ---

        **YOUR TASK:**

        Analyze both inputs to write a short outreach message (ideally for a platform like LinkedIn or email). The message MUST follow this structure and these rules:

        1.  **Find the Hook:** Identify the single strongest point of connection between the user and the counterpart. This could be a shared university, a past employer, a mutual connection, a shared professional interest, or admiration for a specific project they worked on. This is the most important step.
        2.  **Opening (1 sentence):** Start with a polite opening. If a strong hook exists, lead with it. For example: "I hope you don't mind the outreach. I'm a fellow [University Name] alum and was so impressed by..." or "My name is [User's Name], and I've been following your work on [Project Name]..."
        3.  **Context (1-2 sentences):** Briefly state who you are and why you're reaching out. Connect your background or aspirations to their experience. For example: "I'm currently a [User's Job Title] and am deeply interested in transitioning into [Their Field]."
        4.  **The "Ask" (1 sentence):** Clearly and politely ask for a brief chat. Specify the length. For example: "I would be grateful for the chance to learn more about your experience and was hoping to ask for a brief 15-minute virtual coffee chat in the coming weeks."
        5.  **Make it Easy (1 sentence):** Show respect for their time and remove friction. For example: "I know you're busy, so I'm happy to work around whatever is easiest for your schedule."
        6.  **Closing:** End with a polite and professional closing, like "Best," or "Thank you for your consideration," followed by the user's first name.

        **CRITICAL CONSTRAINTS:**
        - Keep the entire message under 100 words.
        - The final output MUST be only the message text itself.
        - Do not include a subject line or any introductory phrases like "Here is the message:".
        - Do not use placeholders like \`[Your Name]\`; use the actual name from the user's profile.
    `;
    
    const message = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            temperature: 0.5,
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    return message;
};