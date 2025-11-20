
import { Type } from '@google/genai';
import type { ProfileData, ParsedCoverLetter } from '../types';
import { readFileContent } from '../utils';
import { generateContentWithRetry } from './geminiService';

// 1. The Agentic System Instruction
// This defines the persona and the multi-step reasoning process the model must follow.
const PARSING_SYSTEM_INSTRUCTION = `
    **Primary Directive:** You are a hyper-attentive data extraction AI. Your primary goal is **completeness**. You will receive raw, unfiltered resume text in any language. Your task is to analyze this text and meticulously populate every field in the provided JSON schema.
    - **Language Agnostic:** Understand the source language but translate all extracted data (job titles, skills, etc.) into English for the final JSON output.
    - **Infer, Don't Omit:** Logically infer information that isn't explicitly stated. A reasonable guess is better than a blank field.
    - **Comprehensive Search:** Scour the *entire* document for data. Skills and other details are often scattered across multiple sections.
    - **Handle Missing Data:** If, after an exhaustive search, data for a field is truly missing, use an empty string \`""\` or an empty array \`[]\`. **Never omit keys from the JSON structure.**

    **Mandatory Internal Process (The "Thinking" Phase):**
    1.  **Pass 1: Broad Extraction.** Scan the entire text and populate the JSON schema with all easily identifiable information.
    2.  **Pass 2: Gap Analysis & Targeted Re-scan.** Internally list all empty fields. Re-scan the entire resume text specifically to find information for these gaps (e.g., find "@" for a missing email, infer skills from achievement descriptions).
    3.  **Pass 3: Final Verification.** Review the completed JSON against the source text one last time for accuracy before producing the final output.

    **Detailed Parsing Rules:**
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
`;

// 2. The Comprehensive Schema
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
      
      // Inferred Fields
      industry: { type: Type.STRING, description: "Inferred target industry." },
      experienceLevel: { type: Type.STRING, description: "Inferred experience level.", enum: ['internship', 'entry', 'mid', 'senior', 'executive'] },
      vibe: { type: Type.STRING, description: "Inferred professional vibe or focus." },
      companyKeywords: { type: Type.STRING, description: "Inferred keywords describing the type of companies worked for." },
      keySkillsToHighlight: { type: Type.STRING, description: "A comma-separated string of the 5-7 most important skills to highlight." },
      additionalInformation: { type: Type.STRING, description: "Any extra info not fitting other categories." },

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
        description: "List of projects.",
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                url: { type: Type.STRING },
                technologiesUsed: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
            },
        },
      },
      technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      tools: { type: Type.ARRAY, items: { type: Type.STRING } },
      certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
      interests: { type: Type.ARRAY, items: { type: Type.STRING } },
      languages: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    proficiency: { type: Type.STRING },
                },
            },
      },
    },
    required: ["fullName", "email", "experience", "education", "technicalSkills"] 
};

// 3. Transformation Helper
// Converts the AI's clean JSON into the ID-based structure required by the React app.
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
      // AI returns string array for achievements, App needs objects
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

const coverLetterSchema = {
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
};

/**
 * Parses a resume from an uploaded file (.pdf, .txt, .md).
 * It reads the file on the client, then sends the text content to Gemini for parsing.
 */
export const importAndParseResume = async (file: File): Promise<Partial<ProfileData>> => {
    const resumeText = await readFileContent(file);
    if (!resumeText || resumeText.trim().length < 20) {
        throw new Error("The provided file is empty or too short to be a valid resume. If this is a scanned PDF, please try again, as OCR will be attempted.");
    }

    // We use the System Instruction for the directive, and the prompt for the specific data.
    const prompt = `
      **Resume Text to Parse:**
      ---
      ${resumeText}
      ---
    `;

    const jsonText = await generateContentWithRetry({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            systemInstruction: PARSING_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            responseSchema: PARSING_SCHEMA,
            // High thinking budget to allow for the 3-pass internal process
            thinkingConfig: { thinkingBudget: 32768 } 
        }
    });

    try {
        const parsedJson = JSON.parse(jsonText);
        return transformApiResponseToProfile(parsedJson);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", jsonText);
        throw new Error("The AI returned a malformed response. Please check the document content and try again.");
    }
};

/**
 * Parses a resume from a markdown string (e.g., previously generated content).
 */
export const parseGeneratedResume = async (resumeMarkdown: string): Promise<Partial<ProfileData>> => {
    if (!resumeMarkdown || resumeMarkdown.trim().length < 20) {
        throw new Error("The provided resume content is too short to parse.");
    }
    
    const prompt = `
      **Resume Markdown to Parse:**
      ---
      ${resumeMarkdown}
      ---
    `;

    const jsonText = await generateContentWithRetry({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
            systemInstruction: PARSING_SYSTEM_INSTRUCTION, // Use the same powerful parser
            responseMimeType: "application/json",
            responseSchema: PARSING_SCHEMA,
            thinkingConfig: { thinkingBudget: 16000 } // Slightly lower budget for cleaner markdown inputs
        }
    });

    try {
        const parsedJson = JSON.parse(jsonText);
        return transformApiResponseToProfile(parsedJson);
    } catch (e) {
        console.error("Failed to parse JSON response from Gemini:", jsonText);
        throw new Error("The AI returned a malformed response.");
    }
};

export const parseGeneratedCoverLetter = async (coverLetterMarkdown: string): Promise<ParsedCoverLetter> => {
    if (!coverLetterMarkdown || coverLetterMarkdown.trim().length < 20) {
        throw new Error("The generated cover letter content is too short to parse.");
    }
    const jsonText = await generateContentWithRetry({
        model: 'gemini-3-pro-preview',
        contents: `Parse this cover letter into the schema:\n\n${coverLetterMarkdown}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: coverLetterSchema,
            thinkingConfig: { thinkingBudget: 2048 }
        }
    });
    
    return JSON.parse(jsonText);
};
