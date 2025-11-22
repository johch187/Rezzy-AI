import { supabase } from './supabaseClient';
import { requireApiBaseUrl } from './apiClient';

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
  const baseUrl = requireApiBaseUrl();
  const headers = await buildHeaders();
  const url = `${baseUrl}/api/payments/checkout`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ successUrl, cancelUrl, priceId }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<{ url: string }>;
};
