'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClearAllPage() {
  const [cleared, setCleared] = useState(false);
  const [step, setStep] = useState(0);

  const clearEverything = async () => {
    try {
      setStep(1);
      
      // Clear all cookies
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=" + window.location.hostname); 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=." + window.location.hostname); 
      });

      setStep(2);
      
      // Clear localStorage
      localStorage.clear();

      setStep(3);
      
      // Clear sessionStorage
      sessionStorage.clear();

      setStep(4);
      
      // Clear IndexedDB
      if ('indexedDB' in window) {
        try {
          const databases = await indexedDB.databases();
          for (const db of databases) {
            if (db.name) {
              await new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name);
                deleteReq.onsuccess = () => resolve(true);
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            }
          }
        } catch (e) {
          console.warn('Failed to clear IndexedDB:', e);
        }
      }

      setStep(5);
      
      // Clear caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
          }
        } catch (e) {
          console.warn('Failed to clear caches:', e);
        }
      }

      setStep(6);
      
      // Clear any service worker registrations
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
          }
        } catch (e) {
          console.warn('Failed to clear service workers:', e);
        }
      }

      setStep(7);
      
      // Force reload to clear any remaining state
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);

      setCleared(true);
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  };

  const steps = [
    'Clearing cookies...',
    'Clearing localStorage...',
    'Clearing sessionStorage...',
    'Clearing IndexedDB...',
    'Clearing caches...',
    'Clearing service workers...',
    'Redirecting to home page...'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            {cleared ? 'Data Cleared!' : 'Clearing All Data'}
          </CardTitle>
          <CardDescription className="text-center">
            {cleared 
              ? 'All browser data has been cleared. You will be redirected to the home page.'
              : 'This will clear all cookies, storage, and cache to fix the 431 error.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!cleared && (
            <Button 
              onClick={clearEverything}
              className="w-full"
              disabled={step > 0}
            >
              {step === 0 ? 'Clear All Data' : 'Clearing...'}
            </Button>
          )}
          
          {step > 0 && (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                Step {step} of {steps.length}: {steps[step - 1]}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {cleared && (
            <div className="text-center text-green-600">
              <p>✅ All data cleared successfully!</p>
              <p className="text-sm mt-2">Redirecting to home page...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
