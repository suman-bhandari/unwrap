// Aggressive header cleaner to prevent 431 errors
// This runs on every page load and periodically to ensure headers stay small

export function aggressiveCleanHeaders() {
  if (typeof window === 'undefined') return;

  try {
    // Get current cookies and check total size
    const cookies = document.cookie.split(';');
    const totalCookieSize = cookies.reduce((total, cookie) => total + cookie.trim().length, 0);
    
    // Only clean if cookies are getting too large (>8KB)
    if (totalCookieSize < 8 * 1024) {
      return; // Don't clean if headers are still small
    }

    // Preserve essential Supabase auth cookies
    const essentialCookies: string[] = [];
    const cookiesToRemove: string[] = [];
    
    cookies.forEach(cookie => {
      const trimmedCookie = cookie.trim();
      if (!trimmedCookie) return;
      
      const name = trimmedCookie.split('=')[0];
      
      // Keep essential Supabase auth cookies
      if (name.startsWith('sb-') && 
          (name.includes('auth-token') || 
           name.includes('refresh-token') || 
           name.includes('access-token'))) {
        essentialCookies.push(trimmedCookie);
      } else {
        cookiesToRemove.push(name);
      }
    });

    // Only remove non-essential cookies
    cookiesToRemove.forEach(name => {
      if (name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      }
    });

    // Clear ALL localStorage to prevent any large data
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear localStorage:', e);
    }

    // Clear ALL sessionStorage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }

    // Clear any IndexedDB that might contain large data
    if ('indexedDB' in window) {
      try {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      } catch (e) {
        console.warn('Failed to clear IndexedDB:', e);
      }
    }

    // Clear any caches
    if ('caches' in window) {
      try {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      } catch (e) {
        console.warn('Failed to clear caches:', e);
      }
    }

    console.log('Aggressive header cleaning completed - all data cleared');
  } catch (error) {
    console.error('Error during aggressive header cleaning:', error);
  }
}

// TEMPORARILY DISABLED - Run immediately when this module loads
if (typeof window !== 'undefined') {
  // aggressiveCleanHeaders(); // DISABLED FOR DEBUGGING
  
  // Run less frequently to avoid interfering with auth
  // setInterval(aggressiveCleanHeaders, 30000); // DISABLED FOR DEBUGGING
  
  // Run on page visibility change (less aggressive)
  // document.addEventListener('visibilitychange', () => {
  //   if (!document.hidden) {
  //     // Only clean if we've been away for a while
  //     setTimeout(aggressiveCleanHeaders, 1000);
  //   }
  // });
  
  // Don't run on every focus to avoid clearing auth during sign-in
  console.log('Aggressive header cleaner DISABLED for debugging');
}
