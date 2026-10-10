import React from "react";
import { Loader } from "../shared/Loader";
import { useOnBoardingData } from "@/app/context/OnBoardingDataContext";
import { toast } from "sonner";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { formattedDate } from "@/app/components/eventSection/eventSection";

/* -------------------------------------------------------------------------- */
/*  AccountStatus                                                             */
/*                                                                            */
/*  One independent, fully fluid screen: back button + title, a status badge  */
/*  showing whether the account is currently ACTIVE or PAUSED, a short        */
/*  message and bullet list about what that status means, and two stacked    */
/*  buttons whose primary action depends on the status:                       */
/*    • active → "Pause account" (with an optional reason textarea)          */
/*    • paused → "Resume account"                                            */
/*  The secondary button is always the "leave it as it is" option.           */
/*                                                                            */
/*  `status` is owned by the parent (it's server state), so the screen        */
/*  flips the moment the parent passes a new value after a pause/resume      */
/*  succeeds — there's no local copy of it to drift out of sync.             */
/*                                                                            */
/*  It fills 100% width and 100% height of its PARENT. Every size inside      */
/*  (fonts, padding, gaps, radii, buttons) is measured in `cqw`, i.e. 1% of   */
/*  the parent's width, so everything scales with the parent. If the         */
/*  content is taller than the parent's height, it scrolls vertically        */
/*  (scrollbar hidden across browsers, scrolling still works).               */
/*                                                                            */
/*  Usage:                                                                   */
/*    <div style={{ width: 390, height: 800 }}>                              */
/*      <AccountStatusMain                                                  */
/*        status={isPaused ? "paused" : "active"}                           */
/*        pausedAt="2026-10-07"                                             */
/*        onBack={() => goBack()}                                           */
/*        onPauseAccount={({ reason }) => pauseAccount(reason)}             */
/*        onResumeAccount={() => resumeAccount()}                           */
/*        onKeepAsIs={() => goBack()}                                       */
/*      />                                                                   */
/*    </div>                                                                 */
/*                                                                            */
/*  Zero dependencies: no Tailwind-required classNames beyond the layout     */
/*  utility classes PauseAccountMain already uses, no icon library, no CSS    */
/*  files.                                                                   */
/* -------------------------------------------------------------------------- */

export type AccountStatus = "active" | "paused" | "loading";

export interface AccountStatusPoint {
    text: string;
    /** "safe" renders a green check, "hidden" renders a muted eye-off mark. */
    kind: "safe" | "hidden";
}

export interface AccountStatusProps {
    /** Current state of the account. Drives the badge, copy and primary action. */
    /** Optional date/time the account was paused, shown under the badge when paused. */
    pausedAt?: string;

    /** Bullet lists, one per state. Overridable; sensible defaults below. */
    activePoints?: AccountStatusPoint[];
    pausedPoints?: AccountStatusPoint[];

    pauseLabel?: string;
    resumeLabel?: string;
    keepActiveLabel?: string;
    stayPausedLabel?: string;

    /** Reason textarea — only shown while the account is active (i.e. when pausing). */
    reasonLabel?: string;
    reasonPlaceholder?: string;
    reasonMaxLength?: number;
    /** Controlled value. Omit to let the component manage its own state. */
    reason?: string;
    onReasonChange?: (reason: string) => void;

    onBack?: () => void;
    showBack?: boolean;
    /** Secondary button — "leave it as it is" for whichever status is showing. */
    onKeepAsIs?: () => void;
    onPauseAccount?: (data: { reason: string }) => void;
    onResumeAccount?: () => void;
    pausing?: boolean;
    resuming?: boolean;

    className?: string;
    style?: React.CSSProperties;
    fluid?: boolean;
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
    ink: "#1f1f24",
    grey: "#8a817c",
    green: "#1f9d55",
    greenSoft: "#e6f6ea",
    amber: "#b5790c",
    amberSoft: "#fdf2e0",
    border: "#ececec",
    white: "#ffffff",
};

const FONT =
    "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const svgBase: React.CSSProperties = { width: "1em", height: "1em", display: "block", flexShrink: 0 };
const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

const BackIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.4}>
        <path d="M15 5l-7 7 7 7" />
    </svg>
);
const PauseIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="currentColor">
        <rect x="6" y="4" width="4" height="16" rx="1.2" />
        <rect x="14" y="4" width="4" height="16" rx="1.2" />
    </svg>
);
const PlayIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} fill="currentColor">
        <path d="M7 4.5v15a1 1 0 0 0 1.5.87l12-7.5a1 1 0 0 0 0-1.74l-12-7.5A1 1 0 0 0 7 4.5Z" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke} strokeWidth={2.6}>
        <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
);
const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" style={svgBase} {...stroke}>
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6 0 9.5 6 9.9 7a11.9 11.9 0 0 1-3 3.9M6.6 6.6C3.9 8.3 2.2 10.9 2.1 12c.4 1 3.9 7 9.9 7 1.3 0 2.5-.3 3.6-.7" />
        <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
    </svg>
);

/** What pausing will do — shown while the account is active. */
const DEFAULT_ACTIVE_POINTS: AccountStatusPoint[] = [
    { kind: "safe", text: "Pausing keeps your matches and chat history exactly as they are." },
    { kind: "safe", text: "Any wallet balance or rewards you've earned are kept." },
    { kind: "hidden", text: "Your profile would be hidden — no one new can find or match with you." },
    { kind: "hidden", text: "You won't receive new likes or messages while paused." },
];

/** What resuming will do — shown while the account is paused. */
const DEFAULT_PAUSED_POINTS: AccountStatusPoint[] = [
    { kind: "hidden", text: "Your profile is hidden right now — no one can find or match with you." },
    { kind: "safe", text: "Your matches and chat history are untouched and ready when you are." },
    { kind: "safe", text: "Resuming makes you visible again instantly — new likes and messages can come in right away." },
];

/* -------------------------------- component -------------------------------- */
export default function AccountStatusMain({
    pausedAt,
    activePoints = DEFAULT_ACTIVE_POINTS,
    pausedPoints = DEFAULT_PAUSED_POINTS,
    pauseLabel = "Pause account",
    resumeLabel = "Resume account",
    keepActiveLabel = "Not now, keep browsing",
    stayPausedLabel = "Stay paused",
    reasonLabel = "Help us improve (optional)",
    reasonPlaceholder = "What's prompting the pause?",
    reasonMaxLength = 300,
    reason,
    onReasonChange,
    onBack,
    showBack = true,
    onKeepAsIs,
    onPauseAccount,
    onResumeAccount,
    pausing = false,
    resuming = false,
    className,
    style,
    fluid = false,
}: AccountStatusProps) {
    const [optimisticStatus, setOptimisticStatus] =
        React.useState<AccountStatus | null>(null);
    const { profileDetails } = useOnBoardingData()
        const { pauseAccount, pauseLoading, pauseError,resumeAccount,resumeError,resumeLoading } = useAccountSettings();
    
    const [reasonInner, setReasonInner] = React.useState("");
    const reasonValue = reason ?? reasonInner;

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value.slice(0, reasonMaxLength);
        if (reason === undefined) setReasonInner(next);
        onReasonChange?.(next);
    };
    /* The server owns the paused state: REVIEW_FINISH.pausedAt is `null` while
       the account is active and a timestamp string once it has been paused. */
    const pausedAtValue =
        profileDetails.details?.flows.REVIEW_FINISH?.pausedAt ?? null;
    const pausedAtDisplay = pausedAt ?? pausedAtValue ?? undefined;

    /* The server state is the base; a just-completed pause/resume overrides it
       until the refetched profile confirms the change on a later render. We key
       off `loading` rather than a null `details`, so an absent profile — or no
       way to load one — reads as active, matching the "pausedAt is null ⇒
       active" rule instead of hanging on the loader forever. */
    const serverStatus: AccountStatus = profileDetails.loading
        ? "loading"
        : pausedAtValue !== null
            ? "paused"
            : "active";
    const status = optimisticStatus ?? serverStatus;
    const isPaused = status === "paused";

    function handleResumeAccount() {
        resumeAccount().then(async (response) => {
            if (response?.success) {
                setOptimisticStatus("active");
                toast.success(response.message || "Account resumed successfully.");
                await profileDetails.refetch();
                setOptimisticStatus(null);
            } else {
                toast.error(resumeError || "Failed to resume account.");
            }
        });
    }

    function handlePauseAccount(data: { reason: string }) {
        pauseAccount(data).then(async (response) => {
            if (response?.success) {
                setOptimisticStatus("paused");
                toast.success(response.message || "Account paused successfully.");
                await profileDetails.refetch();
                setOptimisticStatus(null);
            } else {
                toast.error(pauseError || "Failed to pause account.");
            }
        });
    }

    const points = isPaused ? pausedPoints : activePoints;
    const busy = isPaused ? resuming || resumeLoading : pausing || pauseLoading;

    const badge = isPaused
        ? { label: "Paused", fg: C.amber, bg: C.amberSoft }
        : { label: "Active", fg: C.green, bg: C.greenSoft };
    const frameClass = `flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`;

    if (status === "loading") {
        return (
            <main className={frameClass}>
                <Loader label="Loading Account Status" hint="Just a moment." />
            </main>
        );
    } return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
            {/* Card container – fills remaining height */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">
                {/* Profile card */}
                <div
                    className={
                        fluid
                            ? "absolute inset-0 overflow-hidden"
                            : "mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out"
                    }
                >
                    <div
                        className={`ast-scroll ${className ?? ""}`}
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
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

            .ast-btn {
                cursor: pointer;
                border: 0;
                font: inherit;
                transition: transform .12s ease, filter .12s ease;
            }

            .ast-btn:hover:not(:disabled) {
                filter: brightness(1.05);
            }

            .ast-btn:active:not(:disabled) {
                transform: scale(.98);
            }

            .ast-btn:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }

            .ast-btn:focus-visible {
                outline: 2px solid ${C.pink};
                outline-offset: 2px;
            }

            .ast-textarea {
                font-family: inherit;
            }

            .ast-textarea::placeholder {
                color: ${C.grey};
            }

            .ast-textarea:focus-visible {
                outline: 2px solid ${C.pink};
                outline-offset: 2px;
            }

            .ast-scroll::-webkit-scrollbar {
                display: none;
                width: 0;
                height: 0;
            }
        `}</style>

                        <div
                            style={{
                                fontFamily: FONT,
                                color: C.ink,
                                boxSizing: "border-box",
                                minHeight: "100%",
                                padding: `${U(3)} ${U(5)} ${U(5)}`,
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Header */}
                            <header
                                style={{
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    minHeight: U(9),
                                    marginBottom: U(4),
                                }}
                            >
                                <button
                                    type="button"
                                    className="ast-btn"
                                    aria-label="Go back"
                                    onClick={onBack}
                                    style={{
                                        position: "absolute",
                                        left: U(-1.9),
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: U(9),
                                        height: U(9),
                                        borderRadius: "50%",
                                        background: C.white,
                                        border: `${HAIR} solid ${C.border}`,
                                        boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                                        color: C.ink,
                                        fontSize: U(3.7),
                                        display: showBack ? "flex" : "none",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 0,
                                    }}
                                >
                                    <BackIcon />
                                </button>

                                <h1
                                    style={{
                                        margin: 0,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    Account status
                                </h1>
                            </header>
                            {/* Status icon */}
                            <div
                                style={{
                                    width: U(14),
                                    height: U(14),
                                    margin: "0 auto",
                                    borderRadius: "50%",
                                    background: isPaused ? C.amberSoft : C.greenSoft,
                                    color: isPaused ? C.amber : C.green,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: U(5.6),
                                }}
                            >
                                {isPaused ? <PauseIcon /> : <CheckIcon />}
                            </div>

                            {/* Status badge */}
                            <div style={{ display: "flex", justifyContent: "center", marginTop: U(3.5) }}>
                                <span
                                    role="status"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: U(1.6),
                                        padding: `${U(1.2)} ${U(3.2)}`,
                                        borderRadius: U(4),
                                        background: badge.bg,
                                        color: badge.fg,
                                        fontSize: U(2.7),
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    <span
                                        aria-hidden
                                        style={{
                                            width: U(1.8),
                                            height: U(1.8),
                                            borderRadius: "50%",
                                            background: badge.fg,
                                        }}
                                    />
                                    {badge.label}
                                </span>
                            </div>

                            {/* Title */}
                            <h2
                                style={{
                                    margin: `${U(3)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(5),
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                }}
                            >
                                {isPaused ? "Your account is paused" : "Your account is active"}
                            </h2>

                            {/* Message */}
                            <p
                                style={{
                                    margin: `${U(2)} 0 0`,
                                    textAlign: "center",
                                    fontSize: U(3.2),
                                    lineHeight: 1.45,
                                    color: C.grey,
                                }}
                            >
                                {isPaused
                                    ? pausedAtDisplay
                                        ? `Paused since ${formattedDate(new Date(pausedAtDisplay))}. Ready to be seen again?`
                                        : "Ready to be seen again? Resuming puts your profile back in front of people right away."
                                    : "You're visible on Welvors. Need a break? You can pause without losing anything."}
                            </p>

                            {/* Points */}
                            {points.length > 0 && (
                                <ul
                                    style={{
                                        listStyle: "none",
                                        margin: `${U(3.5)} 0 0`,
                                        padding: `${U(3.5)} ${U(4)}`,
                                        background: "#faf8f6",
                                        border: `${HAIR} solid ${C.border}`,
                                        borderRadius: U(4),
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: U(2),
                                    }}
                                >
                                    {points.map((p, i) => (
                                        <li
                                            key={i}
                                            style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: U(2.3),
                                                fontSize: U(3),
                                                lineHeight: 1.45,
                                                color: "#3a3632",
                                            }}
                                        >
                                            <span
                                                aria-hidden
                                                style={{
                                                    flexShrink: 0,
                                                    marginTop: "0.15em",
                                                    width: U(4),
                                                    height: U(4),
                                                    borderRadius: "50%",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: U(2.2),
                                                    background: p.kind === "safe" ? "#e5f6ea" : "#f1eeea",
                                                    color: p.kind === "safe" ? C.green : C.grey,
                                                }}
                                            >
                                                {p.kind === "safe" ? <CheckIcon /> : <EyeOffIcon />}
                                            </span>

                                            {p.text}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Reason — only while pausing */}
                            {!isPaused && reasonLabel !== "" && (
                                <div style={{ marginTop: U(3.5) }}>
                                    <label
                                        htmlFor="ast-reason"
                                        style={{
                                            display: "block",
                                            marginBottom: U(1.5),
                                            fontSize: U(3),
                                            fontWeight: 600,
                                            color: C.ink,
                                        }}
                                    >
                                        {reasonLabel}
                                    </label>

                                    <textarea
                                        id="ast-reason"
                                        className="ast-textarea"
                                        value={reasonValue}
                                        onChange={handleReasonChange}
                                        maxLength={reasonMaxLength}
                                        placeholder={reasonPlaceholder}
                                        rows={3}
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            resize: "vertical",
                                            minHeight: U(20),
                                            padding: `${U(3)} ${U(3.5)}`,
                                            background: C.white,
                                            border: `${HAIR} solid ${C.border}`,
                                            borderRadius: U(3.8),
                                            fontSize: U(3.1),
                                            lineHeight: 1.45,
                                            color: C.ink,
                                        }}
                                    />

                                    <span
                                        style={{
                                            display: "block",
                                            marginTop: U(1),
                                            textAlign: "right",
                                            fontSize: U(2.5),
                                            color: C.grey,
                                        }}
                                    >
                                        {reasonValue.length} / {reasonMaxLength}
                                    </span>
                                </div>
                            )}

                            {/* buttons */}
                            <div style={{ display: "flex", flexDirection: "column", gap: U(3), marginTop: U(7) }}>
                                <button
                                    type="button"
                                    className="ast-btn"
                                    onClick={() =>
                                        isPaused
                                            ? handleResumeAccount()
                                            : handlePauseAccount({ reason: reasonValue })
                                    }
                                    disabled={busy}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(4.6),
                                        background: `linear-gradient(90deg, ${C.pink}, ${C.pinkDeep})`,
                                        color: C.white,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                        boxShadow: `0 ${U(1.2)} ${U(3.4)} rgba(226,58,106,.35)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: U(2.4),
                                    }}
                                >
                                    <span style={{ fontSize: U(3.6), display: "flex" }}>
                                        {isPaused ? <PlayIcon /> : <PauseIcon />}
                                    </span>
                                    {isPaused
                                        ? resuming
                                            ? "Resuming…"
                                            : resumeLabel
                                        : pausing
                                            ? "Pausing…"
                                            : pauseLabel}
                                </button>

                                <button
                                    type="button"
                                    className="ast-btn"
                                    onClick={onKeepAsIs}
                                    style={{
                                        width: "100%",
                                        height: U(13.9),
                                        borderRadius: U(4.6),
                                        background: C.white,
                                        border: `${U(0.3)} solid ${C.border}`,
                                        color: C.ink,
                                        fontSize: U(4),
                                        fontWeight: 600,
                                    }}
                                >
                                    {isPaused ? stayPausedLabel : keepActiveLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
