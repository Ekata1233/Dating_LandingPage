import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Playfair_Display,Poppins } from "next/font/google";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollProgress from "./components/ScrollProgress";
import HashHandler from "./components/HashHandler";
import { LaunchProvider } from "./context/launchContext";
import IntroVideo from "./components/Intro Video/IntroVideo";
import { LegalProvider } from "./context/legalContext";
import { EB_Garamond } from 'next/font/google';
import { Quicksand } from "next/font/google";
import { EventProvider } from "./context/EventContext";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});
const brandSerif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-brand-serif', // Updated CSS variable name
  display: 'swap',
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const metadata = {
  metadataBase: new URL("https://www.welvors.com"),

  title: "WELVORS",
  description:
    "WELVORS - A trust-driven, emotionally intelligent dating ecosystem.",

  alternates: {
    canonical: "https://www.welvors.com/",
  },

  openGraph: {
    title: "WELVORS",
    description:
      "A trust-driven, emotionally intelligent dating ecosystem.",
    url: "https://www.welvors.com/",
    siteName: "WELVORS",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
        ${geistSans.variable} ${geistMono.variable} ${brandSerif.variable} ${quicksand.variable} ${poppins.variable} 
        h-full antialiased`}
    >
      <head>
        {/* Preload video for faster loading */}
        <link rel="preload" href="/Intro1.mp4" as="video" type="video/mp4" />
        {/* Preconnect to CDN if using external hosting */}
        <link rel="dns-prefetch" href="/Intro1.mp4" />
      </head>
      <body className={`min-h-full flex flex-col`}>
        <IntroVideo>
          <HashHandler />

          <Navbar />
          <ScrollProgress />

          <main className="flex-1">
            <LaunchProvider>
              <LegalProvider>
                <EventProvider>
                  {children}
                </EventProvider>
              </LegalProvider>
            </LaunchProvider>
          </main>

          <Footer />
        </IntroVideo>
      </body>
    </html>
  );
}