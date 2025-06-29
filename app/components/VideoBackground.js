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

  const [audioOn, setAudioOn] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [showVolume, setShowVolume] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [audioInitialized, setAudioInitialized] = useState(false);

  const tracks = [
    '/audio/track1.mp3',
    '/audio/track2.mp3',
    '/audio/track3.mp3',
    '/audio/track4.mp3',
    '/audio/track5.mp3',
    '/audio/track6.mp3',
    '/audio/track7.mp3',
    '/audio/track8.mp3',
    '/audio/track9.mp3',
    '/audio/track10.mp3'
  ];

  const [trackIndex, setTrackIndex] = useState(() => (
    Math.floor(Math.random() * tracks.length)
  ));
  const [audioSrc, setAudioSrc] = useState(tracks[trackIndex]);
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

  // Setup canvas on mount
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const resizeCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = 80 * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = '80px';

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Start visualization even without audio (will show empty bars)
      startVisualization();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
        console.log('Canvas dimensions:', {
          width: canvas.width,
          height: canvas.height,
          styleWidth: canvas.style.width,
          styleHeight: canvas.style.height,
          dpr: window.devicePixelRatio
        });
      };

    }
  }, []);

  // Initialize audio when permission granted
  useEffect(() => {
    if (hasPermission && audioRef.current && !audioInitialized) {
      const initializeAudio = async () => {
        try {
          console.log('Initializing audio...');

          audioRef.current.volume = volume;
          audioRef.current.loop = true;

          const audioPlayPromise = audioRef.current.play();

          audioPlayPromise.then(() => {
            console.log('Audio started playing');
            setAudioOn(true);
            setAudioInitialized(true);
            setupWebAudio();
          }).catch((error) => {
            console.warn('Direct audio play failed:', error);
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
  }, [hasPermission, volume, audioInitialized]);

  // Setup Web Audio API for visualization
  const setupWebAudio = () => {
    if (audioContextRef.current || !audioRef.current) {
      console.log('Web Audio setup skipped:', {
        contextExists: !!audioContextRef.current,
        audioExists: !!audioRef.current
      });
      return;
    };

    try {
      console.log('Setting up Web Audio API...');

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      console.log('Audio context state:', audioContextRef.current.state);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512; // Increased for better resolution
      analyserRef.current.smoothingTimeConstant = 0.7; // Smoother transitions
      analyserRef.current.minDecibels = -90;
      analyserRef.current.maxDecibels = -10;

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      console.log('Web Audio API setup complete');

      console.log('Analyser created:', {
        fftSize: analyserRef.current.fftSize,
        frequencyBinCount: analyserRef.current.frequencyBinCount
      });

    } catch (error) {
      console.warn('Web Audio API setup failed:', error);
    }
  };

  // Audio visualization
  const startVisualization = () => {
    if (!canvasRef.current) {
      console.warn('Canvas not available for visualization');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    console.log('Starting visualization...');

    const draw = () => {
      if (Math.random() < 0.01) { // Log occasionally to avoid spam
        console.log('Draw function running:', {
          audioOn,
          hasAnalyser: !!analyserRef.current,
          canvasExists: !!canvasRef.current
        });
      }
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = 80;

      // Clear canvas with a subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      if (audioOn && analyserRef.current) {

        const sum = dataArray.reduce((a, b) => a + b, 0);
        if (Math.random() < 0.01) {
          console.log('Audio data:', {
            bufferLength,
            sum,
            sample: Array.from(dataArray.slice(0, 10))
          });
        }

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Draw frequency bars
        const barCount = 80; // More bars for better resolution
        const barWidth = width / barCount;
        const maxHeight = height * 0.7; // 70% of canvas height

        // Create a glow effect
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 4;

        for (let i = 0; i < barCount; i++) {
          // Use logarithmic scaling for better frequency distribution
          const dataIndex = Math.floor((i / barCount) * bufferLength * 0.5); // Use lower half for better bass/mid representation
          let barHeight = (dataArray[dataIndex] / 255) * maxHeight;

          // Apply some smoothing and minimum height
          barHeight = Math.max(barHeight, 2);

          // Color based on frequency and amplitude
          const hue = (i / barCount) * 60; // Blue to cyan spectrum
          const alpha = 0.6 + (barHeight / maxHeight) * 0.4;
          ctx.fillStyle = `hsla(${180 + hue}, 70%, 80%, ${alpha})`;

          const x = i * barWidth;
          const y = height - barHeight;

          // Draw bar with rounded top
          ctx.beginPath();
          ctx.roundRect(x + 1, y, barWidth - 2, barHeight, [2, 2, 0, 0]);
          ctx.fill();
        }

        ctx.shadowBlur = 0;
      } else {
        // Show subtle static pattern when audio is off
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        for (let i = 0; i < 60; i += 4) {
          const x = (i / 60) * width;
          const staticHeight = Math.random() * 8 + 2;
          ctx.fillRect(x, height - staticHeight, 2, staticHeight);
        }
      }

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
      } else {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        audioRef.current.volume = volume;
        await audioRef.current.play();
        setAudioOn(true);

        if (!audioInitialized) {
          setAudioInitialized(true);
          setupWebAudio();
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

      {/* <audio
        ref={audioRef}
        src="/audio/beach.mp3"
        preload="auto"
      /> */}

      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        autoPlay
        preload="auto"
      />

      {/* Audio Visualizer - Fixed position at bottom */}
      <canvas
        ref={canvasRef}
        className={styles.audioVisualizer}
      />

      {/* Audio Controls - Fixed position bottom right */}
      <div className={styles.audioControl}>
        <div
          className={styles.controlGroup}
          onMouseEnter={() => setShowVolume(true)}
          onMouseLeave={() => setShowVolume(false)}
        >
          <button
            onClick={toggleAudio}
            className={`${styles.audioButton} ${audioOn ? styles.playing : ''}`}
          >
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