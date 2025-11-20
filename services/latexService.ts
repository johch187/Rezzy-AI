import { supabase } from './supabaseClient';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

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
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }
  const headers = await buildHeaders();
  const response = await fetch(`${API_BASE_URL}/api/latex/compile`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ content: markdown, filename }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `PDF generation failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
