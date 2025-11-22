import { supabase } from './supabaseClient';
import { postJson, apiBaseUrl } from './apiClient';

const API_BASE_URL = apiBaseUrl;

const assertApi = () => {
  // Empty string is valid - it means using relative paths (same origin)
  // Only throw if API_BASE_URL is explicitly null/undefined (shouldn't happen)
  if (API_BASE_URL === null || API_BASE_URL === undefined) {
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

  const url = API_BASE_URL ? `${API_BASE_URL}/api/workspace` : '/api/workspace';
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

export const persistWorkspace = async (payload: WorkspacePayload) => {
  assertApi();
  await postJson('/api/workspace', payload);
};

export const fetchSubscriptionStatus = async () => {
  assertApi();
  const headers = await (async () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) h.Authorization = `Bearer ${token}`;
    }
    return h;
  })();
  const url = API_BASE_URL ? `${API_BASE_URL}/api/payments/status` : '/api/payments/status';
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};
