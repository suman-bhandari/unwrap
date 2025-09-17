// Aggressive header optimization to prevent REQUEST_HEADER_TOO_LARGE errors

export function clearAllSupabaseCookies() {
  if (typeof window === 'undefined') return;
  
  // Clear all Supabase-related cookies
  const cookies = document.cookie.split(';');
  cookies.forEach(cookie => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    
    if (trimmedName.includes('sb-') || 
        trimmedName.includes('supabase') || 
        trimmedName.includes('auth-token') ||
        trimmedName.includes('session')) {
      // Clear cookie for all possible paths and domains
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
    }
  });
}

export function clearLargeLocalStorage() {
  if (typeof window === 'undefined') return;
  
  // Clear large localStorage items
  const keysToCheck = Object.keys(localStorage);
  keysToCheck.forEach(key => {
    if (key.includes('supabase') || key.includes('sb-') || key.includes('auth')) {
      const item = localStorage.getItem(key);
      if (item && item.length > 2000) {
        console.log(`Clearing large localStorage item: ${key} (${item.length} chars)`);
        localStorage.removeItem(key);
      }
    }
  });
}

export function optimizeSessionData() {
  if (typeof window === 'undefined') return;
  
  // Clear large cookies and localStorage
  clearAllSupabaseCookies();
  clearLargeLocalStorage();
  
  // Force a page reload to clear any cached session data
  if (window.location.pathname !== '/login') {
    console.log('Redirecting to login to clear large session data');
    window.location.href = '/login';
  }
}

export function checkHeaderSize() {
  if (typeof window === 'undefined') return false;
  
  // Estimate header size
  const cookies = document.cookie;
  const localStorageSize = Object.keys(localStorage)
    .reduce((size, key) => size + (localStorage.getItem(key)?.length || 0), 0);
  
  const estimatedSize = cookies.length + localStorageSize;
  
  // If estimated size is too large, clear everything
  if (estimatedSize > 8000) { // Vercel limit is around 8KB
    console.warn(`Header size too large (${estimatedSize} bytes), clearing session data`);
    optimizeSessionData();
    return true;
  }
  
  return false;
}

// Run optimization on page load
if (typeof window !== 'undefined') {
  // Check header size immediately
  checkHeaderSize();
  
  // Also check on any storage changes
  window.addEventListener('storage', () => {
    checkHeaderSize();
  });
}
