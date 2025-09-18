'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ClearCookiesPage() {
  const [cleared, setCleared] = useState(false);

  const clearEverything = () => {
    try {
      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name) {
              indexedDB.deleteDatabase(db.name);
            }
          });
        });
      }

      // Clear caches
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.delete(cacheName);
          });
        });
      }

      setCleared(true);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  useEffect(() => {
    // Auto-clear on page load
    clearEverything();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-4">
          {cleared ? 'Data Cleared!' : 'Clearing Data...'}
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {cleared 
            ? 'All cookies, localStorage, and cache have been cleared. You can now try accessing the login page.'
            : 'Please wait while we clear all stored data...'
          }
        </p>
        {cleared && (
          <div className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/login'}
              className="w-full"
            >
              Go to Login Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Go to Home Page
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

