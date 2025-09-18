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
    senderName: string;
    title: string;
    message: string;
    videoUrl?: string;
    videoFile?: File | string | null;
    giftImageUrl?: string;
    qrCodeUrl?: string;
    dateTime?: string;
    venue?: string;
    city?: string;
    reservationDetails?: {
      venue?: string;
      city?: string;
      dateTime?: string;
    };
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
    // Load gift data from database
    const loadGift = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        
        // Import createClient dynamically to avoid SSR issues
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        
        console.log('Loading gift with ID:', resolvedParams.id);
        console.log('Using Supabase client for public gift access');
        
        // Fetch gift from database
        console.log('Attempting to fetch gift from database...');
        const { data: foundGift, error } = await supabase
          .from('gifts')
          .select('*')
          .eq('id', resolvedParams.id)
          .single();
        
        if (error) {
          console.error('Error fetching gift:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          setError(`Gift not found: ${error.message}`);
          return;
        }
        
        if (!foundGift) {
          console.log('No gift found with ID:', resolvedParams.id);
          setError(`Gift not found with ID: ${resolvedParams.id}`);
          return;
        }
        
        console.log('Found gift from database:', foundGift);
        
        // Transform the database data to match the expected format
        const transformedGift = {
          id: foundGift.id,
          title: foundGift.title,
          message: foundGift.message,
          senderName: foundGift.sender_name, // Use actual sender name from database
          recipientName: foundGift.recipient_name,
          scheduledFor: foundGift.scheduled_for,
          isOpened: foundGift.is_opened || false,
          giftImages: [],
          qrFiles: [],
          videoFile: foundGift.video_url,
          videoUrl: foundGift.video_url,
          venue: foundGift.reservation_details?.venue,
          dateTime: foundGift.reservation_details?.dateTime,
          city: foundGift.reservation_details?.city,
          createdAt: foundGift.created_at,
          updatedAt: foundGift.updated_at,
          reservationDetails: {
            type: 'experience',
            venue: foundGift.reservation_details?.venue,
            date: foundGift.reservation_details?.dateTime,
            city: foundGift.reservation_details?.city,
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
  }, [gift, gift?.dateTime, gift?.isOpened, isCalculatingCountdown, countdown]);

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

    // Gift is being unwrapped
    setShowConfetti(true);
    
    // Track gift opening in database
    try {
      if (gift) {
        // Import createClient dynamically to avoid SSR issues
        const { createClient } = await import('@/lib/supabase');
        const supabase = createClient();
        
        // Update gift as opened in database
        const { error: updateError } = await supabase
          .from('gifts')
          .update({ 
            is_opened: true, 
            opened_at: new Date().toISOString() 
          })
          .eq('id', gift.id);
        
        if (updateError) {
          console.error('Error updating gift in database:', updateError);
        }
        
        // Track the opening event
        const { error: trackError } = await supabase
          .from('gift_opens')
          .insert({
            gift_id: gift.id,
            opened_at: new Date().toISOString(),
            ip_address: null, // Could be added if needed
            user_agent: navigator.userAgent
          });
        
        if (trackError) {
          console.error('Error tracking gift open:', trackError);
        }
      }
      
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
                  className="flex justify-center"
                >
                  <div className="w-full max-w-md mx-auto">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 sm:p-8 border border-blue-200 dark:border-gray-700">
                      <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-6 text-left">
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        Dear {gift?.recipientName?.split(' ')[0] || 'Friend'},
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                        {gift?.senderName?.split(' ')[0] || 'Someone'} has something magical planned for{' '}
                        {gift?.dateTime ? new Date(gift.dateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'your special day'}. ✨
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
                        Return when the stars align—24 hours before—to unwrap your surprise.
                      </p>
                      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                        Unwrap Team
                      </p>
                      </div>
                    </div>
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
                {gift && gift.venue && gift.dateTime && gift.city && (
                  <PostcardPreview
                    formData={{
                      title: gift.title,
                      recipientName: gift.recipientName,
                      message: gift.message,
                      venue: gift.venue,
                      dateTime: gift.dateTime,
                      city: gift.city
                    }}
                    giftImages={[]}
                    qrFiles={[]}
                    videoFile={gift.videoFile || null}
                    message={gift.message}
                    isLocked={isLocked}
                    onUnlock={handleUnwrap}
                    countdown={countdown}
                  />
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}