import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { WaitlistProvider } from "./context/WaitlistContext";
import { LaunchProvider } from "./context/launchContext";

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
      <body className="min-h-full flex flex-col">
        <Navbar />

        <main className="flex-1">
          <WaitlistProvider>
            <LaunchProvider>
          {children}
          </LaunchProvider>
          </WaitlistProvider>
        </main>

        <Footer />
      </body>
    </html>
  );
}