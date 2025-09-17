// Vercel-specific header optimization based on official limits
// Individual headers: max 16KB, Total headers: max 32KB

const VERCEL_HEADER_LIMITS = {
  MAX_INDIVIDUAL_HEADER: 16 * 1024, // 16KB
  MAX_TOTAL_HEADERS: 32 * 1024,     // 32KB
  MAX_COOKIE_SIZE: 4 * 1024,        // 4KB per cookie (conservative)
  MAX_TOTAL_COOKIES: 8 * 1024,      // 8KB total cookies (conservative)
};

export function getHeaderSize(headers: Headers): number {
  let totalSize = 0;
  headers.forEach((value, name) => {
    totalSize += name.length + value.length + 4; // +4 for ": " and "\r\n"
  });
  return totalSize;
}

export function getCookieSize(): number {
  if (typeof window === 'undefined') return 0;
  
  let totalSize = 0;
  document.cookie.split(';').forEach(cookie => {
    totalSize += cookie.trim().length;
  });
  return totalSize;
}

export function checkHeaderLimits(): boolean {
  if (typeof window === 'undefined') return true;
  
  const cookieSize = getCookieSize();
  
  // Check if cookies exceed limits
  if (cookieSize > VERCEL_HEADER_LIMITS.MAX_TOTAL_COOKIES) {
    console.warn(`Cookie size (${cookieSize} bytes) exceeds Vercel limit (${VERCEL_HEADER_LIMITS.MAX_TOTAL_COOKIES} bytes)`);
    return false;
  }
  
  return true;
}

export function optimizeCookiesForVercel(): void {
  if (typeof window === 'undefined') return;
  
  const cookies = document.cookie.split(';');
  const optimizedCookies: string[] = [];
  let totalSize = 0;
  
  // Sort cookies by importance (keep essential ones first)
  const essentialCookies = cookies.filter(cookie => 
    cookie.includes('sb-') && 
    (cookie.includes('auth-token') || cookie.includes('refresh-token'))
  );
  
  const otherCookies = cookies.filter(cookie => 
    !cookie.includes('sb-') || 
    (!cookie.includes('auth-token') && !cookie.includes('refresh-token'))
  );
  
  // Add essential cookies first
  [...essentialCookies, ...otherCookies].forEach(cookie => {
    const trimmedCookie = cookie.trim();
    if (!trimmedCookie) return;
    
    const cookieSize = trimmedCookie.length;
    
    // Check if adding this cookie would exceed limits
    if (totalSize + cookieSize <= VERCEL_HEADER_LIMITS.MAX_TOTAL_COOKIES) {
      optimizedCookies.push(trimmedCookie);
      totalSize += cookieSize;
    } else {
      console.log(`Removing large cookie: ${trimmedCookie.substring(0, 50)}... (${cookieSize} bytes)`);
    }
  });
  
  // Clear all cookies first
  cookies.forEach(cookie => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    if (trimmedName) {
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
  
  // Set only optimized cookies
  optimizedCookies.forEach(cookie => {
    const [name, value] = cookie.split('=');
    if (name && value) {
      document.cookie = `${name.trim()}=${value.trim()}; path=/; secure; samesite=strict`;
    }
  });
  
  console.log(`Optimized cookies: ${optimizedCookies.length} cookies, ${totalSize} bytes`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMinimalSupabaseSession(user: any): any {
  if (!user) return null;
  
  // Create minimal session data that fits within Vercel limits
  const minimalUser = {
    id: user.id,
    email: user.email,
    user_metadata: {
      name: user.user_metadata?.name || '',
      // Remove avatar_url and other large fields
    },
    // Remove all other potentially large fields
  };
  
  const minimalSession = {
    access_token: user.access_token || '',
    refresh_token: user.refresh_token || '',
    expires_in: 3600,
    token_type: 'bearer',
    user: minimalUser
  };
  
  // Calculate session size
  const sessionSize = JSON.stringify(minimalSession).length;
  if (sessionSize > VERCEL_HEADER_LIMITS.MAX_INDIVIDUAL_HEADER) {
    console.warn(`Session size (${sessionSize} bytes) exceeds Vercel header limit`);
    return null;
  }
  
  return minimalSession;
}

export function monitorHeaderSize(): void {
  if (typeof window === 'undefined') return;
  
  // Check header size on every page load
  if (!checkHeaderLimits()) {
    console.log('Header size exceeds Vercel limits, optimizing...');
    optimizeCookiesForVercel();
  }
  
  // Monitor on storage changes
  window.addEventListener('storage', () => {
    if (!checkHeaderLimits()) {
      optimizeCookiesForVercel();
    }
  });
  
  // Monitor on beforeunload
  window.addEventListener('beforeunload', () => {
    optimizeCookiesForVercel();
  });
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  monitorHeaderSize();
}
