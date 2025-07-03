'use client';

import { useEffect, useState } from 'react';

const fullText = `Here's a peek into things I've built, broken, and rebuilt.
Most started with "What if I…" and ended up fun, functional, or both.

SAANai – Interview Intelligence: A real-time AI tool that analyzes speech or writing to assess clarity, tone, and personality using the Big Five Model.
Built to help users prep for interviews or public speaking with actionable, psychology-driven feedback.

MindMarket – AI-Powered Ad Targeting: An intelligent ad system that studies a user's digital behavior searches, purchases, patterns, to recommend products with uncanny relevance.
It aims to predict what you want before you even type it.

My Portfolio: Built with Next.js, React, and Tailwind CSS, this site is a creative showcase featuring real-time visuals, audio-reactive effects, and interactive components.
It's fast, expressive, and a reflection of how I blend tech with design.`;

export default function AboutPage() {
  // Check if typing was completed in this session
  const getTypingCompleted = () => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('projectsTypingCompleted') === 'true';
    }
    return false;
  };

  const [displayedText, setDisplayedText] = useState(() => getTypingCompleted() ? fullText : '');
  const [currentCharIndex, setCurrentCharIndex] = useState(() => getTypingCompleted() ? fullText.length : 0);
  const [isTypingComplete, setIsTypingComplete] = useState(() => getTypingCompleted());
  const [completedWords, setCompletedWords] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // If typing was already completed, don't restart it
    if (getTypingCompleted()) {
      return;
    }

    if (currentCharIndex < fullText.length) {
      const timeout = setTimeout(() => {
        const newText = fullText.slice(0, currentCharIndex + 1);
        const prevText = displayedText;

        if ((fullText[currentCharIndex] === ' ' || currentCharIndex === fullText.length - 1) && prevText.length > 0) {
          const words = newText.split(/(\s+)/);
          const justCompletedWord = words[words.length - (currentCharIndex === fullText.length - 1 ? 1 : 2)];

          if (justCompletedWord && justCompletedWord.trim()) {
            setCompletedWords(prev => [...prev, {
              word: justCompletedWord,
              completedAt: Date.now()
            }]);
          }
        }

        setDisplayedText(newText);
        setCurrentCharIndex(prev => prev + 1);
      }, 50);

      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
      // Mark as completed in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('projectsTypingCompleted', 'true');
      }
    }
  }, [currentCharIndex, displayedText]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const words = displayedText.split(/(\s+)/);
  const lastWordIndex = words.length - 1;
  const completedText = words.slice(0, -1).join('');
  const currentWord = words[lastWordIndex] || '';

  const now = Date.now();
  const recentlyCompletedWords = completedWords.filter(w => now - w.completedAt < 1500);

  return (
    <div className="flex justify-center items-start pt-30 px-4 font-['Helvetica_Neue','Helvetica','Arial','sans-serif']">
      <div 
        className="max-w-3xl w-full p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl"
        onMouseMove={handleMouseMove}
        style={{
          background: `
            radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.15), transparent 40%),
            rgba(0, 0, 0, 0.2)
          `,
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Enhanced glowing border effect */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-60 transition-all duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.3), rgba(168, 85, 247, 0.2) 40%, transparent 70%)`,
            filter: 'blur(1px)',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'subtract',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'subtract',
            padding: '1px'
          }}
        />

        {/* Subtle inner glow */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-30 transition-all duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(34, 211, 238, 0.25), transparent 60%)`,
          }}
        />

        <h1 className="text-4xl mb-8 font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent relative z-10 font-['Helvetica_Neue','Helvetica','Arial','sans-serif'] tracking-tight">
          Projects
        </h1>

        <div className="border-l-4 border-gradient-to-b from-cyan-400 to-purple-500 border-white/30 pl-6 relative z-10">
          <p className="text-lg leading-relaxed whitespace-pre-wrap font-normal tracking-wide">
            {completedText.split(/(\s+)/).map((part, index) => {
              const isRecentlyCompleted = recentlyCompletedWords.some(w => w.word === part);

              if (isRecentlyCompleted) {
                return (
                  <span
                    key={index}
                    className="transition-all duration-1500"
                    style={{
                      background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8, #ff6b6b)',
                      backgroundSize: '600% 600%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'rgbFlowSlow 6s ease-in-out infinite, fadeToWhiteDelayed 1.5s forwards',
                      filter: 'drop-shadow(0 0 8px rgba(255, 107, 107, 0.3))'
                    }}
                  >
                    {part}
                  </span>
                );
              }
              return <span key={index} className="text-white/90">{part}</span>;
            })}

            {currentWord && !isTypingComplete && (
              <span
                className="transition-all duration-300"
                style={{
                  background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8, #ff6b6b)',
                  backgroundSize: '600% 600%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'rgbFlowSlow 6s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 8px rgba(255, 107, 107, 0.3))'
                }}
              >
                {currentWord}
              </span>
            )}

            {/* Show remaining text with continuous RGB flow if typing is complete */}
            {isTypingComplete && currentWord && (
              <span
                className="transition-all duration-300"
                style={{
                  background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8, #ff6b6b)',
                  backgroundSize: '600% 600%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'rgbFlowSlow 6s ease-in-out infinite',
                  filter: 'drop-shadow(0 0 8px rgba(255, 107, 107, 0.3))'
                }}
              >
                {currentWord}
              </span>
            )}

            {!isTypingComplete && (
              <span
                className="inline-block w-0.5 h-6 ml-1 shadow-lg"
                style={{
                  background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
                  backgroundSize: '300% 300%',
                  animation: 'rgbFlow 3s ease-in-out infinite, blink 1.2s step-start infinite',
                  filter: 'drop-shadow(0 0 4px rgba(255, 107, 107, 0.5))'
                }}
              />
            )}
          </p>
        </div>

        <style jsx>{`
          @keyframes rgbFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes rgbFlowSlow {
            0% { background-position: 0% 50%; }
            25% { background-position: 50% 50%; }
            50% { background-position: 100% 50%; }
            75% { background-position: 50% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes blink {
            0%, 60% { opacity: 1; }
            61%, 100% { opacity: 0; }
          }

          @keyframes fadeToWhiteDelayed {
            0% {
              -webkit-text-fill-color: transparent;
            }
            90% {
              -webkit-text-fill-color: transparent;
            }
            100% {
              -webkit-text-fill-color: rgba(255, 255, 255, 0.9);
            }
          }
        `}</style>
      </div>
    </div>
  );
}