'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { User, Settings, LogOut, Lock, UserCircle, History } from 'lucide-react';
import Link from 'next/link';

interface UserMenuProps {
  className?: string;
}

export function UserMenu({ className = '' }: UserMenuProps) {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { name?: string; avatar_initials?: string; avatar_url?: string } } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error getting user:', error);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setUser(session?.user || null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (user: { user_metadata?: { name?: string; avatar_initials?: string; avatar_url?: string }; email?: string }) => {
    // First try to get initials from user metadata
    if (user?.user_metadata?.avatar_initials) {
      return user.user_metadata.avatar_initials;
    }
    
    // Fallback to name initials
    if (user?.user_metadata?.name) {
      const name = user.user_metadata.name;
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    // Fallback to email initials
    if (user?.email) {
      const name = user.email.split('@')[0];
      return name.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  const hasAvatar = (user: { user_metadata?: { avatar_url?: string } }) => {
    return user?.user_metadata?.avatar_url && user.user_metadata.avatar_url.trim() !== '';
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Link 
        href="/login"
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 ${className}`}
      >
        <User className="w-4 h-4" />
        Sign In
      </Link>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {hasAvatar(user) ? (
          <img 
            src={user.user_metadata?.avatar_url} 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
            {getUserInitials(user)}
          </div>
        )}
        <span className="hidden sm:block">{user.user_metadata?.name || user.email?.split('@')[0] || 'User'}</span>
        <User className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata?.name || 'User'}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              {/* Menu Items */}
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <UserCircle className="w-4 h-4 mr-3" />
                View Profile
              </Link>

              <Link
                href="/profile/security"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Lock className="w-4 h-4 mr-3" />
                Change Password
              </Link>

              <Link
                href="/profile/avatar"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Profile Picture
              </Link>

              <Link
                href="/memories"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <History className="w-4 h-4 mr-3" />
                Past Memories
              </Link>

              <div className="border-t border-gray-100">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}