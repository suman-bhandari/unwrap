'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { TextRevealButton } from '@/components/ui/shadcn-io/text-reveal-button';
import { UserMenu } from '@/components/UserMenu';

interface HeaderProps {
  showUserMenu?: boolean;
  className?: string;
}

export function Header({ showUserMenu = true, className = '' }: HeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-b border-emerald-200/30 ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/unwrap_log.svg" 
                alt="Unwrap Logo" 
                width={48}
                height={48}
                className="h-12 w-auto"
              />
              <TextRevealButton
                text="Unwrap"
                revealColor="#FFD700"
                revealGradient="linear-gradient(90deg, #B347FF, #FFB800, #37FF8B)"
                className="hidden sm:block"
              />
            </Link>
          </motion.div>
          
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {showUserMenu && <UserMenu />}
          </motion.div>
        </div>
      </div>
    </header>
  );
}
