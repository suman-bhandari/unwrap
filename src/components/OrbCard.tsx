'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PrismBackground from '@/components/ui/shadcn-io/prism-background';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import TypingText from '@/components/ui/shadcn-io/typing-text';

export function OrbCard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => {
      const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      const narrow = window.innerWidth < 640;
      setIsMobile(coarse || narrow);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden bg-neutral-950">
      <div className="absolute inset-0">
        <PrismBackground
          className="w-full h-full"
          animationType={isMobile ? '3drotate' : 'hover'}
          timeScale={isMobile ? 0.5 : 0.6}
          scale={isMobile ? 2.6 : 3.6}
          baseWidth={isMobile ? 4.6 : 5.5}
          height={isMobile ? 3.2 : 3.5}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="group relative"
        >
          <div className="text-center px-8">
            <TypingText
              text={[
                "Create. Unforgettable. Moments.",
                "Craft. Lasting. Memories.",
                "Design. Perfect. Experiences.",
                "Build. Cherished. Stories."
              ]}
              typingSpeed={75}
              pauseDuration={1500}
              deletingSpeed={50}
              showCursor={true}
              loop={true}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              cursorClassName="h-12"
              textColors={['#ffffff']}
              variableSpeed={{ min: 50, max: 120 }}
              startOnVisible={true}
            />
            <div className="mt-4 text-neutral-300 max-w-xl mx-auto">
              Wrap Experiences. Unwrap Joy.
            </div>
            <div className="mt-8">
              <Link href="/create">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="hover-lift bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-amber-500 hover:to-emerald-500 text-white font-semibold shadow-lg px-8 py-3 text-lg">
                    Create Memory
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
