'use client';
import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import VideoBackground from './VideoBackground';

export default function AppWrapper({ children }) {
  const [hasEntered, setHasEntered] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('');

  useEffect(() => {
    const handleInitial = () => {
      const alreadyEntered = sessionStorage.getItem('hasEntered');
      const hadAudioPermission = sessionStorage.getItem('audioPermission');
      const savedTimezone = localStorage.getItem('selectedTimezone');

      if (alreadyEntered === 'true') {
        setHasEntered(true);
        setFadeIn(true);
        setAudioPermission(hadAudioPermission === 'true');
        if (savedTimezone) {
          setSelectedTimezone(savedTimezone);
        }
      }

      setHasMounted(true);
    };

    setTimeout(handleInitial, 0);
  }, []);

  const handleEnter = (timezone) => {
    // Set session storage items
    sessionStorage.setItem('hasEntered', 'true');
    sessionStorage.setItem('audioPermission', 'true');
    
    // Store timezone
    if (timezone) {
      setSelectedTimezone(timezone);
      localStorage.setItem('selectedTimezone', timezone);
    }
    
    setHasEntered(true);
    setAudioPermission(true);
    
    setTimeout(() => setFadeIn(true), 200);
  };

  if (!hasMounted) return null;

  return (
    <>
      {!hasEntered && <LoadingScreen onEnterSite={handleEnter} />}

      {hasEntered && (
        <>
          <VideoBackground 
            hasPermission={audioPermission} 
            selectedTimezone={selectedTimezone}
          />
          <div className={`fade-wrapper ${fadeIn ? 'fade-in' : ''}`}>
            {children}
          </div>
        </>
      )}
      
      <style jsx>{`
        .fade-wrapper {
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }
        
        .fade-wrapper.fade-in {
          opacity: 1;
        }
      `}</style>
    </>
  );
}