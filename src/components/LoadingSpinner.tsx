'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        style={{
          borderTopColor: 'hsl(var(--primary))',
        }}
      />
      <motion.div
        className="absolute inset-1 rounded-full border border-secondary/40"
        animate={{ rotate: -360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        style={{
          borderRightColor: 'hsl(var(--secondary))',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
          borderBottomColor: 'transparent',
        }}
      />
    </div>
  );
}

export function GiftBoxLoader({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <motion.div
        className="relative w-16 h-16"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Gift Box */}
        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 rounded-lg relative">
          {/* Vertical Ribbon */}
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-accent to-accent/80 transform -translate-x-1/2" />
          
          {/* Horizontal Ribbon */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gradient-to-r from-accent to-accent/80 transform -translate-y-1/2" />
          
          {/* Bow */}
          <motion.div 
            className="absolute -top-1 left-1/2 transform -translate-x-1/2"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="w-4 h-3 bg-gradient-to-b from-accent to-accent/80 rounded-full" />
          </motion.div>
        </div>

        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      <motion.p
        className="text-muted-foreground text-sm"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Creating magic...
      </motion.p>
    </div>
  );
}
