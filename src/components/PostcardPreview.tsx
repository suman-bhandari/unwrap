'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react';

interface PostcardPreviewProps {
  formData: {
    title: string;
    recipientName: string;
    message: string;
    venue: string;
    dateTime: string;
    city: string;
  };
  senderName?: string;
  giftImages: File[];
  qrFiles: File[];
  videoFile: File | string | null;
  message: string;
  isLocked?: boolean;
  onUnlock?: () => void;
  countdown?: number;
}

export function PostcardPreview({ 
  formData, 
  senderName = 'User',
  giftImages, 
  qrFiles, 
  videoFile, 
  message, 
  isLocked = false, 
  onUnlock,
  countdown = 0
}: PostcardPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [canOpen, setCanOpen] = useState(false);

  // Update canOpen based on countdown and lock status
  useEffect(() => {
    if (countdown > 0) {
      // If there's a countdown, the gift should be locked
      setCanOpen(false);
    } else if (isLocked) {
      // If there's no countdown but it was locked, unlock it
      setCanOpen(true);
    } else {
      // If there's no countdown and it wasn't locked, it's open
      setCanOpen(true);
    }
  }, [countdown, isLocked]);

  // Also check on mount to handle initial state
  useEffect(() => {
    if (countdown > 0) {
      setCanOpen(false);
    }
  }, []);

  const pages = [
    {
      content: (
        <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-pink-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <img 
            src="/unwrap_log.svg" 
            alt="Unwrap Logo" 
            className="h-32 w-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-white">
            {formData.title}
          </h2>
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-300">From: {senderName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">To: {formData.recipientName}</p>
          </div>
        </div>
      )
    },
    {
      content: (
        <div className="h-full p-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center">
          <div className="text-center">
            <p className="text-lg leading-relaxed text-gray-800 dark:text-white whitespace-pre-line text-left">
              {message}
            </p>
          </div>
        </div>
      )
    },
    ...(videoFile ? [{
      content: (
        <div className="h-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <video 
            controls 
            className="w-full max-w-sm rounded-lg shadow-lg"
            src={typeof videoFile === 'string' ? videoFile : URL.createObjectURL(videoFile)}
          />
        </div>
      )
    }] : []),
    {
      content: (
        <div className="h-full p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-900 flex flex-col justify-center space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">📍</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 text-left">Venue: {formData.venue}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">📅</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 text-left">Date & Time: {new Date(formData.dateTime).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌍</span>
              <span className="text-sm text-gray-700 dark:text-gray-300 text-left">City: {formData.city}</span>
            </div>
          </div>
          
          {qrFiles.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-center">
                <div className={`grid gap-3 max-w-sm ${qrFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {qrFiles.map((file, index) => (
                    <div key={index} className="flex justify-center">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`QR/Ticket ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-xs text-gray-600 dark:text-gray-400">PDF</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  ];

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % pages.length);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + pages.length) % pages.length);
  };

  const handleUnlock = () => {
    if (onUnlock) {
      onUnlock();
    }
    setCanOpen(true);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden border-4 border-gray-200 dark:border-gray-700">
        {/* Countdown Timer */}
        {!canOpen && countdown > 0 && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <Lock className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold mb-4">Memory Awaits</h3>
              <p className="text-sm mb-4">Some moments are worth waiting for the stars to align.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-white/20 rounded-lg p-2 min-w-0">
                  <div className="text-lg sm:text-2xl font-bold">{Math.floor(countdown / 86400)}</div>
                  <div className="text-xs">Days</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 min-w-0">
                  <div className="text-lg sm:text-2xl font-bold">{Math.floor((countdown % 86400) / 3600)}</div>
                  <div className="text-xs">Hours</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 min-w-0">
                  <div className="text-lg sm:text-2xl font-bold">{Math.floor((countdown % 3600) / 60)}</div>
                  <div className="text-xs">Minutes</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 min-w-0">
                  <div className="text-lg sm:text-2xl font-bold">{countdown % 60}</div>
                  <div className="text-xs">Seconds</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Postcard Content */}
        <div className="relative h-96">
          {pages[currentPage]?.content}
        </div>

        {/* Navigation */}
        {pages.length > 1 && canOpen && (
          <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={prevPage}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex space-x-1">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPage ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextPage}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Unlock Status */}
        {canOpen && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
              <Unlock className="w-4 h-4" />
              <span className="text-sm font-medium">Memory Unlocked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
