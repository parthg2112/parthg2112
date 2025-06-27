import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppWrapper from "./components/AppWrapper";
import MouseGlow from "./components/mouseglow";
import Navbar from "./Navbar";
import AudioVisualizer from "./components/AudioVisualizer";

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
          <Navbar/>
          {children}
        </AppWrapper>
        <MouseGlow />
      </body>
    </html>
  );
}
