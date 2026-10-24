'use client';

import React, { useEffect, useRef } from 'react';

export interface OpenInAppModalProps {
    open: boolean;
    onClose: () => void;
    /** Feature the user just clicked, e.g. "plan this date" */
    featureName?: string;
    /** Deep link that opens the app, e.g. "datenow://plans/123" */
    appUrl: string;
    /** Fallback if the app isn't installed (App Store / Play Store / download page) */
    storeUrl?: string;
}

const BRAND = '#E7477D';

/** Tiny four-point star used for the sparkles */
function Sparkle({ className = '', delay = '0s', size = 14 }: { className?: string; delay?: string; size?: number }) {
    return (
        <svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`absolute sparkle ${className}`}
            style={{ animationDelay: delay }}
        >
            <path d="M12 0c.8 6.2 5.8 11.2 12 12-6.2.8-11.2 5.8-12 12-.8-6.2-5.8-11.2-12-12C6.2 11.2 11.2 6.2 12 0z" fill="currentColor" />
        </svg>
    );
}

export default function OpenInAppModal({
    open,
    onClose,
    featureName = 'use this feature',
    appUrl,
    storeUrl,
}: OpenInAppModalProps) {
    const primaryRef = useRef<HTMLButtonElement>(null);

    // Escape to close, lock page scroll, focus the main action
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', onKey);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        primaryRef.current?.focus();

        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    const handleOpenApp = () => {
        window.location.href = appUrl;

        // If the app didn't take over the screen, send them to the store
        if (storeUrl) {
            const timer = window.setTimeout(() => {
                if (!document.hidden) window.location.href = storeUrl;
            }, 1500);
            const cancel = () => {
                if (document.hidden) window.clearTimeout(timer);
            };
            document.addEventListener('visibilitychange', cancel, { once: true });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="open-in-app-title"
        >
            {/* Blurred backdrop */}
            <button
                type="button"
                aria-label="Close"
                tabIndex={-1}
                onClick={onClose}
                className="absolute inset-0 cursor-default backdrop-blur-md backdrop-fade"
                style={{ background: 'rgba(60, 14, 32, 0.35)' }}
            />

            {/* Card */}
            <div
                className="relative w-full max-w-sm rounded-3xl bg-white px-7 pb-6 pt-9 text-center modal-pop"
                style={{ boxShadow: `0 24px 60px -12px ${BRAND}66, 0 0 0 1px ${BRAND}1f` }}
            >
                {/* Soft pink glow behind the icon */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-0 h-40 w-64 -translate-x-1/2 rounded-full blur-3xl"
                    style={{ background: `${BRAND}29` }}
                />

                {/* Heart badge with sparkles */}
                <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                    <div
                        className="flex h-20 w-20 items-center justify-center rounded-full"
                        style={{
                            background: `linear-gradient(145deg, #FF7FA6, ${BRAND})`,
                            boxShadow: `0 10px 24px -6px ${BRAND}99`,
                        }}
                    >
                        <svg width="38" height="38" viewBox="0 0 24 24" fill="#fff" aria-hidden="true" className="heartbeat">
                            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c1.9 0 3.3 1 4 2.2h4C14.7 6 16.1 5 18 5c3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z" />
                        </svg>
                    </div>
                    <Sparkle className="-left-3 top-1 text-[#E7477D]" size={16} delay="0s" />
                    <Sparkle className="-right-4 top-4 text-[#FF9DBB]" size={12} delay="0.6s" />
                    <Sparkle className="-right-1 -top-3 text-[#E7477D]" size={10} delay="1.2s" />
                    <Sparkle className="-left-5 bottom-3 text-[#FF9DBB]" size={10} delay="0.9s" />
                </div>

                {/* Glittering headline */}
                <h2 id="open-in-app-title" className="relative text-[26px] font-extrabold leading-tight tracking-tight">
                    <span className="glitter-text">Your next date starts</span>
                    <br />
                    <span className="glitter-text">in the app</span>
                </h2>

                <p className="mx-auto mt-3 max-w-[17rem] text-[15px] leading-relaxed text-neutral-600">
                    Open the app to {featureName}. Everything's waiting for you there, ready to go.
                </p>

                {/* Actions */}
                <div className="mt-7 flex flex-col gap-2.5">
                    <button
                        ref={primaryRef}
                        type="button"
                        onClick={handleOpenApp}
                        className="group relative cursor-pointer overflow-hidden rounded-full px-6 py-3.5 text-base font-bold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4"
                        style={{
                            background: `linear-gradient(135deg, #F2628F, ${BRAND})`,
                            boxShadow: `0 10px 22px -8px ${BRAND}cc`,
                            ['--tw-ring-color' as string]: `${BRAND}55`,
                        }}
                    >
                        <span className="relative z-10">Open in app</span>
                        <span aria-hidden="true" className="button-shine" />
                    </button>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full cursor-pointer px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-[#E7477D]/10 focus-visible:outline-none focus-visible:ring-4"
                        style={{ color: BRAND, ['--tw-ring-color' as string]: `${BRAND}33` }}
                    >
                        Maybe later
                    </button>
                </div>
            </div>

            <style>{`
                .glitter-text {
                    background-image: linear-gradient(
                        100deg,
                        ${BRAND} 0%,
                        ${BRAND} 35%,
                        #ffc2d4 47%,
                        #ffffff 50%,
                        #ffc2d4 53%,
                        ${BRAND} 65%,
                        ${BRAND} 100%
                    );
                    background-size: 250% 100%;
                    background-position: 100% 0;
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                    color: transparent;
                    animation: glitter-sweep 3.2s ease-in-out infinite;
                }
                @keyframes glitter-sweep {
                    0%   { background-position: 100% 0; }
                    60%, 100% { background-position: 0% 0; }
                }

                .sparkle { animation: twinkle 2.4s ease-in-out infinite; }
                @keyframes twinkle {
                    0%, 100% { transform: scale(0.4) rotate(0deg); opacity: 0.25; }
                    50%      { transform: scale(1) rotate(25deg);  opacity: 1; }
                }

                .heartbeat { animation: heartbeat 2s ease-in-out infinite; }
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    12%      { transform: scale(1.14); }
                    24%      { transform: scale(1); }
                    36%      { transform: scale(1.08); }
                    48%      { transform: scale(1); }
                }

                .button-shine {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%);
                    transform: translateX(-120%);
                    animation: button-shine 3.2s ease-in-out infinite;
                }
                @keyframes button-shine {
                    0%, 55% { transform: translateX(-120%); }
                    100%    { transform: translateX(120%); }
                }

                .modal-pop { animation: modal-pop 320ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both; }
                @keyframes modal-pop {
                    from { opacity: 0; transform: translateY(14px) scale(0.94); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }

                .backdrop-fade { animation: backdrop-fade 240ms ease-out both; }
                @keyframes backdrop-fade {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .glitter-text, .sparkle, .heartbeat, .button-shine, .modal-pop, .backdrop-fade {
                        animation: none !important;
                    }
                    .glitter-text { background-position: 0% 0; background-image: none; -webkit-text-fill-color: ${BRAND}; color: ${BRAND}; }
                    .sparkle { opacity: 0.8; transform: none; }
                    .button-shine { display: none; }
                }
            `}</style>
        </div>
    );
}
