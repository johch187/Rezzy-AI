import { supabase } from './supabaseClient';
import { apiBaseUrl } from './apiClient';

const API_BASE_URL = apiBaseUrl;

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
  // Empty string is valid - it means using relative paths (same origin)
  // Only skip if API_BASE_URL is explicitly null/undefined (shouldn't happen)
  if (API_BASE_URL === null || API_BASE_URL === undefined) {
    return;
  }
  const headers = await buildHeaders();
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/analytics/events` : '/api/analytics/events';
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ eventName, properties }),
    });
    if (!res.ok) {
      // Fail silently to avoid breaking UX
      console.warn('Analytics event failed', await res.text());
    }
  } catch (error) {
    // Fail silently to avoid breaking UX
    console.warn('Analytics event failed', error);
  }
};
