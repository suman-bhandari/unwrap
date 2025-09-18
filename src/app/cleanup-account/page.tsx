'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CleanupAccountPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{ email?: string; user_metadata?: { name?: string }; app_metadata?: Record<string, unknown> } | null>(null);

  const checkUserData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        toast.error('Please sign in first');
        return;
      }

      setUserData(user);
      
      const metadataSize = JSON.stringify(user.user_metadata || {}).length;
      const appMetadataSize = JSON.stringify(user.app_metadata || {}).length;
      const fullSize = JSON.stringify(user).length;
      
      console.log('User data sizes:');
      console.log('- User metadata:', metadataSize, 'bytes');
      console.log('- App metadata:', appMetadataSize, 'bytes');
      console.log('- Full user object:', fullSize, 'bytes');
      
      toast.success('User data analyzed - check console for details');
    } catch (error) {
      console.error('Error checking user data:', error);
      toast.error('Failed to check user data');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupUserData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      
      // Get user initials for avatar
      const name = userData?.user_metadata?.name || userData?.email?.split('@')[0] || 'User';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      // Update user with minimal metadata (remove avatar_url and other large fields)
      const { error } = await supabase.auth.updateUser({
        data: {
          name: name,
          avatar_initials: initials, // Use initials instead of long avatar_url
          // Explicitly remove avatar_url and other potentially large fields
          avatar_url: null,
          picture: null,
          full_name: null,
          preferred_username: null
        }
      });

      if (error) {
        throw error;
      }

      toast.success('User data cleaned up successfully! Avatar URL removed, using initials instead.');
      setUserData(null);
    } catch (error) {
      console.error('Error cleaning up user data:', error);
      toast.error('Failed to clean up user data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Account Cleanup Tool</CardTitle>
            <CardDescription>
              This tool helps diagnose and fix 431 errors by analyzing and cleaning up your user account data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkUserData} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Analyzing...' : 'Check My Account Data'}
            </Button>

            {userData && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Account Data Analysis:</h3>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>User Metadata Size:</strong> {JSON.stringify(userData.user_metadata || {}).length} bytes</p>
                  <p><strong>App Metadata Size:</strong> {JSON.stringify(userData.app_metadata || {}).length} bytes</p>
                  <p><strong>Total User Object Size:</strong> {JSON.stringify(userData).length} bytes</p>
                </div>

                <Button 
                  onClick={cleanupUserData} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Cleaning Up...' : 'Clean Up Account Data'}
                </Button>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Note:</strong> If your account data is very large (&gt;16KB), it can cause 431 errors. 
              The cleanup tool will remove unnecessary metadata while keeping essential information.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
