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

export function updateMinimalSession(updates: Partial<MinimalUser>): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const currentSession = getMinimalSession()
    if (!currentSession) return false
    
    const updatedSession: MinimalSession = {
      ...currentSession,
      user: {
        ...currentSession.user,
        ...updates
      }
    }
    
    setMinimalSession(updatedSession)
    return true
  } catch (error) {
    console.error('Failed to update minimal session:', error)
    return false
  }
}

export async function signInWithMinimalAuth(email: string, password: string): Promise<MinimalSession | null> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are missing!');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
    return null;
  }

  try {
    // Clear ALL cookies before attempting authentication to prevent 431 error
    if (typeof window !== 'undefined') {
      console.log('Clearing all cookies before authentication...');
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
    }

    // Create a fresh Supabase client with minimal configuration
    const supabase = createClient();
    
    console.log('Attempting Supabase sign in with clean state...');
    
    // Use a more direct approach to avoid large headers
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Authentication failed:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    
    if (!data.user) {
      console.error('No user in response');
      return null;
    }

    console.log('Authentication successful, creating minimal session...');
    
    // Create a very minimal session
    const minimalSession: MinimalSession = {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || ''
      },
      access_token: data.access_token || '',
      expires_at: Date.now() + (3600 * 1000) // 1 hour
    };

    // Store in localStorage (not cookies to avoid header issues)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(minimalSession));
        console.log('Minimal session stored in localStorage');
      } catch (error) {
        console.warn('Failed to store session:', error);
      }
    }

    return minimalSession;
  } catch (error) {
    console.error('Sign in failed with exception:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export async function signUpWithMinimalAuth(email: string, password: string, name: string): Promise<MinimalSession | null> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are missing!');
    return null;
  }

  try {
    // Clear ALL cookies before attempting sign up to prevent 431 error
    if (typeof window !== 'undefined') {
      console.log('Clearing all cookies before sign up...');
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
    }

    console.log('Attempting Supabase sign up with clean state...');
    
    // Use a more direct approach to avoid large headers
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      body: JSON.stringify({
        email,
        password,
        data: { name }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Sign up failed:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    
    if (!data.user) {
      console.error('No user in sign up response');
      return null;
    }

    console.log('Sign up successful, creating minimal session...');
    
    // Create a very minimal session
    const minimalSession: MinimalSession = {
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || name
      },
      access_token: data.access_token || '',
      expires_at: Date.now() + (3600 * 1000) // 1 hour
    };

    // Store in localStorage (not cookies to avoid header issues)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(minimalSession));
        console.log('Minimal session stored in localStorage');
      } catch (error) {
        console.warn('Failed to store session:', error);
      }
    }

    return minimalSession;
  } catch (error) {
    console.error('Sign up failed with exception:', error);
    return null;
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
