import { createClient } from '@supabase/supabase-js';

const supabaseUrl = typeof process !== 'undefined'
  ? process.env.SUPABASE_URL || ''
  : '';
const supabaseAnonKey = typeof process !== 'undefined'
  ? process.env.SUPABASE_ANON_KEY || ''
  : '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    console.warn('Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
}
