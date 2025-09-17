// Global error handler for REQUEST_HEADER_TOO_LARGE errors

export function setupErrorHandler() {
  if (typeof window === 'undefined') return;

  // Handle fetch errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Check for 494 error
      if (response.status === 494) {
        console.error('REQUEST_HEADER_TOO_LARGE error detected, clearing session data');
        clearSessionData();
        
        // Redirect to login to force re-authentication
        window.location.href = '/login';
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  // Handle XMLHttpRequest errors
  const originalXHROpen = XMLHttpRequest.prototype.open;
  
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    this.addEventListener('readystatechange', function() {
      if (this.readyState === 4 && this.status === 494) {
        console.error('REQUEST_HEADER_TOO_LARGE error detected in XHR, clearing session data');
        clearSessionData();
        window.location.href = '/login';
      }
    });
    
    return originalXHROpen.call(this, method, url, async ?? true, username, password);
  };

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.message?.includes('494') || 
        event.reason?.status === 494 ||
        event.reason?.code === 'REQUEST_HEADER_TOO_LARGE') {
      console.error('REQUEST_HEADER_TOO_LARGE error in promise, clearing session data');
      clearSessionData();
      window.location.href = '/login';
    }
  });
}

function clearSessionData() {
  if (typeof window === 'undefined') return;
  
  // Clear ALL cookies aggressively
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    if (trimmedName) {
      // Clear for all possible paths and domains
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.vercel.app`;
      document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.supabase.co`;
    }
  });
  
  // Clear ALL localStorage
  localStorage.clear();
  
  // Clear ALL sessionStorage
  sessionStorage.clear();
  
  // Clear IndexedDB if available
  if ('indexedDB' in window) {
    indexedDB.databases?.().then(databases => {
      databases.forEach(db => {
        if (db.name) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  }
  
  // Clear service worker caches
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
}

// Initialize error handler
if (typeof window !== 'undefined') {
  setupErrorHandler();
}
