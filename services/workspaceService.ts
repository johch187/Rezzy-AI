import { supabase } from './supabaseClient';
import { postJson, requireApiBaseUrl } from './apiClient';

export type WorkspacePayload = {
  profile: any;
  documentHistory: any[];
  careerChatHistory: any[];
  tokens: number;
};

export const fetchWorkspace = async (): Promise<WorkspacePayload> => {
  const baseUrl = requireApiBaseUrl();
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

  const url = `${baseUrl}/api/workspace`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};

export const persistWorkspace = async (payload: WorkspacePayload) => {
  await postJson('/api/workspace', payload);
};

export const fetchSubscriptionStatus = async () => {
  const baseUrl = requireApiBaseUrl();
  const headers = await (async () => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) h.Authorization = `Bearer ${token}`;
    }
    return h;
  })();
  const url = `${baseUrl}/api/payments/status`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
};
