import { Type } from "@google/genai";
import type { ProfileData, CareerPath, CareerMilestone, YouTubeVideo } from '../../types';
import { Agent, parseAgentJson } from '../agentKit';
import { isValidVideoId } from '../../utils';

export const generateCareerPath = async (
  profile: ProfileData,
  currentRole: string,
  targetRole: string
): Promise<CareerPath> => {
    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are an expert Career Strategist. Your task is to create a highly detailed, step-by-step career roadmap for a user transitioning from their current role to a target role.
        
        **Directives:**
        - Analyze the user's profile deeply to identify transferrable skills and gaps.
        - Break the journey into logical milestones.
        - For each milestone, provide concrete, actionable steps (not generic advice).
        - Use a "Thinking Process" to ensure the timeline is realistic.`,
        thinkingBudget: 32768, // High budget for planning
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                currentRole: { type: Type.STRING },
                targetRole: { type: Type.STRING },
                path: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            timeframe: { type: Type.STRING, description: "e.g., 'Months 1-6' or 'Year 1'" },
                            milestoneTitle: { type: Type.STRING },
                            milestoneDescription: { type: Type.STRING },
                            actionItems: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        category: { type: Type.STRING, enum: ['Academics', 'Internships', 'Projects', 'Skills', 'Networking', 'Career', 'Extracurriculars', 'Certifications'] },
                                        title: { type: Type.STRING },
                                        description: { type: Type.STRING }
                                    },
                                    required: ['category', 'title', 'description']
                                }
                            }
                        },
                        required: ['timeframe', 'milestoneTitle', 'milestoneDescription', 'actionItems']
                    }
                }
            },
            required: ['path', 'currentRole', 'targetRole']
        }
    });

    const prompt = `Create a career path from '${currentRole}' to '${targetRole}' based on this profile: ${JSON.stringify(profile)}`;
    const result = await agent.chat(prompt);
    return parseAgentJson<CareerPath>(result);
};

export const getVideosForMilestone = async (targetRole: string, milestone: CareerMilestone): Promise<YouTubeVideo[]> => {
    if (!process.env.API_KEY) {
        return Promise.resolve([]);
    }

    const agent = new Agent({
        model: 'gemini-3-pro-preview',
        systemInstruction: `You are a Resource Curator Agent. Your goal is to find the absolute best educational YouTube content for specific career milestones.
        - Generate realistic, high-quality video recommendations.
        - **Priority:** Select high-quality educational content with clear learning objectives (tutorials, lectures, deep-dives) over generic advice or motivational fluff.
        - **Relevance:** Explicitly explain WHY each video was chosen for this specific milestone and what key insight or skill the user will gain.
        - Ensure video IDs are 11 characters long and plausible.`,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    channel: { type: Type.STRING },
                    description: { 
                        type: Type.STRING, 
                        description: "A specific explanation of why this video is relevant to the milestone and what the user will learn." 
                    },
                    videoId: { type: Type.STRING },
                },
                required: ['title', 'channel', 'description', 'videoId']
            }
        }
    });

    const prompt = `Recommend 3-5 high-quality educational YouTube videos for someone aiming for '${targetRole}' who is at this milestone:
    **Milestone:** ${milestone.milestoneTitle}
    **Description:** ${milestone.milestoneDescription}
    **Action Items:** ${milestone.actionItems.map(i => i.title).join(', ')}
    
    Select videos that directly help complete the action items or master the skills required.`;

    try {
        const result = await agent.chat(prompt);
        const videos = parseAgentJson<YouTubeVideo[]>(result);
        
        // Validate video IDs
        const validationPromises = videos.map(async (video) => {
            const isValid = await isValidVideoId(video.videoId);
            return isValid ? video : null;
        });

        return (await Promise.all(validationPromises)).filter(Boolean) as YouTubeVideo[];

    } catch (e) {
        console.error("Failed to get videos via agent:", e);
        return [];
    }
};