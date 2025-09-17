// Minimal authentication system that bypasses Supabase's large session cookies
import { createClient } from './supabase'

interface MinimalUser {
  id: string
  email: string
  name?: string
}

interface MinimalSession {
  user: MinimalUser
  access_token: string
  expires_at: number
}

const SESSION_KEY = 'minimal_session'
const MAX_SESSION_SIZE = 2000 // 2KB max session size

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMinimalSession(user: any): MinimalSession | null {
  if (!user) return null

  const minimalUser: MinimalUser = {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || ''
  }

  const session: MinimalSession = {
    user: minimalUser,
    access_token: user.access_token || '',
    expires_at: Date.now() + (3600 * 1000) // 1 hour
  }

  // Check if session is too large
  const sessionSize = JSON.stringify(session).length
  if (sessionSize > MAX_SESSION_SIZE) {
    console.warn(`Session too large: ${sessionSize} bytes`)
    return null
  }

  return session
}

export function getMinimalSession(): MinimalSession | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(SESSION_KEY)
    if (!stored) return null

    const session: MinimalSession = JSON.parse(stored)
    
    // Check if session is expired
    if (Date.now() > session.expires_at) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function setMinimalSession(session: MinimalSession): void {
  if (typeof window === 'undefined') return

  try {
    const sessionSize = JSON.stringify(session).length
    if (sessionSize > MAX_SESSION_SIZE) {
      console.warn(`Cannot store session: ${sessionSize} bytes exceeds limit`)
      return
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    console.error('Failed to store session:', error)
  }
}

export function clearMinimalSession(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export async function signInWithMinimalAuth(email: string, password: string): Promise<MinimalSession | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data.user) {
      console.error('Sign in error:', error)
      return null
    }

    const minimalSession = createMinimalSession(data.user)
    if (minimalSession) {
      setMinimalSession(minimalSession)
    }

    return minimalSession
  } catch (error) {
    console.error('Sign in failed:', error)
    return null
  }
}

export async function signUpWithMinimalAuth(email: string, password: string, name: string): Promise<MinimalSession | null> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    })

    if (error || !data.user) {
      console.error('Sign up error:', error)
      return null
    }

    const minimalSession = createMinimalSession(data.user)
    if (minimalSession) {
      setMinimalSession(minimalSession)
    }

    return minimalSession
  } catch (error) {
    console.error('Sign up failed:', error)
    return null
  }
}

export async function signOutMinimalAuth(): Promise<void> {
  const supabase = createClient()
  
  try {
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
  } finally {
    clearMinimalSession()
  }
}

export async function refreshMinimalSession(): Promise<MinimalSession | null> {
  const currentSession = getMinimalSession()
  if (!currentSession) return null

  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: currentSession.access_token
    })

    if (error || !data.user) {
      console.error('Session refresh error:', error)
      clearMinimalSession()
      return null
    }

    const minimalSession = createMinimalSession(data.user)
    if (minimalSession) {
      setMinimalSession(minimalSession)
      return minimalSession
    }

    return null
  } catch (error) {
    console.error('Session refresh failed:', error)
    clearMinimalSession()
    return null
  }
}
