'use client';

import React, { useEffect, useState, useRef } from 'react';

const VideoBackground = ({ hasPermission }) => {
  const [videoSrc, setVideoSrc] = useState('');
  const [audioOn, setAudioOn] = useState(false);
  const [volume, setVolume] = useState(30);
  const [mounted, setMounted] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
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
    else selected = '/videos/midnight.mp4';

    setVideoSrc(selected);
  }, []);

  // Initialize audio when component mounts
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      // Set initial volume
      audio.volume = volume / 100;
      
      // Audio event listeners
      const handleCanPlay = () => {
        setAudioLoaded(true);
      };
      
      const handleError = (e) => {
        console.error('Audio error:', e);
        setAudioLoaded(false);
      };

      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
      
      // Load the audio
      audio.load();

      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [volume]);

  // Start audio when permission is granted and user wants audio
  useEffect(() => {
    if (hasPermission && audioRef.current && audioOn && audioLoaded) {
      const playAudio = async () => {
        try {
          audioRef.current.volume = volume / 100;
          await audioRef.current.play();
        } catch (error) {
          console.log('Audio play failed:', error);
          setAudioOn(false);
        }
      };
      playAudio();
    }
  }, [hasPermission, audioOn, audioLoaded, volume]);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibility = () => {
      if (!audioRef.current) return;
      
      if (document.hidden) {
        // Page is hidden - pause audio
        if (audioOn) {
          audioRef.current.pause();
        }
        videoRef.current?.pause();
      } else {
        // Page is visible - resume audio if it should be playing
        if (audioOn && hasPermission) {
          audioRef.current.play().catch(error => {
            console.log('Audio resume failed:', error);
          });
        }
        videoRef.current?.play();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [audioOn, hasPermission]);

  // Toggle audio on/off
  const handleAudioToggle = async () => {
    if (!audioRef.current || !hasPermission || !audioLoaded) return;
    
    try {
      if (audioOn) {
        await audioRef.current.pause();
        setAudioOn(false);
      } else {
        audioRef.current.volume = volume / 100;
        await audioRef.current.play();
        setAudioOn(true);
      }
    } catch (error) {
      console.error('Audio toggle failed:', error);
      setAudioOn(false);
    }
  };

  // Handle volume change
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
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

      {/* High Quality Audio Element */}
      <audio 
        ref={audioRef} 
        src="/audio/beach.mp3" 
        loop 
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Audio Control */}
      <div className="fixed bottom-6 right-6 z-20">
        <div 
          className="relative"
          onMouseEnter={() => setShowVolumeSlider(true)}
          onMouseLeave={() => setShowVolumeSlider(false)}
        >
          {/* Vertical Volume Slider */}
          {showVolumeSlider && audioOn && (
            <div className="absolute bottom-full right-0 mb-3 p-4 bg-black/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl">
              <div className="flex flex-col items-center space-y-3">
                <span className="text-white text-sm font-medium">Volume</span>
                <div className="relative h-24 w-6 flex flex-col items-center">
                  {/* Volume level indicator */}
                  <div className="absolute inset-0 w-2 bg-gray-600 rounded-full mx-auto">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-white rounded-full transition-all duration-200"
                      style={{ height: `${volume}%` }}
                    ></div>
                  </div>
                  
                  {/* Vertical slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                    className="vertical-slider absolute inset-0 w-6 h-24 bg-transparent appearance-none cursor-pointer"
                    orient="vertical"
                  />
                </div>
                <span className="text-white text-xs opacity-80">{volume}%</span>
              </div>
            </div>
          )}

          {/* Toggle Button */}
          <button
            onClick={handleAudioToggle}
            disabled={!hasPermission || !audioLoaded}
            className={`
              px-4 py-3 rounded-full transition-all duration-300 text-sm font-medium backdrop-blur-md border shadow-lg
              ${audioOn 
                ? 'bg-blue-600/80 text-white border-blue-400/30 hover:bg-blue-500/90' 
                : 'bg-black/60 text-white/80 border-white/10 hover:bg-black/80'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center space-x-2
            `}
          >
            <span className="text-lg">{audioOn ? '🔊' : '🔇'}</span>
            <span>{audioOn ? 'Audio On' : 'Audio Off'}</span>
            {!audioLoaded && hasPermission && (
              <div className="ml-2 w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin"></div>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        /* Vertical slider styling */
        .vertical-slider {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          -webkit-transform: rotate(180deg);
          transform: rotate(180deg);
        }

        .vertical-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }

        .vertical-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        .vertical-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }

        .vertical-slider::-webkit-slider-track {
          background: transparent;
          border-radius: 3px;
        }

        .vertical-slider::-moz-range-track {
          background: transparent;
          border-radius: 3px;
        }

        .fade-in {
          animation: fadeIn 1s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VideoBackground;