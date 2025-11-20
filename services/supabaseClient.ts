import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseEnabled = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabasePublishableKey!)
  : null;

if (!isSupabaseEnabled) {
  console.warn('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env to enable auth/storage.');
}
