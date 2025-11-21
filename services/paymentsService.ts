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

export const createCheckout = async (successUrl: string, cancelUrl: string, priceId?: string) => {
  if (!API_BASE_URL) throw new Error('VITE_API_BASE_URL is not configured.');
  const headers = await buildHeaders();
  const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ successUrl, cancelUrl, priceId }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<{ url: string }>;
};
