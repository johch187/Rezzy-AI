import { supabase } from './supabaseClient';
import { apiBaseUrl } from './apiClient';

const API_BASE_URL = apiBaseUrl;

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

export const downloadResumePdf = async (markdown: string, filename: string) => {
  // Empty string is valid - it means using relative paths (same origin)
  if (API_BASE_URL === null || API_BASE_URL === undefined) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }
  const headers = await buildHeaders();
  const url = API_BASE_URL ? `${API_BASE_URL}/api/latex/compile` : '/api/latex/compile';
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content: markdown, filename }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `PDF generation failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
