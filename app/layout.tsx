import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollProgress from "./components/ScrollProgress";
import { WaitlistProvider } from "./context/WaitlistContext";
import { LaunchProvider } from "./context/launchContext";
import IntroVideo from "./components/Intro Video/IntroVideo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Welvors",
  description: "Welvors Landing Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preload video for faster loading */}
        <link rel="preload" href="/Intro1.mp4" as="video" type="video/mp4" />
        {/* Preconnect to CDN if using external hosting */}
        <link rel="dns-prefetch" href="/Intro1.mp4" />
      </head>
      <body className="min-h-full flex flex-col">
        <IntroVideo>

        <Navbar />
        <ScrollProgress />

        <main className="flex-1">
          <WaitlistProvider>
            <LaunchProvider>
          {children}
          </LaunchProvider>
          </WaitlistProvider>
        </main>

        <Footer />
        </IntroVideo>
      </body>
    </html>
  );
}