'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Send, ArrowLeft, Mail, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextRevealButton } from '@/components/ui/shadcn-io/text-reveal-button';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BentoGrid, BentoCard } from '@/components/BentoGrid';
import { AnimatedText } from '@/components/AnimatedComponents';
import { FileUpload } from '@/components/FileUpload';
import { VideoRecorder } from '@/components/VideoRecorder';
import { toast } from 'sonner';
import FireworksBackground from '@/components/ui/shadcn-io/fireworks-background';
import { PostcardPreview } from '@/components/PostcardPreview';
import { createClient } from '@/lib/supabase';

// Helper function to convert File to data URL
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function CreateGiftPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    recipientEmail: '',
    recipientName: '',
    title: '',
    message: '',
    scheduledFor: '',
    venue: '',
    dateTime: '',
    city: ''
  });
  
  const [giftImages] = useState<File[]>([]);
  const [qrFiles, setQrFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState<'now' | 'schedule'>('now');
  const [deliveryMethod, setDeliveryMethod] = useState<'email' | 'link'>('email');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  const steps = [
    { id: 1, title: 'Experience Details', description: 'Who is this for and what are the details?' },
    { id: 2, title: 'Personal Touch', description: 'Add your message (required)' },
    { id: 3, title: 'Schedule & Send', description: 'When to deliver' },
  ];


  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check authentication status
        
        // Check if Supabase is properly configured
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('Supabase not configured - redirecting to login');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        const { data: { user }, error } = await supabase.auth.getUser();
        // Set authentication state based on user presence
        if (error) {
          console.error('Auth error:', error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Only set up auth listener if Supabase is configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setIsAuthenticated(!!session?.user);
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [supabase.auth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Auto-generate link when Create Link is selected
  useEffect(() => {
    if (currentStep === 3 && deliveryMethod === 'link' && !generatedLink) {
      console.log('Auto-generating link for Create Link delivery method');
      generateShareableLink();
    }
  }, [currentStep, deliveryMethod, generatedLink, generateShareableLink]);

  const generateShareableLink = async () => {
    console.log('generateShareableLink called');
    setIsGeneratingLink(true);
    try {
      // Validate required fields before generating link
      if (!formData.recipientName || !formData.title || !formData.venue || !formData.dateTime || !formData.city) {
        toast.error('Please fill in all required fields before generating link', {
          style: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        setIsGeneratingLink(false);
        return;
      }
      

      if (!formData.message && !videoFile) {
        toast.error('Please add either a written message or video message before generating link', {
          style: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        setIsGeneratingLink(false);
        return;
      }

      // Generate a unique ID for the gift
      const giftId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Convert video file to data URL if it exists
      const videoDataURL = videoFile ? await fileToDataURL(videoFile) : null;
      
      // Create gift data
      const giftData = {
        id: giftId,
        ...formData,
        senderName: 'Gift Creator', // In a real app, get this from authenticated user
        giftImages: giftImages.map(file => file.name),
        qrFiles: qrFiles.map(file => file.name),
        videoFile: videoDataURL,
        totalFiles: giftImages.length + qrFiles.length + (videoFile ? 1 : 0),
        isOpened: false,
        scheduledFor: formData.scheduledFor || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      console.log('Form data before storing:', formData);
      console.log('Gift data being stored:', giftData);
      console.log('dateTime in formData:', formData.dateTime);
      console.log('dateTime in giftData:', giftData.dateTime);

      // Store the gift data in localStorage (in a real app, this would be stored in a database)
      const existingGifts = JSON.parse(localStorage.getItem('gifts') || '[]');
      existingGifts.push(giftData);
      localStorage.setItem('gifts', JSON.stringify(existingGifts));

      const link = `${window.location.origin}/gift/${giftId}`;
      console.log('Generated link:', link);
      console.log('Gift data stored:', giftData);
      setGeneratedLink(link);
      
      toast.success('Shareable link generated successfully!', {
        style: {
          backgroundColor: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0'
        }
      });
    } catch (error) {
      console.error('Link generation error:', error);
      toast.error('Failed to generate link. Please try again.', {
        style: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('Link copied to clipboard!', {
        style: {
          backgroundColor: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0'
        }
      });
    } catch (error) {
      toast.error('Failed to copy link. Please try again.', {
        style: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
    }
  };

  const handleNext = () => {
    // Validate required fields based on current step BEFORE navigation
    if (currentStep === 1) {
      if (!formData.recipientName || !formData.title || !formData.venue || !formData.dateTime || !formData.city) {
        toast.error('Please fill in all required fields: recipient name, experience title, venue/location, date & time, and city/timezone', {
          style: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!formData.message && !videoFile) {
        toast.error('Please add either a written message or video message', {
          style: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        return;
      }
    }
    
    // Handle step 3 specific logic
    if (currentStep === 3) {
      // If schedule option is selected, require date/time
      if (deliveryOption === 'schedule' && !formData.scheduledFor) {
        toast.error('Please select a delivery date and time', {
          style: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        return;
      }
      
      // If email delivery is selected, require recipient email
      if (deliveryMethod === 'email' && !formData.recipientEmail) {
        toast.error('Please enter recipient email for email delivery', {
          style: {
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            border: '1px solid #fecaca'
          }
        });
        return;
      }
      
      // If email delivery is selected, submit directly
      if (deliveryMethod === 'email') {
        handleSubmit();
        return;
      }
      
      // If link delivery is selected and link is generated, submit
      if (deliveryMethod === 'link' && generatedLink) {
        handleSubmit();
        return;
      }
      
      // If link delivery is selected but no link yet, wait for auto-generation
      if (deliveryMethod === 'link' && !generatedLink) {
        return; // Link will be auto-generated by useEffect
      }
    }
    
    // Navigate to next step for steps 1-2 (only after validation passes)
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.recipientName || !formData.title || !formData.venue || !formData.dateTime || !formData.city) {
      toast.error('Please fill in all required fields: recipient name, experience title, venue/location, date & time, and city/timezone', {
        style: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
      return;
    }
    
    
    if (!formData.message && !videoFile) {
      toast.error('Please add either a written message or video message', {
        style: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
      return;
    }
    
    // If schedule option is selected, require date/time
    if (deliveryOption === 'schedule' && !formData.scheduledFor) {
      toast.error('Please select a delivery date and time', {
        style: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
      return;
    }
    
    // If email delivery is selected, require recipient email
    if (deliveryMethod === 'email' && !formData.recipientEmail) {
      toast.error('Please enter recipient email for email delivery', {
        style: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca'
        }
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Generate a unique ID for the gift
      const giftId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Convert video file to data URL if it exists
      const videoDataURL = videoFile ? await fileToDataURL(videoFile) : null;
      
      const giftData = {
        id: giftId,
        ...formData,
        senderName: 'Gift Creator', // In a real app, get this from authenticated user
        giftImages: giftImages.map(file => file.name),
        qrFiles: qrFiles.map(file => file.name),
        videoFile: videoDataURL,
        totalFiles: giftImages.length + qrFiles.length + (videoFile ? 1 : 0),
        isOpened: false,
        scheduledFor: formData.scheduledFor || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      console.log('Email submission - Form data:', formData);
      console.log('Email submission - Gift data:', giftData);
      console.log('dateTime in formData:', formData.dateTime);
      console.log('dateTime in giftData:', giftData.dateTime);

      // Store the gift data in localStorage (for testing purposes)
      const existingGifts = JSON.parse(localStorage.getItem('gifts') || '[]');
      existingGifts.push(giftData);
      localStorage.setItem('gifts', JSON.stringify(existingGifts));
      console.log('Gift stored in localStorage for testing');

      // Send the gift email
      const response = await fetch('/api/send-gift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(giftData),
      });

      const result = await response.json();

      if (result.success) {
        if (result.isDevelopment) {
          toast.success('🎁 Gift created successfully! (Development mode - check console for details)');
          console.log('🎁 Gift created successfully!');
          console.log('📧 Email simulation complete - recipient would be:', formData.recipientEmail);
          console.log('🔗 Recipient would visit:', window.location.origin + '/gift/' + giftId);
          console.log('💡 To send real emails, verify a domain in your Resend account');
        } else {
          toast.success('🎁 Gift sent successfully! Email delivered to ' + formData.recipientEmail);
        }
        console.log('Gift sent:', result);
        
        // Redirect back to home after success
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error('Failed to send gift: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Send gift error:', err);
      toast.error('Failed to send gift. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-black flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-amber-50 dark:from-neutral-950 dark:via-neutral-950 dark:to-black">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
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
        </div>
        
        <Button 
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-semibold shadow-lg border-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </header>

      <div className="container mx-auto px-4 py-8 relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <FireworksBackground
            className="w-full h-full pointer-events-none"
            population={0.5}
            color={["#FFD700", "#10B981", "#60A5FA"]}
            fireworkSpeed={3}
            fireworkSize={3}
            particleSpeed={3}
            particleSize={2}
          />
        </div>
        <BentoGrid className="max-w-8xl mx-auto">

          {/* Step Navigation Card */}
          <BentoCard size="xl" variant="glass" delay={0.4}>
            <div className="flex justify-between w-full">
              {steps.map((step) => (
                <motion.div
                  key={step.id}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-full transition-all duration-300 flex-1 justify-center ${
                    step.id === currentStep
                      ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg scale-105'
                      : step.id < currentStep
                      ? 'bg-gradient-to-r from-emerald-500/20 to-blue-600/20 text-emerald-600 hover:from-emerald-500/30 hover:to-blue-600/30'
                      : 'bg-gradient-to-r from-emerald-500/10 to-blue-600/10 text-muted-foreground hover:from-emerald-500/20 hover:to-blue-600/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                    {step.id}
                  </div>
                  <span className="font-medium text-sm">{step.title}</span>
                </motion.div>
              ))}
            </div>
          </BentoCard>

          {/* Main Content Grid */}
          <BentoGrid className="col-span-full">
            {/* Form Section - left */}
            <BentoCard size="xl" variant="glass" delay={0.6}>
              <div className="space-y-6">
                <AnimatedText delay={0.8}>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold mb-2">{steps[currentStep - 1].title}</h2>
                    <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
                  </div>
                </AnimatedText>
                  {/* Step 1: Experience Details (Combined Recipient + Details) */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      {/* Recipient Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Who is this experience for?</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="recipientName">Recipient Name *</Label>
                            <Input
                              id="recipientName"
                              type="text"
                              placeholder="Their name"
                              value={formData.recipientName}
                              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="title">Experience Title *</Label>
                            <Input
                              id="title"
                              type="text"
                              placeholder="e.g., Dinner at Sunset Restaurant"
                              value={formData.title}
                              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Experience Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Experience Details</h3>
                        <Tabs defaultValue="details" className="w-full">
                          <TabsList className="grid w-full grid-cols-2 h-8">
                            <TabsTrigger value="details" className="text-xs py-1 px-2 border border-gray-300">Details</TabsTrigger>
                            <TabsTrigger value="qr" className="text-xs py-1 px-2 border border-gray-300">QR/Tickets</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="details" className="space-y-4">
                            <div className="space-y-2">
                              <Label>Venue/Location *</Label>
                              <Input 
                                placeholder="Name or location" 
                                value={formData.venue}
                                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Date & Time *</Label>
                              <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                  <Input 
                                    type="date" 
                                    min={new Date().toISOString().slice(0, 10)}
                                    value={formData.dateTime ? formData.dateTime.split('T')[0] : ''}
                                    onChange={(e) => {
                                      const date = e.target.value;
                                      const time = formData.dateTime ? formData.dateTime.split('T')[1] : '12:00';
                                      if (date) {
                                        setFormData({ ...formData, dateTime: `${date}T${time}` });
                                      } else {
                                        setFormData({ ...formData, dateTime: '' });
                                      }
                                    }}
                                    required
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour</label>
                                  <select
                                    value={formData.dateTime ? (() => {
                                      const time = formData.dateTime.split('T')[1];
                                      const hour24 = parseInt(time.split(':')[0]);
                                      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
                                      return hour12.toString();
                                    })() : '12'}
                                    onChange={(e) => {
                                      const hour12 = parseInt(e.target.value);
                                      const date = formData.dateTime ? formData.dateTime.split('T')[0] : new Date().toISOString().slice(0, 10);
                                      const time = formData.dateTime ? formData.dateTime.split('T')[1] : '12:00';
                                      const minutes = time.split(':')[1];
                                      const isPM = formData.dateTime ? (() => {
                                        const hour24 = parseInt(time.split(':')[0]);
                                        return hour24 >= 12;
                                      })() : false;
                                      
                                      const hour24 = hour12 === 12 ? (isPM ? 12 : 0) : (isPM ? hour12 + 12 : hour12);
                                      const newTime = `${hour24.toString().padStart(2, '0')}:${minutes}`;
                                      setFormData({ ...formData, dateTime: `${date}T${newTime}` });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                                    <option value="10">10</option>
                                    <option value="11">11</option>
                                    <option value="12">12</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Minutes</label>
                                  <select
                                    value={formData.dateTime ? formData.dateTime.split('T')[1].split(':')[1] : '00'}
                                    onChange={(e) => {
                                      const minutes = e.target.value;
                                      const date = formData.dateTime ? formData.dateTime.split('T')[0] : new Date().toISOString().slice(0, 10);
                                      const time = formData.dateTime ? formData.dateTime.split('T')[1] : '12:00';
                                      const hour = time.split(':')[0];
                                      const newTime = `${hour}:${minutes}`;
                                      setFormData({ ...formData, dateTime: `${date}T${newTime}` });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="00">00</option>
                                    <option value="15">15</option>
                                    <option value="30">30</option>
                                    <option value="45">45</option>
                                  </select>
                                </div>
                                <div className="flex-1">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">AM/PM</label>
                                  <select
                                    value={formData.dateTime ? (() => {
                                      const time = formData.dateTime.split('T')[1];
                                      const hour24 = parseInt(time.split(':')[0]);
                                      return hour24 >= 12 ? 'PM' : 'AM';
                                    })() : 'PM'}
                                    onChange={(e) => {
                                      const ampm = e.target.value;
                                      const date = formData.dateTime ? formData.dateTime.split('T')[0] : new Date().toISOString().slice(0, 10);
                                      const time = formData.dateTime ? formData.dateTime.split('T')[1] : '12:00';
                                      const hour24 = parseInt(time.split(':')[0]);
                                      const minutes = time.split(':')[1];
                                      
                                      let newHour24;
                                      if (ampm === 'AM') {
                                        newHour24 = hour24 === 12 ? 0 : hour24;
                                      } else {
                                        newHour24 = hour24 === 12 ? 12 : hour24 + 12;
                                      }
                                      
                                      const newTime = `${newHour24.toString().padStart(2, '0')}:${minutes}`;
                                      setFormData({ ...formData, dateTime: `${date}T${newTime}` });
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>City/Timezone *</Label>
                              <select 
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                required
                              >
                                <option value="">Select a city</option>
                                <option value="New York">New York (EST)</option>
                                <option value="Los Angeles">Los Angeles (PST)</option>
                                <option value="Chicago">Chicago (CST)</option>
                                <option value="Denver">Denver (MST)</option>
                                <option value="London">London (GMT)</option>
                                <option value="Paris">Paris (CET)</option>
                                <option value="Tokyo">Tokyo (JST)</option>
                                <option value="Sydney">Sydney (AEST)</option>
                                <option value="Dubai">Dubai (GST)</option>
                                <option value="Mumbai">Mumbai (IST)</option>
                                <option value="Singapore">Singapore (SGT)</option>
                                <option value="Hong Kong">Hong Kong (HKT)</option>
                                <option value="Toronto">Toronto (EST)</option>
                                <option value="Vancouver">Vancouver (PST)</option>
                                <option value="Berlin">Berlin (CET)</option>
                                <option value="Rome">Rome (CET)</option>
                                <option value="Madrid">Madrid (CET)</option>
                                <option value="Amsterdam">Amsterdam (CET)</option>
                                <option value="Stockholm">Stockholm (CET)</option>
                                <option value="Moscow">Moscow (MSK)</option>
                                <option value="Cairo">Cairo (EET)</option>
                                <option value="Johannesburg">Johannesburg (SAST)</option>
                                <option value="São Paulo">São Paulo (BRT)</option>
                                <option value="Buenos Aires">Buenos Aires (ART)</option>
                                <option value="Mexico City">Mexico City (CST)</option>
                              </select>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="qr" className="space-y-4">
                            <FileUpload
                              accept="image/*,.pdf,.png,.jpg,.jpeg"
                              multiple={true}
                              onUpload={setQrFiles}
                              maxFiles={3}
                              maxSize={5}
                            />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Personal Touch */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <Tabs defaultValue="message" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-8">
                          <TabsTrigger value="message" className="text-xs py-1 px-2 border border-gray-300">Written Message *</TabsTrigger>
                          <TabsTrigger value="video" className="text-xs py-1 px-2 border border-gray-300">Video Message *</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="message" className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">Your Message</Label>
                            <textarea
                              id="message"
                              className="w-full p-3 border border-input rounded-md bg-background"
                              rows={6}
                              placeholder="Write a heartfelt message to accompany your gift..."
                              value={formData.message}
                              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="video" className="space-y-4">
                          <div className="flex justify-center">
                            <VideoRecorder
                              onVideoReady={setVideoFile}
                              maxDuration={60}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  )}

                  {/* Step 3: Schedule & Send */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">When should this gift be delivered?</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            variant={deliveryOption === 'now' ? 'default' : 'outline'}
                            className={`h-20 flex flex-col gap-2 ${deliveryOption === 'now' ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' : ''}`}
                            onClick={() => {
                              setDeliveryOption('now');
                              setFormData({ ...formData, scheduledFor: '' });
                            }}
                          >
                            <Send className="w-6 h-6" />
                            <span>Send Now</span>
                          </Button>
                          
                          <Button
                            variant={deliveryOption === 'schedule' ? 'default' : 'outline'}
                            className={`h-20 flex flex-col gap-2 ${deliveryOption === 'schedule' ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' : ''}`}
                            onClick={() => {
                              setDeliveryOption('schedule');
                              // Focus on the date input after a short delay
                              setTimeout(() => {
                                const dateInput = document.getElementById('scheduledFor');
                                dateInput?.focus();
                              }, 100);
                            }}
                          >
                            <Calendar className="w-6 h-6" />
                            <span>Schedule</span>
                          </Button>
                        </div>
                        
                        {deliveryOption === 'schedule' && (
                          <div className="space-y-2">
                            <Label htmlFor="scheduledFor">Delivery Date & Time</Label>
                            <Input
                              id="scheduledFor"
                              type="datetime-local"
                              value={formData.scheduledFor}
                              onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                            />
                          </div>
                        )}
                        
                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">How would you like to deliver this gift?</h3>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <Button
                              variant={deliveryMethod === 'email' ? 'default' : 'outline'}
                              className={`h-20 flex flex-col gap-2 ${deliveryMethod === 'email' ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' : ''}`}
                              onClick={() => setDeliveryMethod('email')}
                            >
                              <Mail className="w-6 h-6" />
                              <span>Email</span>
                            </Button>
                            
                            <Button
                              variant={deliveryMethod === 'link' ? 'default' : 'outline'}
                              className={`h-20 flex flex-col gap-2 ${deliveryMethod === 'link' ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white' : ''}`}
                              onClick={() => setDeliveryMethod('link')}
                            >
                              <LinkIcon className="w-6 h-6" />
                              <span>Create Link</span>
                            </Button>
                          </div>
                          
                          {deliveryMethod === 'email' && (
                            <div className="space-y-2">
                              <Label htmlFor="recipientEmail">Recipient Email *</Label>
                              <Input
                                id="recipientEmail"
                                type="email"
                                placeholder="their@email.com"
                                value={formData.recipientEmail}
                                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                required
                              />
                            </div>
                          )}
                        </div>
                        
                        
                        {deliveryMethod === 'link' && (
                          <div className="space-y-4">
                            {generatedLink ? (
                              <>
                                <div className="bg-muted/50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">Your shareable link:</h4>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      value={generatedLink}
                                      readOnly
                                      className="flex-1 font-mono text-sm"
                                    />
                                    <Button
                                      onClick={copyToClipboard}
                                      variant="outline"
                                      size="sm"
                                    >
                                      Copy
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">How to share:</h4>
                                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                    <li>• Send via text message</li>
                                    <li>• Share on social media</li>
                                    <li>• Send through email</li>
                                    <li>• Share on any messaging platform</li>
                                  </ul>
                                </div>
                              </>
                            ) : (
                              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Generating your shareable link...</h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                  Please wait while we create your unique link.
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}


                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    <Button
                      variant="outline"
                      onClick={handlePrev}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    
                    {currentStep === steps.length ? (
                      <Button
                        onClick={handleSubmit}
                        className="hover-lift bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-blue-600 hover:to-emerald-500 text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Gift
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNext} 
                        disabled={isGeneratingLink}
                        className="hover-lift bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-blue-600 hover:to-emerald-500 text-white"
                      >
                        {isGeneratingLink ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Generating Link...
                          </>
                        ) : (
                          'Next'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </BentoCard>

            {/* Preview Section - right */}
            <BentoCard size="xl" variant="magical" delay={0.8}>
              <div className="text-center space-y-6">
                <AnimatedText delay={1.0}>
                  <h3 className="text-xl font-bold mb-2">Preview</h3>
                  <p className="text-muted-foreground mb-4">How your gift will appear</p>
                </AnimatedText>
                
                {/* Postcard Preview */}
                <AnimatedText delay={1.2}>
                  <PostcardPreview
                    formData={formData}
                    giftImages={giftImages}
                    qrFiles={qrFiles}
                    videoFile={videoFile}
                    message={formData.message}
                    isLocked={false}
                  />
                </AnimatedText>
              </div>
            </BentoCard>

            {/* Tips Card removed as requested */}
          </BentoGrid>
        </BentoGrid>

        {/* Footer */}
        <div className="mt-10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center">
              <motion.div 
                className="mb-2 text-lg text-[#00414e]"
                whileHover={{ scale: 1.05 }}
              >
                © 2025 <span className="bg-gradient-to-r from-[#B347FF] via-[#FFB800] to-[#37FF8B] bg-clip-text text-transparent font-semibold">Unwrap</span>. All rights reserved.
              </motion.div>
              <div className="text-sm text-[#00414e]">
                Premium Experience Gift Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
