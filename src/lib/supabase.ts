import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Disable session persistence to prevent large headers
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Use minimal storage that doesn't persist large data
        storage: {
          getItem: () => null, // Always return null to force fresh auth
          setItem: () => {}, // Don't store anything
          removeItem: () => {} // Don't remove anything
        }
      }
    }
  );

  return client;
}
