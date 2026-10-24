'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ReferRedirectPage() {
    const params = useParams<{ code: string }>();
    const code = params?.code ?? '';

    const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=com.infynod.welvors&referrer=${encodeURIComponent(
        `welvors_referral=${code}`
    )}`;

    const APP_STORE_URL = 'https://apps.apple.com/app/welvors/idYOUR_APPLE_APP_ID';
    const APP_SCHEME_URL = `welvors://refer/${encodeURIComponent(code)}`;

    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor;
        const isAndroid = /android/i.test(userAgent);
        const isIOS =
            /iPad|iPhone|iPod/.test(userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

        if (isAndroid) {
            window.location.href = APP_SCHEME_URL;

            const timer = window.setTimeout(() => {
                window.location.href = PLAY_STORE_URL;
            }, 1000);

            return () => window.clearTimeout(timer);
        }

        if (isIOS) {
            window.location.href = APP_SCHEME_URL;

            const timer = window.setTimeout(() => {
                window.location.href = APP_STORE_URL;
            }, 1000);

            return () => window.clearTimeout(timer);
        }
    }, [APP_SCHEME_URL, PLAY_STORE_URL, APP_STORE_URL]);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontFamily: 'sans-serif',
                padding: '20px',
                textAlign: 'center',
                background: '#fff',
            }}
        >
            <h2 style={{ color: '#E43A6A', marginBottom: '8px' }}>
                Welvors
            </h2>

            <p style={{ color: '#555', marginBottom: '24px' }}>
                Redirecting to download the Welvors app...
            </p>

            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                <a
                    href={PLAY_STORE_URL}
                    style={{
                        background: '#1F1B24',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Get on Google Play
                </a>

                <a
                    href={APP_STORE_URL}
                    style={{
                        background: '#E43A6A',
                        color: '#fff',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: 600,
                    }}
                >
                    Download on App Store
                </a>
            </div>
        </div>
    );
}