'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function AnimatedText({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.6 
}: AnimatedTextProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredChildrenProps {
  children: ReactNode | ReactNode[];
  className?: string;
  staggerDelay?: number;
}

export function StaggeredChildren({ 
  children, 
  className, 
  staggerDelay = 0.1 
}: StaggeredChildrenProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Ensure children is an array
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div ref={ref} className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ 
            duration: 0.6, 
            delay: isInView ? index * staggerDelay : 0,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  duration?: number;
}

export function FloatingElement({ 
  children, 
  className, 
  intensity = 10,
  duration = 3 
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-intensity, intensity, -intensity],
        rotate: [-1, 1, -1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  delay?: number;
}

export function RevealOnScroll({ 
  children, 
  className,
  direction = 'up',
  distance = 50,
  delay = 0
}: RevealOnScrollProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directionVariants = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        ...directionVariants[direction]
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0 
      } : { 
        opacity: 0, 
        ...directionVariants[direction]
      }}
      transition={{ 
        duration: 0.8, 
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  onClick?: () => void;
}

export function MagneticButton({ 
  children, 
  className, 
  intensity = 0.3,
  onClick 
}: MagneticButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      whileFocus={{ scale: 1.05 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        e.currentTarget.style.transform = `translate(${x * intensity}px, ${y * intensity}px) scale(1.05)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0px, 0px) scale(1)';
      }}
      onClick={onClick}
      className={cn(
        "transition-transform duration-200 ease-out",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

interface ParallaxElementProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down';
}

export function ParallaxElement({ 
  children, 
  className, 
  speed = 0.5,
  direction = 'up'
}: ParallaxElementProps) {
  return (
    <motion.div
      initial={{ y: direction === 'up' ? 100 : -100, opacity: 0 }}
      whileInView={{ 
        y: 0, 
        opacity: 1,
        transition: { duration: 1, ease: "easeOut" }
      }}
      viewport={{ once: true, margin: "-100px" }}
      style={{
        y: direction === 'up' ? -100 * speed : 100 * speed
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GlowEffectProps {
  children: ReactNode;
  className?: string;
  color?: string;
  intensity?: number;
}

export function GlowEffect({ 
  children, 
  className, 
  color = '#FF6B6B',
  intensity = 20
}: GlowEffectProps) {
  return (
    <motion.div
      className={cn("relative", className)}
      whileHover={{
        boxShadow: `0 0 ${intensity}px ${color}40, 0 0 ${intensity * 2}px ${color}20`,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
}
