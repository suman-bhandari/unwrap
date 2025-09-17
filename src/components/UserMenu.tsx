'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Camera, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { getOptimizedUserData, clearLargeCookies } from '@/lib/session-optimizer';
import { clearAllSupabaseCookies, clearLargeLocalStorage } from '@/lib/header-optimizer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    user_metadata?: {
      name?: string;
      avatar_url?: string;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
        } else {
          setUser(getOptimizedUserData(user));
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? getOptimizedUserData(session.user) : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      // Aggressively clear all session data
      clearLargeCookies();
      clearAllSupabaseCookies();
      clearLargeLocalStorage();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out');
      } else {
        toast.success('Signed out successfully');
        router.push('/');
      }
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const nameParts = name.trim().split(' ');
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
      } else if (nameParts.length === 1) {
        return nameParts[0].slice(0, 2).toUpperCase();
      }
    }
    // Fallback to email if no name
    return email?.split('@')[0]?.slice(0, 2).toUpperCase() || 'U';
  };

  const getUserDisplayName = () => {
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0">
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
            {getUserInitials(user.user_metadata?.name, user.email)}
          </div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
            >
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                      {getUserInitials(user.user_metadata?.name, user.email)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">View Profile</div>
                      <div className="text-xs text-gray-500">Manage your account</div>
                    </div>
                  </Button>
                </Link>


                <Link href="/profile/security">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Security</div>
                      <div className="text-xs text-gray-500">Change password</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/profile/avatar">
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-2 h-auto text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsOpen(false)}
                  >
                    <Camera className="w-4 h-4 mr-3" />
                    <div>
                      <div className="font-medium">Profile Picture</div>
                      <div className="text-xs text-gray-500">Upload or change photo</div>
                    </div>
                  </Button>
                </Link>

                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-2 h-auto text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  onClick={() => {
                    setIsOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">Sign Out</div>
                    <div className="text-xs text-red-500">End your session</div>
                  </div>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
