'use client';
import { useRef } from 'react';
import AudioVisualizer from './AudioVisualizer';

export default function AudioWrapper({ children }) {
  const audioRef = useRef(null);

  return (
    <>
      <audio ref={audioRef} src="/audio/track1.mp3" autoPlay loop />
      <AudioVisualizer audioRef={audioRef} />
      {children}
    </>
  );
}
