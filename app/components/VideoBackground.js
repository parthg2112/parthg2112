'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './VideoBackground.module.css';

export default function VideoBackground({ hasPermission, selectedTimezone }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null); // Consistent ref name

  const [audioOn, setAudioOn] = useState(true);
  const [volume, setVolume] = useState(1); // Set to max volume for testing
  const [showVolume, setShowVolume] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [audioInitialized, setAudioInitialized] = useState(false); // Manages Web Audio API setup

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

  // console.log('VideoBackground component rendered. hasPermission:', hasPermission, 'AudioInitialized (state):', audioInitialized);

  // 1. Load video based on time and timezone
  useEffect(() => {
    const getVideoBasedOnTimezone = () => {
      const now = new Date();
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

      // console.log(`Video selected for hour ${hour} (Timezone: ${selectedTimezone || 'Local'}): ${selected}`);
      setVideoSrc(selected);
    };

    getVideoBasedOnTimezone();
  }, [selectedTimezone]);

  // 2. Initialize canvas for visualizer size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas ref not available for resize useEffect (initial mount).');
      return;
    }

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = 100; // Fixed height for visualizer
      console.log(`Canvas resized to: ${canvas.width}x${canvas.height}`);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 3. Audio visualizer drawing function
  const drawVisualizer = () => {
    // Check refs at the start of each frame
    if (!analyserRef.current || !canvasRef.current) {
      console.log('Visualizer check failed (analyser or canvas missing) inside drawVisualizer. Requesting next frame if audioOn and audioInitialized are true.');
      if (audioOn && audioInitialized) { // Still request if expected to be on
        animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Ensure canvas dimensions are always correct
    canvas.width = window.innerWidth;
    canvas.height = 100;

    // Always clear the canvas at the start of the frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const waveArray = new Uint8Array(analyserRef.current.frequencyBinCount); // Use frequencyBinCount for time domain
    let hasAudioData = false;

    try {
      analyserRef.current.getByteTimeDomainData(waveArray);
      hasAudioData = waveArray.some(val => val !== 128); // Check if any value is not 128
      // console.log('Audio data check:', {
      //   hasAudioData,
      //   sampleValues: Array.from(waveArray.slice(0, 5)), // Show first 5 samples
      //   audioOn,
      //   audioInitialized,
      //   fftSize: analyserRef.current.fftSize,
      //   frequencyBinCount: analyserRef.current.frequencyBinCount
      // });
    } catch (error) {
      console.warn('Error getting audio data from analyser:', error);
      hasAudioData = false;
    }

    // Only draw waveform if audio is playing AND we detect actual audio data
    if (audioOn && hasAudioData) {
      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 25;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

      const sliceWidth = canvas.width * 1.0 / waveArray.length;
      let x = 0;

      for (let i = 0; i < waveArray.length; i++) {
        const v = waveArray[i] / 128.0; // Normalize from 0-255 to 0-2
        const y = (v * canvas.height / 1.7) + (canvas.height / 2); // Scale to canvas height
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
    } else {
      // If no audio data, still show debug text
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText('No active audio signal for visualizer.', 20, 45);
      // console.log('Visualizer: No active audio signal for drawing waveform.');
    }

    // Request next frame if audio is supposed to be on AND the Web Audio API is initialized
    if (audioOn && audioInitialized) {
      animationFrameIdRef.current = requestAnimationFrame(drawVisualizer);
    } else {
      console.log('Stopping visualizer animation loop. audioOn:', audioOn, 'audioInitialized:', audioInitialized);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    }
  };

  const handleSongEnd = () => {
    console.log('Audio ended. Selecting a new random track...');
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * tracks.length);
    } while (newIndex === trackIndex); // Ensure it's a different track than the just-played one

    setTrackIndex(newIndex); // Update state to trigger re-render and new audioSrc
    setAudioSrc(tracks[newIndex]); // Update audio source directly

    // The useEffect for audio initialization should handle playing the new song
    // because audioSrc is a dependency of that useEffect, and it implicitly
    // sets the src on audioRef.current. Then play() is called.
    // No explicit audioRef.current.play() here is usually needed.

    // Optional: If you want to ensure it plays immediately without waiting for a state update cycle
    // setTimeout(() => {
    //   if (audioRef.current) {
    //     audioRef.current.play().catch(e => console.error("Error playing new track:", e));
    //   }
    // }, 50); // Small delay
  };

  // 4. Initialize audio and Web Audio when permission granted and audioRef is ready
  useEffect(() => {
    // console.log('useEffect for audio initialization triggered. hasPermission:', hasPermission, 'audioRef.current IS:', !!audioRef.current, 'audioInitialized (state):', audioInitialized);

    // Only run if permission is granted, audioRef is ready, AND audio is NOT yet initialized
    if (hasPermission && audioRef.current && !audioInitialized) {
      // console.log('Conditions met for initial audio setup. Proceeding with audio playback attempt...');

      const initializeAudioAndWebAudio = async () => {
        try {
          audioRef.current.volume = volume;
          audioRef.current.loop = true; // Ensure audio loops

          // Attempt to play audio
          await audioRef.current.play();

          // console.log('Audio playback initiated successfully. Now setting audioInitialized and audioOn states to true.');
          setAudioInitialized(true); // Signal that Web Audio API is (or will be) set up
          setAudioOn(true); // Signal that audio is playing

          // Now set up Web Audio API after play is successful
          setupWebAudio();

        } catch (error) {
          console.error('Error during initial audio play attempt:', error);
          // If play fails, explicitly set audioOn to false.
          // Do NOT set audioInitialized to false here, to allow setupWebAudio to retry
          // or for user interaction to trigger it later.
          setAudioOn(false);
        }
      };

      initializeAudioAndWebAudio();
    } else {
      // console.log('Skipping initial audio setup. Current Conditions:', {
      //   hasPermission,
      //   audioRefReady: !!audioRef.current,
      //   audioInitializedState: audioInitialized
      // });
    }
  }, [hasPermission, audioInitialized, volume, audioRef.current]); // Dependencies

  // Add this new useEffect to manage the visualizer's animation loop
  useEffect(() => {
    // Only start the animation if audio is on AND the Web Audio API is initialized.
    if (audioOn && audioInitialized) {
      // console.log('Dependencies met. Starting visualizer animation loop.');
      // Start the recursive drawing function
      drawVisualizer();
    }

    // The cleanup logic is already inside your drawVisualizer function,
    // which stops the requestAnimationFrame loop when audioOn or audioInitialized becomes false.
    // So, no explicit cleanup is needed here.

  }, [audioOn, audioInitialized]); // Dependencies: This effect runs ONLY when audioOn or audioInitialized changes.

  // 5. Setup Web Audio API
  const setupWebAudio = () => {
    // Prevent re-initialization if context already exists and audioRef is present
    if (audioContextRef.current || !audioRef.current) {
      // console.log('Web Audio setup skipped: audioContextRef.current exists=', !!audioContextRef.current, 'audioRef.current exists=', !!audioRef.current);
      return;
    }

    try {
      // console.log('Initiating Web Audio API setup...');

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // console.log('Audio Context created. Initial state:', audioContextRef.current.state);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048; // Standard size
      analyserRef.current.smoothingTimeConstant = 0.7; // Smoothness
      // console.log('AnalyserNode created. fftSize:', analyserRef.current.fftSize, 'frequencyBinCount:', analyserRef.current.frequencyBinCount);

      if (!audioRef.current) {
        console.error("audioRef.current is null when attempting to create MediaElementSourceNode!");
        // Revert audioInitialized if crucial ref is missing
        setAudioInitialized(false);
        setAudioOn(false);
        return;
      }
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
      // console.log('MediaElementSourceNode created from audioRef. Source node:', sourceRef.current);

      sourceRef.current.connect(analyserRef.current);
      // console.log('Source connected to Analyser. Analyser node:', analyserRef.current);

      analyserRef.current.connect(audioContextRef.current.destination);
      // console.log('Analyser connected to AudioContext Destination.');

      // Check AudioContext state for suspended
      if (audioContextRef.current.state === 'suspended') {
        console.warn('AudioContext is suspended. Attempting to resume...');
        audioContextRef.current.resume().then(() => {
          // console.log('AudioContext resumed successfully. State:', audioContextRef.current.state);
        }).catch(resumeError => {
          console.error('Failed to resume AudioContext:', resumeError);
          setAudioInitialized(false); // Reset if resume fails
          setAudioOn(false);
        });
      }

      // console.log('Web Audio API setup complete. Final AudioContext state:', audioContextRef.current.state);

      // IMPORTANT: Trigger drawVisualizer directly from here, after connections are made.
      // The drawVisualizer function itself manages its requestAnimationFrame loop.
      // console.log('Web Audio API setup complete. Final AudioContext state:', audioContextRef.current.state);
      // The direct call to drawVisualizer() is now removed.
    } catch (error) {
      console.error('ERROR: Web Audio API setup failed unexpectedly:', error);
      setAudioInitialized(false); // If setup failed, mark as uninitialized
      setAudioOn(false);
    }
  };

  // 6. Toggle Audio functionality
  const toggleAudio = async () => {
    if (!audioRef.current) {
      // console.log('No audioRef.current to toggle.');
      return;
    }

    try {
      if (audioOn) {
        // console.log('Pausing audio...');
        audioRef.current.pause();
        setAudioOn(false);
        // Stop visualizer when audio is paused
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
          // console.log('Visualizer animation cancelled.');
        }
      } else {
        console.log('Attempting to play audio...');
        // Resume AudioContext if suspended (common on user interaction)
        if (audioContextRef.current?.state === 'suspended') {
          // console.log('Resuming AudioContext...');
          await audioContextRef.current.resume();
          // console.log('AudioContext resumed. State:', audioContextRef.current.state);
        }

        audioRef.current.volume = volume;
        await audioRef.current.play();
        // console.log('Audio playback initiated after toggle.');
        setAudioOn(true);

        if (!audioInitialized) {
          // console.log('Audio was not initialized (Web Audio API), setting up now.');
          // setAudioInitialized(true); // setAudioInitialized is already handled in the useEffect for initial play
          setupWebAudio(); // Re-attempt Web Audio API setup
        } else {
          // console.log('Audio already initialized, restarting visualizer animation loop.');
          drawVisualizer(); // Re-start the animation loop
        }
      }
    } catch (error) {
      console.error('Toggle audio error:', error);
      setAudioOn(false); // Ensure state reflects failure
    }
  };

  // 7. Handle Volume Change
  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // 8. Cleanup useEffect (runs on component unmount)
  useEffect(() => {
    return () => {
      // console.log('VideoBackground component unmounting. Cleaning up...');
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
        // console.log('Animation frame cancelled on unmount.');
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
          .then(() => console.log('AudioContext closed on unmount.'))
          .catch(err => console.error('Error closing AudioContext:', err));
      }
      // Reset audioInitialized to false if component unmounts for a fresh start on re-mount
      setAudioInitialized(false);
      setAudioOn(false);
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

      {/* Audio element - crucial for Web Audio API */}
      <audio
        ref={audioRef}
        src={audioSrc}
        autoPlay
        preload="auto"
        crossOrigin="anonymous" // Add this line back
        onEnded={handleSongEnd}
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
            aria-label={audioOn ? 'Pause Background Audio' : 'Play Background Audio'}
          >
            {/* Standard unicode play/pause symbols */}
            {audioOn ? '❚❚' : '▶'}
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
                aria-label="Volume Slider"
              />
              <span className={styles.volumeLabel}>{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Audio Visualizer - Positioned absolutely at the bottom */}
      <div className={styles.audioVisualizer}>
        <canvas
          ref={canvasRef}
          className={styles.visualizerCanvas}
          aria-label="Audio Visualizer"
        />
      </div>

    </div>
  );
}