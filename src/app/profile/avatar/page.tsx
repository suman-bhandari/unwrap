'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { getMinimalSession } from '@/lib/minimal-auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Upload, Camera, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AvatarPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

        setUser(user);
        if (user.user_metadata?.avatar_url) {
          setPreviewUrl(user.user_metadata.avatar_url);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    getUser();
  }, [supabase.auth, router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!user || !fileInputRef.current?.files?.[0]) {
      toast.error('Please select an image first');
      return;
    }

    setIsSaving(true);
    try {
      const file = fileInputRef.current.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl
        }
      });

      if (updateError) {
        throw updateError;
      }

      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = (email: string) => {
    if (!email) return 'U';
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase();
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
                  <Camera className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a profile picture to personalize your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Current Avatar */}
                  <div className="relative">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-indigo-500 text-white rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg">
                        {getUserInitials(user.email || '')}
                      </div>
                    )}
                  </div>

                  {/* File Input */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Image
                    </Button>
                    
                    <p className="text-sm text-gray-500 text-center">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving || !previewUrl}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Picture'}
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