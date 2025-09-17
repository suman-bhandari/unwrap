'use client';

import { useEffect } from 'react';
import { checkHeaderSize, clearAllSupabaseCookies, clearLargeLocalStorage } from '@/lib/header-optimizer';

export function HeaderOptimizer() {
  useEffect(() => {
    // Run header optimization on every page load
    const isHeaderTooLarge = checkHeaderSize();
    
    if (isHeaderTooLarge) {
      console.log('Header size exceeded limits, clearing session data');
      clearAllSupabaseCookies();
      clearLargeLocalStorage();
    }
    
    // Also run on any storage changes
    const handleStorageChange = () => {
      checkHeaderSize();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
