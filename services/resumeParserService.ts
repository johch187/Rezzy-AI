import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData } from '../types';
import { readFileContent, parseError } from '../utils';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Some features will be disabled or mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const LAST_PARSE_TIMESTAMP_KEY = 'lastResumeParseTimestamp';
const PRO_MODEL_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

// --- Resume Parsing Logic ---

const PARSING_PROMPT_DETAILS = `
    **Primary Directive:** You are a hyper-attentive data extraction AI. Your primary goal is **completeness**. You will receive raw, unfiltered resume text in any language. Your task is to analyze this text and meticulously populate every field in the provided JSON schema.
    - **Language Agnostic:** Understand the source language but translate all extracted data (job titles, skills, etc.) into English for the final JSON output.
    - **Infer, Don't Omit:** Logically infer information that isn't explicitly stated. A reasonable guess is better than a blank field.
    - **Comprehensive Search:** Scour the *entire* document for data. Skills and other details are often scattered across multiple sections.
    - **Handle Missing Data:** If, after an exhaustive search, data for a field is truly missing, use an empty string \`""\` or an empty array \`[]\`. **Never omit keys from the JSON structure.**

    **Mandatory Internal Process:**
    1.  **Pass 1: Broad Extraction.** Scan the entire text and populate the JSON schema with all easily identifiable information.
    2.  **Pass 2: Gap Analysis & Targeted Re-scan.** Internally list all empty fields. Re-scan the entire resume text specifically to find information for these gaps (e.g., find "@" for a missing email, infer skills from achievement descriptions).
    3.  **Pass 3: Final Verification.** Review the completed JSON against the source text one last time for accuracy before producing the final output.

    **Detailed Parsing Rules:**
    Your focus is on accurately capturing **Personal Information, Experience, Education, and Projects**. Be flexible with headers (e.g., 'Work History' vs. 'Experience').

    - **Contact Information:** Find \`email\` (look for '@'), \`phone\`, \`linkedin\`, and \`github\` URLs. This info can be anywhere.
    - **Experience:** Extract every job. For each role, capture \`company\`, \`title\`, \`location\`. For dates, meticulously parse varied formats (e.g., 'Jan 2020 - Present', '2019-2021') into standardized \`startDate\` and \`endDate\` fields. Convert to 'Month YYYY' or 'YYYY' format. 'Present' is a valid endDate. **Crucially, extract every single achievement bullet point** without summarization.
    - **Education:** For each entry, extract \`institution\`, \`degree\`, \`fieldOfStudy\`. For dates, parse formats like 'Spring 2022' or '2018 - 2022' into standardized \`startDate\` and \`endDate\` fields ('Month YYYY' or 'YYYY' format).
    - **Projects:** Extract every project listed. Capture \`name\`, \`description\`, and \`url\`. Just like with experience and education, parse any date formats ('2023', 'Q2 2021 - Q1 2022', 'Summer 2020') into standardized \`startDate\` and \`endDate\` fields ('Month YYYY' or 'YYYY' format).
    - **Skills (Deep Inference Required):** Find skills throughout the *entire* resume (summary, experience, projects). Infer skills from context.
        - **Technical Skills:** e.g., Python, React.js, SQL, Machine Learning.
        - **Tools:** e.g., Git, Docker, JIRA, Figma.
        - **Soft Skills:** Infer from descriptions of teamwork, leadership, etc. (e.g., Project Management, Client Relations).

    **Target Role & Style Inference (Critical):**
    Beyond direct extraction, you must synthesize the entire resume to infer the candidate's career goals and style.
    - \`targetJobTitle\`: This is crucial. Analyze the career progression, years of experience, and skills to infer the logical next step or target role. It might be the current role or a more senior one (e.g., infer 'Senior Software Engineer' for someone with 5 years as a Software Engineer).
    - \`industry\`: Infer the primary industry from company descriptions and roles (e.g., 'FinTech', 'Healthcare Technology', 'SaaS').
    - \`experienceLevel\`: Based on the years of experience and roles, determine the seniority: 'internship', 'entry', 'mid', 'senior', or 'executive'.
    - \`keySkillsToHighlight\`: Identify the 5-7 most critical and frequently mentioned skills that define the candidate's core expertise. This should be a comma-separated string.
    - \`vibe\`: Analyze the language of the resume (e.g., action verbs, project descriptions) to create a short phrase describing the writing style and focus. Examples: 'Professional, results-oriented, and collaborative.', 'Creative and user-focused with a passion for design.', 'Data-driven and analytical with a focus on optimization.'

    **Common Pitfalls to Avoid:**
    - **Column Confusion:** Do not read text straight across multi-column layouts.
    - **Header/Footer Noise:** Ignore repeating text like page numbers.
`;

const PARSING_SCHEMA = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING, description: "Full name of the candidate." },
      targetJobTitle: { type: Type.STRING, description: "The candidate's inferred target job title, which might be a step up from their current role." },
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
      keySkillsToHighlight: { type: Type.STRING, description: "A comma-separated string of the 5-7 most important skills to highlight." },
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

/**
 * Internal core function to parse resume text using the Gemini API.
 * @param resumeText The full text content of the resume.
 * @param modelName The specific Gemini model to use for this parsing task.
 * @returns A promise that resolves to the parsed ProfileData.
 */
const _parseResumeText = async (resumeText: string, modelName: 'gemini-2.5-pro' | 'gemini-2.5-flash'): Promise<Partial<ProfileData>> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured. Cannot parse resume.");
  }
  if (!resumeText || resumeText.trim().length < 20) {
      throw new Error("The provided text is too short to be a valid resume.");
  }

  const prompt = `
      You are an expert data extraction system. Your task is to meticulously analyze the provided resume TEXT and extract as much information as possible into a structured JSON object, following the schema and instructions provided.
      **Resume Text to Parse:**
      ---
      ${resumeText}
      ---
      ${PARSING_PROMPT_DETAILS}
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
                responseSchema: PARSING_SCHEMA,
                ...(modelName === 'gemini-2.5-pro' && { thinkingConfig: { thinkingBudget: 32768 } })
            }
        });

        return transformApiResponseToProfile(JSON.parse(response.text.trim()));
    } catch (error: any) {
        lastError = error;
        const { message, isRetryable } = parseError(error);

        if (isRetryable && i < MAX_RETRIES - 1) {
            const delay = INITIAL_BACKOFF_MS * Math.pow(2, i);
            console.warn(`Resume parsing failed (attempt ${i + 1}/${MAX_RETRIES}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        } else {
            console.error(`Non-retryable or final error during resume parsing with ${modelName}:`, error);
            throw new Error(message);
        }
    }
  }

  // This line should not be reachable if the loop logic is correct
  throw new Error(parseError(lastError).message || 'Failed to parse resume after multiple attempts.');
};


/**
 * Parses a resume from an uploaded file (.pdf, .txt, .md).
 * It dynamically selects a model: 'gemini-2.5-flash' for the first parse,
 * and upgrades to 'gemini-2.5-pro' for reparses within a 10-minute window for higher accuracy.
 * @param file The file object to parse.
 * @returns A promise resolving to the parsed profile data.
 */
export const importAndParseResume = async (file: File): Promise<Partial<ProfileData>> => {
  const resumeText = await readFileContent(file);

  const now = Date.now();
  const lastParseTimeStr = localStorage.getItem(LAST_PARSE_TIMESTAMP_KEY);
  const lastParseTime = lastParseTimeStr ? parseInt(lastParseTimeStr, 10) : 0;

  let modelToUse: 'gemini-2.5-pro' | 'gemini-2.5-flash';

  if (lastParseTime && (now - lastParseTime < PRO_MODEL_WINDOW_MS)) {
      modelToUse = 'gemini-2.5-pro';
      console.log("Recent parse detected within 10 minutes. Upgrading to gemini-2.5-pro for enhanced accuracy.");
  } else {
      modelToUse = 'gemini-2.5-flash';
  }

  // Always update the timestamp to the current time for the next call.
  localStorage.setItem(LAST_PARSE_TIMESTAMP_KEY, now.toString());

  return await _parseResumeText(resumeText, modelToUse);
};

/**
 * Parses a resume from a markdown string (e.g., previously generated content).
 * Uses the high-accuracy 'gemini-2.5-pro' model to ensure fidelity when converting
 * AI-generated markdown back into a structured, editable form.
 * @param resumeMarkdown The markdown string of the resume.
 * @returns A promise resolving to the parsed profile data.
 */
export const parseGeneratedResume = async (resumeMarkdown: string): Promise<Partial<ProfileData>> => {
  // This internal parsing should always be high-quality.
  return await _parseResumeText(resumeMarkdown, 'gemini-2.5-pro');
};