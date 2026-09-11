"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
const BASE = "https://dating-app-backend-plum.vercel.app";

const PRIVACY_POLICY_URL = `${BASE}/api/legal/legal-pages/PRIVACY_POLICY`;
const TERMS_OF_SERVICE_URL = `${BASE}/api/legal/legal-pages/TERMS_OF_SERVICE`;
const COOKIE_POLICY_URL = `${BASE}/api/legal/legal-pages/COOKIE_POLICY`;
const COMMUNITY_GUIDELINES_URL = `${BASE}/api/legal/legal-pages/COMMUNITY_GUIDELINES`;
const SAFETY_AND_TRUST_URL = `${BASE}/api/legal/legal-pages/DATING_SAFETY_TIPS`;
const REFUND_AND_CANCELLATION_URL = `${BASE}/api/legal/legal-pages/REFUND_CANCELLATION_POLICY`;
const GRIEVANCE_REDRESSAL_URL = `${BASE}/api/legal/legal-pages/GRIEVANCE_OFFICER_REDRESSAL`;
const AGE_POLICY_18_PLUS_URL = `${BASE}/api/legal/legal-pages/AGE_POLICY_18_PLUS`;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
//Seperate types for each block type to allow for more complex structures in the future if needed.
interface InlineSpan {
    text: string;
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
}

interface ParagraphBlock {
    type: "paragraph";
    content: InlineSpan[];
}

interface HeadingBlock {
    type: "heading";
    level: 2 | 3 | 4;
    content: InlineSpan[];
}

interface BulletListBlock {
    type: "bulletList";
    items: { content: InlineSpan[] }[];
}

interface OrderedListBlock {
    type: "orderedList";
    items: { content: InlineSpan[] }[];
}

interface QuoteBlock {
    type: "quote";
    content: InlineSpan[];
}

interface TableBlock {
    type: "table";
    headers: string[];
    rows: string[][];
}

type Block =
    | ParagraphBlock
    | HeadingBlock
    | BulletListBlock
    | OrderedListBlock
    | QuoteBlock
    | TableBlock;

interface LegalPageContent {
    html: string;
    blocks: Block[];
    schemaVersion: number;
}
export interface LegalPage {
    id: string;
    pageType: string;
    title: string;
    version: string;
    content: LegalPageContent;
    schemaVersion: number;
    effectiveFrom: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

interface LegalData {
    privacyPolicy: LegalPage | null;
    termsOfService: LegalPage | null;
    cookiePolicy: LegalPage | null;
    communityGuidelines: LegalPage | null;
    safetyAndTrust: LegalPage | null;
    refundAndCancellation: LegalPage | null;
    grievanceRedressal: LegalPage | null;
    agePolicy18Plus: LegalPage | null;
    loading: boolean;
    error: string | null;
}

const LegalContext = createContext<LegalData>({
    privacyPolicy: null,
    termsOfService: null,
    cookiePolicy: null,
    communityGuidelines: null,
    safetyAndTrust: null,
    refundAndCancellation: null,
    grievanceRedressal: null,
    agePolicy18Plus: null,
    loading: true,
    error: null,
});

export function LegalProvider({ children }: { children: React.ReactNode }) {
    const [privacyPolicy, setPrivacyPolicy] = useState<LegalPage | null>(null);
    const [termsOfService, setTermsOfService] = useState<LegalPage | null>(null);
    const [cookiePolicy, setCookiePolicy] = useState<LegalPage | null>(null);
    const [communityGuidelines, setCommunityGuidelines] = useState<LegalPage | null>(null);
    const [safetyAndTrust, setSafetyAndTrust] = useState<LegalPage | null>(null);
    const [refundAndCancellation, setRefundAndCancellation] = useState<LegalPage | null>(null);
    const [grievanceRedressal, setGrievanceRedressal] = useState<LegalPage | null>(null);
    const [agePolicy18Plus, setAgePolicy18Plus] = useState<LegalPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;

        const publicGet = async (url: string) => {
            try {
                const response = await axios.get(url);
                return response.data;
            } catch (err) {
                console.error("LegalContext fetch error:", url, err);
                return null;
            }
        };

        (async () => {
            try {
                const [r1,r2,r3,r4,r5,r6,r7,r8] = await Promise.all(
                    [publicGet(PRIVACY_POLICY_URL), 
                        publicGet(TERMS_OF_SERVICE_URL), 
                        publicGet(COOKIE_POLICY_URL), 
                        publicGet(COMMUNITY_GUIDELINES_URL), 
                        publicGet(SAFETY_AND_TRUST_URL), 
                        publicGet(REFUND_AND_CANCELLATION_URL), 
                        publicGet(GRIEVANCE_REDRESSAL_URL), 
                        publicGet(AGE_POLICY_18_PLUS_URL)
                    ]);

                if (!alive) return;

                if (r1?.success && r1.data) {
                    setPrivacyPolicy(r1.data as LegalPage);
                } else {
                    setError("Couldn't load privacy policy.");
                }

                if (r2?.success && r2.data) {
                    setTermsOfService(r2.data as LegalPage);
                } else {
                    setError("Couldn't load terms of service.");
                }

                if (r3?.success && r3.data) {
                    setCookiePolicy(r3.data as LegalPage);
                } else {
                    setError("Couldn't load cookie policy.");
                }

                if (r4?.success && r4.data) {
                    setCommunityGuidelines(r4.data as LegalPage);
                } else {
                    setError("Couldn't load community guidelines.");
                }

                if (r5?.success && r5.data) {
                    setSafetyAndTrust(r5.data as LegalPage);
                } else {
                    setError("Couldn't load safety and trust information.");
                }

                if (r6?.success && r6.data) {
                    setRefundAndCancellation(r6.data as LegalPage);
                } else {
                    setError("Couldn't load refund and cancellation information.");
                }

                if (r7?.success && r7.data) {
                    setGrievanceRedressal(r7.data as LegalPage);
                } else {
                    setError("Couldn't load grievance redressal information.");
                }

                if (r8?.success && r8.data) {
                    setAgePolicy18Plus(r8.data as LegalPage);
                } else {
                    setError("Couldn't load age policy information.");
                }
            } catch (err) {
                console.error("LegalProvider ERROR:", err);
                if (alive) {
                    setError("Couldn't load privacy policy.");
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, []);

    return (
        <LegalContext.Provider value={{
            privacyPolicy, termsOfService, cookiePolicy,
            communityGuidelines,
            safetyAndTrust,
            refundAndCancellation,
            grievanceRedressal,
            agePolicy18Plus, loading, error
        }}>
            {children}
        </LegalContext.Provider>
    );
}

export function useLegalData() {
    return useContext(LegalContext);
}
