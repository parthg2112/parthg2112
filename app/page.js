'use client'
import Image from 'next/image';
import styles from './page.module.css';
import { useState, useEffect } from 'react';

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const words = ['student', 'engineer', 'developer', 'creative'];

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
        }, 2000);
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
  }, [currentText, currentWordIndex, isTyping, words]);

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <p className={styles.subtitle}>I&apos;m a 18 year old</p>

            <h1 className={styles.heroTitle}>
              ~{currentText}
              <span className={styles.cursor}>|</span>
            </h1>
          </div>

          <div className={styles.rightSection}>
            <div className={styles.imageContainer}>
              <div className={styles.profileImage}>
                <Image
                  src="/newpfp.jpg"
                  alt="Fredrick - Web Designer"
                  width={600}
                  height={600}
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