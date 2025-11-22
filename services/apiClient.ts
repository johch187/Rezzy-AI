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
  // If rawEnvBaseUrl is empty or just '/', use relative path (same origin)
  if (!rawEnvBaseUrl || rawEnvBaseUrl === '/') {
    if (typeof window !== 'undefined') {
      console.log('Using relative path for API calls (same-origin backend)');
    }
    return '';
  }
  
  // Validate the URL
  if (!validateApiBaseUrl(rawEnvBaseUrl)) {
    // If invalid, fall back to relative path (same origin)
    console.warn(`VITE_API_BASE_URL is invalid: "${rawEnvBaseUrl}". Using relative path (same-origin) instead.`);
    return '';
  }
  
  // Normalize trailing slash - remove it for absolute URLs
  const normalized = rawEnvBaseUrl.endsWith('/') ? rawEnvBaseUrl.slice(0, -1) : rawEnvBaseUrl;
  if (typeof window !== 'undefined') {
    console.log(`Using API base URL: ${normalized}`);
  }
  return normalized;
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
  // API_BASE_URL can be empty string for relative paths (same origin)
  // This is valid when frontend and backend are served from the same origin
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
  const headers = await buildHeaders();
  const res = await fetch(url, {
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
