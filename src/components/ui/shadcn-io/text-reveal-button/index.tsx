'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TextRevealButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  revealColor?: string;
  strokeColor?: string;
  revealGradient?: string; // optional CSS gradient string
}

export const TextRevealButton = React.forwardRef<
  HTMLButtonElement,
  TextRevealButtonProps
>(({ text = 'Unwrap', revealColor = '#FFD700', strokeColor = 'rgba(100, 100, 100, 0.7)', revealGradient,
  className, style, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative cursor-pointer bg-transparent border-none p-0 m-0 h-auto font-['Arial'] uppercase",
        className
      )}
      style={{
        fontSize: '2em',
        letterSpacing: '3px',
        color: 'transparent',
        WebkitTextStroke: `1px ${strokeColor}` as any,
        ...style,
      }}
      {...props}
    >
      <span>&nbsp;{text}&nbsp;</span>
      <span
        aria-hidden="true"
        className="absolute inset-0 w-0 overflow-hidden transition-all duration-500 group-hover:w-full"
        style={{
          color: revealGradient ? 'transparent' : revealColor,
          borderRight: `6px solid ${revealColor}`,
          WebkitTextStroke: revealGradient ? undefined : (`1px ${revealColor}` as any),
          filter: 'drop-shadow(0 0 23px #FFD700)',
          backgroundImage: revealGradient,
          WebkitBackgroundClip: revealGradient ? ('text' as any) : undefined,
          backgroundClip: revealGradient ? 'text' : undefined,
          WebkitTextFillColor: revealGradient ? ('transparent' as any) : undefined,
        }}
      >
        &nbsp;{text}&nbsp;
      </span>
    </button>
  );
});

TextRevealButton.displayName = 'TextRevealButton';

 