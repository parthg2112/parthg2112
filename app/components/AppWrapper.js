'use client';
import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import VideoBackground from './VideoBackground';

export default function AppWrapper({ children }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const handleEnter = () => {
    setHasEntered(true);
    setTimeout(() => setFadeIn(true), 200); // 200ms smooth fade-in
  };

  return (
    <>
      {!hasEntered && <LoadingScreen onEnterSite={handleEnter} />}

      {hasEntered && (
        <>
          <VideoBackground hasPermission={true} />
          <div className={`fade-wrapper ${fadeIn ? 'fade-in' : ''}`}>
            {children}
          </div>
        </>
      )}
    </>
  );
}
