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
  if (!API_BASE_URL) {
    // Fail silently if not configured or invalid to avoid breaking UX
    return;
  }
  const headers = await buildHeaders();
  try {
    const res = await fetch(`${API_BASE_URL}/api/analytics/events`, {
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
