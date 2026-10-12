"use client";

import React, { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  NoLikesBoost  (STATIC – no API calls)                                     */
/*                                                                            */
/*  "No likes yet" empty state that nudges the person to Boost their profile. */
/*  Same rules as the other screens:                                          */
/*   - fills 100% width / height of its PARENT                                */
/*   - every size is in `cqw` (1% of the parent's width)                      */
/*   - content scrolls vertically if the parent is short, scrollbar hidden    */
/*                                                                            */
/*  Animations (all CSS, disabled automatically for prefers-reduced-motion):  */
/*   - rocket badge floats, with two ripple rings and twinkling sparkles      */
/*   - everything else fades / slides in with a stagger                       */
/*   - stat numbers count up (0 → 10×, 0 → 3×, 0 → 30)                        */
/*   - CTA has a soft glow pulse and a light sweep                            */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <NoLikesBoost fluid onBoost={() => router.push("/boost")}             */
/*                    onImproveProfile={() => router.push("/profile")} />     */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

export interface NoLikesBoostProps {
    /** "🚀 Boost my profile now ›" */
    onBoost?: () => void;
    /** "Or improve your profile to get more likes" */
    onImproveProfile?: () => void;

    fluid?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/* ------------------------------ static content ----------------------------- */
const STATS = [
    { value: 10, suffix: "×", label: "more views" },
    { value: 3, suffix: "×", label: "more likes" },
    { value: 30, suffix: "", label: "min live" },
];

const BENEFITS = [
    { icon: "👀", title: "Be seen first", text: "Top spot for verified singles near you" },
    { icon: "❤️", title: "Get your first likes fast", text: "Most boosted profiles get likes within 30 min" },
    { icon: "📊", title: "Track every view", text: "See who viewed and liked you, live" },
];

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;

const C = {
    purple: "#7c3aed",
    purpleDeep: "#6d28d9",
    purpleText: "#7a3fd6",
    purpleTint: "#f4f0ff",
    ink: "#1f1f24",
    body: "#6b6560",
    grey: "#8f8a85",
    border: "#ece8e4",
    white: "#ffffff",
    page: "#faf8f6",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** counts from 0 to `target`; jumps straight to the end for reduced-motion users */
function useCountUp(target: number, delayMs: number, durationMs = 1000) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
            setValue(target);
            return;
        }
        let raf = 0;
        let start: number | undefined;
        const tick = (now: number) => {
            if (start === undefined) start = now;
            const p = Math.min(1, (now - start) / durationMs);
            setValue(Math.round(target * (1 - Math.pow(1 - p, 3)))); // ease-out
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        const timer = window.setTimeout(() => {
            raf = requestAnimationFrame(tick);
        }, delayMs);
        return () => {
            window.clearTimeout(timer);
            cancelAnimationFrame(raf);
        };
    }, [target, delayMs, durationMs]);

    return value;
}

const StatCard = ({
    value,
    suffix,
    label,
    index,
}: {
    value: number;
    suffix: string;
    label: string;
    index: number;
}) => {
    const delay = 650 + index * 120;
    const shown = useCountUp(value, delay + 150);
    return (
        <div
            className="nlb-anim nlb-pop"
            style={{
                ["--d" as string]: `${delay}ms`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: U(0.8),
                height: U(12.6),
                borderRadius: U(4.2),
                background: C.purpleTint,
            }}
        >
            <span style={{ fontSize: U(4.1), fontWeight: 700, color: C.purpleText, lineHeight: 1 }}>
                {shown}
                {suffix && <span style={{ fontSize: "0.7em", marginLeft: "0.05em" }}>{suffix}</span>}
            </span>
            <span style={{ fontSize: U(2.6), color: C.body }}>{label}</span>
        </div>
    );
};

/* -------------------------------- component -------------------------------- */
export default function NoLikesBoost({ onBoost, onImproveProfile, fluid = false, className, style }: NoLikesBoostProps) {
    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">
                <div
                    className={
                        fluid
                            ? "absolute inset-0 overflow-hidden"
                            : "  h-full aspect-[300/520] max-w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "
                    }
                >
                    <div
                        className={`nlb-scroll ${className ?? ""}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            overflowY: "auto",
                            overflowX: "hidden",
                            background: C.page,
                            fontFamily: FONT,
                            color: C.ink,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .nlb-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }

        .nlb-btn { cursor: pointer; border: 0; font: inherit; background: none; padding: 0; }
        .nlb-btn:focus-visible { outline: 2px solid ${C.purple}; outline-offset: 3px; }

        /* ---------- keyframes ---------- */
        @keyframes nlb-up    { from { opacity: 0; transform: translateY(3cqw); } to { opacity: 1; transform: none; } }
        @keyframes nlb-pop   { from { opacity: 0; transform: scale(.82) translateY(2cqw); } to { opacity: 1; transform: none; } }
        @keyframes nlb-slide { from { opacity: 0; transform: translateX(-4cqw); } to { opacity: 1; transform: none; } }
        @keyframes nlb-badge { from { opacity: 0; transform: scale(.4) rotate(-20deg); } to { opacity: 1; transform: none; } }
        @keyframes nlb-float { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-1.4cqw) rotate(4deg); } }
        @keyframes nlb-ring  { 0% { transform: scale(.78); opacity: .55; } 100% { transform: scale(1.55); opacity: 0; } }
        @keyframes nlb-twinkle { 0%,100% { opacity: .15; transform: scale(.6); } 50% { opacity: 1; transform: scale(1.1); } }
        @keyframes nlb-glow  {
            0%,100% { box-shadow: 0 ${U(2.2)} ${U(5)} rgba(124,58,237,.30); }
            50%     { box-shadow: 0 ${U(2.6)} ${U(8.5)} rgba(124,58,237,.52); }
        }
        @keyframes nlb-shine { 0% { left: -45%; } 55%,100% { left: 130%; } }
        @keyframes nlb-arrow { 0%,100% { transform: translateX(0); } 50% { transform: translateX(.9cqw); } }

        /* ---------- usage ---------- */
        .nlb-anim  { animation-fill-mode: both; animation-delay: var(--d, 0ms); animation-duration: .65s; animation-timing-function: cubic-bezier(.2,.7,.2,1); }
        .nlb-up    { animation-name: nlb-up; }
        .nlb-pop   { animation-name: nlb-pop;   animation-duration: .6s;  animation-timing-function: cubic-bezier(.3,1.4,.5,1); }
        .nlb-slide { animation-name: nlb-slide; }
        .nlb-badge { animation-name: nlb-badge; animation-duration: .8s; animation-timing-function: cubic-bezier(.3,1.5,.5,1); }

        .nlb-rocket { display: inline-block; animation: nlb-float 3.2s ease-in-out 1s infinite; }
        .nlb-ring   { position: absolute; border-radius: 50%; animation: nlb-ring 3s ease-out infinite; }
        .nlb-spark  { position: absolute; border-radius: 50%; animation: nlb-twinkle 2.4s ease-in-out infinite; }

        .nlb-cta    { position: relative; overflow: hidden; animation: nlb-glow 2.8s ease-in-out 1.6s infinite; transition: transform .12s ease, filter .12s ease; }
        .nlb-cta:hover  { filter: brightness(1.06); }
        .nlb-cta:active { transform: scale(.98); }
        .nlb-shine  { position: absolute; top: 0; bottom: 0; left: -45%; width: 32%; transform: skewX(-20deg);
                      background: linear-gradient(100deg, transparent, rgba(255,255,255,.38), transparent);
                      animation: nlb-shine 3.4s ease-in-out 1.8s infinite; pointer-events: none; }
        .nlb-chev   { display: inline-block; animation: nlb-arrow 1.4s ease-in-out 1.8s infinite; }

        .nlb-link   { transition: color .15s ease; }
        .nlb-link:hover { color: ${C.purpleText}; }

        @media (prefers-reduced-motion: reduce) {
            .nlb-anim, .nlb-rocket, .nlb-ring, .nlb-spark, .nlb-cta, .nlb-shine, .nlb-chev {
                animation: none !important; opacity: 1 !important; transform: none !important;
            }
            .nlb-ring, .nlb-spark { opacity: .25 !important; }
            .nlb-shine { display: none; }
        }
      `}</style>

                        <div
                            style={{
                                boxSizing: "border-box",
                                minHeight: "100%",
                                padding: `${U(5)} ${U(3.5)} ${U(10)}`,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            {/* ------------------------------ badge ------------------------------ */}
                            <div
                                style={{
                                    position: "relative",
                                    width: U(24),
                                    height: U(24),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <span
                                    aria-hidden
                                    className="nlb-ring"
                                    style={{ inset: 0, border: `${U(0.3)} solid rgba(124,58,237,.35)`, background: "rgba(124,58,237,.06)" }}
                                />
                                <span
                                    aria-hidden
                                    className="nlb-ring"
                                    style={{ inset: 0, border: `${U(0.3)} solid rgba(124,58,237,.35)`, animationDelay: "1.5s" }}
                                />
                                {/* sparkles */}
                                <span aria-hidden className="nlb-spark" style={{ top: U(1), left: U(2), width: U(1.2), height: U(1.2), background: "#a78bfa" }} />
                                <span aria-hidden className="nlb-spark" style={{ top: U(5), right: U(0.4), width: U(1.6), height: U(1.6), background: "#c4b5fd", animationDelay: ".8s" }} />
                                <span aria-hidden className="nlb-spark" style={{ bottom: U(2), left: U(0.6), width: U(1.4), height: U(1.4), background: "#ddd6fe", animationDelay: "1.5s" }} />
                                <span aria-hidden className="nlb-spark" style={{ bottom: U(0.8), right: U(4), width: U(1), height: U(1), background: "#a78bfa", animationDelay: "2.1s" }} />

                                <div
                                    className="nlb-anim nlb-badge"
                                    style={{
                                        ["--d" as string]: "100ms",
                                        position: "relative",
                                        width: U(15),
                                        height: U(15),
                                        borderRadius: "50%",
                                        background: "radial-gradient(circle at 30% 25%, #9b6bff 0%, #7c3aed 55%, #6428d4 100%)",
                                        boxShadow: `0 0 0 ${U(1.2)} rgba(124,58,237,.18), 0 ${U(1.6)} ${U(4)} rgba(124,58,237,.38)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span className="nlb-rocket" style={{ fontSize: U(7.4), lineHeight: 1 }} role="img" aria-label="Rocket">
                                        🚀
                                    </span>
                                </div>
                            </div>

                            {/* ----------------------------- headline ----------------------------- */}
                            <p
                                className="nlb-anim nlb-up"
                                style={{
                                    ["--d" as string]: "250ms",
                                    margin: `${U(0.6)} 0 0`,
                                    fontSize: U(2.8),
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: C.purpleText,
                                }}
                            >
                                No likes yet
                            </p>

                            <h1
                                className="nlb-anim nlb-up"
                                style={{
                                    ["--d" as string]: "350ms",
                                    margin: `${U(3.2)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(4.6),
                                    fontWeight: 700,
                                    lineHeight: 1.22,
                                    letterSpacing: "-0.005em",
                                }}
                            >
                                Your admirers just
                                <br />
                                haven&rsquo;t found you yet
                            </h1>

                            <p
                                className="nlb-anim nlb-up"
                                style={{
                                    ["--d" as string]: "450ms",
                                    margin: `${U(3)} 0 0`,
                                    padding: `0 ${U(1)}`,
                                    textAlign: "center",
                                    fontSize: U(3),
                                    lineHeight: 1.55,
                                    color: C.body,
                                }}
                            >
                                Great profiles often get missed in a busy feed. A Boost puts you at the{" "}
                                <b style={{ fontWeight: 700, color: "#4a4540" }}>top of the feed in your city</b> — so the right people see you tonight.
                            </p>

                            {/* ------------------------------ stats ------------------------------ */}
                            <div
                                style={{
                                    width: "100%",
                                    display: "grid",
                                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                                    gap: U(3.2),
                                    marginTop: U(4.6),
                                }}
                            >
                                {STATS.map((s, i) => (
                                    <StatCard key={s.label} {...s} index={i} />
                                ))}
                            </div>

                            {/* ---------------------------- benefits ---------------------------- */}
                            <section
                                className="nlb-anim nlb-up"
                                style={{
                                    ["--d" as string]: "850ms",
                                    width: "100%",
                                    boxSizing: "border-box",
                                    marginTop: U(3.2),
                                    padding: `${U(0.8)} ${U(3.4)}`,
                                    background: C.white,
                                    border: `max(1px, 0.2cqw) solid ${C.border}`,
                                    borderRadius: U(4.2),
                                }}
                            >
                                {BENEFITS.map((b, i) => (
                                    <div
                                        key={b.title}
                                        className="nlb-anim nlb-slide"
                                        style={{
                                            ["--d" as string]: `${1000 + i * 140}ms`,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: U(3.4),
                                            padding: `${U(2.6)} 0`,
                                            borderTop: i === 0 ? "none" : `max(1px, 0.2cqw) solid ${C.border}`,
                                        }}
                                    >
                                        <span
                                            aria-hidden
                                            style={{
                                                width: U(7.4),
                                                height: U(7.4),
                                                borderRadius: U(2.2),
                                                flexShrink: 0,
                                                background: C.purpleTint,
                                                fontSize: U(3.6),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {b.icon}
                                        </span>
                                        <div style={{ minWidth: 0 }}>
                                            <h2 style={{ margin: 0, fontSize: U(3.3), fontWeight: 600, lineHeight: 1.25 }}>{b.title}</h2>
                                            <p style={{ margin: `${U(1)} 0 0`, fontSize: U(2.8), lineHeight: 1.35, color: C.grey }}>{b.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            {/* ------------------------------ CTA ------------------------------ */}
                            <button
                                type="button"
                                className="nlb-btn nlb-anim nlb-up nlb-cta"
                                onClick={onBoost}
                                style={{
                                    ["--d" as string]: "1450ms",
                                    marginTop: U(3.2),
                                    width: "100%",
                                    height: U(11.9),
                                    borderRadius: U(6),
                                    background: "linear-gradient(100deg, #8b5cf6 0%, #7c3aed 45%, #6d28d9 100%)",
                                    color: C.white,
                                    fontSize: U(3.8),
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: U(1.8),
                                }}
                            >
                                <span className="nlb-shine" aria-hidden />
                                <span aria-hidden>🚀</span>
                                Boost my profile now
                                <span className="nlb-chev" aria-hidden style={{ fontSize: "1.1em" }}>
                                    ›
                                </span>
                            </button>

                            <button
                                type="button"
                                className="nlb-btn nlb-anim nlb-up nlb-link"
                                onClick={onImproveProfile}
                                style={{
                                    ["--d" as string]: "1600ms",
                                    marginTop: U(3.6),
                                    fontSize: U(3.2),
                                    fontWeight: 700,
                                    color: C.grey,
                                }}
                            >
                                Or improve your profile to get more likes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
