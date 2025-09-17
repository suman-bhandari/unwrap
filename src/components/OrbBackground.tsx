'use client';

import { useEffect, useRef, useCallback } from 'react';

interface OrbBackgroundProps {
  className?: string;
}

export function OrbBackground({ className = '' }: OrbBackgroundProps) {
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

  const createOrbs = useCallback((canvas: HTMLCanvasElement) => {
    orbsRef.current = [];
    const orbCount = Math.min(Math.floor((canvas.width * canvas.height) / 20000), 15);
    
    for (let i = 0; i < orbCount; i++) {
      orbsRef.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 80 + 60,
        color: [
          'rgba(16, 185, 129, 0.15)',   // Magic emerald
          'rgba(245, 158, 11, 0.15)',   // Magic amber
          'rgba(234, 179, 8, 0.15)',    // Magic gold
          'rgba(52, 211, 153, 0.15)',   // Magic mint
          'rgba(5, 150, 105, 0.15)',    // Magic forest
        ][Math.floor(Math.random() * 5)],
        opacity: Math.random() * 0.4 + 0.2,
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
          orb.vx *= -0.8;
          orb.x = Math.max(orb.radius, Math.min(window.innerWidth - orb.radius, orb.x));
        }
        if (orb.y - orb.radius < 0 || orb.y + orb.radius > window.innerHeight) {
          orb.vy *= -0.8;
          orb.y = Math.max(orb.radius, Math.min(window.innerHeight - orb.radius, orb.y));
        }

        // Update pulse phase
        orb.pulsePhase += 0.02;
        const pulseScale = 1 + Math.sin(orb.pulsePhase) * 0.1;

        // Create gradient
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius * pulseScale
        );
        
        gradient.addColorStop(0, orb.color.replace('0.15', '0.4'));
        gradient.addColorStop(0.3, orb.color.replace('0.15', '0.2'));
        gradient.addColorStop(0.7, orb.color.replace('0.15', '0.1'));
        gradient.addColorStop(1, orb.color.replace('0.15', '0.05'));

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
        ctx.shadowBlur = 30;
        ctx.globalAlpha = orb.opacity * 0.2;
        ctx.fillStyle = orb.color.replace('0.15', '0.3');
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius * pulseScale * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Add connecting lines between nearby orbs
      orbsRef.current.forEach((orb1, i) => {
        orbsRef.current.slice(i + 1).forEach((orb2) => {
          const dx = orb1.x - orb2.x;
          const dy = orb1.y - orb2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 250) {
            const opacity = (1 - distance / 250) * 0.15;
            ctx.save();
            ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(orb1.x, orb1.y);
            ctx.lineTo(orb2.x, orb2.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      });

      // Add subtle noise overlay
      ctx.save();
      ctx.globalAlpha = 0.02;
      ctx.fillStyle = 'rgba(16, 185, 129, 1)';
      for (let i = 0; i < 100; i++) {
        ctx.fillRect(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          1,
          1
        );
      }
      ctx.restore();

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
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
}
