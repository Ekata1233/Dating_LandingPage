'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google';

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

const instrument = Instrument_Serif({
    subsets: ['latin'],
    weight: '400',
    style: ['normal', 'italic'],
});

const TRUST = [
    {
        h: 'Verified profiles only',
        p: 'Phone, ID, selfie and live-video checks. No bots, no catfish.',
    },
    {
        h: 'SafeFace privacy',
        p: 'Avatar-first. Reveal your real photo on your terms.',
    },
    {
        h: 'Intentional matching',
        p: 'Compatibility built on values and intent, not just photos.',
    },
];

const PACKAGE = 'com.infynod.welvors';
const APP_STORE_URL = 'https://apps.apple.com/app/welvors/idYOUR_APPLE_APP_ID'; // TODO: replace with real Apple app ID
const PHONE_IMG = 'https://ik.imagekit.io/aezmcynwbe/welvors/hero_image.png';

export default function ReferRedirectPage() {
    const params = useParams<{ code: string }>();
    const code = params?.code ?? '';
    // 'detecting' = figuring out the device, 'opening' = mobile redirect in progress, 'done' = show page
    const [phase, setPhase] = useState<'detecting' | 'opening' | 'done'>('detecting');
    const [isAndroidDevice, setIsAndroidDevice] = useState(false);

    const referrer = encodeURIComponent(`welvors_event=${code}`);

    // Plain HTTPS Play Store link. On Android this is handed to the Play Store
    // app (App Link); if that is not possible it opens the Play Store website
    // in Chrome. Works without a user gesture, so it is the auto-redirect target.
    const PLAY_STORE_FALLBACK_URL = `https://play.google.com/store/apps/details?id=${PACKAGE}&referrer=${referrer}`;

    // Explicit "open the Play Store app" intent for Chrome on Android. Used for
    // the button (user tap). If the intent fails, Chrome loads the HTTPS URL.
    const PLAY_STORE_URL = `intent://details?id=${PACKAGE}&referrer=${referrer}#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=${encodeURIComponent(
        PLAY_STORE_FALLBACK_URL
    )};end`;

    const APP_SCHEME_URL = `welvors://refer/${encodeURIComponent(code)}`;

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isAndroid = /android/i.test(userAgent);
        const isIOS =
            /iPad|iPhone|iPod/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        setIsAndroidDevice(isAndroid);

        // Desktop: no redirect. Show the page with the store buttons once the
        // device check is done (short hold so the loader doesn't flash).
        if (!isAndroid && !isIOS) {
            const desktopTimer = setTimeout(() => setPhase('done'), 700);
            return () => clearTimeout(desktopTimer);
        }

        setPhase('opening');

        const timers: ReturnType<typeof setTimeout>[] = [];
        const cleanups: Array<() => void> = [];

        if (isAndroid) {
            // Android: go straight to the Welvors listing in the Play Store app.
            // replace() keeps this redirect page out of the back-button history.
            window.location.replace(PLAY_STORE_URL);

            // Some browsers (in-app browsers, or Chrome without a user tap) ignore
            // intent:// links. If we're still on screen, use the HTTPS listing,
            // which Android hands to the Play Store app (or shows in Chrome).
            const fallbackTimer = setTimeout(() => {
                if (!document.hidden) window.location.replace(PLAY_STORE_FALLBACK_URL);
            }, 900);
            timers.push(fallbackTimer);

            // If the Play Store app took over, don't navigate again.
            const cancel = () => clearTimeout(fallbackTimer);
            const onVisibility = () => {
                if (document.hidden) cancel();
            };
            document.addEventListener('visibilitychange', onVisibility);
            window.addEventListener('pagehide', cancel);
            cleanups.push(() => {
                document.removeEventListener('visibilitychange', onVisibility);
                window.removeEventListener('pagehide', cancel);
            });
        } else if (isIOS) {
            // iOS: try the installed app, then fall back to the App Store.
            window.location.href = APP_SCHEME_URL;
            const iosTimer = setTimeout(() => {
                window.location.replace(APP_STORE_URL);
            }, 1200);
            timers.push(iosTimer);

            const cancel = () => clearTimeout(iosTimer);
            const onVisibility = () => {
                if (document.hidden) cancel();
            };
            document.addEventListener('visibilitychange', onVisibility);
            window.addEventListener('pagehide', cancel);
            cleanups.push(() => {
                document.removeEventListener('visibilitychange', onVisibility);
                window.removeEventListener('pagehide', cancel);
            });
        }

        // Safety net: if nothing navigated away, reveal the page with the store buttons.
        timers.push(setTimeout(() => setPhase('done'), 3000));

        return () => {
            timers.forEach(clearTimeout);
            cleanups.forEach((fn) => fn());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [code]);

    return (
        <div className={`wv-root ${jakarta.className} mt-10`}>
            <style dangerouslySetInnerHTML={{ __html: CSS }} />

            {/* Loader */}
            {phase !== 'done' && (
                <div className="wv-loader" role="status" aria-label="Loading">
                    <div className="wv-spinner" aria-hidden="true" />
                </div>
            )}

            {/* Hero */}
            <main className="wv-main">
                <div className="wv-left">
                    <div className="wv-copy">
                        <p className="wv-eyebrow">Welvors Referral</p>
                        <h1 className={`wv-title ${instrument.className}`}>
                            You&apos;re invited to{' '}
                            <em style={{ color: '#D6336C' }}>something real.</em>
                        </h1>
                        <p className="wv-sub">
                            A friend invited you to Welvors. Open the app to
                            join with their invite and meet verified people
                            at curated events.
                        </p>
                    </div>

                    <div className="wv-actions">
                        <div className="wv-buttons">
                            <a
                                href={isAndroidDevice ? PLAY_STORE_URL : PLAY_STORE_FALLBACK_URL}
                                className="wv-store wv-store-dark"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                                    <path d="M3.6 1.8 13.8 12 3.6 22.2c-.4-.2-.6-.6-.6-1.1V2.9c0-.5.2-.9.6-1.1Zm11.3 11.3 2.6 2.6-11.7 6.7 9.1-9.3Zm3.9-3.9 2.9 1.7c.8.5.8 1.7 0 2.2l-2.9 1.7-2.9-2.8 2.9-2.8ZM5.8 1.6l11.7 6.7-2.6 2.6-9.1-9.3Z" />
                                </svg>
                                <span className="wv-store-text">
                                    <span className="wv-store-small">GET IT ON</span>
                                    <span className="wv-store-big">Google Play</span>
                                </span>
                            </a>

                            <a href={APP_STORE_URL} className="wv-store wv-store-pink">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
                                    <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.7-1-2.7-4.1ZM13.9 5c.7-.9 1.2-2 1-3.2-1 0-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5Z" />
                                </svg>
                                <span className="wv-store-text">
                                    <span className="wv-store-small">DOWNLOAD ON THE</span>
                                    <span className="wv-store-big">App Store</span>
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="wv-right mt-0">
                    <div className="wv-glow" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={PHONE_IMG} alt="Welvors app" className="wv-phone" />
                </div>
            </main>

            {/* Trust strip */}
            <section className="wv-trust-wrap">
                <div className="wv-trust">
                    {TRUST.map((t) => (
                        <div key={t.h} className="wv-trust-item">
                            <span className="wv-trust-h">{t.h}</span>
                            <span className="wv-trust-p">{t.p}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="wv-footer">
                <div className="wv-footer-inner">
                    <span>
                        © 2026 Infynod Tech Private Limited · Made with care in
                        India
                    </span>
                    <div style={{ display: 'flex', gap: 18 }}>
                        <a href="https://www.welvors.com/legalSafety/privacyPolicy">
                            Privacy
                        </a>
                        <a href="https://www.welvors.com/legalSafety/termCondition">
                            Terms
                        </a>
                        <a href="https://www.welvors.com/">welvors.com</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

const CSS = `
.wv-root{min-height:100vh;display:flex;flex-direction:column;background:#FDF8F5;color:#1C1A24;-webkit-font-smoothing:antialiased}
.wv-root a{text-decoration:none;color:#D6336C}
.wv-root a:hover{color:#A61E52}

.wv-loader{position:fixed;inset:0;z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:#FDF8F5}
.wv-spinner{width:48px;height:48px;border-radius:50%;border:4px solid #F1E6E0;border-top-color:#D6336C;animation:wv-spin .8s linear infinite}
.wv-loader-text{margin:0;font-size:15px;font-weight:600;color:#5B5664}

.wv-main{flex:1;max-width:1180px;width:100%;margin:0 auto;padding:56px 24px 40px;box-sizing:border-box;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:56px;align-items:center}
.wv-left{display:flex;flex-direction:column;gap:28px;min-width:0}
.wv-copy{display:flex;flex-direction:column;gap:14px}
.wv-eyebrow{margin:0;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#D6336C}
.wv-title{margin:0;font-weight:400;font-size:clamp(42px,6vw,68px);line-height:1.02;letter-spacing:-.01em;text-wrap:balance}
.wv-sub{margin:0;font-size:17px;line-height:1.6;color:#5B5664;max-width:480px;text-wrap:pretty}

.wv-actions{display:flex;flex-direction:column;gap:14px}
.wv-buttons{display:flex;flex-wrap:wrap;gap:12px}
.wv-root a.wv-store{display:flex;align-items:center;gap:12px;padding:12px 22px;min-height:56px;box-sizing:border-box;border-radius:14px;color:#fff}
.wv-root a.wv-store:hover{color:#fff}
.wv-store-dark{background:#1C1A24}
.wv-store-dark:hover{background:#33303D}
.wv-store-pink{background:linear-gradient(135deg,#E8417A,#C2185B)}
.wv-store-pink:hover{filter:brightness(1.07)}
.wv-store-text{display:flex;flex-direction:column;line-height:1.15}
.wv-store-small{font-size:11px;opacity:.8}
.wv-store-big{font-size:17px;font-weight:700}

.wv-right{position:relative;display:flex;justify-content:center;align-items:center;min-height:460px;min-width:0}
.wv-glow{position:absolute;width:min(440px,90%);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,#FBDCE6 0%,#FDF8F5 70%)}
.wv-phone{position:relative;width:100%;max-width:480px;height:auto;display:block;border-radius:16px}

.wv-trust-wrap{max-width:1180px;width:100%;margin:0 auto;padding:8px 24px 48px;box-sizing:border-box}
.wv-trust{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:1px;background:#F1E6E0;border:1px solid #F1E6E0;border-radius:20px;overflow:hidden}
.wv-trust-item{background:#fff;padding:22px 24px;display:flex;flex-direction:column;gap:6px}
.wv-trust-h{font-size:15px;font-weight:700}
.wv-trust-p{font-size:14px;line-height:1.55;color:#5B5664}

.wv-footer{border-top:1px solid #F1E6E0}
.wv-footer-inner{max-width:1180px;margin:0 auto;padding:20px 24px;display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;font-size:13px;color:#7A7482}
.wv-root .wv-footer a{color:#7A7482}
.wv-root .wv-footer a:hover{color:#D6336C}

@keyframes wv-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.wv-spinner{animation-duration:2.4s}}
`;
