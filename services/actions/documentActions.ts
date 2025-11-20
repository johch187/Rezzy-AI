import { Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent } from '../../types';
import { Agent, parseAgentJson } from '../agentKit';

const MOCK_RESPONSE: GeneratedContent = {
    resume: `# Mock Resume`,
    coverLetter: `Dear Hiring Manager, This is a mock response.`
};

export const generateTailoredDocuments = async (
  profile: ProfileData,
  options: GenerationOptions
): Promise<{ documents: GeneratedContent; analysis: any }> => {

  if (!process.env.API_KEY) {
    return new Promise(resolve => setTimeout(() => resolve({ documents: MOCK_RESPONSE, analysis: null }), 1500));
  }

  const inspirationDocsText = `
    ${options.uploadedResume ? `--- EXISTING RESUME (STYLE REF) ---\n${options.uploadedResume}\n--- END ---` : ''}
    ${options.uploadedCoverLetter ? `--- EXISTING COVER LETTER (STYLE REF) ---\n${options.uploadedCoverLetter}\n--- END ---` : ''}
    `;

  // 1. Resume Architect Agent
  const documentAgent = new Agent({
    model: options.thinkingMode ? 'gemini-3-pro-preview' : 'gemini-2.5-flash',
    systemInstruction: `You are an expert Resume Architect & Career Writer.
    - Your ONLY goal is to generate high-impact, ATS-optimized application documents.
    - **Tailoring:** Deeply align the candidate's profile with the job description. Prioritize relevant skills.
    - **Style:** Adopt the candidate's "vibe" and requested tone.
    - **Formatting:** Output clean Markdown.
    - **Constraint:** Do not invent false information, but do reframe existing experience to match the target role.`,
    thinkingBudget: options.thinkingMode ? 32768 : undefined,
    responseMimeType: "application/json",
    responseSchema: {
        type: Type.OBJECT,
        properties: {
            resume: { type: Type.STRING, description: "Markdown resume or null" },
            coverLetter: { type: Type.STRING, description: "Markdown cover letter or null" }
        },
        required: ["resume", "coverLetter"]
    }
  });

  // 2. HR Evaluator Agent (for Analysis)
  // Only run if we are generating documents for a specific job
  const shouldAnalyze = (options.generateResume || options.uploadedResume) && options.jobDescription;
  
  const analysisAgent = shouldAnalyze ? new Agent({
      model: 'gemini-3-pro-preview',
      systemInstruction: `You are a strict HR Evaluator.
      - Analyze the applicant's profile against the job description.
      - Provide a Fit Score and actionable feedback.`,
      thinkingBudget: 16000,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
            fitScore: { type: Type.NUMBER },
            gapAnalysis: { type: Type.STRING },
            keywordOptimization: { type: Type.STRING },
            impactEnhancer: { type: Type.STRING }
        },
        required: ['fitScore', 'gapAnalysis', 'keywordOptimization', 'impactEnhancer']
      }
  }) : null;

  const generationPrompt = `
    **Candidate Profile:** ${JSON.stringify(profile)}
    **Job Description:** ${options.jobDescription}
    **Style/Inspiration:** ${inspirationDocsText}
    **Directives:**
    - Generate Resume: ${options.generateResume} (Max length: ${options.resumeLength})
    - Generate Cover Letter: ${options.generateCoverLetter} (Length: ${options.coverLetterLength})
    - Tone: ${options.tone}
    - Vibe: ${profile.vibe}
  `;

  const analysisPrompt = `
    **Resume:** ${options.uploadedResume || JSON.stringify(profile)}
    **Job Description:** ${options.jobDescription}
  `;

  // Execute in parallel
  const [documentsResult, analysisResult] = await Promise.all([
      documentAgent.chat(generationPrompt),
      analysisAgent ? analysisAgent.chat(analysisPrompt) : Promise.resolve(null)
  ]);

  return { 
      documents: parseAgentJson<GeneratedContent>(documentsResult), 
      analysis: analysisResult ? parseAgentJson(analysisResult) : null 
  };
};