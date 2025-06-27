'use client'
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.leftSection}>
            <p className={styles.subtitle}>I'm Specialized in</p>
            <p className={styles.subtitle}>Creating Website Design.</p>

            <h1 className={styles.heroTitle}>parthg.me</h1>
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