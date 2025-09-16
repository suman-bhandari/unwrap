'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  delay?: number;
  variant?: 'default' | 'gradient' | 'glass' | 'magical';
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
      className
    )}>
      {children}
    </div>
  );
}

export function BentoCard({ 
  children, 
  className, 
  size = 'md', 
  delay = 0,
  variant = 'default'
}: BentoCardProps) {
  const sizeClasses = {
    sm: 'col-span-1 row-span-1',
    md: 'col-span-1 md:col-span-1 row-span-1',
    lg: 'col-span-1 md:col-span-2 row-span-1',
    xl: 'col-span-1 md:col-span-2 lg:col-span-2 row-span-2'
  };

  const variantClasses = {
    default: 'bg-white/80 backdrop-blur-sm border border-white/20',
    gradient: 'bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border border-primary/20',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
    magical: 'bg-gradient-to-br from-pink-50/50 via-white/30 to-teal-50/50 backdrop-blur-sm border border-white/30 shadow-2xl'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Special Bento Card for hero sections
export function BentoHero({ 
  children, 
  className,
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-8 md:p-12",
        "col-span-1 md:col-span-2 lg:col-span-3",
        "bg-gradient-to-br from-primary/20 via-white/40 to-secondary/20",
        "backdrop-blur-lg border border-white/30 shadow-2xl",
        className
      )}
    >
      {/* Magical background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100/20 via-transparent to-teal-100/20" />
      
      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Feature card for the Bento layout
export function BentoFeature({ 
  icon, 
  title, 
  description, 
  delay = 0,
  className 
}: { 
  icon: ReactNode; 
  title: string; 
  description: string; 
  delay?: number;
  className?: string;
}) {
  return (
    <BentoCard delay={delay} variant="glass" className={className}>
      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          className="p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg"
          whileHover={{ 
            scale: 1.1,
            rotate: [0, -5, 5, 0],
          }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        
        <h3 className="text-xl font-bold text-foreground">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </BentoCard>
  );
}
