'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './VideoBackground.module.css';

export default function VideoBackground({ hasPermission }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [audioOn, setAudioOn] = useState(false);
  const [volume, setVolume] = useState(0.05);
  const [showVolume, setShowVolume] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');

  // Load video based on time
  useEffect(() => {
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

  // Play audio after permission
  useEffect(() => {
    if (hasPermission && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
      setAudioOn(true);
    }
  }, [hasPermission]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioOn) {
      audioRef.current.pause();
      setAudioOn(false);
    } else {
      audioRef.current.volume = volume;
      audioRef.current.play().catch(() => {});
      setAudioOn(true);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

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
      <audio ref={audioRef} src="/audio/beach.mp3" loop />

      <div
        className={styles.audioControl}
        onMouseEnter={() => setShowVolume(true)}
        onMouseLeave={() => setShowVolume(false)}
      >
        <button onClick={toggleAudio} className={styles.audioButton}>
          {audioOn ? '🔊 Audio On' : '🔇 Audio Off'}
        </button>

        {showVolume && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className={styles.volumeSlider}
          />
        )}
      </div>
    </div>
  );
}