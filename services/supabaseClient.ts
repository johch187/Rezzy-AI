import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseEnabled =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseKey === 'string' &&
  supabaseKey.length > 0;

export const supabase: SupabaseClient<Database> | null = isSupabaseEnabled
  ? createClient<Database>(supabaseUrl, supabaseKey)
  : null;

export default supabase;
