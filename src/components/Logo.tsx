'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function Logo({ size = 'md', animated = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        duration: 0.6
      }
    },
    hover: { 
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: { 
        duration: 0.3,
        rotate: { duration: 0.6 }
      }
    }
  };

  const bowVariants = {
    initial: { scale: 0 },
    animate: { 
      scale: 1,
      transition: { 
        delay: 0.3,
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    },
    hover: {
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      className={cn(sizeClasses[size], className)}
      variants={animated ? logoVariants : {}}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      whileHover={animated ? "hover" : {}}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Gift Box Base */}
        <defs>
          <linearGradient id="boxGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#EE5A52" />
          </linearGradient>
          <linearGradient id="ribbonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD93D" />
            <stop offset="100%" stopColor="#F7CC2D" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Box Shadow */}
        <ellipse
          cx="50"
          cy="85"
          rx="30"
          ry="8"
          fill="rgba(0,0,0,0.1)"
        />

        {/* Main Gift Box */}
        <motion.rect
          x="25"
          y="35"
          width="50"
          height="45"
          rx="4"
          fill="url(#boxGradient)"
          filter="url(#glow)"
        />

        {/* Box Highlight */}
        <rect
          x="28"
          y="38"
          width="44"
          height="39"
          rx="2"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1"
        />

        {/* Vertical Ribbon */}
        <rect
          x="46"
          y="35"
          width="8"
          height="45"
          fill="url(#ribbonGradient)"
        />

        {/* Horizontal Ribbon */}
        <rect
          x="25"
          y="53"
          width="50"
          height="8"
          fill="url(#ribbonGradient)"
        />

        {/* Bow */}
        <motion.g variants={animated ? bowVariants : {}}>
          {/* Bow Base */}
          <ellipse
            cx="50"
            cy="35"
            rx="12"
            ry="8"
            fill="url(#ribbonGradient)"
          />
          
          {/* Bow Left Wing */}
          <path
            d="M38 35 Q35 28 38 25 Q42 28 45 35 Q42 32 38 35"
            fill="url(#ribbonGradient)"
          />
          
          {/* Bow Right Wing */}
          <path
            d="M62 35 Q65 28 62 25 Q58 28 55 35 Q58 32 62 35"
            fill="url(#ribbonGradient)"
          />
          
          {/* Bow Center Knot */}
          <ellipse
            cx="50"
            cy="35"
            rx="4"
            ry="6"
            fill="#F4A261"
          />
        </motion.g>

        {/* Sparkles */}
        {animated && (
          <>
            <motion.circle
              cx="20"
              cy="25"
              r="1.5"
              fill="#FFD93D"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0,
              }}
            />
            <motion.circle
              cx="80"
              cy="30"
              r="1"
              fill="#FF6B6B"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.7,
              }}
            />
            <motion.circle
              cx="75"
              cy="65"
              r="1.2"
              fill="#4ECDC4"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1.4,
              }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}

export function LogoText({ size = 'md', animated = true, className }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  const letterVariants = {
    hover: {
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.span
      className={cn(
        sizeClasses[size],
        'font-bold gradient-text font-handwriting',
        className
      )}
      variants={animated ? textVariants : {}}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
    >
      {animated ? (
        <>
          {['U', 'n', 'w', 'r', 'a', 'p'].map((letter, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              whileHover="hover"
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </>
      ) : (
        'Unwrap'
      )}
    </motion.span>
  );
}
