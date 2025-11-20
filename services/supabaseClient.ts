import { createClient } from '@supabase/supabase-js';

// Safely access environment variables
const env = (import.meta as any).env || {};
const supabaseUrl = 'https://adktjayvtprtypgqlwpr.supabase.co';
const supabaseAnonKey = 'sb_publishable_cCuUc9y6VJRC478K0te-9w_Jj1NFalw';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(
    supabaseUrl || 'https://adktjayvtprtypgqlwpr.supabase.co', 
    supabaseAnonKey || 'sb_publishable_cCuUc9y6VJRC478K0te-9w_Jj1NFalw'
);