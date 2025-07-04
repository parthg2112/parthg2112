'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onEnterSite }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [glitchProgress, setGlitchProgress] = useState(0);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [enterSiteGlitch, setEnterSiteGlitch] = useState(false);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [phraseGlitch, setPhraseGlitch] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Loading phrases
  const loadingPhrases = [
    'Loading Yeezus.dev...',
    'Initializing creativity core...',
    'Synthwave engine active...'
  ];

  // Common timezones list with labels
  const timezones = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET)' },
    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Asia/Shanghai', label: 'China (CST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Seoul', label: 'Seoul (KST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
    { value: 'Pacific/Auckland', label: 'Auckland (NZDT)' },
    { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
    { value: 'Africa/Cairo', label: 'Cairo (EET)' },
    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' }
  ];

  // Detect user's timezone on component mount
  useEffect(() => {
    // Set loading start time
    setLoadingStartTime(Date.now());
    
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Check if user's timezone is in our list, otherwise use it as is
    const matchingTimezone = timezones.find(tz => tz.value === userTimezone);
    if (matchingTimezone) {
      setSelectedTimezone(userTimezone);
    } else {
      // Add user's timezone to the list if not present
      setSelectedTimezone(userTimezone);
      timezones.unshift({ value: userTimezone, label: `${userTimezone} (Auto-detected)` });
    }

    // Store in localStorage for persistence
    const savedTimezone = localStorage.getItem('selectedTimezone');
    if (savedTimezone) {
      setSelectedTimezone(savedTimezone);
    }
  }, []);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      if (selectedTimezone) {
        const now = new Date();
        const timeString = now.toLocaleString('en-US', {
          timeZone: selectedTimezone,
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        setCurrentTime(timeString);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedTimezone]);

  // Loading phrase rotation
  useEffect(() => {
    if (!isComplete) {
      const interval = setInterval(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  // Get time-based video with timezone consideration
  const getVideoSrc = (timezone = selectedTimezone) => {
    const now = new Date();
    
    // Get hour in selected timezone
    const hour = timezone ? 
      parseInt(now.toLocaleString('en-US', { 
        timeZone: timezone, 
        hour: 'numeric', 
        hour12: false 
      })) : 
      now.getHours();

    if (hour >= 4 && hour < 6) return '/videos/dawn.mp4';
    else if (hour >= 6 && hour < 11) return '/videos/dayrise.mp4';
    else if (hour >= 11 && hour < 16) return '/videos/bright-day.mp4';
    else if (hour >= 16 && hour < 18.5) return '/videos/sunset.mp4';
    else if (hour >= 18.5 && hour < 20) return '/videos/evening.mp4';
    else return '/videos/midnight.mp4';
  };

  // Handle timezone change
  const handleTimezoneChange = (newTimezone) => {
    setSelectedTimezone(newTimezone);
    localStorage.setItem('selectedTimezone', newTimezone);
    setShowTimezoneDropdown(false);
  };

  // Get timezone abbreviation for display
  const getTimezoneAbbr = () => {
    const timezone = timezones.find(tz => tz.value === selectedTimezone);
    if (timezone) {
      const match = timezone.label.match(/\(([^)]+)\)/);
      return match ? match[1] : timezone.label.split(' ')[0];
    }
    return selectedTimezone.split('/').pop();
  };

  // Get time for any timezone
  const getTimeForTimezone = (timezoneValue) => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      timeZone: timezoneValue,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Preload assets and track progress
  useEffect(() => {
    const loadAssets = async () => {
      const videoSrc = getVideoSrc();
      const audioSrc = '/audio/track1.mp3';
      
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
        
        // Mark assets as loaded when both are complete
        if (videoLoaded && audioLoaded) {
          setProgress(100);
          setAssetsLoaded(true);
          // Don't set isComplete here - let the timer handle it
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
        setAssetsLoaded(true);
      }
    };

    if (selectedTimezone) {
      loadAssets();
    }
  }, [selectedTimezone]);

  // Minimum loading duration timer - ensures 4-5 second minimum
  useEffect(() => {
    if (assetsLoaded && loadingStartTime) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minLoadingTime = 4500; // 4.5 seconds minimum
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setIsComplete(true);
      }, remainingTime);
    }
  }, [assetsLoaded, loadingStartTime]);

  // Glitch effect for progress display - increased frequency
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (progress < 100) {
        // Random glitch effect - increased frequency
        if (Math.random() < 0.3) { // 30% chance of glitch, increased from 10%
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
    }, 100); // More frequent updates, reduced from 200ms to 100ms

    return () => clearInterval(glitchInterval);
  }, [progress]);

  // Glitch effect for loading phrase - same as progress glitch
  useEffect(() => {
    const phraseGlitchInterval = setInterval(() => {
      if (!isComplete) {
        // Random glitch effect - same frequency as progress
        if (Math.random() < 0.3) { // 30% chance of glitch
          setPhraseGlitch(true);
          setTimeout(() => setPhraseGlitch(false), 80); // Return to normal after 80ms
        }
      } else {
        clearInterval(phraseGlitchInterval);
      }
    }, 100); // Same frequency as progress glitch

    return () => clearInterval(phraseGlitchInterval);
  }, [isComplete]);

  // Smooth display progress update - ensures all numbers are shown
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

  // Glitch effect for "Enter Site" button
  useEffect(() => {
    if (isComplete && !isEntering) {
      const glitchInterval = setInterval(() => {
        if (Math.random() < 0.08) { // 8% chance of glitch
          setEnterSiteGlitch(true);
          setTimeout(() => setEnterSiteGlitch(false), 120); // Glitch for 120ms
        }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(glitchInterval);
    }
  }, [isComplete, isEntering]);

  const handleEnterSite = () => {
    setIsEntering(true);
    setTimeout(() => {
      // Pass the selected timezone to the parent component
      onEnterSite(selectedTimezone);
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-800 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Timezone Selector - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="relative">
          {/* Current Time Display */}
          <div className="text-xs text-gray-400 mb-2 text-right tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {currentTime}
          </div>
          
          {/* Timezone Button */}
          <button
            onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
            className="bg-black/80 border border-white/20 text-white px-3 py-2 text-xs hover:border-white/40 transition-all duration-200 backdrop-blur-sm flex items-center gap-2 tracking-wide"
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' }}
          >
            <span>🌍</span>
            <span className="hidden sm:inline">
              {getTimezoneAbbr()}
            </span>
            <span className={`transition-transform duration-200 ${showTimezoneDropdown ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Dropdown */}
          {showTimezoneDropdown && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-black/90 border border-white/20 backdrop-blur-md max-h-64 overflow-y-scroll custom-scrollbar">
              {timezones.map((timezone) => (
                <button
                  key={timezone.value}
                  onClick={() => handleTimezoneChange(timezone.value)}
                  className={`w-full px-4 py-2 text-left text-xs hover:bg-white/10 transition-colors duration-150 tracking-wide flex justify-between items-center ${
                    selectedTimezone === timezone.value 
                      ? 'bg-white/20 text-white' 
                      : 'text-gray-300'
                  }`}
                  style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' }}
                >
                  <span>{timezone.label}</span>
                  <span className="text-gray-400 text-xs ml-2">{getTimeForTimezone(timezone.value)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showTimezoneDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowTimezoneDropdown(false)}
        />
      )}

      {/* Main Content */}
      <div className="text-center z-10">
        {!isComplete && (
          <div className="mb-6">
            <span 
              className="inline-block text-xl font-mono font-normal text-white tracking-wider transition-all duration-75"
              style={{
                color: phraseGlitch ? '#ffffff' : '#ffffff',
                textShadow: phraseGlitch 
                  ? '2px 0 #000000, -2px 0 #ffffff, 0 2px #000000' 
                  : 'none',
                transform: phraseGlitch 
                  ? `translateX(${(Math.random() - 0.5) * 3}px) translateY(${(Math.random() - 0.5) * 2}px)` 
                  : 'none',
                filter: phraseGlitch 
                  ? 'brightness(1.5) contrast(2)' 
                  : 'none'
              }}
            >
              {loadingPhrases[currentPhraseIndex]}
            </span>
          </div>
        )}
        
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
              className="bg-transparent border-none text-white text-2xl tracking-wider uppercase transition-all duration-500 hover:opacity-70 focus:outline-none animate-fade-in group"
              style={{
                fontFamily: '"Courier New", Courier, monospace',
                textShadow: enterSiteGlitch 
                  ? '2px 0 #000000, -2px 0 #ffffff, 0 2px #000000' 
                  : 'none',
                transform: enterSiteGlitch 
                  ? `translateX(${(Math.random() - 0.5) * 3}px) translateY(${(Math.random() - 0.5) * 2}px)` 
                  : 'none',
                filter: enterSiteGlitch 
                  ? 'brightness(1.5) contrast(2)' 
                  : 'none'
              }}
            >
              <span className="relative">
                Enter Site
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
              </span>
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

        .custom-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;