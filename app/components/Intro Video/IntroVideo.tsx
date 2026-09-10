'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface IntroVideoProps {
  children: React.ReactNode;
}

export default function IntroVideo({ children }: IntroVideoProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [showIntro, setShowIntro] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'entering' | 'playing' | 'exiting'>('entering');
  const [loadStartTime] = useState(Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Prevent body scroll while intro is showing
    document.body.style.overflow = 'hidden';
    
    // Start loading video immediately
    const video = videoRef.current;
    if (video) {
      video.load();
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Restore scroll when navigating away from home
  useEffect(() => {
    if (!isHome) {
      document.body.style.overflow = '';
    }
  }, [isHome]);

  // Entry phase
  useEffect(() => {
    if (videoReady) {
      const timer = setTimeout(() => setPhase('playing'), 100);
      return () => clearTimeout(timer);
    }
  }, [videoReady]);

  // Track video progress with optimized updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let animFrame: number;
    const updateProgress = () => {
      if (video.duration && video.currentTime > 0) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      animFrame = requestAnimationFrame(updateProgress);
    };

    // Use requestAnimationFrame for smoother updates
    animFrame = requestAnimationFrame(updateProgress);
    
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [videoReady]);

  const endIntro = useCallback(() => {
    if (phase === 'exiting') return;
    setPhase('exiting');
    setTimeout(() => {
      setShowIntro(false);
      document.body.style.overflow = '';
    }, 1200);
  }, [phase]);

  // Handle video canplay through for faster start
  const handleCanPlayThrough = useCallback(() => {
    const loadTime = Date.now() - loadStartTime;
    console.log(`Video loaded in ${loadTime}ms`);
    setVideoReady(true);
  }, [loadStartTime]);

  if (!isHome || !showIntro) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Video with optimized loading */}
      <video
        ref={videoRef}
        src="/Intro1.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        onCanPlayThrough={handleCanPlayThrough}
        onCanPlay={() => !videoReady && setVideoReady(true)}
        onEnded={endIntro}
        onError={(e) => {
          console.error('Video load error:', e);
          // Fallback: skip intro on error
          setVideoReady(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
          phase === 'entering'
            ? 'opacity-0 scale-110 blur-sm'
            : phase === 'exiting'
            ? 'opacity-0 scale-95 blur-md'
            : 'opacity-100 scale-100 blur-0'
        }`}
      />

      {/* Loading state with progress indicator */}
      {!videoReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black">
          <div className="relative">
            {/* Outer ring */}
            <div className="h-16 w-16 rounded-full border-2 border-white/10" />
            {/* Spinning inner */}
            <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-[#C21559]" />
          </div>
          <p className="mt-4 text-sm text-white/50">Loading...</p>
        </div>
      )}

      {/* Gradient overlays */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${
        phase === 'entering' ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
      </div>

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />

      {/* Foreground UI */}
      <div className={`relative z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-20 text-center sm:pb-24 transition-all duration-1000 ease-out ${
        phase === 'entering'
          ? 'opacity-0 translate-y-12'
          : phase === 'exiting'
          ? 'opacity-0 -translate-y-8 scale-95'
          : 'opacity-100 translate-y-0 scale-100'
      }`}>
        {/* Logo */}
        <div className="mb-6">
          <span className="text-4xl font-bold tracking-wide text-white sm:text-5xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Welvors
          </span>
        </div>

        {/* CTA button */}
        <button
          onClick={endIntro}
          disabled={phase === 'exiting'}
          className="group flex items-center gap-3 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:border-white/60 hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Heart icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="text-[#C21559]"
          >
            <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
          </svg>
          <span className="text-sm font-semibold tracking-[0.2em]">
            BEGIN JOURNEY
          </span>
          {/* Arrow icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        <p className="mt-4 text-xs text-white/50">
          or video will take you there automatically
        </p>
      </div>

      {/* Progress bar container */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-700 ${
        phase === 'entering' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}>
        
        {/* Progress track */}
        <div className="relative h-[3px] w-full bg-white/10">
          {/* Glow layer */}
          <div
            className="absolute inset-0 h-full transition-all duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C21559, #D6336C, #C93B68)',
              boxShadow: '0 0 15px rgba(194, 21, 89, 0.8), 0 0 8px rgba(194, 21, 89, 1)',
              filter: 'blur(2px)',
            }}
          />
          {/* Solid bar */}
          <div
            className="absolute inset-0 h-full transition-all duration-300 ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #C21559, #E91E7A, #C93B68)',
            }}
          />
        </div>
      </div>

      {/* Exit overlay with different effect */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-all duration-1200 ${
          phase === 'exiting' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: phase === 'exiting'
            ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.95) 100%)'
            : 'transparent',
          transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </div>
  );
}
