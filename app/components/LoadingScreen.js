'use client';

import React, { useState, useEffect, useRef } from 'react';

// Initialize a global cache on the window object. This allows assets
// to persist after this component unmounts.
if (typeof window !== 'undefined' && !window.assetCache) {
  window.assetCache = {};
}

/**
 * Fetches a media file, reports its download progress, and caches it as a blob URL.
 * @param {string} url - The URL of the asset to fetch.
 * @param {function(number):void} onProgress - A callback to report progress (0-100).
 * @returns {Promise<string>} A promise that resolves with the blob URL.
 */
const fetchAndCache = (url, onProgress) => {
  return new Promise((resolve, reject) => {
    // 1. Check if the asset is already in our cache.
    if (window.assetCache[url]) {
      onProgress(100);
      resolve(window.assetCache[url]);
      return;
    }

    // 2. Fetch the asset from the network.
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok for ${url}`);
        }
        if (!response.body) {
          throw new Error('Response body is null.');
        }

        const reader = response.body.getReader();
        const contentLength = +response.headers.get('Content-Length');
        let receivedLength = 0;
        const chunks = [];

        // 3. Read the download stream chunk by chunk.
        const read = () => {
          reader.read().then(({ done, value }) => {
            if (done) {
              onProgress(100);
              const blob = new Blob(chunks);
              const blobUrl = URL.createObjectURL(blob);
              window.assetCache[url] = blobUrl; // Cache the result
              resolve(blobUrl);
              return;
            }

            chunks.push(value);
            receivedLength += value.length;

            // 4. Calculate and report progress.
            if (contentLength) {
              const progress = Math.min(100, (receivedLength / contentLength) * 100);
              onProgress(progress);
            }

            read(); // Continue reading the stream
          }).catch(reject);
        };
        read();
      })
      .catch(err => {
        console.warn(`Failed to preload ${url}:`, err);
        onProgress(100); // Mark as complete to not block the UI
        reject(err);
      });
  });
};


export default function LoadingScreen({ onEnterSite }) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [glitchProgress, setGlitchProgress] = useState(0);
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [enterSiteGlitch, setEnterSiteGlitch] = useState(false);
  const [phraseGlitch, setPhraseGlitch] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // --- All your other existing UI state and functions can remain ---
  // (e.g., timezones, currentPhraseIndex, showTimezoneDropdown, etc.)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
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

  const resetLoadingState = () => {
    setProgress(0);
    setDisplayProgress(0);
    setIsComplete(false);
    setAssetsLoaded(false);
    setLoadingStartTime(Date.now());
  };

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
      }, 600);
      return () => clearInterval(interval);
    }
  }, [isComplete]);

  const progressRef = useRef({});

  // Get time-based video with timezone consideration
  // Your existing function to determine the video source
  const getVideoSrc = (timezone = selectedTimezone) => {
    const now = new Date();
    const hour = timezone ? parseInt(now.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false })) : now.getHours();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const basePath = isMobile ? '/videos/mobile/' : '/videos/';
    if (hour >= 7 && hour < 12) return basePath + 'Sunny.webm';
    if (hour >= 12 && hour < 16) return basePath + 'Afternoon.webm';
    if (hour >= 16 && hour < 20) return basePath + 'Sunset.webm';
    return basePath + 'Midnight.webm';
  };


  // Handle timezone change
  const handleTimezoneChange = (newTimezone) => {
    setSelectedTimezone(newTimezone);

    // Reset loading state for new timezone
    setProgress(0);
    setIsComplete(false);
    setAssetsLoaded(false);
    setLoadingStartTime(Date.now());
    setDisplayProgress(0);

    localStorage.setItem('selectedTimezone', newTimezone);
    setShowTimezoneDropdown(false);

    // Reset loading state for new timezone
    resetLoadingState();
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

  // Main asset loading effect
  useEffect(() => {
    // Initialize timezone and start time
    if (!selectedTimezone) {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const savedTimezone = localStorage.getItem('selectedTimezone');
      setSelectedTimezone(savedTimezone || userTimezone);
      setLoadingStartTime(Date.now());
      return; // Rerun effect once timezone is set
    }

    const loadAssets = async () => {
      const videoSrc = getVideoSrc();
      const audioSrcs = [
        '/audio/track1.mp3', '/audio/track2.mp3', '/audio/track3.mp3',
        '/audio/track4.mp3', '/audio/track6.mp3', '/audio/track7.mp3',
        '/audio/track8.mp3', '/audio/track9.mp3'
      ];

      // Define assets and their contribution to the progress bar
      const assetsToLoad = [
        { url: videoSrc, weight: 0.7 }, // Video is 70% of the bar
        { url: audioSrcs[0], weight: 0.3 } // First audio track is 30%
      ];

      progressRef.current = {}; // Reset progress tracking

      const updateOverallProgress = () => {
        const totalProgress = Object.values(progressRef.current).reduce((acc, asset) => acc + (asset.progress * asset.weight), 0);
        // Use Math.max to ensure progress never goes backward
        setProgress(prev => Math.max(prev, totalProgress));
      };

      // Create a loader for each primary asset
      const primaryLoaders = assetsToLoad.map(asset =>
        fetchAndCache(asset.url, (p) => {
          progressRef.current[asset.url] = { progress: p, weight: asset.weight };
          updateOverallProgress();
        })
      );

      // Quietly preload other audio tracks in the background
      audioSrcs.slice(1).forEach(url => fetchAndCache(url, () => { }));

      await Promise.allSettled(primaryLoaders);
    };

    loadAssets();
  }, [selectedTimezone]);

  // Glitch effect for progress display - increased frequency
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setDisplayProgress(current => {
        if (current >= 100) return 100;
        // Move display value towards the actual progress value
        const newProgress = current + (progress - current) * 0.1;
        return Math.abs(progress - newProgress) < 0.1 ? progress : newProgress;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

  // Checks for loading completion
  useEffect(() => {
    if (progress >= 100) {
      const elapsedTime = Date.now() - loadingStartTime;
      const minLoadingTime = 2500; // Minimum 2.5 seconds display time
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

      const timer = setTimeout(() => {
        setIsComplete(true);
      }, remainingTime);
      return () => clearTimeout(timer);
    }
  }, [progress, loadingStartTime]);

  const handleEnterSite = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnterSite(selectedTimezone);
    }, 800);
  };

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

  // 3. Smoothly animates the displayed percentage number
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setDisplayProgress(current => {
        if (current >= 100) {
            cancelAnimationFrame(animationFrameId);
            return 100;
        }
        const newProgress = current + (progress - current) * 0.1;
        return Math.abs(progress - newProgress) < 0.1 ? progress : newProgress;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [progress]);

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

  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-800 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>

      {/* Timezone Selector - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <div className="relative">
          {/* Current Time Display */}
          <div className="text-xs text-gray-400 mb-2 text-right tracking-wide pixel-font">
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
                  className={`w-full px-4 py-2 text-left text-xs hover:bg-white/10 transition-colors duration-150 tracking-wide flex justify-between items-center ${selectedTimezone === timezone.value
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
        {!isComplete ? (
          <div>
            <div className="mb-6">
              <span className="inline-block text-xl font-mono font-normal text-white tracking-wider">
                {loadingPhrases[currentPhraseIndex]}
              </span>
            </div>
            <div className="text-2xl pixel-font text-white relative tracking-wider">
              <span className="inline-block transition-all duration-75">
                LOADING {Math.floor(displayProgress)}%
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={handleEnterSite}
            className="bg-transparent border-none text-white text-2xl tracking-wider uppercase transition-all duration-500 hover:opacity-70 focus:outline-none animate-fade-in group pixel-font"
            style={{ textShadow: 'none' }}
          >
            Enter Site
          </button>
        )}
      </div>

      <style jsx>{`
        @font-face {
          font-family: 'pixelated';
          src: url('/fonts/pixelated.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'pixelated-Bold';
          src: url('/fonts/pixelated-bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
        
        .pixel-font {
          font-family: 'pixelated', 'Press Start 2P', cursive;
          font-size: 1.05rem; /* Slightly smaller for pixel font */
          /* Enhancements for more pixelated look */
          text-rendering: crisp-edges;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
          transition: font-family 0.3s ease;
        }

        /* HOVER STATE: Change to bold pixelated font */
        .group:hover .pixel-font {
          font-family: 'pixelated-Bold', 'Press Start 2P', cursive;
        }

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
