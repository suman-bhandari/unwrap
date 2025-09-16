'use client';

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative rounded-full
        bg-luxury-black/20 dark:bg-luxury-white/20
        border border-luxury-gold/30 dark:border-luxury-gold/50
        backdrop-blur-sm
        flex items-center justify-center
        hover:bg-luxury-gold/20 dark:hover:bg-luxury-gold/30
        transition-all duration-300
        group
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-luxury-gold/20 to-luxury-bronze/20"
        initial={false}
        animate={{ opacity: theme === 'dark' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <motion.div
        className="relative z-10"
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 180 : 0,
          scale: theme === 'dark' ? 0.8 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {theme === 'light' ? (
          <Sun className={`${iconSizes[size]} text-luxury-gold group-hover:text-luxury-bronze transition-colors`} />
        ) : (
          <Moon className={`${iconSizes[size]} text-luxury-white group-hover:text-luxury-gold transition-colors`} />
        )}
      </motion.div>

      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-luxury-gold/50"
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0 }}
        whileTap={{ 
          scale: 1.5, 
          opacity: [0, 0.3, 0],
          transition: { duration: 0.4 }
        }}
      />
    </motion.button>
  );
}
