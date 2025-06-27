'use client';

import { useEffect, useState } from 'react';

const fullText = `I'm a creative technologist and developer who blends code with design. 

Whether it's crafting dynamic UI, integrating immersive video, or building cyberpunk-inspired portfolios, I thrive on making interactive digital art. 

With a love for storytelling, music, and motion, I bring together frontend flair and backend logic to create experiences that connect.`;

export default function AboutPage() {
  const [displayedText, setDisplayedText] = useState('');
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [completedWords, setCompletedWords] = useState([]);
  const [currentWordStartTime, setCurrentWordStartTime] = useState(Date.now());

  useEffect(() => {
    if (currentCharIndex < fullText.length) {
      const timeout = setTimeout(() => {
        const newText = fullText.slice(0, currentCharIndex + 1);
        const prevText = displayedText;
        
        // Check if we completed a word (hit a space or end of text)
        if ((fullText[currentCharIndex] === ' ' || currentCharIndex === fullText.length - 1) && 
            prevText.length > 0) {
          const words = newText.split(/(\s+)/);
          const justCompletedWord = words[words.length - (currentCharIndex === fullText.length - 1 ? 1 : 2)];
          
          if (justCompletedWord && justCompletedWord.trim()) {
            setCompletedWords(prev => [...prev, {
              word: justCompletedWord,
              completedAt: Date.now()
            }]);
            setCurrentWordStartTime(Date.now());
          }
        }
        
        setDisplayedText(newText);
        setCurrentCharIndex(prev => prev + 1);
      }, 50); // Slightly slower for better color showcase

      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
    }
  }, [currentCharIndex, displayedText]);

  // Split text into completed words and current word being typed
  const words = displayedText.split(/(\s+)/); // Keep whitespace
  const lastWordIndex = words.length - 1;
  const completedText = words.slice(0, -1).join('');
  const currentWord = words[lastWordIndex] || '';

  // Filter out words that should fade to white (completed more than 1.5s ago)
  const now = Date.now();
  const recentlyCompletedWords = completedWords.filter(w => now - w.completedAt < 1500);

  return (
    <div className="max-w-3xl mx-auto mt-24 px-6 text-white font-['Geist',sans-serif]">
      <h1 className="text-4xl mb-6 font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        About Me
      </h1>
      
      <div className="border-l-2 border-white pl-4">
        <p className="text-lg leading-relaxed whitespace-pre-wrap">
          {/* Completed text - mix of white and recently completed RGB words */}
          {completedText.split(/(\s+)/).map((part, index) => {
            const isRecentlyCompleted = recentlyCompletedWords.some(w => w.word === part);
            
            if (isRecentlyCompleted) {
              return (
                <span 
                  key={index}
                  style={{
                    background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8, #ff6b6b)',
                    backgroundSize: '600% 600%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'rgbFlowSlow 6s ease-in-out infinite, fadeToWhiteDelayed 1.5s forwards'
                  }}
                >
                  {part}
                </span>
              );
            }
            return <span key={index} className="text-white">{part}</span>;
          })}
          
          {/* Current word being typed with RGB animation */}
          {currentWord && (
            <span 
              className="current-word"
              style={{
                background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8, #ff6b6b)',
                backgroundSize: '600% 600%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'rgbFlowSlow 6s ease-in-out infinite'
              }}
            >
              {currentWord}
            </span>
          )}
          
          {/* Animated cursor */}
          {!isTypingComplete && (
            <span 
              className="cursor inline-block w-[2px] h-[1.2rem] ml-1"
              style={{
                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #fd79a8)',
                backgroundSize: '300% 300%',
                animation: 'rgbFlow 3s ease-in-out infinite, blink 1.2s step-start infinite'
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
            -webkit-text-fill-color: white;
          }
        }
        
        .current-word {
          transition: all 0.5s ease;
        }
      `}</style>
    </div>
  );
}