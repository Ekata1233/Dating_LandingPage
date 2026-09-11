"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Border animation: icons pop out FROM the line, drift up or down, then fade out.
 * Different shapes: flower, diamond, petal, cross, ring.
 */

type Shape = "flower" | "diamond" | "petal" | "heart" | "ring";
type Dir = "up" | "down";

interface Item {
  shape: Shape;
  dir: Dir;
  x: number;
  color: string;
  size: number;
  opacity: number;
  dur: number;
  delay: number;
}

const PINK = "#C21559";
const SOFT = "#D6336C";
const WARM = "#B31E52";
const BLUSH = "#E8849A";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateItems(seed: number, count: number): Item[] {
  const rng = seeded(seed);
  const shapes: Shape[] = ["flower", "diamond", "petal", "heart", "ring"];
  const colors = [PINK, SOFT, WARM, BLUSH];
  return Array.from({ length: count }, () => ({
    shape: shapes[Math.floor(rng() * shapes.length)],
    dir: rng() > 0.5 ? "up" : "down",
    x: 5 + rng() * 90,
    color: colors[Math.floor(rng() * colors.length)],
    size: 6 + rng() * 10,
    opacity: 0.15 + rng() * 0.2,
    dur: 3 + rng() * 3,
    delay: rng() * 3,
  }));
}

const FlowerSVG = ({ c, s }: { c: string; s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <circle cx="12" cy="6" r="3.5" />
    <circle cx="18" cy="10" r="3.5" />
    <circle cx="16" cy="17" r="3.5" />
    <circle cx="8" cy="17" r="3.5" />
    <circle cx="6" cy="10" r="3.5" />
    <circle cx="12" cy="12" r="2.5" fill="#FFF0F3" />
  </svg>
);

const DiamondSVG = ({ c, s }: { c: string; s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 2L22 12L12 22L2 12Z" />
    <path d="M12 6L18 12L12 18L6 12Z" fill="#FFF0F3" opacity="0.4" />
  </svg>
);

const PetalSVG = ({ c, s }: { c: string; s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <ellipse cx="12" cy="12" rx="5" ry="10" transform="rotate(30 12 12)" />
    <ellipse cx="12" cy="12" rx="5" ry="10" transform="rotate(-30 12 12)" opacity="0.5" />
  </svg>
);

const HeartSVG = ({ c, s }: { c: string; s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
    <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
  </svg>
);

const RingSVG = ({ c, s }: { c: string; s: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="2" />
    <circle cx="12" cy="12" r="4" stroke={c} strokeWidth="1" opacity="0.5" />
  </svg>
);

const renderShape = (shape: Shape, color: string, size: number) => {
  switch (shape) {
    case "flower": return <FlowerSVG c={color} s={size} />;
    case "diamond": return <DiamondSVG c={color} s={size} />;
    case "petal":  return <PetalSVG c={color} s={size} />;
    case "heart":   return <HeartSVG c={color} s={size} />;
    default:       return <RingSVG c={color} s={size} />;
  }
};

interface AnimatedBorderProps {
  seed?: number;
  count?: number;
}

export default function AnimatedBorder({ seed = 42, count = 14 }: AnimatedBorderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const items = React.useMemo(() => generateItems(seed, count), [seed, count]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`wv-animated-border ${active ? "is-active" : ""}`}>
      <div className="wv-animated-border__line" />

      {items.map((item, i) => (
        <span
          key={i}
          className={`wv-ab-item wv-ab-item--${item.dir}`}
          style={{
            left: `${item.x}%`,
            "--wv-ab-op": item.opacity,
            "--wv-ab-dur": `${item.dur}s`,
            "--wv-ab-delay": `${item.delay}s`,
          } as React.CSSProperties}
        >
          {renderShape(item.shape, item.color, item.size)}
        </span>
      ))}
    </div>
  );
}
