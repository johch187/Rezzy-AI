import { supabase } from './supabaseClient';
import { requireApiBaseUrl } from './apiClient';

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
  const baseUrl = requireApiBaseUrl();
  const headers = await buildHeaders();
  const url = `${baseUrl}/api/latex/compile`;
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
