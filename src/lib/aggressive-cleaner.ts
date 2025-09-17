// Most aggressive cleaning to prevent REQUEST_HEADER_TOO_LARGE errors

export function nuclearClean() {
  if (typeof window === 'undefined') return;
  
  console.log('🧹 Nuclear cleaning initiated to prevent 494 errors');
  
  // Clear ALL cookies
  document.cookie.split(';').forEach(cookie => {
    const [name] = cookie.split('=');
    const trimmedName = name.trim();
    if (trimmedName) {
      // Clear for all possible domains and paths
      const domains = [
        window.location.hostname,
        `.${window.location.hostname}`,
        '.vercel.app',
        '.supabase.co',
        '.supabase.com'
      ];
      
      const paths = ['/', '/create', '/login', '/profile'];
      
      domains.forEach(domain => {
        paths.forEach(path => {
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure`;
          document.cookie = `${trimmedName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure; samesite=strict`;
        });
      });
    }
  });
  
  // Clear ALL storage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
  
  // Clear IndexedDB
  if ('indexedDB' in window) {
    try {
      indexedDB.databases?.().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    } catch (e) {
      console.warn('Could not clear IndexedDB:', e);
    }
  }
  
  // Clear caches
  if ('caches' in window) {
    try {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
      });
    } catch (e) {
      console.warn('Could not clear caches:', e);
    }
  }
  
  console.log('🧹 Nuclear cleaning completed');
}

export function forceCleanAuth() {
  if (typeof window === 'undefined') return;
  
  // Nuclear clean first
  nuclearClean();
  
  // Force redirect to login to get fresh auth
  if (window.location.pathname !== '/login') {
    console.log('🔄 Redirecting to login for clean authentication');
    window.location.href = '/login';
  }
}

// Run nuclear clean on every page load
if (typeof window !== 'undefined') {
  // Run immediately
  nuclearClean();
  
  // Also run on page visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      nuclearClean();
    }
  });
  
  // Run on focus
  window.addEventListener('focus', nuclearClean);
  
  // Run on beforeunload
  window.addEventListener('beforeunload', nuclearClean);
}
