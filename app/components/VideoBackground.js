'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './VideoBackground.module.css';

export default function VideoBackground({ hasPermission, selectedTimezone }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);
  
  const [audioOn, setAudioOn] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Load video based on time and timezone
  useEffect(() => {
    const getVideoBasedOnTimezone = () => {
      const now = new Date();
      
      // Get hour in selected timezone or use local time
      const hour = selectedTimezone ? 
        parseInt(now.toLocaleString('en-US', { 
          timeZone: selectedTimezone, 
          hour: 'numeric', 
          hour12: false 
        })) : 
        now.getHours();

      let selected = '/videos/bright-day.mp4';
      if (hour >= 4 && hour < 6) selected = '/videos/dawn.mp4';
      else if (hour >= 6 && hour < 11) selected = '/videos/dayrise.mp4';
      else if (hour >= 11 && hour < 16) selected = '/videos/bright-day.mp4';
      else if (hour >= 16 && hour < 18.5) selected = '/videos/sunset.mp4';
      else if (hour >= 18.5 && hour < 20) selected = '/videos/evening.mp4';
      else selected = '/videos/midnight.mp4';
      
      setVideoSrc(selected);
    };

    getVideoBasedOnTimezone();
  }, [selectedTimezone]);

  // Initialize and play audio when permission granted
  useEffect(() => {
    if (hasPermission && audioRef.current && !audioInitialized) {
      const initializeAudio = async () => {
        try {
          console.log('Initializing audio...');
          
          // Set basic audio properties
          audioRef.current.volume = volume;
          audioRef.current.loop = true;
          
          // Try to play audio first (this often works without Web Audio API)
          const audioPlayPromise = audioRef.current.play();
          
          audioPlayPromise.then(() => {
            console.log('Audio started playing');
            setAudioOn(true);
            setAudioInitialized(true);
            
            // Now try to set up Web Audio API for visualization
            setupWebAudio();
          }).catch((error) => {
            console.warn('Direct audio play failed:', error);
            
            // If direct play fails, try with a user interaction delay
            setTimeout(() => {
              audioRef.current?.play().then(() => {
                console.log('Audio started playing (delayed)');
                setAudioOn(true);
                setAudioInitialized(true);
                setupWebAudio();
              }).catch(err => console.warn('Delayed audio play also failed:', err));
            }, 100);
          });
          
        } catch (error) {
          console.error('Audio initialization error:', error);
        }
      };

      initializeAudio();
    }
  }, [hasPermission, volume]);

  // Setup Web Audio API for visualization
  const setupWebAudio = () => {
    if (audioContextRef.current || !audioRef.current) return;
    
    try {
      console.log('Setting up Web Audio API...');
      
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      
      // Create source and connect
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
      
      console.log('Web Audio API setup complete');
      
      // Start visualization
      startVisualization();
      
    } catch (error) {
      console.warn('Web Audio API setup failed:', error);
      // Audio will still play, just no visualization
    }
  };

  // Audio visualization
  const startVisualization = () => {
    if (!canvasRef.current || !analyserRef.current) {
      console.warn('Canvas or analyser not available for visualization');
      return;
    }
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    console.log('Starting visualization with buffer length:', bufferLength);
    
    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = 80 * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = '80px';
      ctx.scale(dpr, dpr);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const draw = () => {
      if (!analyserRef.current || !audioOn) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      
      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), 80);
      
      // Draw frequency bars
      const barCount = 64;
      const barWidth = (canvas.width / (window.devicePixelRatio || 1)) / barCount;
      const maxHeight = 60;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (bufferLength / barCount));
        const barHeight = (dataArray[dataIndex] / 255) * maxHeight;
        
        if (barHeight > 1) { // Only draw if there's actual audio data
          // Create glow effect
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.shadowBlur = 10;
          
          // Main bar
          ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + (barHeight / maxHeight) * 0.4})`;
          const x = i * barWidth;
          const y = 80 - barHeight;
          
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          
          // Extra glow
          ctx.shadowBlur = 20;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + (barHeight / maxHeight) * 0.3})`;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
        }
      }
      
      // Reset shadow
      ctx.shadowBlur = 0;
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    
    try {
      if (audioOn) {
        audioRef.current.pause();
        setAudioOn(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        // Resume audio context if needed
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        audioRef.current.volume = volume;
        await audioRef.current.play();
        setAudioOn(true);
        
        if (!audioInitialized) {
          setAudioInitialized(true);
          setupWebAudio();
        } else if (analyserRef.current) {
          startVisualization();
        }
      }
    } catch (error) {
      console.error('Toggle audio error:', error);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!videoSrc) return null;

  return (
    <div className={styles.videoWrapper}>
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        className={styles.videoBg}
      />
      
      <audio 
        ref={audioRef} 
        src="/audio/beach.mp3" 
        preload="auto"
      />

      {/* Audio Visualizer - Fixed position at bottom */}
      <canvas
        ref={canvasRef}
        className={styles.audioVisualizer}
      />

      {/* Audio Controls - Fixed position bottom left */}
      <div className={styles.audioControl}>
        <div
          className={styles.controlGroup}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button onClick={toggleAudio} className={styles.audioButton}>
            {audioOn ? '🔊' : '🔇'}
          </button>

          {showVolume && (
            <div className={styles.volumeContainer}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
              />
              <span className={styles.volumeLabel}>{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}