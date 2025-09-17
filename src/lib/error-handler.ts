// Global error handler for REQUEST_HEADER_TOO_LARGE errors
import { optimizeCookiesForVercel } from './vercel-header-optimizer';

export function setupErrorHandler() {
  if (typeof window === 'undefined') return;

  // Handle fetch errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      
      // Check for 494 error (Vercel's REQUEST_HEADER_TOO_LARGE)
      if (response.status === 494) {
        console.error('Vercel REQUEST_HEADER_TOO_LARGE error detected, optimizing headers');
        
        // Use Vercel-specific optimization instead of nuclear clean
        optimizeCookiesForVercel();
        
        // Try the request again with optimized headers
        try {
          const retryResponse = await originalFetch(...args);
          if (retryResponse.status !== 494) {
            console.log('Request succeeded after header optimization');
            return retryResponse;
          }
        } catch {
          console.warn('Retry failed, redirecting to login');
        }
        
        // If retry fails, redirect to login
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
        console.error('Vercel REQUEST_HEADER_TOO_LARGE error detected in XHR, optimizing headers');
        optimizeCookiesForVercel();
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
      console.error('Vercel REQUEST_HEADER_TOO_LARGE error in promise, optimizing headers');
      optimizeCookiesForVercel();
      window.location.href = '/login';
    }
  });
}


// Initialize error handler
if (typeof window !== 'undefined') {
  setupErrorHandler();
}
