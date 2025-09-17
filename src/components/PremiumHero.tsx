'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useCallback } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo, LogoText } from '@/components/Logo';

interface PremiumHeroProps {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
}

export function PremiumHero({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  backgroundImage
}: PremiumHeroProps) {
  const ref = useRef(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const orbsRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    opacity: number;
    pulsePhase: number;
  }>>([]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const createOrbs = useCallback((canvas: HTMLCanvasElement) => {
    orbsRef.current = [];
    const orbCount = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 12);
    
    for (let i = 0; i < orbCount; i++) {
      orbsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 100 + 80,
        color: [
          'rgba(16, 185, 129, 0.2)',   // Magic emerald
          'rgba(245, 158, 11, 0.2)',   // Magic amber
          'rgba(234, 179, 8, 0.2)',    // Magic gold
          'rgba(52, 211, 153, 0.2)',   // Magic mint
          'rgba(5, 150, 105, 0.2)',    // Magic forest
        ][Math.floor(Math.random() * 5)],
        opacity: Math.random() * 0.5 + 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
      createOrbs(canvas);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      orbsRef.current.forEach((orb) => {
        // Update position
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce off edges with some damping
        if (orb.x - orb.radius < 0 || orb.x + orb.radius > window.innerWidth) {
          orb.vx *= -0.7;
          orb.x = Math.max(orb.radius, Math.min(window.innerWidth - orb.radius, orb.x));
        }
        if (orb.y - orb.radius < 0 || orb.y + orb.radius > window.innerHeight) {
          orb.vy *= -0.7;
          orb.y = Math.max(orb.radius, Math.min(window.innerHeight - orb.radius, orb.y));
        }

        // Update pulse phase
        orb.pulsePhase += 0.015;
        const pulseScale = 1 + Math.sin(orb.pulsePhase) * 0.15;

        // Create gradient
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius * pulseScale
        );
        
        gradient.addColorStop(0, orb.color.replace('0.2', '0.6'));
        gradient.addColorStop(0.3, orb.color.replace('0.2', '0.3'));
        gradient.addColorStop(0.7, orb.color.replace('0.2', '0.15'));
        gradient.addColorStop(1, orb.color.replace('0.2', '0.05'));

        // Draw main orb
        ctx.save();
        ctx.globalAlpha = orb.opacity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Add outer glow
        ctx.save();
        ctx.shadowColor = orb.color.split(',')[0] + ', 1)';
        ctx.shadowBlur = 40;
        ctx.globalAlpha = orb.opacity * 0.3;
        ctx.fillStyle = orb.color.replace('0.2', '0.4');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * pulseScale * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Add connecting lines between nearby orbs
      orbsRef.current.forEach((orb1, i) => {
        orbsRef.current.slice(i + 1).forEach((orb2) => {
          const dx = orb1.x - orb2.x;
          const dy = orb1.y - orb2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 300) {
            const opacity = (1 - distance / 300) * 0.2;
            ctx.save();
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(orb1.x, orb1.y);
            ctx.lineTo(orb2.x, orb2.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [createOrbs]);

  return (
    <section 
      ref={ref}
      className="relative full-screen-section clean-gradient overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-8"
        >
          <Logo size="lg" className="mx-auto mb-6" />
          <LogoText size="lg" className="mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {subtitle}
          </h2>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight"
        >
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
          className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
        >
          {description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
        >
                      <Button
              size="lg"
              className="text-lg px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg"
            >
            <span className="flex items-center gap-3">
              {ctaText}
              <ArrowRight className="w-6 h-6" />
            </span>
          </Button>

          <motion.div
            className="flex items-center gap-2 text-gray-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-medium">Simple & Elegant</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-gray-400 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
