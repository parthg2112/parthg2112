'use client'
import Image from 'next/image';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const words = ['student', 'engineer', 'developer', 'creative'];

const fontFamilies = [
    "'Montserrat', sans-serif",
    "'Playfair Display', serif",
    "'Permanent Marker', cursive",
    "'Pacifico', cursive",
    "'Bangers', cursive",
    "'Merriweather', serif",
    "'Dancing Script', cursive"
];

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    let timeout;

    if (isTyping) {
      if (currentText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentWord.substring(0, currentText.length + 1));
        }, 150);
      } else {
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        }, 100);
      } else {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [currentText, currentWordIndex, isTyping]);

  // useEffect for font animation
  useEffect(() => {
    const fontInterval = setInterval(() => {
      setCurrentFontIndex((prevIndex) => (prevIndex + 1) % fontFamilies.length);
    }, 2000); // Change font every 1 second (1000ms)

    return () => clearInterval(fontInterval); // Clean up interval on component unmount
  }, []);

  return (
    <div className={styles.container}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Permanent+Marker&family=Merriweather:wght@400;700&family=Dancing+Script:wght@400;700&display=swap');
        }
      `}</style>


      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            {/* NEW: Apply dynamic font style */}
            <p
              className={styles.subtitle}
              style={{ fontFamily: fontFamilies[currentFontIndex] }}
            >
              I&apos;m an 18 year old
            </p>

            <h1 className={styles.heroTitle}>
              ~{currentText}
              <span className={styles.cursor}>|</span>
            </h1>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.imageContainer}>
              <div className={styles.profileImage}>
                <Image
                  src="/newpfp.webp"
                  alt="Parth - Creative Developer"
                  width={600}
                  height={600}
                  className={styles.profileImg}
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.cliButtonWrapper}>
          <div className={styles.cliButtonGradientEffect} />
          <button className={styles.cliButton}>
            <Link href="/cli">
              SWITCH TO CLI →
            </Link>
          </button>
        </div>

      </main>
    </div>
  );
}