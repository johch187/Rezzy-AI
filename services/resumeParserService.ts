import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData } from '../types';
import { readFileContent } from '../utils';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Some features will be disabled or mocked.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const parseError = (error: any): { message: string, isRetryable: boolean } => {
    const errorMessage = String(error?.message || error).toLowerCase();

    // --- Gemini API & Network Errors ---
    if (errorMessage.includes('api key not valid')) {
        return { message: "Invalid API Key: The API key provided is not valid. Please ensure you have configured it correctly.", isRetryable: false };
    }
    if (errorMessage.includes('content has been blocked') || errorMessage.includes('safety policy')) {
        return { message: "Content Blocked: Your request was blocked due to safety settings. Please modify your input and try again.", isRetryable: false };
    }
    if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
        return { message: "Invalid Request: The data sent to the AI was malformed. This could be due to a bug. Please try again, and if the problem persists, contact support.", isRetryable: false };
    }
    if (errorMessage.includes('rate limit') || errorMessage.includes('resource has been exhausted')) {
        return { message: "Service Busy: The AI service is currently experiencing high traffic. Please wait a moment before trying again.", isRetryable: true };
    }
    if (errorMessage.includes('503') || errorMessage.includes('500') || errorMessage.includes('unavailable') || errorMessage.includes('internal error')) {
        return { message: "Service Unavailable: The AI service is temporarily unavailable. This is usually a short-term issue. Please try again in a few moments.", isRetryable: true };
    }
    if (errorMessage.includes('network request failed') || errorMessage.includes('fetch') || errorMessage.includes('network error') || errorMessage.includes('timed out')) {
         return { message: "Network Error: We couldn't connect to the service. Please check your internet connection and try again.", isRetryable: true };
    }
    if (error instanceof SyntaxError || errorMessage.includes('json')) {
        return { message: "Invalid AI Response: The model returned a response in an unexpected format. This can be a temporary issue, please try again.", isRetryable: true };
    }
    
    // Default/Unknown Errors
    console.error("Unhandled API Error:", error);
    const displayMessage = `An unexpected error occurred. Please try again. Details: ${error.message || 'No additional details available.'}`;
    return { message: displayMessage, isRetryable: false };
};


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

    **Common Pitfalls to Avoid:**
    - **Column Confusion:** Do not read text straight across multi-column layouts.
    - **Header/Footer Noise:** Ignore repeating text like page numbers.
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

/**
 * Internal core function to parse resume text using the Gemini API.
 * @param resumeText The full text content of the resume.
 * @returns A promise that resolves to the parsed ProfileData.
 */
const _parseResumeText = async (resumeText: string): Promise<Partial<ProfileData>> => {
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


/**
 * Parses a resume from an uploaded file (.pdf, .txt, .md).
 * @param file The file object to parse.
 * @returns A promise resolving to the parsed profile data.
 */
export const importAndParseResume = async (file: File): Promise<Partial<ProfileData>> => {
  const resumeText = await readFileContent(file);
  return await _parseResumeText(resumeText);
};

/**
 * Parses a resume from a markdown string (e.g., previously generated content).
 * @param resumeMarkdown The markdown string of the resume.
 * @returns A promise resolving to the parsed profile data.
 */
export const parseGeneratedResume = async (resumeMarkdown: string): Promise<Partial<ProfileData>> => {
  return await _parseResumeText(resumeMarkdown);
};