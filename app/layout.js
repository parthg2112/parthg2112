import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import VideoBackground from "./components/VideoBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'My Portfolio',
  description: 'Created for you',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VideoBackground />
        {children}
      </body>
    </html>
  );
}
