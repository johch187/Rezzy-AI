import { GoogleGenAI, Type } from "@google/genai";
import type { ProfileData, GenerationOptions, GeneratedContent, CareerPath, YouTubeVideo, ApplicationAnalysisResult, MentorMatch, CareerMilestone } from '../types';
import { generateContentWithRetry } from './geminiService';
import { profileToMarkdown } from '../components/editor/markdownConverter';

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
): Promise<{ documents: GeneratedContent; analysis: ApplicationAnalysisResult | null }> => {

  if (!process.env.API_KEY) {
      const mockAnalysis: ApplicationAnalysisResult = {
          fitScore: 85,
          gapAnalysis: "- Experience with Python is mentioned, but the job requires Go.",
          keywordOptimization: "- Add 'cloud infrastructure' and 'CI/CD'.",
          impactEnhancer: "- Quantify the 'improved system performance' bullet point."
      };
      return new Promise(resolve => setTimeout(() => resolve({ documents: MOCK_RESPONSE, analysis: mockAnalysis }), 1500));
  }

  let analysisResult: ApplicationAnalysisResult | null = null;
  try {
    if (options.jobDescription && (options.generateResume || options.uploadedResume)) {
      const resumeForAnalysis = options.uploadedResume 
        ? options.uploadedResume 
        : profileToMarkdown(profile, profile.sectionOrder || ['summary', 'experience', 'education', 'projects', 'skills', 'certifications', 'languages']);
      
      if (resumeForAnalysis.trim()) {
        analysisResult = await analyzeApplicationFit(resumeForAnalysis, options.jobDescription);
      }
    }
  } catch (analysisError) {
    console.warn("Application analysis failed during document generation, but generation will continue.", analysisError);
    analysisResult = null; 
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
    documents: {
      resume: generatedContent.resume || null,
      coverLetter: generatedContent.coverLetter || null,
    },
    analysis: analysisResult,
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

        1.  **Find the Hook:** Identify the single strongest point of connection between the user and the counterpart. This could be a shared university, a past employer, a mutual connection, or admiration for a specific project they worked on. This is the most important step.
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
                        timeframe: { type: Type.STRING, description: "The general timeframe for this milestone (e.g., 'First 6 months', 'Year 1', 'Years 2-3')." },
                        milestoneTitle: { type: Type.STRING, description: "A concise, motivating title for this stage of the career path." },
                        milestoneDescription: { type: Type.STRING, description: "A brief 1-2 sentence summary of the goal for this milestone, potentially highlighting the quarterly focus." },
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
                                    title: { type: Type.STRING, description: "A short, actionable title for the task. Prefix with the quarter, e.g., 'Q1: Learn Python Basics'." },
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
        You are a world-class career strategist and mentor AI. Your task is to create an exceptionally detailed, actionable, and realistic career path for a user.

        **CONTEXT:**

        *   **User's Current Role:** ${currentRole}
        *   **User's Target Role:** ${targetRole}
        *   **User's Background Profile (for context):**
            \`\`\`json
            ${JSON.stringify(profile, null, 2)}
            \`\`\`

        **YOUR DIRECTIVE:**

        Create a comprehensive, actionable, and realistic career path. The duration of the path should be appropriate for the transition from their current role to their target role (e.g., 1-2 years for a small step up, 3-5+ years for a major career change).

        1.  **Analyze the Gap:** Deeply analyze the user's profile against the requirements of the target role. Identify critical gaps in skills, experience, projects, and network.
        2.  **Define Milestones:** Structure the path into a logical sequence of chronological milestones. The timeframes can be flexible (e.g., "First 6 Months", "Year 1", "Years 2-3"). The total number of milestones should reflect the complexity of the goal, typically between 2 and 5.
        3.  **Create Granular Quarterly Action Items:** For EACH milestone, you MUST provide a detailed list of action items.
            *   **Quarterly Focus:** Each action item's title MUST be prefixed with the quarter it should be focused on (e.g., "Q1:", "Q2:", "Q3:", "Q4:").
            *   **Leverage Existing Skills:** Your suggestions must be tailored. If the user already has a skill (e.g., Python), suggest an advanced application of it rather than learning it from scratch. Reference their profile to make these connections.
            *   **Comprehensive & Diverse Categories:** Ensure the action items for each year cover a diverse range of categories like Skills, Projects, Networking, Certifications, and Extracurriculars.
                *   **Skills:** Specific technical or soft skills to learn (e.g., "Q1: Master Advanced Excel Pivot Tables & VLOOKUPs").
                *   **Projects:** Suggest highly specific and creative projects that bridge the user's current skills with the target role's requirements. Instead of a generic "build a portfolio," suggest "Q3: Develop a web scraping tool using Python to analyze and compare 10-K filings for companies in the user's target industry."
                *   **Networking:** Specific types of people to connect with or events to attend (e.g., "Q2: Conduct informational interviews with 3 alumni in the target role").
                *   **Certifications:** Relevant certifications to pursue (e.g., "Q4: Begin studying for the CFA Level 1 exam").
                *   **Extracurriculars:** Suggest relevant volunteer work, hackathons, or competitions that build relevant experience and network. For example, "Q1: Participate in a weekend hackathon focused on FinTech solutions."
            *   **Actionable Descriptions:** The description for each action item must be specific and practical. Instead of "Learn Python," suggest "Complete the 'Python for Everybody' specialization on Coursera and apply skills to a small data analysis project."

        Your final output MUST be a single, valid JSON object that strictly adheres to the provided schema. The path array must contain a number of milestone objects appropriate for the career transition.
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

export const getVideosForMilestone = async (targetRole: string, milestone: CareerMilestone): Promise<YouTubeVideo[]> => {
    if (!process.env.API_KEY) {
        return Promise.resolve([
            { title: "How to Learn Any New Skill Fast", channel: "Productivity Channel", description: "A guide to mastering new skills.", videoId: "i9lV7c_I-gA" },
            { title: "Effective Networking for Beginners", channel: "Career Advice", description: "Learn how to build your professional network.", videoId: "Z5x_gK-kg_4" },
            { title: "DCF Model Tutorial", channel: "Finance Gurus", description: "Step by step DCF modeling.", videoId: "3-hY3b_KkNE" }
        ]);
    }
    const actionItemsText = milestone.actionItems.map(item => `- ${item.category}: ${item.title} (${item.description})`).join('\n');

    const prompt = `
        You are a hyper-focused career development content curator. Your task is to use Google Search to find a diverse set of highly relevant YouTube videos for a user's career milestone.

        **CONTEXT:**
        - **User's Target Role:** "${targetRole}"
        - **Current Milestone Title:** "${milestone.milestoneTitle}"
        - **Milestone Timeframe:** "${milestone.timeframe}"
        - **Action Items for this milestone:**
        ${actionItemsText}

        **INSTRUCTIONS (Follow these steps precisely):**

        1.  **Be Creative with Search Terms:** Don't just use literal keywords from the action items. Think broadly about the user's target role and this milestone's theme. Include searches for conceptual advice, "day in the life" videos, and foundational skill tutorials relevant to the user's journey. For example, for a "Financial Analyst" role, besides "DCF model", also search for "investment banking career advice", or "excel tips for finance".

        2.  **Keyword Extraction:** Analyze the milestone title and EACH action item. For each item, extract the most important keywords and technical terms.
            -   Example: If an action item is "Q1: Skills: Learn Python basics for data analysis", your keywords should be "Python for data analysis tutorial", "Python basics for beginners", "data analysis projects".
            -   Example: For an analyst role, if an item is "Master Financial Modeling", keywords should be "DCF model excel tutorial", "three statement model guide", "LBO modeling for beginners".

        3.  **Targeted YouTube Search:** For each key action item or extracted keyword group, perform targeted Google searches to find relevant YouTube videos. Try to find 2-3 relevant videos for each major action item. Aim for a total of 6-8 unique videos for the entire milestone. Vary your search queries to find different types of content.

        4.  **Quality & Relevance Filters:**
            -   **Relevance:** The video MUST directly teach a skill, explain a concept, or provide career insight related to the action items.
            -   **Quality:** Prioritize videos from reputable, expert channels (e.g., established educational creators, industry professionals, official company channels). Avoid clickbait or low-quality content.
            -   **Uniqueness:** Ensure the final list does not contain duplicate videos.

        5.  **Data Extraction:** For each selected video, you MUST extract the following information:
            -   The official \`title\`.
            -   The \`channel\` name.
            -   A brief, one-sentence \`description\` summarizing WHY this video is valuable for this specific milestone.
            -   The unique 11-character \`videoId\` from the video's URL (e.g., the "v" parameter).

        **OUTPUT FORMAT:**
        Your final output MUST be a single, valid JSON array of objects. Do not include any other text or markdown formatting. The array should contain between 4 and 8 video objects.
        \`\`\`json
        [
          {
            "title": "The video title",
            "channel": "The channel name",
            "description": "A brief summary connecting it to the user's goals.",
            "videoId": "ABC123defgh"
          }
        ]
        \`\`\`
    `;

    const response = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 32768 }
        }
    });

    try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
        }
        
        const jsonStartIndex = response.indexOf('[');
        const jsonEndIndex = response.lastIndexOf(']');

        if (jsonStartIndex === -1 || jsonEndIndex === -1 || jsonEndIndex < jsonStartIndex) {
            throw new Error("Could not find a valid JSON array in the AI response.");
        }
        
        const jsonString = response.substring(jsonStartIndex, jsonEndIndex + 1);
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse milestone videos JSON from Gemini:", response, e);
        throw new Error("The AI was unable to find relevant videos for this milestone.");
    }
};


// --- NEW FEATURE SERVICES ---

export const analyzeApplicationFit = async (resumeText: string, jobDescription: string): Promise<ApplicationAnalysisResult> => {
    const prompt = `
    You are an expert career analyst. Compare the provided RESUME against the JOB DESCRIPTION and return a detailed analysis as a JSON object.

    **RESUME:**
    \`\`\`
    ${resumeText}
    \`\`\`

    **JOB DESCRIPTION:**
    \`\`\`
    ${jobDescription}
    \`\`\`

    **TASK:**
    Provide a comprehensive analysis with the following four components:
    1.  **fitScore:** An integer from 0 to 100 representing the percentage match.
    2.  **gapAnalysis:** A markdown string identifying key skills and experiences required by the job but missing or under-emphasized in the resume. Use bullet points.
    3.  **keywordOptimization:** A markdown string suggesting keywords from the job description to include in the resume to pass ATS scans. Use bullet points.
    4.  **impactEnhancer:** A markdown string with concrete suggestions for making the resume's experience bullet points more impactful and metric-driven. Use bullet points.
    `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            fitScore: { type: Type.INTEGER },
            gapAnalysis: { type: Type.STRING },
            keywordOptimization: { type: Type.STRING },
            impactEnhancer: { type: Type.STRING },
        },
        required: ["fitScore", "gapAnalysis", "keywordOptimization", "impactEnhancer"]
    };
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(jsonText);
};

export const findMentorMatch = async (thesisTopic: string, facultyList: string): Promise<MentorMatch[]> => {
    const prompt = `
    You are an expert academic advisor AI. Your task is to analyze a student's thesis topic and a list of faculty members to find the best potential mentors.

    **THESIS TOPIC / ABSTRACT:**
    \`\`\`
    ${thesisTopic}
    \`\`\`

    **LIST OF FACULTY & BIOS:**
    \`\`\`
    ${facultyList}
    \`\`\`

    **INSTRUCTIONS:**
    1.  Carefully read the thesis topic to understand its core themes, methodologies, and subject area.
    2.  For each faculty member in the provided list, analyze their research interests, publications, and expertise.
    3.  Compare the student's topic with each faculty member's profile.
    4.  Identify the top 3-5 faculty members who are the best fit.
    5.  For each top match, provide a "score" (an integer from 0 to 100) representing the strength of the alignment.
    6.  Provide a concise, compelling "reasoning" for why each person is a good match, specifically referencing shared keywords or research interests.

    Return the results as a JSON array of objects, ordered from the highest score to the lowest.
    `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The full name of the faculty member." },
                score: { type: Type.INTEGER, description: "The match score from 0-100." },
                reasoning: { type: Type.STRING, description: "A brief explanation of why this faculty member is a good match." },
            },
            required: ["name", "score", "reasoning"]
        }
    };
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(jsonText);
};

export const shapeInterviewStory = async (brainDump: string): Promise<string> => {
    const prompt = `You are an expert interview coach. Take the following "brain dump" from a user about an experience and reshape it into a clear, compelling story using the STAR (Situation, Task, Action, Result) method. The output should be a well-written narrative in markdown format.

    **USER'S BRAIN DUMP:**
    \`\`\`
    ${brainDump}
    \`\`\`
    
    **YOUR TASK:**
    Structure the story clearly with markdown headings for each section: **Situation**, **Task**, **Action**, and **Result**. The result section must be impactful and quantified if possible.
    `;
    return await generateContentWithRetry({ model: 'gemini-2.5-pro', contents: prompt });
};

export const generateInterviewQuestions = async (jobDescription: string): Promise<string[]> => {
    const prompt = `You are an expert hiring manager for the role described below. Generate a list of 10-15 likely interview questions (behavioral, technical, and situational) based on this job description. Return the output as a JSON array of strings.

    **JOB DESCRIPTION:**
    \`\`\`
    ${jobDescription}
    \`\`\`
    `;
    const schema = { type: Type.ARRAY, items: { type: Type.STRING } };
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: schema }
    });
    return JSON.parse(jsonText);
};

export const reframeFeedback = async (feedbackText: string): Promise<string> => {
    const prompt = `You are an empathetic career coach. A user has received the following feedback and wants help processing it. Reframe this feedback into a positive, actionable plan for growth. Your output should be a markdown string with sections for "Key Takeaways" and "Actionable Growth Opportunities".

    **FEEDBACK:**
    \`\`\`
    ${feedbackText}
    \`\`\`
    `;
    return await generateContentWithRetry({ model: 'gemini-2.5-pro', contents: prompt });
};

export const getNegotiationPrep = async (jobTitle: string, location: string): Promise<{ salaryRange: string; tips: string; }> => {
    const prompt = `You are a negotiation expert. Use your search tool to find the average salary range for a **${jobTitle}** in **${location}**. Then, provide a list of tips and go-to phrases for negotiating a higher salary or better benefits. The output must be a JSON object with "salaryRange" and "tips" (in markdown) as keys.`;
    const schema = {
        type: Type.OBJECT,
        properties: {
            salaryRange: { type: Type.STRING, description: "e.g., '$85,000 - $110,000 per year'" },
            tips: { type: Type.STRING, description: "Markdown-formatted list of tips and phrases." },
        },
        required: ["salaryRange", "tips"]
    };
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    return JSON.parse(jsonText);
};