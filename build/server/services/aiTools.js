import { Type } from '@google/genai';
import { generateContentWithRetry, hasGeminiKey } from '../lib/genai.js';
const COFFEE_CHAT_BRIEF_FALLBACK = `
## Quick Overview
You're meeting with Sarah Chen, a Senior Product Manager at Innovate Inc., who previously worked at your alma mater's rival, a fun point of connection. The most interesting angle here is her transition from engineering to product, which mirrors your own career aspirations.

### Shared Touchpoints
- **Shared Industry:** You both have a deep background in the SaaS technology space.
- **Company Overlap:** Her previous role was at a company that is a key partner of your current employer.
- **Geographic Connection:** You both lived in the Bay Area during the same time period.
- **Skillset Synergy:** You've both highlighted "user-centric design" and "data-driven decisions" in your public profiles.

### Smart Conversation Starters
- "I was really intrigued by your career path from software engineering into product management at Innovate. What was the most surprising part of that transition for you?"
- "Given your experience with both large-scale enterprise products and nimble startups, what are some of the key differences you've noticed in how product decisions get made?"
- "I saw that you volunteered with 'Code for Kids.' As someone passionate about mentorship, I'd love to hear what you learned from that experience."

### Industry or Context Insights
- **Recent Launch:** Innovate Inc. just launched their new AI-powered analytics tool last month. It's a great opportunity to ask about the challenges and successes of that launch.
- **Market Trend:** The conversational AI space is rapidly evolving. Mentioning a recent development or asking her opinion on it could show you're up-to-date.

### Closing or Follow-Up Ideas
A great way to close would be to ask, "Based on our chat, is there anyone else in your network you think would be insightful for me to connect with as I explore this path?" For follow-up, you could send a relevant article about a topic you discussed.`;
const REACH_OUT_FALLBACK = `Hi Sarah,

My name is Alex Doe, and I came across your profile while exploring careers in Product Management. I was really inspired by your journey from engineering to your current role at Innovate Inc.

I'm currently a Software Engineer and aspiring to make a similar transition. I would be incredibly grateful for the opportunity to hear about your experience.

Would you be open to a brief 15-20 minute virtual coffee chat in the coming weeks? I'm flexible and happy to work around your schedule.

Thanks so much for your time and consideration.

Best,
Alex`;
const MILESTONE_VIDEO_FALLBACK = [
    {
        title: 'How to Learn Any New Skill Fast',
        channel: 'Productivity Channel',
        description: 'A guide to mastering new skills.',
        videoId: 'i9lV7c_I-gA',
    },
    {
        title: 'Effective Networking for Beginners',
        channel: 'Career Advice',
        description: 'Learn how to build your professional network.',
        videoId: 'Z5x_gK-kg_4',
    },
    {
        title: 'DCF Model Tutorial',
        channel: 'Finance Gurus',
        description: 'Step by step DCF modeling.',
        videoId: '3-hY3b_KkNE',
    },
];
export const generateCoffeeChatBrief = async (profile, counterpartInfo) => {
    if (!hasGeminiKey) {
        return COFFEE_CHAT_BRIEF_FALLBACK;
    }
    const prompt = `
    **Role:** You are a friendly and insightful coffee chat coach. Your job is to help people feel confident and prepared before networking conversations by creating a personalized "Coffee Chat Brief".
    
    **Tone:** Warm, curious, and professional — like a smart, encouraging friend helping someone prep for an important chat.

    ---

    **INPUT DATA:**

    **1. The User's Professional Profile:**
    \`\`\`json
    ${JSON.stringify(profile, null, 2)}
    \`\`\`

    **2. Information About the Counterpart:**
    \`\`\`text
    ${counterpartInfo}
    \`\`\`

    ---

    **YOUR TASK:**

    Create a "Coffee Chat Brief" with the following sections:
    1. Quick Overview (2–3 sentences)
    2. Shared Touchpoints (3-5 bullet points)
    3. Smart Conversation Starters (3–4 bullet points)
    4. Industry or Context Insights (2–3 bullet points)
    5. Closing or Follow-Up Ideas (1–2 sentences)

    Use markdown for formatting and avoid introductory phrases.
  `;
    return generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            temperature: 0.6,
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 32768 },
        },
    });
};
export const generateReachOutMessage = async (profile, counterpartInfo) => {
    if (!hasGeminiKey) {
        return REACH_OUT_FALLBACK;
    }
    const prompt = `
    **Role:** You are a world-class professional communication coach. Write a concise, warm outreach message for a coffee chat request.

    **Profile:**
    \`\`\`json
    ${JSON.stringify(profile, null, 2)}
    \`\`\`

    **Counterpart Information:**
    \`\`\`text
    ${counterpartInfo}
    \`\`\`

    **Constraints:**
    - Open with the strongest shared hook.
    - Provide brief context about the sender.
    - Include a clear ask for a 15–20 minute chat and make it easy for the recipient to accept.
    - Keep under 100 words.
    - Output only the message text.
  `;
    return generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            temperature: 0.5,
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 32768 },
        },
    });
};
export const shapeInterviewStory = async (brainDump) => {
    if (!brainDump.trim()) {
        throw new Error('Please provide details about your story.');
    }
    const prompt = `You are an expert interview coach. Take the following "brain dump" and rewrite it using the STAR format with markdown headings for Situation, Task, Action, and Result. The result must be impactful and quantified when possible.\n\n\`\`\`\n${brainDump}\n\`\`\``;
    return generateContentWithRetry({ model: 'gemini-2.5-pro', contents: prompt });
};
export const generateInterviewQuestions = async (jobDescription) => {
    if (!jobDescription.trim()) {
        throw new Error('Provide a job description to analyze.');
    }
    const prompt = `You are an expert hiring manager for the role below. Generate a list of 10-15 likely interview questions (behavioral, technical, and situational). Return only a JSON array of strings.\n\n\`\`\`\n${jobDescription}\n\`\`\``;
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
    });
    return JSON.parse(jsonText);
};
export const generateCareerPath = async (profile, currentRole, targetRole) => {
    if (!currentRole.trim() || !targetRole.trim()) {
        throw new Error('Both currentRole and targetRole are required.');
    }
    if (!hasGeminiKey) {
        throw new Error('Gemini API not configured.');
    }
    const careerPathSchema = {
        type: Type.OBJECT,
        properties: {
            path: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        timeframe: { type: Type.STRING },
                        milestoneTitle: { type: Type.STRING },
                        milestoneDescription: { type: Type.STRING },
                        actionItems: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: {
                                        type: Type.STRING,
                                        enum: ['Academics', 'Internships', 'Projects', 'Skills', 'Networking', 'Career', 'Extracurriculars', 'Certifications'],
                                    },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                },
                                required: ['category', 'title', 'description'],
                            },
                        },
                    },
                    required: ['timeframe', 'milestoneTitle', 'milestoneDescription', 'actionItems'],
                },
            },
        },
        required: ['path'],
    };
    const prompt = `
    You are a world-class career strategist. Create a realistic, multi-milestone plan to move the user from **${currentRole}** to **${targetRole}**.

    **User Profile:**
    \`\`\`json
    ${JSON.stringify(profile, null, 2)}
    \`\`\`

    **Requirements:**
    - Analyze gaps vs. the target role.
    - Provide 2-5 chronological milestones with descriptive titles and timeframes.
    - For each milestone, list diverse quarterly action items. Prefix titles with a quarter label (e.g., "Q1:").
    - Tailor suggestions to the user's background; build on existing strengths before adding new skills.
    - Make every action item specific and practical.

    Return a JSON object that matches the provided schema exactly.
  `;
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: careerPathSchema,
            thinkingConfig: { thinkingBudget: 32768 },
        },
    });
    const parsed = JSON.parse(jsonText);
    return { ...parsed, currentRole, targetRole };
};
export const getVideosForMilestone = async (targetRole, milestone) => {
    if (!hasGeminiKey) {
        return MILESTONE_VIDEO_FALLBACK;
    }
    const actionItemsText = milestone.actionItems
        .map(item => `- ${item.category}: ${item.title} (${item.description})`)
        .join('\n');
    const prompt = `
    You are a career development content curator using Google Search to find highly relevant YouTube videos.

    **User's Target Role:** ${targetRole}
    **Milestone:** ${milestone.milestoneTitle} (${milestone.timeframe})
    **Action Items:**
    ${actionItemsText}

    Instructions:
    1. Extract keywords from each action item and the milestone theme.
    2. Perform targeted searches to find unique, high-quality videos (total 4-8) directly related to the milestone.
    3. For each video, return title, channel, a one-sentence description tying it to the milestone, and the 11-character YouTube videoId.

    Output ONLY a JSON array of video objects.
  `;
    const response = await generateContentWithRetry({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            thinkingConfig: { thinkingBudget: 32768 },
        },
    });
    try {
        const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch?.[1]) {
            return JSON.parse(jsonMatch[1]);
        }
        const jsonStart = response.indexOf('[');
        const jsonEnd = response.lastIndexOf(']');
        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            throw new Error('No JSON array found in response');
        }
        return JSON.parse(response.substring(jsonStart, jsonEnd + 1));
    }
    catch (error) {
        console.error('Failed to parse milestone videos JSON from Gemini:', response, error);
        throw new Error('The AI was unable to find relevant videos for this milestone.');
    }
};
export const findMentorMatch = async (thesisTopic, facultyList) => {
    if (!thesisTopic.trim() || !facultyList.trim()) {
        throw new Error('Provide both a thesis topic and faculty list.');
    }
    if (!hasGeminiKey) {
        return [
            {
                name: 'Dr. Jane Doe',
                score: 92,
                reasoning: 'Specializes in applied AI and fintech systems that align with the student’s thesis topic.',
            },
        ];
    }
    const prompt = `
    You are an expert academic advisor. Match the student's thesis topic with the best faculty mentors.

    **Thesis Topic:**
    \`\`\`
    ${thesisTopic}
    \`\`\`

    **Faculty List:**
    \`\`\`
    ${facultyList}
    \`\`\`

    Return a JSON array of the top 3-5 matches with \
"name", "score" (0-100), and "reasoning".
  `;
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                score: { type: Type.INTEGER },
                reasoning: { type: Type.STRING },
            },
            required: ['name', 'score', 'reasoning'],
        },
    };
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
export const reframeFeedback = async (feedbackText) => {
    if (!feedbackText.trim()) {
        throw new Error('Provide the feedback you received.');
    }
    const prompt = `You are an empathetic career coach. Reframe the feedback below into a positive, actionable plan. Use markdown headings for "Key Takeaways" and "Actionable Growth Opportunities".\n\n\`\`\`\n${feedbackText}\n\`\`\``;
    return generateContentWithRetry({ model: 'gemini-2.5-pro', contents: prompt });
};
export const getNegotiationPrep = async (jobTitle, location) => {
    if (!jobTitle.trim() || !location.trim()) {
        throw new Error('Provide both job title and location.');
    }
    if (!hasGeminiKey) {
        return {
            salaryRange: '$85,000 - $110,000 per year',
            tips: '- Research compensation data from three reputable sources before negotiating.\n- Prepare a clear list of achievements with quantified impact.\n- Practice a confident but collaborative script before the conversation.',
        };
    }
    const prompt = `
    You are a negotiation expert. Use Google Search to find the average salary range for a **${jobTitle}** in **${location}**. Provide a JSON object with "salaryRange" (string) and "tips" (markdown bullet list of negotiation advice and phrases).
  `;
    const schema = {
        type: Type.OBJECT,
        properties: {
            salaryRange: { type: Type.STRING },
            tips: { type: Type.STRING },
        },
        required: ['salaryRange', 'tips'],
    };
    const jsonText = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: 'application/json',
            responseSchema: schema,
        },
    });
    return JSON.parse(jsonText);
};
