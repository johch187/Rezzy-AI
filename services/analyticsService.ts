import { supabase } from './supabaseClient';
import { getApiBaseUrl } from './apiClient';

const API_BASE_URL = getApiBaseUrl();

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
  const baseUrl = API_BASE_URL || getApiBaseUrl();
  if (!baseUrl) {
    return;
  }
  const headers = await buildHeaders();
  try {
    const url = `${baseUrl}/api/analytics/events`;
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
