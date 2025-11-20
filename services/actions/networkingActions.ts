import type { ProfileData } from '../../types';
import { postJson } from '../apiClient';

export const generateCoffeeChatBrief = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
    const response = await postJson<{ text: string }>("/api/llm/networking/brief", { profile, counterpartInfo });
    return response.text;
};

export const generateReachOutMessage = async (
  profile: ProfileData,
  counterpartInfo: string
): Promise<string> => {
    const response = await postJson<{ text: string }>("/api/llm/networking/reach-out", { profile, counterpartInfo });
    return response.text;
};
