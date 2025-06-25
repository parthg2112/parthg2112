'use client'
import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.logo}>
          th.me
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Home</a>
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Project</a>
        </nav>

      </div>
      <style jsx>{`
        .container {
        min-height: 100vh;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        overflow-x: hidden;
        }

        /* Header */
        .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 2rem;
        position: relative;
        z-index: 10;
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.02);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        }

        .nav {
        display: flex;
        gap: 2rem;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        }

        .navLink {
        color: #ffffff;
        text-decoration: none;
        font-size: 0.95rem;
        font-weight: 400;
        transition: opacity 0.2s ease;
        }

        .navLink:hover {
        opacity: 0.7;
        }
      `}
      </style>
    </div>
  );
}