'use client';
import { useRef, useEffect } from 'react';

export default function MouseGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const moveGlow = (e) => {
      const { clientX, clientY } = e;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
      }
    };

    window.addEventListener('mousemove', moveGlow);
    return () => window.removeEventListener('mousemove', moveGlow);
  }, []);

  return (
    <div
      ref={glowRef}
      className="fixed top-0 left-0 w-[50px] h-[50px] pointer-events-none z-50
        rounded-full mix-blend-screen opacity-70
        -translate-x-1/2 -translate-y-1/2
        bg-[radial-gradient(ellipse_at_center,_#ffffff20_0%,_#ffffff08_40%,_transparent_50%)]
        shadow-[0_0_50px_10px_rgba(255,255,255,0.1)]
        backdrop-blur-[1px]
        before:content-[''] before:absolute before:inset-0
        before:bg-cover before:opacity-30 before:rounded-full
        before:mix-blend-overlay"
    />
  );
}
