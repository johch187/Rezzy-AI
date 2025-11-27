import { supabase } from './supabaseClient';
import { requireApiBaseUrl } from './apiClient';

export type ProductType = 'subscription' | 'topup_small' | 'topup_large';

const buildHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const createCheckout = async (
  successUrl: string,
  cancelUrl: string,
  productType: ProductType = 'subscription'
) => {
  const baseUrl = requireApiBaseUrl();
  const headers = await buildHeaders();
  const url = `${baseUrl}/api/payments/checkout`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ successUrl, cancelUrl, productType }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<{ url: string }>;
};
