'use client'
import Image from 'next/image';
import Navbar from './Navbar'
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          th.me
        </div>
        <nav className={styles.nav}>
          <a href="#"
            className={styles.navLink}
            data-text="Home"
            onMouseMove={(e) => {
              const target = e.target;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              target.style.setProperty('--x', `${x}px`);
            }}
          >
            Home
          </a>
          <a
            href="#"
            className={styles.navLink}
            data-text="About"
            onMouseMove={(e) => {
              const target = e.target;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              target.style.setProperty('--x', `${x}px`);    
            }}
          >
            About
          </a>
          <a
            href="#"
            className={styles.navLink}
            data-text="Project"
            onMouseMove={(e) => {
              const target = e.target;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              target.style.setProperty('--x', `${x}px`);
            }}
          >
            Project
          </a>
        </nav>
        <button className={styles.ctaButton}>
          START A PROJECT →
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <p className={styles.subtitle}>I'm Specialized in</p>
            <p className={styles.subtitle}>Creating Website Design.</p>
            
            <h1 className={styles.heroTitle}>th.me</h1>
          </div>
          
          <div className={styles.rightSection}>
            <div className={styles.imageContainer}>
              <div className={styles.profileImage}>
                <Image
                  src="/yzycd.jpg"
                  alt="Fredrick - Web Designer"
                  width={200}
                  height={300}
                  className={styles.profileImg}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}