import { supabase } from './supabaseClient';

const rawEnvBaseUrl = ((import.meta as any).env?.VITE_API_BASE_URL || '').trim();

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

const resolveApiBaseUrl = (): string => {
  const fallbackOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '';
  if (!rawEnvBaseUrl) {
    if (fallbackOrigin) {
      console.warn('VITE_API_BASE_URL missing; defaulting to same-origin backend.');
      return fallbackOrigin;
    }
    return '';
  }
  if (!validateApiBaseUrl(rawEnvBaseUrl)) {
    if (fallbackOrigin) {
      console.warn(`VITE_API_BASE_URL is invalid: "${rawEnvBaseUrl}". Falling back to same-origin backend (${fallbackOrigin}).`);
      return fallbackOrigin;
    }
    return '';
  }
  // Normalize trailing slash except for empty string (root-relative)
  if (rawEnvBaseUrl === '/') return '';
  return rawEnvBaseUrl.endsWith('/') ? rawEnvBaseUrl.slice(0, -1) : rawEnvBaseUrl;
};

const API_BASE_URL = resolveApiBaseUrl();

export const apiBaseUrl = API_BASE_URL;
export const hasApiBaseUrl = !!API_BASE_URL;

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

export const postJson = async <TResponse>(path: string, body: any): Promise<TResponse> => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured and no same-origin fallback is available. Please set it in your environment (e.g., VITE_API_BASE_URL=https://your-api.run.app).');
  }
  const headers = await buildHeaders();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<TResponse>;
};
