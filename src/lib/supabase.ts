import { createClient } from '@supabase/supabase-js';

// Environment configuration for Supabase Client
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://mock-davetechs.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock-key';

/**
 * Centralized Supabase client singleton for Dave Techs Academy.
 * Strictly uses public/anon key with PostgreSQL Row Level Security (RLS).
 * Secrets (like Paystack secret key) are strictly contained in Supabase Edge Functions.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  db: {
    schema: 'public',
  },
});

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)
  );
};
