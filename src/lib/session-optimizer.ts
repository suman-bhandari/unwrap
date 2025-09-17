// Session optimization utilities to prevent REQUEST_HEADER_TOO_LARGE errors

export function optimizeUserMetadata(userMetadata: Record<string, unknown> | null | undefined) {
  if (!userMetadata) return userMetadata;
  
  // Remove large unnecessary fields that might be causing header bloat
  const optimized = { ...userMetadata };
  
  // Remove large avatar URLs if they're base64 encoded (they can be very large)
  if (optimized.avatar_url && typeof optimized.avatar_url === 'string' && optimized.avatar_url.startsWith('data:image')) {
    // Keep only a reference or remove entirely
    delete optimized.avatar_url;
  }
  
  // Remove any other large fields that might be present
  Object.keys(optimized).forEach(key => {
    if (typeof optimized[key] === 'string' && optimized[key].length > 1000) {
      delete optimized[key];
    }
  });
  
  return optimized;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getOptimizedUserData(user: any) {
  if (!user) return user;
  
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
    user_metadata: optimizeUserMetadata(user.user_metadata),
    // Remove other large fields that might be causing issues
    app_metadata: undefined,
    aud: undefined,
    confirmation_sent_at: undefined,
    recovery_sent_at: undefined,
    email_change_sent_at: undefined,
    new_email: undefined,
    invited_at: undefined,
    action_link: undefined,
    email_confirmed_at: undefined,
    phone_confirmed_at: undefined,
    confirmed_at: undefined,
    email_change: undefined,
    phone_change: undefined,
    last_sign_in_at: undefined,
    is_sso_user: undefined,
    deleted_at: undefined,
    is_anonymous: undefined
  };
}

export function clearLargeCookies() {
  // Clear any cookies that might be too large
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name] = cookie.split('=');
    if (name.trim() && (name.includes('supabase') || name.includes('sb-'))) {
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
}
