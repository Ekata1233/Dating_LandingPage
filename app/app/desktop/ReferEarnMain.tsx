import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { ReferralStats, useUserProfileData } from "@/app/context/UserProfileDataContext";
import Link from "next/link";
import React, { useCallback, useEffect } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  ReferAndEarn                                                              */
/*                                                                            */
/*  One independent, fully fluid screen made of three stacked parts:          */
/*    1. Header + banner + "How it works" timeline                            */
/*    2. Invite code, friend's code input, total earned                       */
/*    3. Referral tabs + "How rewards work"                                   */
/*                                                                            */
/*  It fills 100% width and 100% height of its PARENT. Every size inside      */
/*  (fonts, padding, gaps, radii, icons, buttons) is measured in `cqw`, i.e.  */
/*  1% of the parent's width, so everything scales with the parent. If the    */
/*  content is taller than the parent's height, it scrolls vertically         */
/*  (scrollbar hidden across browsers, scrolling still works).                */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <ReferAndEarn inviteCode="LY7A3Q6M" />                                */
/*    </div>                                                                  */
/*                                                                            */
/*  Zero dependencies: no Tailwind, no icon library, no CSS files.            */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export type ReferralTab = "joined" | "rewarded" | "pending";

export interface ReferralItem {
    id: string | number;
    name: string;
    subtitle?: string;
    /** e.g. "+₹100" */
    amount?: string;
}

export interface HowItWorksStep {
    icon: "share" | "login" | "diamond";
    title: string;
    description: string;
    /** Orange reward pill, e.g. "+₹100" */
    reward?: string;
    rewardNote?: string;
}

export interface ReferAndEarnProps {
    title?: string;
    showHeader?: boolean;
    bannerTitle?: string;
    steps?: HowItWorksStep[];

    currencySymbol?: string;
    withdrawNote?: string;

    referrals?: ReferralStats;
    rules?: string[];

    onBack?: () => void;
    showBack?: boolean;
    onCopy?: (code: string) => void;
    onInvite?: (code: string) => void;
    /** Return nothing; the input clears after calling */
    onApplyCode?: (code: string) => void;

    /**
     * Fill the parent edge to edge instead of rendering the 300px desktop
     * frame. The mobile shell sets this and supplies `onBack`.
     */
    fluid?: boolean;

    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";

const C = {
    pink: "#e23a6a",
    pinkDeep: "#c2185b",
    pinkText: "#e0355f",
    pinkSoft: "#fde4ea",
    pinkTint: "#fff6f8",
    pinkBorder: "#f8d9e1",
    ink: "#1f1f24",
    grey: "#8a817c",
    greyLight: "#b3b3b3",
    border: "#ececec",
    white: "#ffffff",
};

const FONT =
    "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const SERIF = "'Playfair Display', 'Georgia', 'Times New Roman', serif";

const svgBase: React.CSSProperties = { width: "1em", height: "1em", display: "block", flexShrink: 0 };
const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

/* ---------------------------------- icons ---------------------------------- */
const BackIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.4}>
        <path d="M15 5l-7 7 7 7" />
    </svg>
);
const ShareIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="currentColor">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.2 10.7l7.6-4.4M8.2 13.3l7.6 4.4" stroke="currentColor" strokeWidth="2" />
    </svg>
);
const LoginIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
        <path d="M3 12h11M10 8l4 4-4 4" />
    </svg>
);
const DiamondIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M6 3h12l4 6-10 12L2 9l4-6Z" />
        <path d="M2 9h20M9 3l3 6 3-6M12 21 9 9M12 21l3-12" />
    </svg>
);
const CopyIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <rect x="9" y="9" width="11" height="12" rx="2" />
        <path d="M5 15V5a2 2 0 0 1 2-2h8" />
    </svg>
);
const GiftIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <rect x="3" y="9" width="18" height="12" rx="2" />
        <path d="M3 13h18M12 9v12M12 9C9 9 8 6 9.500 5S12 6 12 9Zm0 0c3 0 4-3 2.500-4S12 6 12 9Z" />
    </svg>
);
const InfoIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <circle cx="12" cy="12" r="9.500" />
        <path d="M12 11v6" />
        <circle cx="12" cy="7.500" r="0.6" fill="currentColor" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.6}>
        <path d="M5 12.500l4.500 4.500L19 7" />
    </svg>
);

const STEP_ICONS = { share: ShareIcon, login: LoginIcon, diamond: DiamondIcon };

/* ------------------------------ illustrations ------------------------------ */
const GiftIllustration = () => (
    <svg viewBox="0 0 315 290" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden>
        <defs>
            <linearGradient id="ref-body" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff5a86" />
                <stop offset="1" stopColor="#ff8a6b" />
            </linearGradient>
        </defs>
        {/* confetti */}
        <g fill="none" strokeWidth="4" strokeLinecap="round">
            <circle cx="235" cy="28" r="9" stroke="#3ec6e0" />
            <circle cx="131" cy="76" r="9" stroke="#5b7cf6" />
            <circle cx="228" cy="120" r="7" stroke="#ff8a4c" />
            <circle cx="41" cy="212" r="6" stroke="#ff8a4c" />
            <path d="M160 8v12" stroke="#ffd93b" />
            <path d="M212 86l7-8" stroke="#3ec6e0" />
            <path d="M78 108l9 8" stroke="#5b7cf6" />
            <path d="M2 168l14-5" stroke="#3ec6e0" />
            <path d="M270 128l14-6" stroke="#ff8a4c" />
            <path d="M40 60c6-6 12 0 6 8" stroke="#5b7cf6" />
            <path d="M255 165c8-8 16 2 24-4" stroke="#b06cf6" />
            <path d="M62 170c6-8 14-4 22-8" stroke="#ff8a4c" />
            <path d="M160 100c6-4 6 6 0 10" stroke="#ff8a4c" />
            <rect x="277" y="188" width="10" height="10" rx="2" stroke="#5b7cf6" transform="rotate(45 282 193)" />
            <rect x="180" y="60" width="16" height="16" rx="3" stroke="#b06cf6" transform="rotate(45 188 68)" />
        </g>
        <g fill="#ffb300">
            <path d="M87 24l14 6-12 8z" />
            <path d="M264 66l-10-2 4 10z" />
            <path d="M20 108l12 3-8 8z" />
        </g>
        {/* box */}
        <rect x="98" y="205" width="132" height="82" rx="10" fill="url(#ref-body)" />
        <rect x="83" y="173" width="162" height="36" rx="10" fill="#ff3d7f" />
        {/* ribbon */}
        <rect x="155" y="175" width="15" height="110" fill="#ffe600" />
        {/* bow */}
        <g fill="none" stroke="#ffe600" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
            <path d="M162 172C132 176 100 168 108 148c8-20 44-12 54 22" />
            <path d="M164 172c30 4 62-4 54-24-8-20-44-12-54 22" />
        </g>
    </svg>
);

const CoinIllustration = () => (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden>
        <circle cx="50" cy="50" r="50" fill="#ffc400" />
        <circle cx="50" cy="50" r="38" fill="#f57c00" />
        <text
            x="50"
            y="66"
            textAnchor="middle"
            fontSize="52"
            fontWeight="800"
            fill="#ffd600"
            fontFamily="Arial, sans-serif"
        >
            $
        </text>
    </svg>
);

/* -------------------------------- defaults --------------------------------- */
const DEFAULT_STEPS: HowItWorksStep[] = [
    {
        icon: "share",
        title: "Share your code",
        description: "Send your invite link via WhatsApp, Instagram or anywhere.",
    },
    {
        icon: "login",
        title: "Friend joins Welvors",
        description: "They sign up & log in using your code.",
        reward: "+₹100",
        rewardNote: "to you",
    },
    {
        icon: "diamond",
        title: "They buy any plan",
        description: "Premium+, VIP or Elite — any package counts.",
        reward: "+₹200",
        rewardNote: "to you",
    },
];

const DEFAULT_RULES = [
    "₹100 is credited once your friend joins (signs up & logs in) with your code.",
    "₹500 is credited when that friend activates any paid package (Premium+, VIP or Elite).",
    "Rewards land in your Welvors wallet and can be withdrawn to UPI / bank.",
    "Self-referrals or fake accounts are not eligible and may lead to a ban.",
];

const TABS = [
    { key: "joined", label: "Joined" },
    { key: "rewarded", label: "Rewarded" },
    { key: "pending", label: "Pending" },
] as const;


/* -------------------------------- component -------------------------------- */
export default function ReferAndEarn({
    title = "Refer & Earn",
    showHeader = true,
    bannerTitle = "Refer & Earn",
    steps = DEFAULT_STEPS,
    currencySymbol = "₹",
    withdrawNote = "Withdraw to UPI anytime",
    rules = DEFAULT_RULES,
    onBack,
    showBack = true,
    onCopy,
    onInvite,
    onApplyCode,
    fluid = false,
    className,
    style,
}: ReferAndEarnProps) {
    const [tab, setTab] = React.useState<ReferralTab>("joined");
    const [friendCode, setFriendCode] = React.useState("");
    const [copied, setCopied] = React.useState(false);
    const [valid, setValid] = React.useState(false);
    const { setActiveSection } = useActiveSection();
    const { referralDashboard, referralHistory, applyReferral, validateReferral, validateReferralError, applyReferralError } = useUserProfileData()
    const inviteCode = referralDashboard?.referralCode ?? "";
    const totalEarned = referralDashboard?.stats.totalEarned ?? 0;
    const stats = referralDashboard?.stats ?? {
        totalEarned: 0,
        joined: 0,
        rewarded: 0,
        pending: 0,
    }; const handleCLick = useCallback(
        () => () => setActiveSection("profile"),
        [setActiveSection]
    );
    const canApply = friendCode.trim().length > 0;

    const handleCopy = async () => {
        try {
            await navigator.clipboard?.writeText(inviteCode);
        } catch {
            /* clipboard may be unavailable; still notify parent */
        }
        onCopy?.(inviteCode);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
    };

    const handleValidate = async () => {
        // onApplyCode?.(friendCode.trim());
        // const response = await validateReferral({referralCode : referralDashboard?.referralCode || ""});
        // setFriendCode("");
    };
    // useEffect(() => {
    //     handleValidate()
    // }, [])
    const handleApply = async () => {
        if (!canApply) return;
        const response = await applyReferral({ referralCode: friendCode.trim() });

        if (response?.success) {
            toast.success(response.message)
        }
        else {
            toast.error(applyReferralError || "Referral already applied.")
        }
        console.log("response", response);
        setFriendCode("");
    };

    const sectionTitle: React.CSSProperties = {
        margin: 0,
        fontSize: U(3.1),
        fontWeight: 700,
        letterSpacing: "0.12em",
        color: C.ink,
    };

    return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">

                {/* Profile card */}
                <div
                    className={fluid
                        ? "absolute inset-0 overflow-hidden"
                        : "  mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "}>
                    <div
                        className={`wre-scroll ${className ?? ""}`}
                        style={{
                            width: "100%",
                            height: "100%",
                            containerType: "inline-size",
                            overflowY: "auto",
                            overflowX: "hidden",
                            background: C.white,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            ...style,
                        }}
                    >
                        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');
        .wre-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wre-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .wre-btn:active:not(:disabled) { transform: scale(.98); }
        .wre-btn:disabled { cursor: not-allowed; }
        .wre-btn:focus-visible, .wre-input:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .wre-input::placeholder { color: ${C.greyLight}; letter-spacing: 0.12em; }
        .wre-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
        .wre-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
      `}</style>

                        <div
                            style={{
                                fontFamily: FONT,
                                color: C.ink,
                                boxSizing: "border-box",
                                padding: `${U(4)} ${U(5)} ${U(10)}`,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* ================================ PART 1 ================================ */}

                            {/* header */}
                            {showHeader && (
                                <header
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        minHeight: U(10),
                                        marginBottom: U(6),
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="lc-btn cursor-pointer"
                                        aria-label="Go back"
                                        onClick={onBack ?? handleCLick()}
                                        style={{
                                            position: "absolute",
                                            left: U(-1.9),
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            width: U(10),
                                            height: U(10),
                                            borderRadius: "50%",
                                            background: C.white,
                                            border: `${HAIR} solid ${C.border}`,
                                            boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                            color: C.ink,
                                            fontSize: U(4),
                                            display: showBack ? "flex" : "none",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            padding: 0,
                                        }}
                                    >
                                        <BackIcon />
                                    </button>
                                    <h1 style={{ margin: 0, fontSize: U(4.3), fontWeight: 600, letterSpacing: "0.02em" }}>
                                        {title}
                                    </h1>
                                </header>
                            )}

                            {/* banner */}
                            <section
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    aspectRatio: "906 / 463",
                                    borderRadius: U(5.8),
                                    background: "linear-gradient(120deg, #f0518f 0%, #d8306f 45%, #c11a63 100%)",
                                    boxShadow: `0 ${U(2)} ${U(5)} rgba(226,58,106,.25)`,
                                    overflow: "hidden",
                                }}
                            >
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "12%",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        width: U(31),
                                        height: U(28.5),
                                    }}
                                >
                                    <GiftIllustration />
                                </div>
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 0,
                                        right: 0,
                                        bottom: U(3.2),
                                        textAlign: "center",
                                        color: C.white,
                                        fontSize: U(4.5),
                                        fontWeight: 600,
                                        letterSpacing: "0.01em",
                                    }}
                                >
                                    {bannerTitle}
                                </div>
                            </section>

                            {/* how it works */}
                            <h2 style={{ ...sectionTitle, marginTop: U(8), marginBottom: U(5) }}>How it works</h2>

                            <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: U(2.4) }}>
                                {steps.map((s, i) => {
                                    const Icon = STEP_ICONS[s.icon];
                                    const first = i === 0;
                                    const last = i === steps.length - 1;
                                    return (
                                        <li key={i} style={{ display: "flex", alignItems: "stretch", gap: U(3.6) }}>
                                            {/* timeline column */}
                                            <div
                                                style={{
                                                    position: "relative",
                                                    flex: `0 0 ${U(9.4)}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <span
                                                    aria-hidden
                                                    style={{
                                                        position: "absolute",
                                                        left: "50%",
                                                        top: first ? "50%" : U(-2.4),
                                                        bottom: last ? "50%" : U(-2.4),
                                                        borderLeft: `${U(0.3)} dashed #f4b6c6`,
                                                        transform: "translateX(-50%)",
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        position: "relative",
                                                        width: U(9.4),
                                                        height: U(9.4),
                                                        borderRadius: "50%",
                                                        background: "#fff1f4",
                                                        border: `${U(0.4)} solid #fbd7df`,
                                                        color: C.pinkText,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: U(4.2),
                                                    }}
                                                >
                                                    <Icon />
                                                </span>
                                            </div>

                                            {/* card */}
                                            <div
                                                style={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    gap: U(2.6),
                                                    padding: `${U(3.6)} ${U(3.6)}`,
                                                    background: C.white,
                                                    border: `${HAIR} solid ${C.border}`,
                                                    borderRadius: U(4.4),
                                                    boxShadow: `0 ${U(0.6)} ${U(2.4)} rgba(0,0,0,.05)`,
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <h3 style={{ margin: 0, fontSize: U(3.7), fontWeight: 600, lineHeight: 1.25 }}>{s.title}</h3>
                                                    <p style={{ margin: `${U(1.2)} 0 0`, fontSize: U(3.1), lineHeight: 1.5, color: C.grey }}>
                                                        {s.description}
                                                    </p>
                                                </div>
                                                {s.reward && (
                                                    <div
                                                        style={{
                                                            flexShrink: 0,
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "flex-end",
                                                            gap: U(1.8),
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                padding: `${U(1.9)} ${U(4)}`,
                                                                borderRadius: U(4),
                                                                background: "linear-gradient(135deg, #fbb03b, #f28c12)",
                                                                color: C.white,
                                                                fontSize: U(3.4),
                                                                fontWeight: 600,
                                                                boxShadow: `0 ${U(0.8)} ${U(2)} rgba(242,140,18,.3)`,
                                                                whiteSpace: "nowrap",
                                                            }}
                                                        >
                                                            {s.reward}
                                                        </span>
                                                        {s.rewardNote && (
                                                            <span style={{ fontSize: U(2.6), color: C.grey }}>{s.rewardNote}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>

                            {/* ================================ PART 2 ================================ */}

                            <h2 style={{ ...sectionTitle, marginTop: U(9), marginBottom: U(3.4) }}>Your invite code</h2>

                            {/* code card */}
                            <section
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: U(2.2),
                                    padding: `${U(5.6)} ${U(3)} ${U(4.6)}`,
                                    background: C.white,
                                    border: `${HAIR} solid ${C.border}`,
                                    borderRadius: U(5.2),
                                    boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
                                }}
                            >
                                <span style={{ fontSize: U(2.4), fontWeight: 600, letterSpacing: "0.2em", color: "#8d8d7c" }}>
                                    TAP TO COPY
                                </span>
                                <button
                                    type="button"
                                    className="wre-btn"
                                    onClick={handleCopy}
                                    aria-label="Copy invite code"
                                    style={{
                                        background: "transparent",
                                        padding: 0,
                                        fontFamily: SERIF,
                                        fontSize: U(7.9),
                                        fontWeight: 700,
                                        letterSpacing: "0.08em",
                                        color: C.pinkText,
                                        lineHeight: 1.15,
                                        maxWidth: "100%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {inviteCode}
                                </button>
                                <button
                                    type="button"
                                    className="wre-btn"
                                    onClick={handleCopy}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: U(2),
                                        minWidth: U(34),
                                        height: U(10),
                                        padding: `0 ${U(5)}`,
                                        marginTop: U(1),
                                        borderRadius: U(5),
                                        background: C.pinkSoft,
                                        color: C.pinkText,
                                        fontSize: U(3.5),
                                        fontWeight: 600,
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    <span style={{ fontSize: U(3.8), display: "flex" }}>{copied ? <CheckIcon /> : <CopyIcon />}</span>
                                    {copied ? "Copied!" : "Copy code"}
                                </button>
                            </section>

                            {/* invite button */}
                            <Link href={referralDashboard?.shareLink ?? "#"} target="_blank" rel="noopener noreferrer" style={{ width: "100%" }}>
                                <button
                                    type="button"
                                    className="wre-btn"
                                    // onClick={() => onInvite?.(inviteCode)}
                                    style={{
                                        marginTop: U(6.2),
                                        width: "100%",
                                        height: U(13.9),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: U(2.8),
                                        borderRadius: U(4.6),
                                        background: "linear-gradient(90deg, #e63a6b, #e03a68)",
                                        color: C.white,
                                        fontSize: U(4),
                                        fontWeight: 500,
                                        boxShadow: `0 ${U(1.2)} ${U(3.4)} rgba(226,58,106,.35)`,
                                    }}
                                >
                                    <span style={{ fontSize: U(4.2), display: "flex" }}>
                                        <ShareIcon />
                                    </span>
                                    Invite friends &amp; earn
                                </button>
                            </Link>

                            {/* friend's code header */}
                            <div style={{ display: "flex", alignItems: "center", gap: U(3.4), marginTop: U(8) }}>
                                <span
                                    style={{
                                        width: U(9),
                                        height: U(9),
                                        borderRadius: "50%",
                                        background: C.pinkSoft,
                                        color: C.pinkText,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: U(4),
                                        flexShrink: 0,
                                    }}
                                >
                                    <GiftIcon />
                                </span>
                                <h3 style={{ margin: 0, fontSize: U(4.3), fontWeight: 600 }}>Have a friend&apos;s code?</h3>
                            </div>

                            {/* friend's code panel */}
                            <section
                                style={{
                                    marginTop: U(4.2),
                                    padding: `${U(5.4)} ${U(6.2)} ${U(6.4)}`,
                                    background: C.pinkTint,
                                    border: `${HAIR} solid ${C.pinkBorder}`,
                                    borderRadius: U(5.2),
                                    boxShadow: `0 ${U(0.6)} ${U(3)} rgba(226,58,106,.06)`,
                                }}
                            >
                                <p style={{ margin: 0, fontSize: U(3.2), lineHeight: 1.45, color: "#6f6a68" }}>
                                    Enter a friend&apos;s code to give them credit when you join — you can add it once.
                                </p>
                                <div style={{ display: "flex", alignItems: "stretch", gap: U(4.2), marginTop: U(4.6) }}>
                                    <input
                                        className="wre-input"
                                        value={friendCode}
                                        onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                                        placeholder="ENTER CODE"
                                        maxLength={16}
                                        aria-label="Friend's code"
                                        style={{
                                            flex: 1,
                                            minWidth: 0,
                                            height: U(13.5),
                                            boxSizing: "border-box",
                                            padding: `0 ${U(4.6)}`,
                                            background: C.white,
                                            border: `${HAIR} solid #dcdcdc`,
                                            borderRadius: U(4.2),
                                            fontFamily: "inherit",
                                            fontSize: U(3.5),
                                            fontWeight: 500,
                                            letterSpacing: "0.12em",
                                            color: C.ink,
                                            textTransform: "uppercase",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="wre-btn"
                                        onClick={handleApply}
                                        disabled={!canApply}
                                        style={{
                                            flex: `0 0 ${U(26)}`,
                                            height: U(13.5),
                                            borderRadius: U(4.2),
                                            background: canApply ? `linear-gradient(135deg, ${C.pink}, ${C.pinkDeep})` : "#efefef",
                                            color: canApply ? C.white : "#8d8d8d",
                                            fontSize: U(3.9),
                                            fontWeight: 600,
                                        }}
                                    >
                                        Apply
                                    </button>
                                </div>
                            </section>

                            {/* total earned */}
                            <section
                                style={{
                                    position: "relative",
                                    marginTop: U(8.2),
                                    padding: `${U(4.6)} ${U(5.6)} ${U(4.6)}`,
                                    minHeight: U(37.6),
                                    boxSizing: "border-box",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    borderRadius: U(5.5),
                                    background: "linear-gradient(120deg, #e8407f 0%, #d02a6b 50%, #c11a63 100%)",
                                    color: C.white,
                                    boxShadow: `0 ${U(2)} ${U(5)} rgba(226,58,106,.28)`,
                                    overflow: "hidden",
                                }}
                            >
                                <span style={{ fontSize: U(3.6), fontWeight: 500, opacity: 0.88 }}>Total earned</span>
                                <span style={{ fontSize: U(9.3), fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
                                    {currencySymbol}
                                    {totalEarned.toLocaleString("en-IN")}
                                </span>
                                <span style={{ fontSize: U(3.5), fontWeight: 400, opacity: 0.92, paddingRight: U(20) }}>
                                    {withdrawNote}
                                </span>
                                <div
                                    style={{
                                        position: "absolute",
                                        right: U(7.8),
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: U(15.6),
                                        height: U(15.6),
                                        filter: "drop-shadow(0 6px 10px rgba(0,0,0,.12))",
                                    }}
                                >
                                    <CoinIllustration />
                                </div>
                            </section>

                            {/* ================================ PART 3 ================================ */}

                            <h2 style={{ margin: `${U(9)} 0 ${U(3.4)}`, fontSize: U(3.5), fontWeight: 700 }}>Your referrals</h2>

                            {/* tabs */}
                            {/* tabs */}
                            <div
                                role="tablist"
                                style={{
                                    display: "flex",
                                    gap: U(2.2),
                                    alignItems: "stretch",
                                }}
                            >
                                {TABS.map(({ key, label }) => {
                                    const active = tab === key;

                                    const count = stats[key] ?? 0;

                                    return (
                                        <button
                                            key={key}
                                            role="tab"
                                            aria-selected={active}
                                            type="button"
                                            className="wre-btn"
                                            onClick={() => setTab(key)}
                                            style={{
                                                flex: "1 1 auto",
                                                minWidth: 0,
                                                height: U(12),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: U(2.2),
                                                padding: `0 ${U(2.6)}`,
                                                borderRadius: U(6),
                                                background: active ? "#fff1f4" : C.white,
                                                border: `${U(0.3)} solid ${active ? C.pink : "#ebebeb"
                                                    }`,
                                                color: active ? C.pinkText : C.ink,
                                                fontSize: U(3.4),
                                                fontWeight: active ? 500 : 400,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {label}

                                            <span
                                                style={{
                                                    minWidth: U(4.4),
                                                    height: U(4.4),
                                                    padding: `0 ${U(0.8)}`,
                                                    boxSizing: "border-box",
                                                    borderRadius: U(2.2),
                                                    background: active ? C.pink : "#efefef",
                                                    color: active ? C.white : "#8d8d8d",
                                                    fontSize: U(2.6),
                                                    fontWeight: 600,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* list / empty state */}
                            <section
                                style={{
                                    marginTop: U(4.3),
                                    minHeight: U(25.6),
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: referralDashboard?.history.length ? "flex-start" : "center",
                                    background: C.white,
                                    border: `${HAIR} solid ${C.border}`,
                                    borderRadius: U(5),
                                    boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
                                    overflow: "hidden",
                                }}
                            >
                                {referralDashboard?.history.length === 0 ? (
                                    <p style={{ margin: 0, textAlign: "center", fontSize: U(3.4), color: "#a9a9a9" }}>
                                        No referrals yet
                                    </p>
                                ) : (
                                    referralDashboard?.history.map((r, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: U(3),
                                                padding: `${U(3.2)} ${U(4)}`,
                                                borderTop: i === 0 ? "none" : `${HAIR} solid ${C.border}`,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: U(9),
                                                    height: U(9),
                                                    borderRadius: "50%",
                                                    flexShrink: 0,
                                                    background: C.pinkSoft,
                                                    color: C.pinkText,
                                                    fontSize: U(3.4),
                                                    fontWeight: 600,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {/* {r?.name.slice(0, 1).toUpperCase()} */}
                                            </span>
                                            {/* <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="wre-ellipsis" style={{ fontSize: U(3.4), fontWeight: 500 }}>
                                                    {r?.name}
                                                </div>
                                                {r.subtitle && (
                                                    <div className="wre-ellipsis" style={{ fontSize: U(2.7), color: C.grey }}>
                                                        {r.subtitle}
                                                    </div>
                                                )}
                                            </div> */}
                                            {/* {r.amount && (
                                                <span style={{ fontSize: U(3.4), fontWeight: 600, color: "#e08a10", whiteSpace: "nowrap" }}>
                                                    {r.amount}
                                                </span>
                                            )} */}
                                        </div>
                                    ))
                                )}
                            </section>

                            {/* how rewards work */}
                            <section
                                style={{
                                    marginTop: U(6.4),
                                    padding: `${U(5.4)} ${U(5.4)} ${U(5.4)}`,
                                    background: "#fff8f9",
                                    border: `${HAIR} solid ${C.pinkBorder}`,
                                    borderRadius: U(5),
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: U(2.4), color: C.pinkText }}>
                                    <span style={{ fontSize: U(3.6), display: "flex" }}>
                                        <InfoIcon />
                                    </span>
                                    <h3 style={{ margin: 0, fontSize: U(3.1), fontWeight: 600, letterSpacing: "0.1em" }}>
                                        HOW REWARDS WORK
                                    </h3>
                                </div>
                                <ul style={{ listStyle: "none", margin: `${U(4.6)} 0 0`, padding: 0, display: "flex", flexDirection: "column", gap: U(3.4) }}>
                                    {rules.map((r, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                position: "relative",
                                                paddingLeft: U(5.4),
                                                fontSize: U(3.15),
                                                lineHeight: 1.5,
                                                color: "#2b2b2f",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    position: "absolute",
                                                    left: U(0.6),
                                                    top: "0.55em",
                                                    width: U(1.7),
                                                    height: U(1.7),
                                                    borderRadius: "50%",
                                                    background: C.pink,
                                                    boxShadow: `0 0 ${U(1)} rgba(226,58,106,.45)`,
                                                }}
                                            />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}