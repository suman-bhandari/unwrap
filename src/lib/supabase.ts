import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }

  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        // Use proper Supabase auth with optimized settings
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Use sessionStorage instead of localStorage to reduce cookie size
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            try {
              return sessionStorage.getItem(key);
            } catch {
              return null;
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            try {
              sessionStorage.setItem(key, value);
            } catch (error) {
              console.warn('Failed to store item:', error);
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            try {
              sessionStorage.removeItem(key);
            } catch (error) {
              console.warn('Failed to remove item:', error);
            }
          }
        }
      }
    }
  );

  return client;
}
