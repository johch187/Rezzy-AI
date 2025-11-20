import { supabase } from './supabaseClient';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const sendAnalyticsEvent = async (eventName: string, properties: Record<string, any> = {}) => {
  if (!API_BASE_URL) return; // No backend configured
  const headers = await buildHeaders();
  const res = await fetch(`${API_BASE_URL}/api/analytics/events`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ eventName, properties }),
  });
  if (!res.ok) {
    // Fail silently to avoid breaking UX
    console.warn('Analytics event failed', await res.text());
  }
};
