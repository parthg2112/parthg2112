'use client';

import React, { useState, useEffect } from 'react';

const LoadingScreen = ({ onEnterSite }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(timer);
          return 100;
        }
        // Realistic loading simulation with varying speeds
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  const handleEnterSite = () => {
    setIsEntering(true);
    setTimeout(() => {
      onEnterSite();
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-800 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>

      {/* Loading Bar Container */}
      <div className="w-80 md:w-96 mb-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Loading</span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-white via-gray-300 to-white transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center mt-4 space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      {/* Enter Site Button */}
      {isComplete && (
        <button
          onClick={handleEnterSite}
          className="group relative px-8 py-4 bg-transparent border-2 border-white text-white font-semibold text-lg tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black animate-fade-in"
        >
          <span className="relative z-10">Enter Site</span>
          <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
        </button>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;