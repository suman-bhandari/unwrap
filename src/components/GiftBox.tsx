'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface GiftBoxProps {
  isLocked?: boolean;
  onUnwrap?: () => void;
  countdown?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export function GiftBox({ 
  isLocked = false, 
  onUnwrap, 
  countdown, 
  size = 'md',
  interactive = true 
}: GiftBoxProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const handleClick = () => {
    if (isLocked || !interactive) return;
    
    setIsOpening(true);
    setTimeout(() => {
      onUnwrap?.();
      setIsOpening(false);
    }, 1000);
  };

  return (
    <div className="relative perspective-1000">
      <motion.div
        className={`${sizeClasses[size]} relative preserve-3d cursor-pointer`}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive && !isLocked ? { scale: 0.95 } : {}}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        animate={{
          rotateY: isOpening ? 180 : 0,
        }}
        transition={{
          duration: 1,
          ease: "easeInOut"
        }}
      >
        {/* Unwrap Logo - Replacing the entire gift box */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-24 h-24' : 'w-32 h-32'} bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl`}>
            <img 
              src="/unwrap_log.svg" 
              alt="Unwrap Logo" 
              className="w-3/4 h-3/4 filter brightness-0 invert" 
            />
          </div>
        </div>

        {/* Lock overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
            <div className="bg-white/90 rounded-full p-2">
              <div className="w-4 h-4 border-2 border-gray-600 rounded-full relative">
                <div className="absolute top-1 left-1 w-2 h-1 bg-gray-600 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* Countdown display */}
        {countdown && countdown > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-white rounded-lg px-3 py-1 shadow-lg">
              <span className="text-sm font-mono text-gray-700">
                {Math.floor(countdown / 3600)}h {Math.floor((countdown % 3600) / 60)}m {countdown % 60}s
              </span>
            </div>
          </div>
        )}

        {/* Floating animation */}
        <motion.div
          className="absolute inset-0"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Sparkle effects */}
        {interactive && (
          <>
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full"
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
            <motion.div
              className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-400 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute top-1/4 -right-2 w-1 h-1 bg-yellow-200 rounded-full"
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
