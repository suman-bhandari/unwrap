import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Reduce session data size
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Limit session data
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') return null;
            const item = localStorage.getItem(key);
            if (!item) return null;
            
            try {
              const parsed = JSON.parse(item);
              // If it's a session, optimize it
              if (key.includes('session') && parsed?.user) {
                const optimized = {
                  ...parsed,
                  user: {
                    id: parsed.user.id,
                    email: parsed.user.email,
                    user_metadata: {
                      name: parsed.user.user_metadata?.name,
                      // Remove avatar_url to prevent large headers
                    }
                  }
                };
                return JSON.stringify(optimized);
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
                const optimized = {
                  ...parsed,
                  user: {
                    id: parsed.user.id,
                    email: parsed.user.email,
                    user_metadata: {
                      name: parsed.user.user_metadata?.name,
                      // Remove avatar_url to prevent large headers
                    }
                  }
                };
                localStorage.setItem(key, JSON.stringify(optimized));
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
          }
        }
      }
    }
  );


  return client;
}
