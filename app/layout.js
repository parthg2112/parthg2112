import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppWrapper from "./components/AppWrapper";
import MouseGlow from "./components/mouseglow";
import Navbar from "./Navbar";
import SocialDrawer from "./components/SocialDrawer";

import localFont from 'next/font/local'

const pixelated = localFont({
  src: [
    {
      path: '../public/fonts/pixelated.ttf', // adjust path as needed
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/pixelated-bold.ttf', // adjust path as needed
      weight: '700',
      style: 'normal',
    }
  ],
  variable: '--font-pixelated'
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Portfolio',
  description: 'parthg.me',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppWrapper>
          <Navbar />
          
          <SocialDrawer />
          {children}
        </AppWrapper>
        <MouseGlow />
      </body>
    </html>
  );
}
