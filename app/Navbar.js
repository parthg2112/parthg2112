'use client'
import Image from 'next/image';
import styles from './navbar.module.css';
import Link from 'next/link';

export default function Navbar() {
  return (
      <div className={styles.header}>
        <div className={styles.logo}>
          <Link href = "/">parthg.me</Link>
        </div>
        <nav className={styles.nav}>

          <Link
            href="/about"
            className={styles.navLink}
            data-text="Home"
            onMouseMove={(e) => {
              const target = e.target;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              target.style.setProperty('--x', `${x}px`);
            }}
          >
            About
          </Link>

          <Link
            href="/skills"
            className={styles.navLink}
            data-text="About"
            onMouseMove={(e) => {
              const target = e.target;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              target.style.setProperty('--x', `${x}px`);
            }}
          >
            Skills
          </Link>

          <Link
            href="/projects"
            className={styles.navLink}
            data-text="Project"
            onMouseMove={(e) => {
              const target = e.target;
              const rect = target.getBoundingClientRect();
              const x = e.clientX - rect.left;
              target.style.setProperty('--x', `${x}px`);
            }}
          >
            Projects
          </Link>

        </nav>
        <button className={styles.ctaButton}>
          START A PROJECT →
        </button>
      </div>
  );
}