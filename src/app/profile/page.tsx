'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
// Removed minimal auth import - using Supabase auth
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          router.replace('/login');
          return;
        }
        
        if (!user) {
          router.replace('/login');
          return;
        }

        console.log('Profile page: Found user:', user);
        setUser(user);
        setFormData({
          name: user.user_metadata?.name || '',
          email: user.email || ''
        });
      } catch (error) {
        console.error('Error getting user:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [router, supabase.auth]);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Get initials for the new name
      const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      
      // Update user with minimal metadata (remove large fields)
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          avatar_initials: initials,
          // Remove potentially large fields
          avatar_url: null,
          picture: null,
          full_name: null,
          preferred_username: null
        }
      });

      if (error) {
        throw error;
      }

      // Update local state
      setUser(prev => prev ? { 
        ...prev, 
        user_metadata: {
          ...prev.user_metadata,
          name: formData.name,
          avatar_initials: initials
        }
      } : null);
      
      toast.success('Profile updated successfully!');
      console.log('Profile updated with initials instead of avatar URL');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50">
        <Header />
        <div className="pt-28 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50">
      <Header />
      
      <div className="pt-28 px-4 py-8">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}