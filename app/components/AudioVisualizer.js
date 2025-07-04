'use client';
import { useEffect, useRef, useState } from 'react';

export default function AudioVisualizer({ hasPermission, trackSrc = "/audio/track1.mp3" }) {
    const audioRef = useRef(null);
    const canvasRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioInitialized, setAudioInitialized] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = 180;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Audio event listeners
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('ended', handleEnded);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('ended', handleEnded);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    // Initialize audio when permission is granted
    useEffect(() => {
        if (hasPermission && audioRef.current && !audioInitialized) {
            const initializeAudio = async () => {
                try {
                    console.log('Initializing AudioVisualizer audio...');
                    
                    // Initialize audio context only if not already created
                    if (!audioCtxRef.current) {
                        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
                        analyserRef.current = audioCtxRef.current.createAnalyser();
                        
                        // Only create MediaElementSource if it doesn't exist
                        if (!sourceRef.current) {
                            sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
                            sourceRef.current.connect(analyserRef.current);
                            analyserRef.current.connect(audioCtxRef.current.destination);
                        }
                        
                        // Configure analyser for clean waveform
                        analyserRef.current.fftSize = 2048;
                        analyserRef.current.smoothingTimeConstant = 0.7;
                    }

                    // Resume audio context if suspended
                    if (audioCtxRef.current.state === 'suspended') {
                        await audioCtxRef.current.resume();
                    }

                    // Start playing audio
                    await audioRef.current.play();
                    setIsPlaying(true);
                    setAudioInitialized(true);
                    
                    // Start visualization
                    startVisualization();
                    
                } catch (error) {
                    console.error('Error initializing AudioVisualizer:', error);
                }
            };

            initializeAudio();
        }
    }, [hasPermission, audioInitialized]);

    const startVisualization = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const waveArray = new Uint8Array(analyserRef.current.fftSize);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            
            // Get waveform data
            analyserRef.current.getByteTimeDomainData(waveArray);

            // Clear canvas completely for clean look
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw waveform
            drawCleanWaveform(ctx, waveArray, canvas);
        };

        draw();
    };

    const drawCleanWaveform = (ctx, data, canvas) => {
        // Main waveform
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';

        const sliceWidth = canvas.width / data.length;
        let x = 0;

        // Create smooth curve points
        const points = [];
        for (let i = 0; i < data.length; i++) {
            const v = data[i] / 128.0; // Normalize to -1 to 1
            const y = (v * canvas.height / 2.5) + (canvas.height / 2); // Center and scale
            points.push({ x, y });
            x += sliceWidth;
        }

        // Draw smooth curve
        if (points.length > 0) {
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length - 1; i++) {
                const currentPoint = points[i];
                const nextPoint = points[i + 1];
                const controlX = (currentPoint.x + nextPoint.x) / 2;
                const controlY = (currentPoint.y + nextPoint.y) / 2;
                
                ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, controlX, controlY);
            }
            
            if (points.length > 1) {
                const lastPoint = points[points.length - 1];
                ctx.lineTo(lastPoint.x, lastPoint.y);
            }
        }

        ctx.stroke();
    };

    // Manual control functions for external use
    const togglePlayPause = async () => {
        if (!audioRef.current || !hasPermission) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                if (audioCtxRef.current?.state === 'suspended') {
                    await audioCtxRef.current.resume();
                }
                await audioRef.current.play();
            }
        } catch (error) {
            console.error('Error toggling audio:', error);
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close();
            }
        };
    }, []);

    return (
        <div className="fixed bottom-0 left-0 w-full h-[180px] z-50 bg-transparent">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ width: '100vw', height: '180px' }}
            />
            <audio
                ref={audioRef}
                src={trackSrc}
                preload="auto"
                className="hidden"
                crossOrigin="anonymous"
            />
            
            {/* Status indicator */}
            <div className="absolute top-4 left-4 text-white text-sm opacity-70 pointer-events-none">
                {!hasPermission ? 'Audio disabled' : !isPlaying ? 'Audio paused' : 'Audio playing'}
            </div>
            
            {/* Optional: Manual control button */}
            {hasPermission && (
                <button
                    onClick={togglePlayPause}
                    className="absolute top-4 right-4 text-white text-sm bg-black/50 px-3 py-1 rounded opacity-70 hover:opacity-100 transition-opacity"
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>
            )}
        </div>
    );
}