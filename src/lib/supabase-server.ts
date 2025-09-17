// Server-side Supabase configuration with minimal headers
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set(name: string, value: string, options: any) {
          // Don't set large cookies - this prevents server-side cookie bloat
          if (value.length > 1000) {
            console.warn(`Skipping large cookie: ${name} (${value.length} bytes)`)
            return
          }
          cookieStore.set({ name, value, ...options })
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
      auth: {
        // Disable session persistence on server side
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    }
  )
}
