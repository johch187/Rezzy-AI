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
    throw new Error('VITE_API_BASE_URL is not configured. Please set it in your .env file (e.g., VITE_API_BASE_URL=http://localhost:8000 for local development).');
  }
  if (!validateApiBaseUrl(API_BASE_URL)) {
    throw new Error(`VITE_API_BASE_URL is invalid: "${API_BASE_URL}". It must be a relative path (e.g., "/") or a valid URL with a proper domain (e.g., http://localhost:8000 or https://api.example.com).`);
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
