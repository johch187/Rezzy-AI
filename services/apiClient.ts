import { supabase } from './supabaseClient';

const rawEnvBaseUrl = (import.meta.env?.VITE_API_BASE_URL ?? '').toString().trim();

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
    return (
      hostname === 'localhost' ||
      /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) ||
      hostname.includes('.')
    );
  } catch {
    return false;
  }
};

const detectSameOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  const origin = window.location?.origin;
  // In some environments origin can be "null" (e.g., about:blank); treat that as unset.
  return origin && origin !== 'null' ? origin : '';
};

const resolveApiBaseUrl = (): string => {
  const sameOrigin = detectSameOrigin();

  // If rawEnvBaseUrl is empty or just '/', use same-origin backend
  if (!rawEnvBaseUrl || rawEnvBaseUrl === '/') {
    if (sameOrigin) {
      console.log(`Using same-origin backend for API calls: ${sameOrigin}`);
    }
    return sameOrigin;
  }

  // Validate the URL
  if (!validateApiBaseUrl(rawEnvBaseUrl)) {
    const fallback = sameOrigin;
    if (fallback) {
      console.warn(
        `VITE_API_BASE_URL is invalid: "${rawEnvBaseUrl}". Using same-origin backend (${fallback}).`,
      );
    }
    return fallback;
  }

  // Normalize trailing slash - remove it for absolute URLs
  const normalized = rawEnvBaseUrl.endsWith('/')
    ? rawEnvBaseUrl.slice(0, -1)
    : rawEnvBaseUrl;
  if (typeof window !== 'undefined') {
    console.log(`Using API base URL: ${normalized}`);
  }
  return normalized;
};

const API_BASE_URL = resolveApiBaseUrl();

export const apiBaseUrl = API_BASE_URL;
export const getApiBaseUrl = (): string => API_BASE_URL || detectSameOrigin();
export const hasApiBaseUrl = !!getApiBaseUrl();

export const requireApiBaseUrl = (): string => {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      'VITE_API_BASE_URL is not configured and no same-origin fallback is available. Please set it in your environment (e.g., VITE_API_BASE_URL=https://your-api.run.app).',
    );
  }
  return base;
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
  const base = requireApiBaseUrl();
  const url = `${base}${path}`;
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
