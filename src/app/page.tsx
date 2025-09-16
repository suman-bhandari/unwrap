'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Gift, Crown } from 'lucide-react';
import Link from 'next/link';
import { LogoText } from '@/components/Logo';
import { TextRevealButton } from '@/components/ui/shadcn-io/text-reveal-button';
import { PremiumSection, PremiumCard } from '@/components/PremiumSection';
import { OrbCard } from '@/components/OrbCard';
import { Button } from '@/components/ui/button';
 

export default function Home() {
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
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
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