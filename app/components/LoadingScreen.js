'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onEnterSite }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [glitchProgress, setGlitchProgress] = useState(0);

  // Get time-based video like VideoBackground component
  const getVideoSrc = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 6) return '/videos/dawn.mp4';
    else if (hour >= 6 && hour < 11) return '/videos/dayrise.mp4';
    else if (hour >= 11 && hour < 16) return '/videos/bright-day.mp4';
    else if (hour >= 16 && hour < 18.5) return '/videos/sunset.mp4';
    else if (hour >= 18.5 && hour < 20) return '/videos/evening.mp4';
    else return '/videos/midnight.mp4';
  };

  // Preload assets and track progress
  useEffect(() => {
    const loadAssets = async () => {
      const videoSrc = getVideoSrc();
      const audioSrc = '/audio/beach.mp3';
      
      let videoLoaded = false;
      let audioLoaded = false;
      let maxProgress = 0;

      const updateOverallProgress = () => {
        let totalProgress = 0;
        if (videoLoaded) totalProgress += 50;
        if (audioLoaded) totalProgress += 50;
        
        // Ensure progress only increases
        if (totalProgress > maxProgress) {
          maxProgress = totalProgress;
          setProgress(maxProgress);
        }
        
        // Complete when both are loaded
        if (videoLoaded && audioLoaded) {
          setProgress(100);
          setTimeout(() => setIsComplete(true), 500);
        }
      };

      // Load video
      const video = document.createElement('video');
      video.preload = 'auto';
      
      const loadVideo = new Promise((resolve) => {
        let videoProgressUpdated = false;

        const handleVideoLoaded = () => {
          if (!videoProgressUpdated) {
            videoLoaded = true;
            videoProgressUpdated = true;
            updateOverallProgress();
            resolve();
          }
        };

        // Multiple fallbacks for video loading
        video.addEventListener('canplaythrough', handleVideoLoaded);
        video.addEventListener('loadeddata', handleVideoLoaded);
        
        // Progress tracking with safeguards
        video.addEventListener('progress', () => {
          if (video.buffered.length > 0 && video.duration) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const loadedPercent = (bufferedEnd / video.duration) * 100;
            
            // Only update if we have significant progress and haven't marked as complete
            if (loadedPercent > 80 && !videoProgressUpdated) {
              handleVideoLoaded();
            }
          }
        });

        video.addEventListener('error', () => {
          console.warn('Video loading error, continuing...');
          handleVideoLoaded(); // Continue even if video fails
        });

        // Timeout fallback
        setTimeout(() => {
          if (!videoProgressUpdated) {
            console.warn('Video loading timeout, continuing...');
            handleVideoLoaded();
          }
        }, 10000); // 10 second timeout

        video.src = videoSrc;
        video.load();
      });

      // Load audio
      const audio = new Audio();
      const loadAudio = new Promise((resolve) => {
        let audioProgressUpdated = false;

        const handleAudioLoaded = () => {
          if (!audioProgressUpdated) {
            audioLoaded = true;
            audioProgressUpdated = true;
            updateOverallProgress();
            resolve();
          }
        };

        // Multiple fallbacks for audio loading
        audio.addEventListener('canplaythrough', handleAudioLoaded);
        audio.addEventListener('loadeddata', handleAudioLoaded);
        
        // Progress tracking
        audio.addEventListener('progress', () => {
          if (audio.buffered.length > 0 && audio.duration) {
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
            const loadedPercent = (bufferedEnd / audio.duration) * 100;
            
            if (loadedPercent > 80 && !audioProgressUpdated) {
              handleAudioLoaded();
            }
          }
        });

        audio.addEventListener('error', () => {
          console.warn('Audio loading error, continuing...');
          handleAudioLoaded(); // Continue even if audio fails
        });

        // Timeout fallback
        setTimeout(() => {
          if (!audioProgressUpdated) {
            console.warn('Audio loading timeout, continuing...');
            handleAudioLoaded();
          }
        }, 8000); // 8 second timeout

        audio.preload = 'auto';
        audio.src = audioSrc;
        audio.load();
      });

      // Wait for both assets with overall timeout
      try {
        await Promise.race([
          Promise.all([loadVideo, loadAudio]),
          new Promise(resolve => setTimeout(resolve, 15000)) // 15 second max wait
        ]);
      } catch (error) {
        console.warn('Asset loading error:', error);
      }
      
      // Force completion if not already complete
      if (!videoLoaded || !audioLoaded) {
        setProgress(100);
        setIsComplete(true);
      }
    };

    loadAssets();
  }, []);

  // Glitch effect for progress display - only glitch, don't change actual progress
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (progress < 100) {
        // Random glitch effect - occasionally show wrong number briefly
        if (Math.random() < 0.1) { // 10% chance of glitch, reduced frequency
          const glitchValue = Math.max(0, Math.min(100, progress + (Math.random() - 0.5) * 20));
          setGlitchProgress(glitchValue);
          setTimeout(() => setGlitchProgress(progress), 80); // Return to real value after 80ms
        } else {
          setGlitchProgress(progress);
        }
      } else {
        setGlitchProgress(100);
        clearInterval(glitchInterval);
      }
    }, 200); // Less frequent updates

    return () => clearInterval(glitchInterval);
  }, [progress]);

  // Smooth display progress update
  useEffect(() => {
    const animateProgress = () => {
      setDisplayProgress(prev => {
        const diff = glitchProgress - prev;
        if (Math.abs(diff) < 0.1) return glitchProgress;
        return prev + diff * 0.15; // Smooth animation
      });
    };

    const interval = setInterval(animateProgress, 16); // ~60fps
    return () => clearInterval(interval);
  }, [glitchProgress]);

  const handleEnterSite = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnterSite();
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-800 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Enter Site Button - Fades in same position */}
      <div className="text-center">
        <div className="text-2xl font-mono font-normal text-white relative tracking-wider">
          {!isComplete ? (
            <span 
              className={`inline-block transition-all duration-75`}
              style={{
                color: Math.abs(displayProgress - glitchProgress) > 5 ? '#ffffff' : '#ffffff',
                textShadow: Math.abs(displayProgress - glitchProgress) > 5 
                  ? '2px 0 #000000, -2px 0 #ffffff, 0 2px #000000' 
                  : 'none',
                transform: Math.abs(displayProgress - glitchProgress) > 5 
                  ? `translateX(${(Math.random() - 0.5) * 3}px) translateY(${(Math.random() - 0.5) * 2}px)` 
                  : 'none',
                filter: Math.abs(displayProgress - glitchProgress) > 5 
                  ? 'brightness(1.5) contrast(2)' 
                  : 'none'
              }}
            >
              LOADING {Math.floor(displayProgress)}%
            </span>
          ) : (
            <button
              onClick={handleEnterSite}
              className="bg-transparent border-none text-white font-mono text-2xl tracking-wider uppercase transition-all duration-500 hover:opacity-70 focus:outline-none animate-fade-in underline decoration-1 underline-offset-4"
            >
              Enter Site
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;