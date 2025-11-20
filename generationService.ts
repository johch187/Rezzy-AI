import { Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent } from '../types';
import { generateContentWithRetry } from './geminiService';

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
      throw new Error("Model returned a malformed, non-JSON response.");
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

  const brief = await generateContentWithRetry({
    model: 'gemini-2.5-pro', // Use the more powerful model for this task
    contents: prompt,
    config: {
      temperature: 0.6, // A bit of creativity but still grounded
      topP: 0.9,
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  if (!brief) {
      throw new Error("The AI returned an empty response. Please try again with more detailed information.");
  }
  return brief;
};
