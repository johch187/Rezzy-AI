import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

/**
 * Supabase client configuration.
 * Uses new publishable key format (sb_publishable_...) only.
 * Legacy anon keys are no longer supported.
 * See: https://github.com/orgs/supabase/discussions/29260
 */
const validatePublishableKey = (key: string | undefined): boolean => {
  if (!key) return false;
  if (!key.startsWith('sb_publishable_')) {
    console.error(
      'Invalid Supabase publishable key format. Expected format: sb_publishable_...\n' +
      'Legacy anon keys are no longer supported. Get your new publishable key from:\n' +
      'Supabase Dashboard → Project Settings → API → Publishable Keys'
    );
    return false;
  }
  return true;
};

export const isSupabaseEnabled = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  validatePublishableKey(supabasePublishableKey)
);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        // Ensure we're using the latest auth flow
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseEnabled) {
  if (supabaseUrl && supabasePublishableKey && !validatePublishableKey(supabasePublishableKey)) {
    // Key format is invalid
    console.error('Supabase publishable key format is invalid. Please use the new format: sb_publishable_...');
  } else {
    console.warn(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env to enable auth/storage.\n' +
      'Required format: VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...'
    );
  }
} else if (typeof window !== 'undefined') {
  console.log('Supabase configured with new publishable key format (sb_publishable_...)');
}
