'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Upload, X, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function AvatarPage() {
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
          router.push('/login');
        } else if (!user) {
          router.push('/login');
        } else {
          setUser(user);
          setPreviewUrl(user.user_metadata?.avatar_url || null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase.auth, router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      // Convert file to base64 for storage in user metadata
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const { error } = await supabase.auth.updateUser({
          data: {
            avatar_url: base64,
          }
        });

        if (error) {
          toast.error('Error updating avatar');
        } else {
          toast.success('Avatar updated successfully');
          // Refresh user data
          const { data: { user: updatedUser } } = await supabase.auth.getUser();
          setUser(updatedUser);
          setSelectedFile(null);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error('Error uploading avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user) return;

    setIsUploading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          avatar_url: null,
        }
      });

      if (error) {
        toast.error('Error removing avatar');
      } else {
        toast.success('Avatar removed successfully');
        setPreviewUrl(null);
        setSelectedFile(null);
        // Refresh user data
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        setUser(updatedUser);
      }
    } catch (error) {
      toast.error('Error removing avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(user?.user_metadata?.avatar_url || null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading avatar settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getUserInitials = (email?: string) => {
    return email?.split('@')[0]?.slice(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-emerald-200/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Profile</span>
              </motion.div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-4 pb-8">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 backdrop-blur-sm bg-white/90 shadow-2xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white">
                    <Camera className="w-8 h-8" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Profile Picture</CardTitle>
                <CardDescription>
                  Upload or change your profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Avatar */}
                <div className="text-center">
                  <div className="relative inline-block">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl border-4 border-white shadow-lg">
                        {getUserInitials(user.email || '')}
                      </div>
                    )}
                    {selectedFile && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Controls */}
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {previewUrl ? 'Change Picture' : 'Upload Picture'}
                    </Button>

                    {previewUrl && (
                      <Button
                        variant="outline"
                        onClick={handleRemove}
                        disabled={isUploading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  {selectedFile && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-500">
                    <p>Supported formats: JPG, PNG, GIF</p>
                    <p>Maximum file size: 5MB</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedFile && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0"
                    >
                      {isUploading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Uploading...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isUploading}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
