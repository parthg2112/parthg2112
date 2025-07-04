'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavLinkMouseMove = (e) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    target.style.setProperty('--x', `${x}px`);
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <style jsx global>{`
        .glass-navbar-fixed {
          position: sticky;
          top: 0;
          z-index: 1000;
          
          /* --- Key additions to force GPU rendering --- */
          isolation: isolate;
          transform: translate3d(0, 0, 0); /* Forces the element onto its own layer */
          will-change: backdrop-filter;  /* Tells the browser to optimize for this property */
          
          /* Visual Styles */
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          backdrop-filter: blur(20px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-flow {
          animation: gradient-flow 3s ease infinite;
        }
      `}</style>

      <div 
        className="glass-navbar-fixed flex justify-between items-center p-6 overflow-hidden font-['Crimson Text', 'Georgia', 'Times New Roman', 'serif']"
      >
        <div className="text-xl font-bold -tracking-wider relative z-10 font-['Helvetica_Neue','Helvetica','Arial','sans-serif']">
          <Link href="/" className="text-white hover:text-gray-300 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.6)]">
            parthg.me
          </Link>
        </div>

        <nav className="flex justify-between flex-1 max-w-md mx-auto relative z-10 font-medium">
          <Link
            href="/about"
            className="group relative text-white/90 text-lg font-normal px-4 py-2 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.6)] rounded-lg hover:bg-black/10"
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10">ABOUT</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <span 
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{ 
                left: 'var(--x, 50%)', 
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>

          <Link
            href="/skills"
            className="group relative text-white/90 text-lg font-normal px-4 py-2 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.6)] rounded-lg hover:bg-black/10"
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10">SKILLS</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <span 
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{ 
                left: 'var(--x, 50%)', 
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>

          <Link
            href="/projects"  
            className="group relative text-white/90 text-lg font-normal px-4 py-2 transition-all duration-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.6)] rounded-lg hover:bg-black/10"
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10">PROJECTS</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 group-hover:opacity-100 transition-all duration-300" />
            <span 
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{ 
                left: 'var(--x, 50%)', 
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>
        </nav>

        <div className="relative group">
          <div 
            className="absolute -inset-0.5 rounded-full opacity-100 transition-all duration-300 animate-gradient-flow"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.8), rgba(255,255,255,1), rgba(255,255,255,0.8), rgba(255,255,255,0.6), rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              backgroundSize: '400% 400%',
              filter: 'blur(0.5px)'
            }}
          />
          <button className="relative bg-gray-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold cursor-pointer transition-all duration-300 z-10 group-hover:shadow-2xl group-hover:bg-black/95 font-['Helvetica_Neue','Helvetica','Arial','sans-serif']">
            <Link href="/cli">
              SWITCH TO CLI →
            </Link>
          </button>
        </div>
      </div>
    </>
  );
}