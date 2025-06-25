'use client';

import React, { useEffect, useState, useRef } from 'react';

const VideoBackground = () => {
  const [videoSrc, setVideoSrc] = useState('');
  const [audioOn, setAudioOn] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Time-based video source
  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    let selected = '/videos/bright-day.mp4';
    if (hour >= 4 && hour < 6) selected = '/videos/dawn.mp4';
    else if (hour >= 6 && hour < 11) selected = '/videos/dayrise.mp4';
    else if (hour >= 11 && hour < 16) selected = '/videos/bright-day.mp4';
    else if (hour >= 16 && hour < 18.5) selected = '/videos/sunset.mp4';
    else if (hour >= 18.5 && hour < 20) selected = '/videos/evening.mp4';
    else selected = '/videos/night.mp4';

    setVideoSrc(selected);
  }, []);

  // Pause video when tab is inactive
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        videoRef.current?.pause();
        if (audioRef.current && audioOn) {
          audioRef.current.pause();
        }
      } else {
        videoRef.current?.play();
        if (audioRef.current && audioOn) {
          audioRef.current.play();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [audioOn]);

  // Auto-start audio after first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!userInteracted && audioRef.current) {
        setUserInteracted(true);
        try {
          audioRef.current.volume = 0.3;
          await audioRef.current.play();
          // Keep audioOn as true since it's already true by default
        } catch (error) {
          console.log('Auto-play failed:', error);
          setAudioOn(false); // Set to false only if play fails
        }
      }
    };

    // Listen for any user interaction
    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [userInteracted]);

  // Toggle audio manually
  const handleAudioToggle = async (e) => {
    // Prevent event bubbling to avoid triggering first interaction
    e.stopPropagation();
    
    if (!audioRef.current) return;
    
    try {
      if (audioOn) {
        await audioRef.current.pause();
        setAudioOn(false);
      } else {
        audioRef.current.volume = 0.3;
        await audioRef.current.play();
        setAudioOn(true);
      }
    } catch (error) {
      console.error('Audio toggle failed:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Video */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover fade-in pointer-events-none"
      />

      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        src="/audio/beach.mp3" 
        loop 
        preload="auto"
      />

      {/* Toggle Button */}
      <div className="absolute bottom-6 right-6 z-10">
        <button
          onClick={handleAudioToggle}
          className="px-4 py-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all text-sm font-medium backdrop-blur-sm border border-white/10"
        >
          {audioOn ? '🔊 Audio On' : '🔇 Audio Off'}
        </button>
      </div>

      {/* First interaction prompt (optional) */}
      {!userInteracted && (
        <div className="absolute top-6 left-6 z-10">
          <div className="px-3 py-2 bg-black/40 text-white/80 rounded text-xs backdrop-blur-sm">
            Click anywhere to start audio
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoBackground;