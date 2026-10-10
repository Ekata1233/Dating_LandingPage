import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, Poppins } from "next/font/google";
import { EB_Garamond } from "next/font/google";
import { Quicksand } from "next/font/google";
import { Figtree } from "next/font/google";
import "./globals.css";

import ScrollProgress from "./components/ScrollProgress";
import HashHandler from "./components/HashHandler";
import IntroVideo from "./components/Intro Video/IntroVideo";

import { LaunchProvider } from "./context/launchContext";
import { LegalProvider } from "./context/legalContext";
import { EventProvider } from "./context/EventContext";

import ConditionalNavbar from "@/app/components/ui/ConditionalNavbar";
import ConditionalFooter from "./components/ui/ConditionalFooter";
import { ActiveSectionProvider } from "./context/ActiveSectionContext";
import { UsersProvider } from "./context/UsersContext";
import { AccountSettingsProvider } from "./context/AccountSettingsContext";
import { Toaster } from "sonner";
import { UserProfileDataProvider } from "./context/UserProfileDataContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const brandSerif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-brand-serif",
  display: "swap",
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
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.welvors.com"),

  title: "WELVORS",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  }, description:
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
        ${geistSans.variable}
        ${geistMono.variable}
        ${brandSerif.variable}
        ${quicksand.variable}
        ${poppins.variable}
        ${figtree.variable}
        h-full
        antialiased
      `}
    >
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link
          rel="preload"
          href="/Intro1.mp4"
          as="video"
          type="video/mp4"
        />

        <link rel="dns-prefetch" href="/Intro1.mp4" />
      </head>

      <body className="flex min-h-full flex-col">
        <IntroVideo>
          <HashHandler />

          <ConditionalNavbar />

          <ScrollProgress />

          <main className="flex-1">
            <UsersProvider>
              <LegalProvider>
                <EventProvider>
                  <ActiveSectionProvider>
                    <AccountSettingsProvider >
                      <UserProfileDataProvider >
                        {children}
                        <Toaster position="bottom-right" richColors />
                      </UserProfileDataProvider>
                    </AccountSettingsProvider>
                  </ActiveSectionProvider>
                </EventProvider>
              </LegalProvider>
            </UsersProvider>
          </main>

          <ConditionalFooter />
        </IntroVideo>
      </body>
    </html>
  );
}