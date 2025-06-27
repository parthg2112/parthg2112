'use client';
import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import VideoBackground from './VideoBackground';

export default function AppWrapper({ children }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const handleInitial = () => {
      const alreadyEntered = sessionStorage.getItem('hasEntered');

      if (alreadyEntered === 'true') {
        setHasEntered(true);
        setFadeIn(true);
      }

      setHasMounted(true); // now safe to show app
    };

    // Delay to ensure no hydration flicker
    setTimeout(handleInitial, 0);
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem('hasEntered', 'true');
    setHasEntered(true);
    setTimeout(() => setFadeIn(true), 200);
  };

  // Wait for hydration check before rendering
  if (!hasMounted) return null;

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
