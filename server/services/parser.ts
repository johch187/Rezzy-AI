import { Type } from '@google/genai';
import type { ParsedCoverLetter, ProfileData } from '../../types';
import { generateContentWithRetry, hasGeminiKey } from '../lib/genai';

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

    - **Contact Information:** Find \`email\`, \`phone\`, \`linkedin\`, and \`github\` URLs.
    - **Experience:** Extract every job with company, title, location, dates, and bullet achievements.
    - **Education:** Extract institution, degree, field of study, and normalize dates.
    - **Projects:** Capture name, description, URL, and normalized dates.
    - **Skills:** Infer technical, tools, and soft skills from across the resume.

    **Target Role & Style Inference (Critical):**
    - \`targetJobTitle\`: Infer the logical next role based on experience.
    - \`industry\`: Determine the primary industry from the resume.
    - \`experienceLevel\`: 'internship', 'entry', 'mid', 'senior', or 'executive'.
    - \`keySkillsToHighlight\`: 5-7 critical skills as a comma-separated string.
    - \`vibe\`: Short phrase describing the resume's tone.

    **Common Pitfalls to Avoid:**
    - Do not read across multi-column layouts.
    - Ignore headers/footers and repeated noise.
`;

const PARSING_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    jobTitle: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    website: { type: Type.STRING },
    location: { type: Type.STRING },
    linkedin: { type: Type.STRING },
    github: { type: Type.STRING },
    summary: { type: Type.STRING },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          fieldOfStudy: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          gpa: { type: Type.STRING },
          relevantCoursework: { type: Type.STRING },
          awardsHonors: { type: Type.STRING },
        },
      },
    },
    experience: {
      type: Type.ARRAY,
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
            items: { type: Type.STRING },
          },
        },
      },
    },
    projects: {
      type: Type.ARRAY,
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
    certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
    interests: { type: Type.ARRAY, items: { type: Type.STRING } },
    customSections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    additionalInformation: { type: Type.STRING },
    industry: { type: Type.STRING },
    experienceLevel: { type: Type.STRING },
    targetJobTitle: { type: Type.STRING },
    companyName: { type: Type.STRING },
    companyKeywords: { type: Type.STRING },
    keySkillsToHighlight: { type: Type.STRING },
    vibe: { type: Type.STRING },
  },
};

const transformApiResponseToProfile = (parsedData: any): Partial<ProfileData> => {
  const transformSimpleArray = (arr: string[] | undefined) => {
    if (!arr) return [];
    return arr.map(name => ({ id: crypto.randomUUID(), name }));
  };

  const transformExperience = (exps: any[] | undefined) => {
    if (!exps) return [];
    return exps.map(exp => ({
      id: crypto.randomUUID(),
      company: exp.company || '',
      title: exp.title || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      achievements: (exp.achievements || []).map((text: string) => ({ id: crypto.randomUUID(), text })),
    }));
  };

  const transformArrayWithId = (arr: any[] | undefined) => {
    if (!arr) return [];
    return arr.map(item => ({
      id: crypto.randomUUID(),
      ...item,
      startDate: item.startDate || '',
      endDate: item.endDate || '',
    }));
  };

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

export const parseResumeText = async (
  resumeText: string,
  model: 'gemini-2.5-pro' | 'gemini-2.5-flash'
): Promise<Partial<ProfileData>> => {
  if (!resumeText || resumeText.trim().length < 20) {
    throw new Error('The provided text is too short to be a valid resume.');
  }

  if (!hasGeminiKey) {
    throw new Error('Gemini API not configured.');
  }

  const prompt = `
      You are an expert data extraction system. Analyze the resume text below and populate the schema according to the detailed instructions.\n\n      ---\n      ${resumeText}\n      ---\n      ${PARSING_PROMPT_DETAILS}
    `;

  const jsonText = await generateContentWithRetry({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: PARSING_SCHEMA,
      ...(model === 'gemini-2.5-pro' ? { thinkingConfig: { thinkingBudget: 32768 } } : {}),
    },
  });

  return transformApiResponseToProfile(JSON.parse(jsonText));
};

export const parseCoverLetterMarkdown = async (
  coverLetterMarkdown: string
): Promise<ParsedCoverLetter> => {
  if (!coverLetterMarkdown || coverLetterMarkdown.trim().length < 20) {
    throw new Error('The generated cover letter content is too short to parse.');
  }

  if (!hasGeminiKey) {
    throw new Error('Gemini API not configured.');
  }

  const prompt = `
        You are an expert data extraction system. Analyze the cover letter markdown below and extract its structured components.
        ---
        ${coverLetterMarkdown}
        ---
    `;

  const schema = {
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
  } as const;

  const jsonText = await generateContentWithRetry({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: schema,
    },
  });

  return JSON.parse(jsonText);
};
