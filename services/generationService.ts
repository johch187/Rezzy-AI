import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent, CareerPath } from '../types';
import { parseError } from '../utils';
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

export const generateCareerPath = async (
  profile: ProfileData,
  currentRole: string,
  targetRole: string
): Promise<CareerPath> => {
    
    if (!process.env.API_KEY) {
        return Promise.resolve({
            currentRole,
            targetRole,
            path: [
                {
                    timeframe: "Next 3-6 Months",
                    milestoneTitle: "Foundation Building",
                    milestoneDescription: "Focus on acquiring the core skills and knowledge needed for your target role.",
                    actionItems: [
                        { category: "Skills", title: "Complete an Online Course", description: `Enroll in and complete a foundational course related to ${targetRole} on a platform like Coursera or Udemy.` },
                        { category: "Networking", title: "Informational Interviews", description: "Reach out to 2-3 professionals currently in your target role on LinkedIn for a brief coffee chat to understand their journey." },
                    ]
                },
                {
                    timeframe: "Year 1",
                    milestoneTitle: "Practical Application",
                    milestoneDescription: "Apply your new skills in a real-world context to build a portfolio and gain experience.",
                    actionItems: [
                        { category: "Projects", title: "Build a Portfolio Project", description: `Develop a project that showcases your abilities relevant to ${targetRole}. Document your process and results.` },
                        { category: "Career", title: "Seek Relevant Responsibilities", description: "Volunteer for tasks or projects at your current job that are related to the responsibilities of a " + targetRole + "." },
                    ]
                }
            ]
        });
    }

    const careerPathSchema = {
        type: Type.OBJECT,
        properties: {
            path: {
                type: Type.ARRAY,
                description: "An array of milestone objects representing the career path.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        timeframe: { type: Type.STRING, description: "The general timeframe for this milestone (e.g., 'Year 1-2 of University', 'First 6 Months in Role')." },
                        milestoneTitle: { type: Type.STRING, description: "A concise, motivating title for this stage of the career path." },
                        milestoneDescription: { type: Type.STRING, description: "A brief 1-2 sentence summary of the goal for this milestone." },
                        actionItems: {
                            type: Type.ARRAY,
                            description: "A list of concrete actions the user should take during this milestone.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { 
                                        type: Type.STRING, 
                                        enum: ['Academics', 'Internships', 'Projects', 'Skills', 'Networking', 'Career', 'Extracurriculars', 'Certifications'],
                                        description: "The category of the action item."
                                    },
                                    title: { type: Type.STRING, description: "A short, actionable title for the task." },
                                    description: { type: Type.STRING, description: "A detailed, practical description of the action item, providing specific examples or advice." }
                                },
                                required: ["category", "title", "description"]
                            }
                        }
                    },
                    required: ["timeframe", "milestoneTitle", "milestoneDescription", "actionItems"]
                }
            }
        },
        required: ["path"]
    };

    const prompt = `
        You are a seasoned career strategist and mentor AI. Your task is to create a detailed, actionable, and realistic career path for a user based on their current situation and future aspirations.

        **CONTEXT:**

        *   **User's Current Situation:** ${currentRole}
        *   **User's Target Role:** ${targetRole}
        *   **User's Background Profile (for context):**
            \`\`\`json
            ${JSON.stringify(profile, null, 2)}
            \`\`\`

        **YOUR DIRECTIVE:**

        Create a step-by-step career path, structured as a series of chronological milestones. The path should be both ambitious and achievable. Each milestone must contain specific, tangible action items.

        1.  **Analyze the Gap:** First, analyze the gap between the user's current situation/profile and their target role. Identify the key skills, experiences, and network they need to build.
        2.  **Define Milestones:** Break down the journey into 3-5 logical milestones. Each milestone should have a clear timeframe and objective.
        3.  **Create Actionable Steps:** For each milestone, provide a list of concrete action items. These should be specific and practical. Instead of "Learn to code," suggest "Complete a Python for Data Science course and build a portfolio project analyzing a public dataset."
        4.  **Categorize Actions:** Assign a category to each action item from the provided list to help the user organize their efforts.
        5.  **Maintain a Realistic Tone:** The advice should be encouraging but grounded in reality. Acknowledge the effort required.

        **EXAMPLE SCENARIOS:**
        *   If the user is a 'University Student' aiming for 'Investment Banking', the path should include steps like 'Spring Week Internships', 'Summer Analyst Programs', 'Networking with Alumni', and 'Financial Modeling Courses'.
        *   If the user is a 'Junior Software Engineer' aiming for 'Product Manager', the path should include steps like 'Take on product-adjacent tasks', 'Build a side project from scratch', 'Get a certification like Certified Scrum Product Owner (CSPO)', and 'Conduct informational interviews with PMs'.

        Your final output MUST be a single, valid JSON object that strictly adheres to the provided schema.
    `;
    
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: careerPathSchema,
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });
    
    const parsedData = JSON.parse(jsonText);

    return {
        path: parsedData.path,
        currentRole: currentRole,
        targetRole: targetRole,
    };
};