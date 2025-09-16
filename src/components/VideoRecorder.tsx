'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Download, Video } from 'lucide-react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface VideoRecorderProps {
  onVideoReady: (file: File) => void;
  maxDuration?: number; // in seconds
}

export function VideoRecorder({ onVideoReady, maxDuration = 60 }: VideoRecorderProps) {
  const webcamRef = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => [...prev, data]);
      }
    },
    []
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopRef = useRef<NodeJS.Timeout | null>(null);

  const downloadVideo = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const file = new File([blob], 'video-message.webm', { type: 'video/webm' });
      
      // Create preview URL
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      
      // Notify parent component
      onVideoReady(file);
    }
  }, [recordedChunks, onVideoReady]);

  const stopRecordingAction = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Clear timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current);
        autoStopRef.current = null;
      }
      
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Auto-save the video after stopping
      setTimeout(() => {
        downloadVideo();
      }, 100);
    }
  };

  const startRecording = useCallback(() => {
    setError('');
    setRecordedChunks([]);
    setVideoUrl('');
    
    if (webcamRef.current?.stream) {
      try {
        const mediaRecorder = new MediaRecorder(webcamRef.current.stream, {
          mimeType: 'video/webm',
        });
        
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        
        // Start timer
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => {
            const newTime = prev + 1;
            if (newTime >= maxDuration) {
              stopRecordingAction();
              return maxDuration;
            }
            return newTime;
          });
        }, 1000);
        
        // Auto-stop at max duration
        autoStopRef.current = setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            stopRecordingAction();
          }
        }, maxDuration * 1000);
        
      } catch (err) {
        setError('Failed to start recording. Please check your camera permissions.');
        console.error('Recording error:', err);
      }
    }
  }, [handleDataAvailable, maxDuration]);

  const resetRecording = () => {
    setRecordedChunks([]);
    setVideoUrl('');
    setRecordingTime(0);
    setError('');
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      // Clear timers on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current);
      }
      // Revoke video URL to prevent memory leaks
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video Message
        </CardTitle>
        <CardDescription>
          Record a personal video message (max {maxDuration}s)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          {!videoUrl ? (
            <Webcam
              ref={webcamRef}
              audio={true}
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              onUserMediaError={(error) => {
                setError('Camera access denied. Please allow camera access to record a video.');
                console.error('Webcam error:', error);
              }}
            />
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
            />
          )}

          {/* Recording indicator */}
          {isRecording && (
            <motion.div
              className="absolute top-2 left-2 flex items-center gap-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
              REC {formatTime(recordingTime)}
            </motion.div>
          )}

          {/* Time remaining */}
          {isRecording && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {formatTime(maxDuration - recordingTime)} left
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2">
          {!isRecording && !videoUrl && (
            <Button onClick={startRecording} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <div className="flex gap-2 flex-1">
              <Button onClick={stopRecordingAction} variant="destructive" className="flex-1 text-black">
                <Square className="w-4 h-4 mr-2" />
                Stop & Save
              </Button>
            </div>
          )}

          {!isRecording && recordedChunks.length > 0 && !videoUrl && (
            <Button onClick={downloadVideo} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Save Video
            </Button>
          )}

          {videoUrl && (
            <Button onClick={resetRecording} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Record Again
            </Button>
          )}
        </div>

        {videoUrl && (
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm text-center">
            ✅ Video recorded successfully! You can record again or continue with this video.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
