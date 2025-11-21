import { supabase } from './supabaseClient';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();

// Validate API_BASE_URL format
const validateApiBaseUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Allow relative paths (e.g., '/' or '/api')
  if (url === '/' || url.startsWith('/')) {
    return true;
  }
  
  // Validate absolute URLs
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    // Allow localhost, IP addresses, and domains with at least one dot
    return hostname === 'localhost' || 
           /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || 
           hostname.includes('.');
  } catch {
    return false;
  }
};

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
  if (!API_BASE_URL || !validateApiBaseUrl(API_BASE_URL)) {
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
