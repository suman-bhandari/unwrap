'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Heart, Clock, User } from 'lucide-react';
import { GiftBox } from '@/components/GiftBox';
import { Logo, LogoText } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Demo gift data
const demoGift = {
  id: 'demo',
  title: 'Anniversary Dinner at Sunset Restaurant',
  message: 'Happy Anniversary! I can&apos;t wait to celebrate this special milestone with you at our favorite place. This dinner is just the beginning of many more magical moments together. Love you always! ❤️',
  senderName: 'Sarah',
  recipientName: 'Michael',
  scheduledFor: null,
  isOpened: false,
  giftImages: [],
  videoUrl: null,
  reservationDetails: {
    type: 'restaurant',
    venue: 'Sunset Restaurant',
    date: '2024-12-20 19:00',
    details: 'Table for 2, Anniversary celebration'
  }
};

export default function DemoGiftPage() {
  const [gift] = useState(demoGift);
  const [isUnwrapped, setIsUnwrapped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleUnwrap = async () => {
    setIsUnwrapped(true);
    setShowConfetti(true);
    
    toast.success('Gift unwrapped! 🎉');

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-center items-center absolute top-0 left-0 right-0 z-20">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo size="md" animated={true} />
          <LogoText size="md" animated={true} />
        </motion.div>
      </header>
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(100)].map((_, i) => {
              const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#45B7D1', '#FFA07A'];
              const shapes = ['circle', 'star', 'heart'];
              const shape = shapes[Math.floor(Math.random() * shapes.length)];
              const color = colors[Math.floor(Math.random() * colors.length)];
              
              return (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-20px',
                  }}
                  initial={{ y: -20, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    y: typeof window !== 'undefined' ? window.innerHeight + 20 : 800,
                    opacity: [1, 1, 0],
                    rotate: [0, 360, 720],
                    scale: [1, 1.5, 0.5],
                    x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    delay: Math.random() * 3,
                    ease: 'easeOut',
                  }}
                >
                  {shape === 'circle' && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  )}
                  {shape === 'star' && (
                    <div className="text-lg" style={{ color }}>★</div>
                  )}
                  {shape === 'heart' && (
                    <div className="text-lg" style={{ color }}>♥</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {!isUnwrapped ? (
            /* Pre-Unwrap State */
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
                    You have a gift!
                  </h1>
                </motion.div>
                
                <div className="flex items-center justify-center gap-2 text-xl text-muted-foreground">
                  <User className="w-5 h-5" />
                  <span>From {gift.senderName}</span>
                </div>
                
                {gift.recipientName && (
                  <p className="text-lg text-muted-foreground">
                    To {gift.recipientName}
                  </p>
                )}
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex justify-center"
              >
                <GiftBox
                  size="lg"
                  isLocked={false}
                  onUnwrap={handleUnwrap}
                  interactive={true}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <Button
                  size="lg"
                  onClick={handleUnwrap}
                  className="text-lg px-8 py-4 hover-lift"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Unwrap Your Gift
                </Button>
                <p className="text-muted-foreground">
                  Click the gift box or button to reveal your surprise!
                </p>
                <p className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-3 max-w-md mx-auto">
                  💡 This is a demo gift. In the real app, you&apos;d receive this via email!
                </p>
              </motion.div>
            </motion.div>
          ) : (
            /* Post-Unwrap State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-4">
                <motion.h1
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl md:text-5xl font-bold gradient-text"
                >
                  {gift.title}
                </motion.h1>
                <div className="flex items-center justify-center gap-2 text-lg text-muted-foreground">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span>From {gift.senderName} with love</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Message Section */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="gift-box-shadow border-0 h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Personal Message
                      </h3>
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg">
                        <p className="text-lg italic leading-relaxed font-handwriting">
                          &ldquo;{gift.message}&rdquo;
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Gift Details */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Card className="gift-box-shadow border-0 h-full">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" />
                        Gift Details
                      </h3>
                      <div className="space-y-4">
                        {gift.reservationDetails && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Venue:</span>
                              <span>{gift.reservationDetails.venue}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Date & Time:</span>
                              <span>{new Date(gift.reservationDetails.date).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Details:</span>
                              <span>{gift.reservationDetails.details}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                          <p className="text-sm text-primary font-medium">
                            🎉 Save this information and enjoy your experience!
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Thank You Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">Want to thank {gift.senderName}?</h3>
                    <p className="text-muted-foreground mb-4">
                      Let them know you received and loved your gift!
                    </p>
                    <Button 
                      className="hover-lift"
                      onClick={() => toast.success('Thank you message sent! ❤️')}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Send Thank You
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
