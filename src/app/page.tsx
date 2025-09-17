'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Gift, Crown } from 'lucide-react';
import Link from 'next/link';
import { LogoText } from '@/components/Logo';
import { TextRevealButton } from '@/components/ui/shadcn-io/text-reveal-button';
import { PremiumSection, PremiumCard } from '@/components/PremiumSection';
import { OrbCard } from '@/components/OrbCard';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { toast } from 'sonner';
 

export default function Home() {
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/create`,
        },
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-emerald-200/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src="/unwrap_log.svg" 
                alt="Unwrap Logo" 
                className="h-16 w-auto"
              />
              <TextRevealButton
                text="Unwrap"
                revealColor="#FFD700"
                revealGradient="linear-gradient(90deg, #B347FF, #FFB800, #37FF8B)"
                className="hidden sm:block"
              />
            </motion.div>
            
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="hover-lift border-gray-300 hover:border-gray-400"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
              </motion.div>
              
              <Link href="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="hover-lift bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Orb Card Hero Section */}
      <div className="pt-28 px-4">
        <div className="container mx-auto max-w-6xl">
          <OrbCard />
        </div>
      </div>

      {/* Experience Categories Section (temporarily hidden) */}
      {false && (
        <PremiumSection id="experiences" background="light" className="section-spacing-sm">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Gift Unforgettable Experiences
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From intimate dinners to grand concerts, create memories that last a lifetime
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: "🍽️", title: "Fine Dining", description: "Michelin-starred restaurants, wine tastings, chef's table experiences" },
                { icon: "🎵", title: "Concerts & Shows", description: "Live music, Broadway shows, comedy clubs, exclusive performances" },
                { icon: "⚽", title: "Sports & Games", description: "VIP tickets, stadium tours, meet & greets, championship games" },
                { icon: "🎭", title: "Cultural Events", description: "Museum exhibitions, art galleries, theater productions, festivals" }
              ].map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="text-6xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{category.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{category.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </PremiumSection>
      )}



      {/* Footer */}
      <div className="mt-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center">
            <motion.div 
              className="mb-2 text-lg text-[#00414e]"
              whileHover={{ scale: 1.05 }}
            >
              © 2025 <span className="bg-gradient-to-r from-[#B347FF] via-[#FFB800] to-[#37FF8B] bg-clip-text text-transparent font-semibold">Unwrap</span>. All rights reserved.
            </motion.div>
            <div className="text-sm text-[#00414e]">
              Premium Experience Gift Platform
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}