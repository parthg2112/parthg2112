'use client';

import { useEffect, useState } from 'react';

const fullText = `Here’s a peek into the things I’ve built, broken, and rebuilt. Most of these started with “What if I…” and ended in something fun, functional, or both.

Interview Intelligence: A real-time AI tool that listens to speech or writing and evaluates language clarity, tone, and personality using the Big Five model — made to help people prep for interviews.`;

export default function PorjectPage() {
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

                if ((fullText[currentCharIndex] === ' ' || currentCharIndex === fullText.length - 1) && prevText.length > 0) {
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
            }, 50);

            return () => clearTimeout(timeout);
        } else {
            setIsTypingComplete(true);
        }
    }, [currentCharIndex, displayedText]);

    const words = displayedText.split(/(\s+)/);
    const lastWordIndex = words.length - 1;
    const completedText = words.slice(0, -1).join('');
    const currentWord = words[lastWordIndex] || '';

    const now = Date.now();
    const recentlyCompletedWords = completedWords.filter(w => now - w.completedAt < 1500);

    return (
        <div className="flex justify-center items-start pt-46 px-4">
            <div className="max-w-3xl w-full p-12 rounded-xl text-white bg-black/30 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.3)]">
                <h1 className="text-4xl mb-6 font-semibold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    My Projects
                </h1>

                <div className="border-l-2 border-white pl-4">
                    <p className="text-lg leading-relaxed whitespace-pre-wrap">
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
        </div>
    );
} 
