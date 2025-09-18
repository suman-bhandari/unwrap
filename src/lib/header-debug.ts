// Header debugging utility for development
export function debugHeaderSize(): void {
  if (typeof window === 'undefined') return;

  const cookies = document.cookie.split(';');
  const totalSize = cookies.reduce((total, cookie) => total + cookie.trim().length, 0);
  
  console.log('=== Header Debug Info ===');
  console.log(`Total cookie size: ${totalSize} bytes`);
  console.log(`Cookie count: ${cookies.length}`);
  
  if (totalSize > 8 * 1024) {
    console.warn('⚠️ Headers are getting large (>8KB)');
  }
  
  if (totalSize > 16 * 1024) {
    console.error('🚨 Headers exceed Vercel limit (>16KB)');
  }
  
  // Show individual cookie sizes
  cookies.forEach((cookie, index) => {
    const trimmedCookie = cookie.trim();
    if (trimmedCookie) {
      const size = trimmedCookie.length;
      const name = trimmedCookie.split('=')[0];
      console.log(`Cookie ${index + 1}: ${name} (${size} bytes)`);
    }
  });
  
  console.log('========================');
}

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as unknown as { debugHeaders: typeof debugHeaderSize }).debugHeaders = debugHeaderSize;
}

