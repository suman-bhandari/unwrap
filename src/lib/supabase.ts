import { createBrowserClient } from '@supabase/ssr'
import { createMinimalSupabaseSession, optimizeCookiesForVercel } from './vercel-header-optimizer'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Enable session persistence but with size limits
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Custom storage that respects Vercel limits
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            try {
              const parsed = JSON.parse(item);
              // If it's a session, optimize it for Vercel limits
              if (key.includes('session') && parsed?.user) {
                const minimalSession = createMinimalSupabaseSession(parsed.user);
                return minimalSession ? JSON.stringify(minimalSession) : null;
              }
              return item;
            } catch {
              return item;
            }
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') return;
            
            try {
              const parsed = JSON.parse(value);
              // If it's a session, optimize it before storing
              if (key.includes('session') && parsed?.user) {
                const minimalSession = createMinimalSupabaseSession(parsed.user);
                if (minimalSession) {
                  localStorage.setItem(key, JSON.stringify(minimalSession));
                  // Optimize cookies after storing session
                  optimizeCookiesForVercel();
                }
                return;
              }
              localStorage.setItem(key, value);
            } catch {
              localStorage.setItem(key, value);
            }
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') return;
            localStorage.removeItem(key);
            // Optimize cookies after removing session
            optimizeCookiesForVercel();
          }
        }
      }
    }
  );

  return client;
}
