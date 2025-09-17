import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Completely disable session persistence to prevent large headers
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce',
        // Use minimal storage that doesn't store anything
        storage: {
          getItem: () => null, // Never return stored sessions
          setItem: () => {}, // Never store sessions
          removeItem: () => {} // Never remove sessions
        }
      }
    }
  );

  return client;
}
