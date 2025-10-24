import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent, IncludedProfileSelections, Experience, Education, Project, ParsedCoverLetter } from '../types';
import { readFileContent } from '../utils';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Some features will be disabled or mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Parses a caught error object from an API call and returns a user-friendly message
 * and a flag indicating if the operation is retryable.
 * @param error The catught error object.
 * @returns An object with a user-friendly `message` and a boolean `isRetryable`.
 */
const parseError = (error: any): { message: string, isRetryable: boolean } => {
    const errorMessage = String(error?.message || error).toLowerCase();

    if (error instanceof SyntaxError) {
        return { message: "The AI returned a response in an unexpected format which couldn't be processed. This is often a temporary issue. Please try again.", isRetryable: true };
    }
    if (errorMessage.includes('api key not valid')) {
        return { message: "API Key Error: The configured API key is invalid or has expired.", isRetryable: false };
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('resource has been exhausted')) {
        return { message: "The service is currently experiencing high traffic (Rate Limit Exceeded). Please wait a moment before trying again.", isRetryable: true };
    }
    if (errorMessage.includes('content has been blocked') || errorMessage.includes('safety policy')) {
        return { message: "Content Blocked: The request was blocked due to safety policies. Please revise your input to remove any potentially sensitive content and try again.", isRetryable: false };
    }
    if (errorMessage.includes('503') || errorMessage.includes('unavailable') || errorMessage.includes('overloaded')) {
        return { message: "Service Unavailable: The AI service is temporarily unavailable or overloaded. This is usually temporary, so please try again in a few moments.", isRetryable: true };
    }
    if (errorMessage.includes('network request failed') || errorMessage.includes('fetch')) {
         return { message: "Network Error: Could not connect to the AI service. Please check your internet connection.", isRetryable: true };
    }

    // Default fallback
    const displayMessage = error.message ? `An unexpected error occurred: ${error.message}` : "An unknown error occurred. Please check the console for more details.";
    return { message: displayMessage, isRetryable: false };
};


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
                    You are an expert web-scraping assistant. Your task is to visit the provided URL, extract the core job description, and clean it for presentation.

                    URL: ${urlObject.href}

                    **Success Path:**
                    1.  **Extract Core Content:** Visit the URL and meticulously extract the primary text of the job description.
                    2.  **Clean and Sanitize:** Aggressively remove all non-essential content (headers, footers, ads, etc.).
                    3.  **Format for Readability:** Structure the extracted text logically using simple markdown.
                    4.  **Final Output:** Return ONLY the cleaned and formatted plain text of the job description.

                    **Failure Path:**
                    - If you are unable to extract the job description, you MUST return a single line with a specific error code, prefixed with "FETCH_ERROR:".
                    - Use one of the following error codes:
                      - "NOT_FOUND": If the URL leads to a "404 Not Found" page.
                      - "ACCESS_DENIED": If you encounter a login wall, CAPTCHA, or access-denied message (403 Forbidden).
                      - "SERVER_ERROR": If the website's server returns an error (e.g., 500, 502, 503).
                      - "NO_CONTENT": If the page loads but does not contain a job description.
                    
                    - For example, if the page returns a 500 error, your response must be exactly: "FETCH_ERROR: SERVER_ERROR"
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const extractedText = response.text.trim();

                if (extractedText.startsWith('FETCH_ERROR:')) {
                    const errorCode = extractedText.replace('FETCH_ERROR:', '').trim();
                    let userMessage: string;

                    switch (errorCode) {
                        case 'NOT_FOUND':
                            userMessage = "The page at the provided URL could not be found (404 Not Found). Please check if the URL is correct.";
                            break;
                        case 'ACCESS_DENIED':
                            userMessage = "Access to the URL was denied. This often happens with sites that require a login or have bot protection. Please paste the description manually.";
                            break;
                        case 'SERVER_ERROR':
                            userMessage = "The server for the URL reported an error (e.g., 500 Internal Server Error). The site might be temporarily down. Please try again later or paste the description manually.";
                            break;
                        case 'NO_CONTENT':
                            userMessage = "We accessed the page, but couldn't find a job description. The content might be loaded in a way that's hard for the AI to read. Please paste it manually.";
                            break;
                        default:
                            userMessage = "The AI could not extract a job description from the URL for an unknown reason. Please paste the description manually.";
                    }
                    const error = new Error(userMessage);
                    (error as any).code = errorCode; // Attach code for retry logic
                    return reject(error);

                } else if (!extractedText || extractedText.length < 50) {
                    return reject(new Error("The AI returned very little content from the URL. It's likely not a valid job description. Please paste the full description manually."));
                } else {
                    return resolve(extractedText);
                }
            } catch (error) {
                // Catches errors from the ai.models.generateContent call itself and re-throws a user-friendly version.
                const { message } = parseError(error);
                return reject(new Error(message));
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
        const errorCode = error.code;

        // A definitive failure from scraping (e.g., 404, 403, or no content found). Don't retry these.
        const isNonRetryableScrapingError = errorCode && ['NOT_FOUND', 'ACCESS_DENIED', 'NO_CONTENT'].includes(errorCode);
        
        if (isNonRetryableScrapingError) {
            throw error;
        }

        // It's a transient error (timeout, Gemini API error, or a 5xx from the target site). Let's retry.
        if (i < MAX_RETRIES - 1) {
            const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
            console.warn(`URL fetch failed (attempt ${i + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
  }

  // If all retries failed, throw a comprehensive error.
  throw new Error(`Failed to fetch the URL after ${MAX_RETRIES} attempts. The website or AI service may be temporarily unavailable. Last error: ${lastError?.message || 'Unknown error'}`);
};

/**
 * Filters the profile data based on user selections.
 * @param profile The full ProfileData object.
 * @param selections The IncludedProfileSelections object indicating what to include.
 * @returns A new ProfileData object with only the selected content.
 */
const filterProfileData = (profile: ProfileData, selections: IncludedProfileSelections): ProfileData => {
    const filteredProfile: ProfileData = { ...profile };

    // Handle top-level optional fields
    if (!selections.summary) filteredProfile.summary = '';
    if (!selections.additionalInformation) filteredProfile.additionalInformation = '';

    // Handle array sections
    filteredProfile.education = profile.education.filter(edu => selections.educationIds.has(edu.id));
    filteredProfile.experience = profile.experience.filter(exp => selections.experienceIds.has(exp.id));
    filteredProfile.projects = profile.projects.filter(proj => selections.projectIds.has(proj.id));
    filteredProfile.technicalSkills = profile.technicalSkills.filter(skill => selections.technicalSkillIds.has(skill.id));
    filteredProfile.softSkills = profile.softSkills.filter(skill => selections.softSkillIds.has(skill.id));
    filteredProfile.tools = profile.tools.filter(tool => selections.toolIds.has(tool.id));
    filteredProfile.languages = profile.languages.filter(lang => selections.languageIds.has(lang.id));
    filteredProfile.certifications = profile.certifications.filter(cert => selections.certificationIds.has(cert.id));
    filteredProfile.interests = profile.interests.filter(interest => selections.interestIds.has(interest.id));

    // Handle custom sections and their items
    filteredProfile.customSections = profile.customSections
        .filter(cs => selections.customSectionIds.has(cs.id))
        .map(cs => {
            const includedItems = selections.customSectionItemIds[cs.id];
            return {
                ...cs,
                items: cs.items.filter(item => includedItems?.has(item.id))
            };
        });

    return filteredProfile;
};


export const generateTailoredDocuments = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<GeneratedContent> => {

  if (!process.env.API_KEY) {
      return new Promise(resolve => setTimeout(() => resolve(MOCK_RESPONSE), 1500));
  }

  const modelName = options.thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  // Filter the profile data based on user's selections
  const filteredProfile = filterProfileData(profile, options.includedProfileSelections);
  
  const prompt = `
    You are a world-class professional resume and cover letter writer. Your task is to create tailored application documents for a job application.

    **Candidate's Profile:**
    The following is a detailed JSON object of the candidate's professional profile. It is highly structured, including specific achievements, categorized skills (technical, soft, tools), project details, and more. Use this granular information to create highly specific and compelling content.
    ${JSON.stringify(filteredProfile)}

    **Job Description:**
    ${options.jobDescription}

    **Instructions:**
    1. **Industry:** The candidate is targeting the "${profile.industry}" industry. Ensure the language, skills, and examples are highly relevant to this field.
    2. **Experience Level & Vibe:** The candidate is targeting a(n) "${profile.experienceLevel}" role and wants to convey a vibe that is: "${profile.vibe}". Reflect this in the language and focus of the documents.
    3. **Resume Template Style:** The user chose the "${profile.selectedResumeTemplate}" template. The resume should reflect this style (e.g., 'classic' is traditional, 'modern' is clean and minimalist, 'creative' might use more unique formatting).
    4. **Cover Letter Template Style:** The user chose the "${profile.selectedCoverLetterTemplate}" template. The cover letter should also reflect this style.
    5. **Resume Length:** Create a resume with a maximum length of ${options.resumeLength}.
    6. **Resume Summary:** ${options.includeSummary ? 'The resume MUST include a professional summary section at the top. Use the user-provided summary as a strong base, but refine it to perfectly match the job description.' : 'The resume MUST NOT include a professional summary section.'}
    7. **Cover Letter Skills:** ${options.includeCoverLetterSkills ? 'The cover letter MUST include a dedicated "Key Skills" section. This section should be a concise, bulleted list of 3-5 of the most relevant skills from the candidate\'s profile (technical, soft, and tools) that are directly applicable to the job description.' : 'The cover letter should integrate skills naturally into the narrative and MUST NOT have a separate, dedicated "Key Skills" section.'}
    8. **Tone:** The tone should be adjusted based on this scale: 0 is extremely formal business, 100 is very personal and conversational. The user selected: ${options.tone}.
    9. **Language Style:** The language should be adjusted on this scale: 0 is highly technical and full of jargon, 100 is general and easy to understand for a non-technical audience. The user selected: ${options.technicality}.
    10. **Key Focus Areas:** The user wants to specifically highlight these topics: "${options.focus}". Ensure these are prominent.
    11. **Documents to Generate:** 
        - Resume: ${options.generateResume}
        - Cover Letter: ${options.generateCoverLetter}
    
    ${options.uploadedResume || options.uploadedCoverLetter ? `
    **Inspiration Documents:**
    The user has provided the following documents for inspiration. Use their style, tone, and key phrases as a guide, but create entirely new, tailored content for the target job. Do not simply copy the old documents.

    ${options.uploadedResume ? `--- OLD RESUME FOR INSPIRATION ---\n${options.uploadedResume}` : ''}
    ${options.uploadedCoverLetter ? `--- OLD COVER LETTER FOR INSPIRATION ---\n${options.uploadedCoverLetter}` : ''}
    ` : ''}

    **Task:**
    - Analyze the candidate's detailed profile and the job description in detail.
    - Create a resume that strategically highlights the most relevant skills (from all categories) and experiences. Transform the achievement bullet points into powerful, quantified statements.
    - Create a compelling cover letter that tells a story, directly connects the candidate's experience to the company's needs as stated in the job description, and perfectly reflects the desired tone, language style, and template choice.
    - Structure the output as a JSON object with two keys: "resume" and "coverLetter". The value for each key should be the full document content in Markdown format. If a document is not requested, its value should be null.
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


// --- Resume Parsing Logic ---

const PARSING_PROMPT_DETAILS = `
    **Core Objective:** Your goal is to convert the unstructured resume TEXT content into a clean, accurate, and comprehensive JSON object that populates as much of the user's profile as possible. Be meticulous and infer structure intelligently.

    **Detailed Parsing Instructions:**

    1.  **Core Information**: Extract the candidate's \`fullName\`, current or most recent \`jobTitle\`, \`email\`, \`phone\`, \`location\`, \`website\`, \`linkedin\`, and \`github\`. The \`jobTitle\` is often found right under the name.

    2.  **Experience Section (Crucial):**
        - For each role, identify the company, title, location, and precise \`startDate\` and \`endDate\` (e.g., 'YYYY' or 'MM/YYYY' or 'Present').
        - **Achievements vs. Responsibilities:** This is a critical distinction. An achievement demonstrates impact and value. Actively search for bullet points or sentences that contain:
            - **Quantifiable Metrics:** Numbers, percentages, dollar amounts (e.g., "Increased revenue by 15%", "Managed a budget of $500k", "Reduced server costs by 20%").
            - **Specific Outcomes:** Words indicating completion or positive results (e.g., "Launched," "Delivered," "Implemented," "Resolved," "Optimized," "Awarded").
            - **Strong Action Verbs:** "Led," "Developed," "Engineered," "Managed," "Mentored," etc.
        - **Formatting:** Ensure EACH impactful bullet point from the resume is a SEPARATE string in the \`achievements\` array. Do not combine them.

    3.  **Education Section:**
        - For each entry, extract the institution, degree, field of study, GPA (if mentioned), relevant coursework, awards/honors, and precise \`startDate\` and \`endDate\` (e.g., 'YYYY' or 'MM/YYYY').

    4.  **Projects Section (Enhanced):**
        - For each project, extract its name, description, URL (if present), technologies used, and precise \`startDate\` and \`endDate\` (e.g., 'YYYY' or 'MM/YYYY').

    5.  **Skills Section (Precise Categorization & Inference):**
        - Scour the ENTIRE resume for skills, not just a dedicated 'Skills' section. Look for them in summaries, experience descriptions, project details, and any explicit skill lists.
        - Use the following definitions to categorize them accurately:
            - **Technical Skills:** Core abilities related to the "how" of a job, involving specific technologies, programming, data, or technical methodologies.
                - **Examples:** Python, React.js, SQL, Machine Learning, Data Analysis, Cloud Computing, AWS, Agile Methodologies, Network Security, REST APIs.
                - **Rule:** If it's a programming language, framework, technical concept, or methodology, it's a Technical Skill.
            - **Tools:** Specific software, platforms, or hardware used to perform tasks.
                - **Examples:** Git & GitHub, Docker, JIRA, Salesforce, Figma, Adobe Premiere Pro, HubSpot, Microsoft Office Suite, Jenkins.
                - **Rule:** If you can "open" or "log into" it, it's likely a Tool.
            - **Soft Skills:** Interpersonal attributes, personal qualities, and transferable skills demonstrated in professional contexts. Actively infer these from descriptions of teamwork, leadership, problem-solving, communication, adaptability, and collaboration within experience and project sections, even if not explicitly listed.
                - **Examples:** Team Leadership, Strategic Communication, Complex Problem Solving, Adaptability, Client Relations, Mentorship, Cross-functional Collaboration.
                - **Rule:** If it describes "how" you work with others, manage yourself, or impact team dynamics, it's a Soft Skill.

    6.  **General Inferences:**
        - From the job titles, summary, and overall content, accurately infer the \`industry\` (e.g., "Software Engineering", "Digital Marketing", "Healthcare IT") and \`experienceLevel\` ("internship", "entry", "mid", "senior", "executive").
        - Generate a concise, professional \`vibe\` string based on the resume's overall tone and focus (e.g., "Innovative problem-solver with a focus on data-driven results", "Client-focused sales leader driving revenue growth").

    7.  **Data Integrity & Formatting:**
        - **Be Comprehensive:** Your primary goal is to extract as much information as possible into the corresponding fields in the JSON schema.
        - **Do NOT Invent Data:** If information for a specific optional field (e.g., GPA, GitHub URL) is clearly not present in the resume, omit the key for that field. Do not use placeholders like "N/A".
        - **Handle Empty Sections:** If an entire section like 'Projects' or 'Certifications' is absent from the resume, you MUST return an empty array for that key (e.g., \`"projects": []\`). Do not omit the key for entire sections.
        - **Date Format:** When extracting dates (startDate, endDate), prioritize "YYYY" or "MM/YYYY" format. If only years are available, use "YYYY". If "Present" is indicated, use "Present".
`;

const PARSING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING, description: "Full name of the candidate." },
      jobTitle: { type: Type.STRING, description: "The candidate's current or most recent job title." },
      email: { type: Type.STRING, description: "Email address." },
      phone: { type: Type.STRING, description: "Phone number." },
      website: { type: Type.STRING, description: "Personal website or portfolio URL." },
      location: { type: Type.STRING, description: "City and State, e.g., 'San Francisco, CA'." },
      linkedin: { type: Type.STRING, description: "URL of the LinkedIn profile." },
      github: { type: Type.STRING, description: "URL of the GitHub profile." },
      summary: { type: Type.STRING, description: "The professional summary or objective statement." },
      education: {
        type: Type.ARRAY,
        description: "A list of educational institutions attended.",
        items: {
          type: Type.OBJECT,
          properties: {
            institution: { type: Type.STRING },
            degree: { type: Type.STRING },
            fieldOfStudy: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            gpa: { type: Type.STRING, description: "GPA, if mentioned." },
            relevantCoursework: { type: Type.STRING },
            awardsHonors: { type: Type.STRING }
          }
        }
      },
      experience: {
        type: Type.ARRAY,
        description: "A list of professional experiences.",
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING },
            title: { type: Type.STRING },
            location: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            achievements: {
              type: Type.ARRAY,
              description: "List of achievements or responsibilities as strings.",
              items: { type: Type.STRING }
            }
          }
        }
      },
      projects: {
        type: Type.ARRAY,
        description: "A list of personal or professional projects.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            url: { type: Type.STRING },
            technologiesUsed: { type: Type.STRING, description: "Comma-separated list of technologies." },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING }
          }
        }
      },
      technicalSkills: { type: Type.ARRAY, description: "List of technical skills.", items: { type: Type.STRING } },
      softSkills: { type: Type.ARRAY, description: "List of soft skills.", items: { type: Type.STRING } },
      tools: { type: Type.ARRAY, description: "List of tools and technologies.", items: { type: Type.STRING } },
      languages: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {type: Type.STRING },
            proficiency: { type: Type.STRING, enum: ['native', 'fluent', 'conversational', 'basic'] }
          }
        }
      },
      certifications: { type: Type.ARRAY, description: "List of certifications.", items: { type: Type.STRING } },
      interests: { type: Type.ARRAY, description: "List of interests.", items: { type: Type.STRING } },
      industry: { type: Type.STRING, description: "Inferred target industry." },
      experienceLevel: { type: Type.STRING, description: "Inferred experience level.", enum: ['internship', 'entry', 'mid', 'senior', 'executive'] },
      vibe: { type: Type.STRING, description: "Inferred professional vibe or focus." },
    }
};

const transformApiResponseToProfile = (parsedData: any): Partial<ProfileData> => {
  const transformSimpleArray = (arr: string[] | undefined) => {
    if (!arr) return [];
    return arr.map(name => ({ id: crypto.randomUUID(), name }));
  };
  
  const transformExperience = (exps: any[] | undefined) => {
    if (!exps) return [];
    return exps.map(exp => ({
      ...exp,
      id: crypto.randomUUID(),
      achievements: (exp.achievements || []).map((text: string) => ({ id: crypto.randomUUID(), text })),
    }));
  };

  const transformArrayWithId = (arr: any[] | undefined) => {
    if(!arr) return [];
    return arr.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      startDate: item.startDate || '',
      endDate: item.endDate || '',
    }));
  }

  return {
    ...parsedData,
    experience: transformExperience(parsedData.experience),
    education: transformArrayWithId(parsedData.education),
    projects: transformArrayWithId(parsedData.projects),
    languages: transformArrayWithId(parsedData.languages),
    technicalSkills: transformSimpleArray(parsedData.technicalSkills),
    softSkills: transformSimpleArray(parsedData.softSkills),
    tools: transformSimpleArray(parsedData.tools),
    certifications: transformSimpleArray(parsedData.certifications),
    interests: transformSimpleArray(parsedData.interests),
  };
};

export const importAndParseResume = async (file: File): Promise<Partial<ProfileData>> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured. Cannot parse resume.");
  }

  const resumeText = await readFileContent(file);
  if (!resumeText || resumeText.trim().length < 20) {
      throw new Error("The file appears to be empty or contains very little content.");
  }

  const prompt = `
      You are an expert data extraction system. Your task is to meticulously analyze the provided resume TEXT and extract as much information as possible into a structured JSON object, following the schema and instructions provided.
      **Resume Text to Parse:**
      ---
      ${resumeText}
      ---
      ${PARSING_PROMPT_DETAILS}
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: PARSING_SCHEMA,
        }
    });

    return transformApiResponseToProfile(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Error during resume parsing:", error);
    const { message } = parseError(error);
    throw new Error(message);
  }
};

export const parseGeneratedResume = async (resumeMarkdown: string): Promise<Partial<ProfileData>> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured. Cannot parse resume.");
  }

  if (!resumeMarkdown || resumeMarkdown.trim().length < 20) {
      throw new Error("The generated resume content is too short to parse.");
  }

  const prompt = `
      You are an expert data extraction system. Your task is to meticulously analyze the provided resume, which is in MARKDOWN format, and extract as much information as possible into a structured JSON object, following the schema and instructions provided.
      **Resume Markdown to Parse:**
      ---
      ${resumeMarkdown}
      ---
      ${PARSING_PROMPT_DETAILS}
    `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Use Pro for higher accuracy on this complex task
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: PARSING_SCHEMA,
        }
    });
    return transformApiResponseToProfile(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Error parsing generated resume:", error);
    const { message } = parseError(error);
    throw new Error(message);
  }
};

export const parseGeneratedCoverLetter = async (coverLetterMarkdown: string): Promise<ParsedCoverLetter> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured. Cannot parse cover letter.");
    }

    if (!coverLetterMarkdown || coverLetterMarkdown.trim().length < 20) {
        throw new Error("The generated cover letter content is too short to parse.");
    }
    
    const prompt = `
        You are an expert data extraction system. Your task is to meticulously analyze the provided cover letter, which is in MARKDOWN format, and extract its components into a structured JSON object.

        **Cover Letter Markdown to Parse:**
        ---
        ${coverLetterMarkdown}
        ---
        
        **Detailed Parsing Instructions:**

        1.  **Sender Information**:
            - \`senderName\`: The full name of the person sending the letter.
            - \`senderAddress\`: The full street address, city, state, and zip code of the sender. Consolidate into a single string. If parts are on multiple lines, join them.
            - \`senderContact\`: The sender's email and/or phone number. Consolidate into a single string.

        2.  **Date**: Extract the date the letter was written.

        3.  **Recipient Information**:
            - \`recipientName\`: The full name of the hiring manager or recipient. If not specified, use "Hiring Manager".
            - \`recipientTitle\`: The job title of the recipient.
            - \`companyName\`: The name of the company.
            - \`companyAddress\`: The full address of the company. Consolidate into a single string.

        4.  **Letter Content**:
            - \`salutation\`: The opening greeting (e.g., "Dear Ms. Jones,").
            - \`body\`: The entire main content of the letter, from the first paragraph after the salutation to the last paragraph before the closing. Preserve paragraph breaks by using "\\n\\n".
            - \`closing\`: The closing phrase (e.g., "Sincerely," or "Best regards,").
            - \`signature\`: The sender's name as it appears at the very end.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        senderName: { type: Type.STRING },
                        senderAddress: { type: Type.STRING },
                        senderContact: { type: Type.STRING },
                        date: { type: Type.STRING },
                        recipientName: { type: Type.STRING },
                        recipientTitle: { type: Type.STRING },
                        companyName: { type: Type.STRING },
                        companyAddress: { type: Type.STRING },
                        salutation: { type: Type.STRING },
                        body: { type: Type.STRING },
                        closing: { type: Type.STRING },
                        signature: { type: Type.STRING },
                    },
                },
            }
        });

        return JSON.parse(response.text.trim());
    } catch (error: any) {
        console.error("Error parsing generated cover letter:", error);
        const { message } = parseError(error);
        throw new Error(message);
    }
};


export const convertToLatex = async (markdownContent: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not configured. Cannot convert to LaTeX.");
    }

    const prompt = `
        You are an expert LaTeX document creator specializing in professional resumes and cover letters.
        Your task is to convert the following document, provided in Markdown format, into a complete, clean, and compilable LaTeX document.

        **Input Document (Markdown):**
        ---
        ${markdownContent}
        ---

        **LaTeX Output Requirements:**

        1.  **Complete Document:** The output MUST be a full LaTeX file, starting with \`\\documentclass{article}\` and ending with \`\\end{document}\`.
        2.  **No Explanations:** Do NOT include any explanations, comments, or markdown formatting (like \`\`\`latex\`) in your response. The output must be ONLY the raw LaTeX code.
        3.  **Professional Layout:**
            *   Use the \`article\` document class.
            *   Set margins appropriately for a professional document using the \`geometry\` package (e.g., \`\\usepackage[left=0.75in, right=0.75in, top=0.5in, bottom=0.5in]{geometry}\`).
            *   Remove page numbering (\`\\pagestyle{empty}\`).
            *   Use a clean, modern font if possible (e.g., \`\\usepackage{helvet}\`, \`\\renewcommand{\\familydefault}{\\sfdefault}\`).
            *   For **resumes**, the candidate's name (if present, usually the first H1) should be large and centered. Contact information should be presented neatly below the name.
            *   For **cover letters**, use standard business letter formatting (sender address, date, recipient address, salutation, body, closing).
        4.  **Structure Mapping:**
            *   Map Markdown headings (\`#\`, \`##\`) to LaTeX sections (e.g., \`\\section*{...}\`). Use the starred version to avoid section numbering.
            *   Map Markdown bullet points (\`-\` or \`*\`) to a LaTeX \`itemize\` environment, with each point being an \`\\item\`.
            *   Map Markdown bold (\`**text**\`) to LaTeX bold (\`\\textbf{text}\`).
        5.  **Packages:** Include necessary packages like \`geometry\`, \`hyperref\` (for clickable links), \`needspace\`.
        6.  **Hyperlinks:** Ensure any web links in the contact information are clickable using \`hyperref\`.
        7.  **Handle Special Characters**: Escape LaTeX special characters (e.g., #, $, %, &, _, {, }) appropriately. For example, an email like "a&b@test.com" should be "a\\&b@test.com".

        **Example Resume Structure Snippet:**
        \`\`\`latex
        \\documentclass{article}
        \\usepackage[utf8]{inputenc}
        \\usepackage{geometry}
        \\usepackage{hyperref}
        \\geometry{left=0.75in, right=0.75in, top=0.5in, bottom=0.5in}
        \\pagestyle{empty}

        \\begin{document}

        \\begin{center}
            {\\Huge \\textbf{Alex Doe}} \\\\
            \\vspace{2mm}
            (555) 123-4567 | \\href{mailto:alex.doe@example.com}{alex.doe@example.com} | \\href{http://alexdoe.dev}{alexdoe.dev}
        \\end{center}

        \\section*{Summary}
        A highly motivated Software Engineer...

        \\section*{Experience}
        \\textbf{Software Engineer} | Tech Solutions Inc. \\hfill 2022 - Present \\\\
        \\begin{itemize}
            \\item Developed and maintained web applications...
        \\end{itemize}

        \\end{document}
        \`\`\`
        Now, based on these instructions, convert the provided Markdown document, correctly identifying if it is a resume or a cover letter and applying the appropriate formatting.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch(error: any) {
        console.error("Error converting to LaTeX:", error);
        const { message } = parseError(error);
        throw new Error(message);
    }
};

/**
 * Compiles LaTeX code into a PDF using an external service.
 * @param latexCode The full LaTeX document as a string.
 * @returns A promise that resolves to a Blob containing the PDF data.
 */
export const compileLatexToPdf = async (latexCode: string): Promise<Blob> => {
    // This uses a public, free-to-use LaTeX compilation service that appears more robust.
    // For production applications, a more reliable, private, or paid service is recommended.
    const TEX2DOC_API_URL = 'https://cloud.tex2doc.com/api/v1/pdf';

    try {
        const response = await fetch(TEX2DOC_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                latex_body: latexCode,
                output_format: 'pdf',
            }),
        });

        if (!response.ok) {
            // This API returns a JSON error object on failure.
            try {
                const errorResult = await response.json();
                const errorMessage = errorResult.message || `The PDF compilation service returned an error: ${response.status} ${response.statusText}`;
                console.error("LaTeX Compilation Failed:", errorResult);
                throw new Error(errorMessage);
            } catch (jsonError) {
                // If the error response isn't JSON, fall back to the status text.
                throw new Error(`The PDF compilation service returned an error: ${response.status} ${response.statusText}`);
            }
        }
        
        // The API should return the PDF blob directly on success.
        const pdfBlob = await response.blob();
        
        if (pdfBlob.type !== 'application/pdf') {
             // Sometimes services return an error (e.g., HTML or text) with a 200 OK status.
             // We can try to read it as text to find an error message.
             const errorText = await pdfBlob.text();
             console.error("LaTeX Compilation returned non-PDF content:", errorText);
             throw new Error(`LaTeX compilation failed. The service returned an unexpected content type. Log: ${errorText.substring(0, 500)}`);
        }

        return pdfBlob;

    } catch (error) {
        console.error("Network or compilation service error:", error);
        if (error instanceof Error) {
             // The most common client-side error is "Failed to fetch", which indicates a network or CORS issue.
             throw new Error(`Could not connect to the PDF compilation service. Please check your internet connection or try again later. (Details: ${error.message})`);
        }
        throw new Error("An unknown error occurred while connecting to the PDF compilation service.");
    }
};