"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom hook that triggers a CSS class when an element enters the viewport.
 * Uses Intersection Observer for performance.
 *
 * @param options - IntersectionObserver options
 * @returns [ref, isVisible] - ref to attach to element, whether element is visible
 */
export function useScrollReveal(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

/**
 * Returns a delay style for staggered animations.
 * @param index - item index
 * @param baseDelay - delay between items in ms (default 80)
 */
export function staggerDelay(index: number, baseDelay = 80): React.CSSProperties {
  return { transitionDelay: `${index * baseDelay}ms` };
}
