import type { ProfileData, CareerPath, CareerMilestone, YouTubeVideo } from '../../types';
import { postJson } from '../apiClient';

export const generateCareerPath = async (
  profile: ProfileData,
  currentRole: string,
  targetRole: string
): Promise<CareerPath> => {
    return postJson<CareerPath>("/api/llm/career-path", { profile, currentRole, targetRole });
};

export const getVideosForMilestone = async (targetRole: string, milestone: CareerMilestone): Promise<YouTubeVideo[]> => {
    try {
        const videos = await postJson<YouTubeVideo[]>("/api/llm/career/videos", { targetRole, milestone });
        return videos || [];
    } catch (err) {
        console.error("Video recommendations failed; returning none.", err);
        return [];
    }
};
