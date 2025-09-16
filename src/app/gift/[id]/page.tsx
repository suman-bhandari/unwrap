'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { PostcardPreview } from '@/components/PostcardPreview';

interface GiftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function GiftPage({ params }: GiftPageProps) {
  const [gift, setGift] = useState<{
    id: string;
    recipientName: string;
    title: string;
    message: string;
    videoUrl?: string;
    giftImageUrl?: string;
    qrCodeUrl?: string;
    reservationDetails?: any;
    scheduledFor?: string;
    isOpened: boolean;
    openedAt?: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCalculatingCountdown, setIsCalculatingCountdown] = useState(true);

  useEffect(() => {
    // Load gift data from localStorage
    const loadGift = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        const gifts = JSON.parse(localStorage.getItem('gifts') || '[]');
        const foundGift = gifts.find((g: { id: string }) => g.id === resolvedParams.id);
        console.log('Found gift from localStorage:', foundGift);
        console.log('Gift dateTime field:', foundGift?.dateTime);
        console.log('Gift scheduledFor field:', foundGift?.scheduledFor);
        console.log('All gift fields:', Object.keys(foundGift || {}));
        console.log('Form data keys that should be present:', ['id', 'title', 'message', 'senderName', 'recipientName', 'venue', 'dateTime', 'city', 'scheduledFor']);
        console.log('Raw localStorage data:', localStorage.getItem('gifts'));
        
        if (foundGift) {
          // Transform the stored data to match the expected format
          const transformedGift = {
            id: foundGift.id,
            title: foundGift.title,
            message: foundGift.message,
            senderName: foundGift.senderName,
            recipientName: foundGift.recipientName,
            scheduledFor: foundGift.scheduledFor,
            isOpened: foundGift.isOpened || false,
            giftImages: foundGift.giftImages || [],
            qrFiles: foundGift.qrFiles || [],
            videoFile: foundGift.videoFile,
            videoUrl: foundGift.videoUrl,
            venue: foundGift.venue,
            dateTime: foundGift.dateTime,
            city: foundGift.city,
            reservationDetails: {
              type: 'experience',
              venue: foundGift.venue,
              date: foundGift.dateTime,
              city: foundGift.city,
              details: foundGift.title
            }
          };
          console.log('Transformed gift:', transformedGift);
          setGift(transformedGift);
          
          // Calculate initial countdown immediately if gift has a future date
          if (transformedGift.dateTime && !transformedGift.isOpened) {
            const eventTime = new Date(transformedGift.dateTime).getTime();
            const unlockTime = eventTime - (24 * 60 * 60 * 1000);
            const now = new Date().getTime();
            const initialCountdown = Math.max(0, Math.floor((unlockTime - now) / 1000));
            setCountdown(initialCountdown);
            console.log('Initial countdown calculated:', initialCountdown);
          }
        } else {
          setError('Gift not found');
        }
      } catch (err) {
        console.error('Error loading gift:', err);
        setError('Failed to load gift');
      } finally {
        setLoading(false);
        setIsCalculatingCountdown(false);
      }
    };

    loadGift();
  }, [params]);

  // Handle countdown if gift is scheduled
  useEffect(() => {
    console.log('Countdown useEffect triggered:', { gift: !!gift, dateTime: gift?.dateTime, isOpened: gift?.isOpened, isCalculatingCountdown });
    console.log('Current countdown state:', countdown);
    
    // Only start countdown if we're not still calculating and have valid data
    if (!isCalculatingCountdown && gift && gift.dateTime && !gift.isOpened && countdown > 0) {
      console.log('Starting countdown interval for gift:', gift);
      
      const eventTime = new Date(gift.dateTime).getTime();
      const unlockTime = eventTime - (24 * 60 * 60 * 1000); // 24 hours before event
      
      console.log('Event time:', new Date(eventTime));
      console.log('Unlock time:', new Date(unlockTime));
      console.log('Current time:', new Date());
      
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const timeUntilUnlock = Math.max(0, Math.floor((unlockTime - now) / 1000));
        console.log('Time until unlock (seconds):', timeUntilUnlock);
        setCountdown(timeUntilUnlock);
        
        if (timeUntilUnlock === 0) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      console.log('Countdown not started because:', {
        isCalculatingCountdown,
        hasGift: !!gift,
        hasDateTime: !!gift?.dateTime,
        isOpened: gift?.isOpened,
        countdown
      });
    }
  }, [gift?.dateTime, gift?.isOpened, isCalculatingCountdown, countdown]);

  const handleUnwrap = async () => {
    if (countdown > 0) {
      const days = Math.floor(countdown / 86400);
      const hours = Math.floor((countdown % 86400) / 3600);
      const minutes = Math.floor((countdown % 3600) / 60);
      const seconds = countdown % 60;
      
      const timeString = days > 0 
        ? `${days}d ${hours}h ${minutes}m ${seconds}s`
        : `${hours}h ${minutes}m ${seconds}s`;
      
      toast.error(`This gift unlocks in ${timeString}! This gift unlocks 24 hours before the event.`);
      return;
    }

    setIsUnwrapped(true);
    setShowConfetti(true);
    
    // Track gift opening
    try {
        setGift((prev) => prev ? { ...prev, isOpened: true } : null);
      toast.success('Gift unwrapped! 🎉');
    } catch (error) {
      console.error('Error tracking gift open:', error);
    }

    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const isLocked = countdown > 0;
  console.log('isLocked:', isLocked, 'countdown:', countdown);
  console.log('Gift dateTime:', gift?.dateTime);
  console.log('Gift isOpened:', gift?.isOpened);
  console.log('Should show countdown display:', countdown > 0 && gift?.dateTime && !gift?.isOpened);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 relative overflow-hidden">
      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                }}
                initial={{ y: -10, opacity: 1, rotate: 0 }}
                animate={{
                  y: window.innerHeight + 10,
                  opacity: [1, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {loading || isCalculatingCountdown ? (
            <div className="text-center space-y-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">Loading your gift...</p>
            </div>
          ) : error ? (
            <div className="text-center space-y-8">
              <div className="text-6xl">🎁</div>
              <h1 className="text-4xl font-bold text-red-600">Gift Not Found</h1>
              <p className="text-lg text-muted-foreground">{error}</p>
              <p className="text-sm text-muted-foreground">
                The gift you&apos;re looking for doesn&apos;t exist or may have been removed.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Countdown Display */}
              {countdown > 0 && gift?.dateTime && !gift?.isOpened && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-blue-200 dark:border-gray-700"
                >
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      🎊 Ready to Unwrap In
                    </h2>
                    <div className="flex justify-center space-x-4 text-3xl font-mono font-bold text-blue-600 dark:text-blue-400">
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                        {Math.floor(countdown / 86400).toString().padStart(2, '0')}
                        <div className="text-sm font-normal text-gray-500">Days</div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 flex items-center">:</div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                        {Math.floor((countdown % 86400) / 3600).toString().padStart(2, '0')}
                        <div className="text-sm font-normal text-gray-500">Hours</div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 flex items-center">:</div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                        {Math.floor((countdown % 3600) / 60).toString().padStart(2, '0')}
                        <div className="text-sm font-normal text-gray-500">Minutes</div>
                      </div>
                      <div className="text-blue-600 dark:text-blue-400 flex items-center">:</div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-lg">
                        {(countdown % 60).toString().padStart(2, '0')}
                        <div className="text-sm font-normal text-gray-500">Seconds</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>This gift unlocks 24 hours before the event.</strong>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Gift Display using PostcardPreview */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex justify-center"
              >
                <PostcardPreview
                  formData={gift}
                  giftImages={[]}
                  qrFiles={[]}
                  videoFile={gift.videoFile}
                  message={gift.message}
                  isLocked={isLocked}
                  onUnlock={handleUnwrap}
                  countdown={countdown}
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}