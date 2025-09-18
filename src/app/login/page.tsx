'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
import FireworksBackground from '@/components/ui/shadcn-io/fireworks-background';
import { TextRevealButton } from '@/components/ui/shadcn-io/text-reveal-button';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Clear ALL cookies before signing in to prevent 431 errors
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const totalSize = cookies.reduce((total, cookie) => total + cookie.trim().length, 0);
        console.log(`Current header size: ${totalSize} bytes`);
        
        // Always clear all cookies before sign in to prevent 431 errors
        console.log('Clearing all cookies before sign in...');
        cookies.forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          if (name) {
            // Clear cookie for all possible paths and domains
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}`;
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname}`;
          }
        });
        
        // Also clear localStorage and sessionStorage
        localStorage.clear();
        sessionStorage.clear();
      }

      console.log('Attempting Supabase sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error('Invalid credentials');
        return;
      }

      if (data.user) {
        console.log('Login successful, user:', data.user);
        console.log('User metadata size:', JSON.stringify(data.user.user_metadata || {}).length, 'bytes');
        console.log('User app metadata size:', JSON.stringify(data.user.app_metadata || {}).length, 'bytes');
        console.log('Full user object size:', JSON.stringify(data.user).length, 'bytes');
        toast.success('Welcome back!');
        router.push('/create');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      console.error('Sign in error details:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      
      // Clear any existing large cookies before signing up
      if (typeof window !== 'undefined') {
        const cookies = document.cookie.split(';');
        const totalSize = cookies.reduce((total, cookie) => total + cookie.trim().length, 0);
        
        if (totalSize > 4 * 1024) { // If headers are getting large
          console.log('Clearing large headers before sign up...');
          // Clear non-essential cookies but keep any existing auth
          cookies.forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            if (name && !name.startsWith('sb-')) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            }
          });
        }
      }

      console.log('Attempting Supabase sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error('Failed to create account');
        return;
      }

      if (data.user) {
        console.log('Sign up successful, user:', data.user);
        toast.success('Account created! Welcome!');
        router.push('/create');
      } else {
        toast.error('Failed to create account');
      }
    } catch (error) {
      console.error('Sign up error details:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="relative min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-neutral-900 dark:to-neutral-950">
      <FireworksBackground
        className="absolute inset-0 z-0 pointer-events-none"
        population={1}
        color={["#FFD700", "#10B981", "#60A5FA"]}
        fireworkSpeed={6}
        fireworkSize={3}
        particleSpeed={4}
        particleSize={3}
      />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <img 
              src="/unwrap_log.svg" 
              alt="Unwrap Logo" 
              className="h-16 w-auto"
            />
            <TextRevealButton
              text="Unwrap"
              revealColor="#FFD700"
              revealGradient="linear-gradient(90deg, #B347FF, #FFB800, #37FF8B)"
              className="text-2xl font-bold"
            />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-0 backdrop-blur-sm bg-white/90 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-center">Get Started</CardTitle>
              <CardDescription className="text-center">
                Sign in to your account or create a new one.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-purple-500 to-pink-500">
                  <TabsTrigger 
                    value="signin"
                    className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=inactive]:text-white hover:text-white"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=inactive]:text-white hover:text-white"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-6"
        >
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0">
              ← Back to home
            </Button>
          </Link>
        </motion.div>
        </div>
      </div>
    </div>
  );
}
