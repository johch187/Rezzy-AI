import type { Request, Response } from 'express';
import { Type } from '@google/genai';
import type {
  ProfileData,
  GenerationOptions,
  GeneratedContent,
  ApplicationAnalysisResult,
} from '../../types.js';
import { generateContentWithRetry, hasGeminiKey } from '../lib/genai.js';
import { profileToMarkdown } from '../utils/profileToMarkdown.js';
import type { AuthedRequest } from '../routes.js';

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
Alex Doe`,
};

export const handleGenerateDocuments = async (req: AuthedRequest, res: Response) => {
  const { profile, options } = req.body as {
    profile?: ProfileData;
    options?: GenerationOptions;
  };

  if (!profile || !options) {
    return res.status(400).json({ error: 'Missing profile or options payload.' });
  }

  try {
    const result = await generateTailoredDocuments(profile, options);
    return res.json(result);
  } catch (error) {
    console.error('Failed to generate documents:', error);
    return res.status(500).json({ error: 'Failed to generate documents.' });
  }
};

export const handleApplicationAnalysis = async (req: Request, res: Response) => {
  const { resumeText, jobDescription } = req.body as {
    resumeText?: string;
    jobDescription?: string;
  };

  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'resumeText and jobDescription are required.' });
  }

  try {
    const analysis = await analyzeApplicationFit(resumeText, jobDescription);
    return res.json(analysis);
  } catch (error) {
    console.error('Failed to analyze application:', error);
    return res.status(500).json({ error: 'Failed to analyze application.' });
  }
};

const generateTailoredDocuments = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<{ documents: GeneratedContent; analysis: ApplicationAnalysisResult | null }> => {
  if (!hasGeminiKey) {
    const mockAnalysis: ApplicationAnalysisResult = {
      fitScore: 85,
      gapAnalysis: '- Experience with Python is mentioned, but the job requires Go.',
      keywordOptimization: "- Add 'cloud infrastructure' and 'CI/CD'.",
      impactEnhancer: "- Quantify the 'improved system performance' bullet point.",
    };
    return {
      documents: MOCK_RESPONSE,
      analysis: mockAnalysis,
    };
  }

  let analysisResult: ApplicationAnalysisResult | null = null;
  try {
    if (options.jobDescription && (options.generateResume || options.uploadedResume)) {
      const resumeForAnalysis = options.uploadedResume
        ? options.uploadedResume
        : profileToMarkdown(
            profile,
            profile.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'languages']
          );

      if (resumeForAnalysis.trim()) {
        analysisResult = await analyzeApplicationFit(resumeForAnalysis, options.jobDescription);
      }
    }
  } catch (analysisError) {
    console.warn('Application analysis failed during document generation.', analysisError);
    analysisResult = null;
  }

  const modelName = options.thinkingMode ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const inspirationDocsText = `
    ${
      options.uploadedResume
        ? `--- EXISTING RESUME (FOR STYLE REFERENCE ONLY) ---\n${options.uploadedResume}\n--- END EXISTING RESUME ---`
        : ''
    }
    ${
      options.uploadedCoverLetter
        ? `--- EXISTING COVER LETTER (FOR STYLE REFERENCE ONLY) ---\n${options.uploadedCoverLetter}\n--- END EXISTING COVER LETTER ---`
        : 'No inspiration documents were provided.'
    }
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

    ### Core Directives & Constraints

    You MUST adhere to every instruction below.

    - **Primary Goal:** Your main task is to analyze the **Job Description**, extract its key requirements, and then strategically weave the most relevant points from the **Candidate Profile** into the documents to create a powerful application.

    - **Resume Content (CRITICAL):**
      - **Achievements:** Every bullet point in the experience section MUST start with a strong action verb (e.g., "Orchestrated," "Engineered," "Maximized").
      - **Quantification:** You MUST quantify achievements with metrics wherever possible (e.g., "Increased revenue by 15%," "Managed a team of 5"). If the profile lacks metrics, you may infer a realistic and plausible one based on the context.

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

  const jsonText = await generateContentWithRetry({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          resume: {
            type: Type.STRING,
            description: 'The full resume content in Markdown format. Null if not requested.',
          },
          coverLetter: {
            type: Type.STRING,
            description: 'The full cover letter content in Markdown format. Null if not requested.',
          },
        },
        required: ['resume', 'coverLetter'],
      },
      ...(options.thinkingMode && { thinkingConfig: { thinkingBudget: 32768 } }),
    },
  });

  let generatedContent: GeneratedContent;
  try {
    generatedContent = JSON.parse(jsonText);
  } catch (error) {
    console.error('Failed to parse JSON response from Gemini:', jsonText);
    throw new Error('The AI returned a response in an unexpected format. Please try again.');
  }

  return {
    documents: {
      resume: generatedContent.resume || null,
      coverLetter: generatedContent.coverLetter || null,
    },
    analysis: analysisResult,
  };
};

const analyzeApplicationFit = async (
  resumeText: string,
  jobDescription: string
): Promise<ApplicationAnalysisResult> => {
  if (!hasGeminiKey) {
    return {
      fitScore: 80,
      gapAnalysis: '- Add more quantified achievements to align with the job.',
      keywordOptimization: '- Include cloud-native and observability keywords.',
      impactEnhancer: '- Emphasize leadership across cross-functional teams.',
    };
  }

  const prompt = `
    You are a senior technical recruiter tasked with evaluating how well a resume fits a job description.

    **Resume:**
    \`\`\`
    ${resumeText}
    \`\`\`

    **Job Description:**
    \`\`\`
    ${jobDescription}
    \`\`\`

    Provide a JSON object with:
    - fitScore: number 0-100
    - gapAnalysis: string (bullet list prefixed with "-")
    - keywordOptimization: string
    - impactEnhancer: string
  `;

  const jsonText = await generateContentWithRetry({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fitScore: { type: Type.INTEGER },
          gapAnalysis: { type: Type.STRING },
          keywordOptimization: { type: Type.STRING },
          impactEnhancer: { type: Type.STRING },
        },
        required: ['fitScore', 'gapAnalysis', 'keywordOptimization', 'impactEnhancer'],
      },
      thinkingConfig: { thinkingBudget: 16384 },
    },
  });

  return JSON.parse(jsonText);
};
