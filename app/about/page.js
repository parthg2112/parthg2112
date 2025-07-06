'use client';

import { useEffect, useState } from 'react';

const fullText = `I'm a creative technologist and developer who blends code with design. 

Whether it's crafting dynamic UI, integrating immersive video, or building nature-inspired portfolios, I thrive on making interactive digital art. 

With a love for storytelling, music, and motion, I bring together frontend flair and backend logic to create experiences that connect.`;

export default function AboutPage() {
  // Function to check sessionStorage safely for server-side rendering
  const getInitialState = () => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('typingAnimationComplete') === 'true') {
      return {
        text: fullText,
        index: fullText.length,
        isComplete: true,
      };
    }
    return {
      text: '',
      index: 0,
      isComplete: false,
    };
  };

  const [displayedText, setDisplayedText] = useState(getInitialState().text);
  // This state will trigger the glass effect after the component mounts.
  const [isReadyForGlass, setIsReadyForGlass] = useState(false);

  // ADD THIS NEW useEffect HOOK:
  // This hook gives the browser a moment to settle after navigation,
  // then forces the style recalculation for the glass effect.
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReadyForGlass(true);
    }, 50); // A 50ms delay is usually perfect.

    return () => clearTimeout(timer); // Cleanup on unmount
  }, []); // The empty array ensures this runs only ONCE when the component mounts.

  const [currentCharIndex, setCurrentCharIndex] = useState(getInitialState().index);
  const [isTypingComplete, setIsTypingComplete] = useState(getInitialState().isComplete);

  const [completedWords, setCompletedWords] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // REMOVED: The check that stopped the effect from running again.

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
      }, 30);

      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
      // Save the completion state to sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('typingAnimationComplete', 'true');
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
    <div className="flex justify-center items-start pt-8 md:pt-30 px-4 font-['Helvetica_Neue','Helvetica','Arial','sans-serif'] main">
      <div
        className="max-w-3xl w-full p-10 rounded-3xl text-white relative overflow-hidden shadow-2xl about-container"
        onMouseMove={handleMouseMove}
        style={{
    background: `
      radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.15), transparent 40%),
      rgba(0, 0, 0, 0.2)
    `,
    // CONDITIONALLY APPLY THE FILTERS
    backdropFilter: isReadyForGlass ? 'blur(20px) saturate(180%)' : 'none',
    WebkitBackdropFilter: isReadyForGlass ? 'blur(20px) saturate(180%)' : 'none',
    
    // ADD A SMOOTH TRANSITION (OPTIONAL BUT RECOMMENDED)
    transition: 'backdrop-filter 0.3s ease-in-out',

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

        <h1 className="text-4xl mb-8 font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent relative z-10 font-['Helvetica_Neue','Helvetica','Arial','sans-serif'] tracking-tight about-title">
          About Me
        </h1>

        <div className="border-l-4 border-gradient-to-b from-cyan-400 to-purple-500 border-white/30 pl-6 relative z-10">
          <p className="text-lg leading-relaxed whitespace-pre-wrap font-normal tracking-wide about-text">
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
                      // WebkitBackgroundClip: 'text',
                      // WebkitTextFillColor: 'transparent',
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

          /* Responsive styles for mobile devices */
          @media (max-width: 768px) { /* Adjust breakpoint as needed */
            
            .about-container {
              max-width: 95%; /* Make container take up more width on small screens */
              padding: 1.5rem; /* Reduce padding for smaller screens */
            }

            .about-title {
              font-size: 2.5rem; /* Decrease title font size */
              margin-bottom: 1.5rem; /* Adjust margin */
            }

            .about-text {
              font-size: 1rem; /* Decrease paragraph font size */
              line-height: 1.6; /* Adjust line height for readability */
            }
          }
        `}</style>
      </div>
    </div>
  );
}