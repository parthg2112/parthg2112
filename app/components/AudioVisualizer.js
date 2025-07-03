// AudioVisualizer.jsx
'use client';
import styles from '../cli/page.module.css'
import { useEffect, useRef } from 'react';

export default function AudioVisualizer({ audioRef }) {
  const canvasRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioRef.current);

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = 128;

    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = 100;

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength);
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 0.5;
        ctx.fillStyle = 'rgb(255 255 255 / 0.9)';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };

    draw();

    return () => {
      analyser.disconnect();
      source.disconnect();
    };
  }, [audioRef]);

  return (
    <canvas ref={canvasRef} className="w-full h-[100px] absolute bottom-0 left-0 z-10" />
  );
}
