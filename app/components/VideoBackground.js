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
    '/audio/track7.mp3'
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

  // Setup canvas and start visualization
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = 180;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Start the clean waveform visualization
      startCleanVisualization();

      return () => {
        window.removeEventListener('resize', resizeCanvas);
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

  // Setup Web Audio API for clean waveform visualization
  const setupWebAudio = () => {
    if (audioContextRef.current || !audioRef.current) {
      console.log('Web Audio setup skipped:', {
        contextExists: !!audioContextRef.current,
        audioExists: !!audioRef.current
      });
      return;
    }

    try {
      console.log('Setting up Web Audio API...');

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      console.log('Audio context state:', audioContextRef.current.state);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048; // For clean waveform like your AudioVisualizer
      analyserRef.current.smoothingTimeConstant = 0.7; // Smooth but responsive

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      console.log('Web Audio API setup complete');

    } catch (error) {
      console.warn('Web Audio API setup failed:', error);
    }
  };

  // Clean waveform visualization (from your AudioVisualizer.js)
  const startCleanVisualization = () => {
    if (!canvasRef.current) {
      console.warn('Canvas not available for visualization');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    console.log('Starting clean waveform visualization...');

    const waveArray = new Uint8Array(2048);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // Clear canvas completely for clean look
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (audioOn && analyserRef.current) {
        // Get waveform data only
        analyserRef.current.getByteTimeDomainData(waveArray);
        drawCleanWaveform(ctx, waveArray, canvas);
      } else {
        // Draw static line when not playing
        drawStaticLine(ctx, canvas);
      }
    };

    const drawCleanWaveform = (ctx, data, canvas) => {
      // Main waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

      const sliceWidth = canvas.width / data.length;
      let x = 0;

      // Create smooth curve points
      const points = [];
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0; // Normalize to -1 to 1
        const y = (v * canvas.height / 2.5) + (canvas.height / 2); // Center and scale
        points.push({ x, y });
        x += sliceWidth;
      }

      // Draw smooth curve
      if (points.length > 0) {
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 1; i++) {
          const currentPoint = points[i];
          const nextPoint = points[i + 1];
          const controlX = (currentPoint.x + nextPoint.x) / 2;
          const controlY = (currentPoint.y + nextPoint.y) / 2;
          
          ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
        }
        
        if (points.length > 1) {
          const lastPoint = points[points.length - 1];
          ctx.lineTo(lastPoint.x, lastPoint.y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawStaticLine = (ctx, canvas) => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
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

      <audio
        ref={audioRef}
        src={audioSrc}
        loop
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
      />

      {/* Clean Waveform Visualizer - Fixed position at bottom like your AudioVisualizer */}
      <canvas
        ref={canvasRef}
        className="fixed top-2000 left-0 w-full h-[180px] z-40 block"
        style={{ width: '100vw', height: '180px' }}
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
            {audioOn ? '> >' : '| |'}
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

      {/* Optional: Click indicator like in your AudioVisualizer */}
      <div className="absolute bottom-8 right-6 text-white text-sm opacity-70 pointer-events-none">
        {!audioOn ? 'Audio paused' : 'Audio playing'}
      </div>
    </div>
  );
}