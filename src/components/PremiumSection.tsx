'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PremiumSectionProps {
  children: ReactNode;
  className?: string;
  background?: 'dark' | 'light' | 'gradient' | 'luxury' | 'magic';
  fullHeight?: boolean;
  id?: string;
}

export function PremiumSection({ 
  children, 
  className, 
  background = 'dark',
  fullHeight = true,
  id 
}: PremiumSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const backgroundClasses = {
    dark: 'clean-dark text-white',
    light: 'simple-white text-gray-900',
    gradient: 'clean-gradient text-gray-900',
    luxury: 'clean-dark text-white',
    magic: 'clean-gradient text-gray-900'
  };

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        'relative overflow-hidden',
        fullHeight && 'min-h-screen',
        backgroundClasses[background],
        className
      )}
    >

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </section>
  );
}

interface PremiumTextProps {
  children: ReactNode;
  className?: string;
  variant?: 'hero' | 'title' | 'subtitle' | 'body';
  delay?: number;
}

export function PremiumText({ 
  children, 
  className, 
  variant = 'body',
  delay = 0 
}: PremiumTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const variantClasses = {
    hero: 'text-premium-xl font-display font-black text-luxury-gold premium-text-shadow',
    title: 'text-premium-lg font-display font-bold text-luxury-white',
    subtitle: 'text-premium-md font-premium font-semibold text-luxury-cream',
    body: 'text-lg md:text-xl text-luxury-cream/90 leading-relaxed'
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </motion.div>
  );
}

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export function PremiumCard({ 
  children, 
  className, 
  delay = 0,
  hover = true 
}: PremiumCardProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={cn(
        'relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg',
        hover && 'hover:shadow-xl transition-shadow',
        className
      )}
    >
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
