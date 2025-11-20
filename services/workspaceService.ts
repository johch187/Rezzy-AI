import { supabase } from './supabaseClient';
import { postJson } from './apiClient';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

const assertApi = () => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured; backend workspace sync unavailable.');
  }
};

export type WorkspacePayload = {
  profile: any;
  documentHistory: any[];
  careerChatHistory: any[];
  tokens: number;
};

export const fetchWorkspace = async (): Promise<WorkspacePayload> => {
  assertApi();
  // GET wrapper using postJson helper (which sets auth headers)
  const headers = await (async () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) h.Authorization = `Bearer ${token}`;
    }
    return h;
  })();

  const res = await fetch(`${API_BASE_URL}/api/workspace`, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

export const persistWorkspace = async (payload: WorkspacePayload) => {
  assertApi();
  await postJson('/api/workspace', payload);
};
