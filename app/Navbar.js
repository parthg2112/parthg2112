'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation'; // 1. Import the usePathname hook

export default function Navbar() {
  const pathname = usePathname(); // 2. Get the current path
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

  // 3. Add this condition to hide the navbar on the /cli page
  // if (pathname === '/cli') {
  //   return null;
  // }

  if (!mounted) {
    return null;
  }

  const isHiddenOnCli = pathname === '/cli';

  return (
    <>
      <style jsx global>{`
        /* CRITICAL FIX: Re-establishing the global stacking context.
          This ensures the browser knows what content is 'behind' the navbar.
        */
        body {
          position: relative;
          z-index: 0;
        }

        main {
          position: relative;
          z-index: 1;
        }

        .glass-navbar-fixed {
          top: 0;
          z-index: 1000; /* Must be higher than main's z-index */
          
          /* Force hardware acceleration */
          isolation: isolate;
          transform: translate3d(0, 0, 0);
          
          /* The blur effect */
          // -webkit-backdrop-filter: blur(20px) saturate(180%);
          // backdrop-filter: blur(20px) saturate(180%);
          // background-color: rgba(255, 255, 255, 0.1);
          padding-bottom: 40px;
          border-bottom: 2px solid rgba(255, 255, 255, 0.1);
        }
        
        @keyframes gradient-flow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient-flow {
          animation: gradient-flow 3s ease infinite;
        }

        /* Hide the mobile-only home link by default (for desktop) */
        .home-link-mobile-only {
          display: none; 
        }

        /* Responsive styles */
        @media (max-width: 768px) { /* Adjust breakpoint as needed for handheld devices */
          .glass-navbar-fixed {
            padding: 1rem; /* Adjust padding for smaller screens */
          }
          
          /* Hide the 'parthg.me' logo on mobile */
          .logo-hidden-on-mobile {
            display: none;
          }
          
          /* Show the mobile-only home link on mobile */
          .home-link-mobile-only {
            display: flex; /* or inline-block, block depending on desired layout */
          }

          /* Hide the 'SWITCH TO CLI' button on mobile */
          .button-hidden-on-mobile {
            display: none;
          }
          
          .navbar-nav-mobile-full-width {
            flex-grow: 1; /* Allow navigation to take full width */
            max-width: 100%; /* Ensure navigation takes full width */
            justify-content: space-around; /* Distribute items evenly */
          }
        }

        /* Import Marck Script for logo */
        @import url('https://fonts.googleapis.com/css2?family=Marck+Script&display=swap');
        /* Import Press Start 2P for nav links */
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        /* NEW: Import Montserrat for the button */
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');

        /* LOCAL FONT DEFINITIONS */
        @font-face {
          font-family: 'pixelated';
          src: url('/fonts/pixelated.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'pixelated-Bold';
          src: url('/fonts/pixelated-bold.ttf') format('truetype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        /* Style for the logo text */
        .logo-font-marck-script {
          font-family: 'Marck Script', cursive;
          font-weight: 700;
        }

        /* UPDATED: Style for the pixelated nav links font */
        .nav-link-pixel-font {
          font-family: 'pixelated', 'Press Start 2P', cursive;
          font-size: 1.05rem; /* Slightly smaller for pixel font */
          /* Enhancements for more pixelated look */
          text-rendering: crisp-edges;
          -webkit-font-smoothing: none;
          -moz-osx-font-smoothing: grayscale;
          transition: font-family 0.3s ease;
        }

        /* HOVER STATE: Change to bold pixelated font */
        .group:hover .nav-link-pixel-font {
          font-family: 'pixelated-Bold', 'Press Start 2P', cursive;
        }

        .font-montserrat {
          font-family: 'Montserrat', sans-serif;
        }

        /* UPDATED: Default white glow for nav link text (reduced intensity) */
        .text-default-glow {
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.7), 0 0 6px rgba(255, 255, 255, 0.4);
          transition: text-shadow 0.3s ease-in-out;
        }

        /* Remove glow on hover for better contrast with black text */
        .group:hover .text-default-glow {
            text-shadow: none;
        }
        
        .hidden-on-cli {
          display: none;
        }

        /* BUTTON FONT STYLES */
        .button-pixel-font {
          font-family: 'pixelated', 'Press Start 2P', cursive;
          transition: font-family 0.3s ease;
        }
      `}</style>

      <div
        className=" glass-navbar-fixed flex justify-between items-center p-6 overflow-hidden font-['Crimson Text', 'Georgia', 'Times New Roman', 'serif'] ${isHiddenOnCli ? 'hidden-on-cli' : ''}`"
      >
        {/* Original parthg.me link, now hidden on mobile */}
        <div className="text-xl font-bold -tracking-wider relative z-10 logo-hidden-on-mobile">
          <Link href="/" className="text-white hover:text-gray-300 transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.6)] logo-font-marck-script">
            parthg.me
          </Link>
        </div>

        <nav className="flex justify-between flex-1 max-w-md mx-auto relative z-10 font-medium navbar-nav-mobile-full-width">
          {/* New Home link for mobile devices */}
          <Link
            href="/"
            // UPDATED: Reduced padding for smaller hover rectangle
            className="group relative text-white/90 text-lg font-normal px-2 py-1 transition-all duration-300 hover:text-white rounded-lg home-link-mobile-only"
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10 text-default-glow nav-link-pixel-font">~/</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 transition-all duration-300" />
            <span
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{
                left: 'var(--x, 50%)',
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>

          <Link
            href="/about"
            // MODIFIED: hover:text-black and hover:bg-white
            // UPDATED: Reduced padding for smaller hover rectangle (px-2 py-1)
            className="group relative text-white/90 text-lg font-normal px-2 py-1 transition-all duration-300 rounded-lg "
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10 text-default-glow nav-link-pixel-font">ABOUT</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 transition-all duration-300" />
            <span
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{
                left: 'var(--x, 50%)',
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>

          <Link
            href="/skills"
            // MODIFIED: hover:text-black and hover:bg-white
            // UPDATED: Reduced padding for smaller hover rectangle (px-2 py-1)
            className="group relative text-white/90 text-lg font-normal px-2 py-1 transition-all duration-30 rounded-lg"
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10 text-default-glow nav-link-pixel-font">SKILLS</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 transition-all duration-300" />
            <span
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 group transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{
                left: 'var(--x, 50%)',
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>

          <Link
            href="/projects"
            // MODIFIED: hover:text-black and hover:bg-white
            // UPDATED: Reduced padding for smaller hover rectangle (px-2 py-1)
            className="group relative text-white/90 text-lg font-normal px-2 py-1 transition-all duration-300 rounded-lg "
            onMouseMove={handleNavLinkMouseMove}
          >
            <span className="relative z-10 text-default-glow nav-link-pixel-font">PROJECTS</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-black/30 to-gray-700/30 opacity-0 transition-all duration-300" />
            <span
              className="absolute top-1/2 w-1.5 h-1.5 bg-gray-400 rounded-full opacity-0 transition-all duration-300 pointer-events-none -translate-y-1/2 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
              style={{
                left: 'var(--x, 50%)',
                transform: 'translateX(-50%) translateY(-50%)',
                filter: 'blur(0.5px)'
              }}
            />
          </Link>
        </nav>

        {/* The SWITCH TO CLI button, still hidden on mobile */}
        <div className="relative group button-hidden-on-mobile">
          <div
            className="absolute -inset-0.5 rounded-full opacity-100 transition-all duration-300 animate-gradient-flow"
            style={{
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3), rgba(255,255,255,0.6), rgba(255,255,255,0.8), rgba(255,255,255,1), rgba(255,255,255,0.8), rgba(255,255,255,0.6), rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
              backgroundSize: '400% 400%',
              filter: 'blur(0.5px)'
            }}
          />
          <button className="relative bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm cursor-pointer transition-all duration-300 z-10 group-hover:shadow-2xl group-hover:bg-black/95">
            {/* UPDATED: Applied pixelated font to the Link inside the button */}
            <Link href="/cli" className="button-pixel-font">
              SWITCH TO CLI →
            </Link>
          </button>
        </div>
      </div>
    </>
  );
}