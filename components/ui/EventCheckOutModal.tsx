"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* -------------------------------------------------------------------------- */
/*  CheckoutModal  (with Razorpay payment)                                    */
/*                                                                            */
/*  Flow when the user taps "Pay securely":                                   */
/*   1. POST /api/payment/create-order  -> backend creates Razorpay order     */
/*   2. Load Razorpay checkout.js (once) and open it with that order_id       */
/*   3. On success Razorpay gives payment_id + order_id + signature           */
/*   4. POST /api/payment/verify -> backend checks the signature and          */
/*      confirms the booking. ONLY after this is the booking "paid".          */
/*   5. onSuccess(bookingId) -> navigate to the ticket / success screen       */
/*                                                                            */
/*  Never treat Razorpay's handler callback alone as success. Step 4 is the   */
/*  real check (plus a Razorpay webhook on the backend as a safety net).      */
/* -------------------------------------------------------------------------- */

import { usePayment } from "@/app/context/PaymentContext";

export interface PaymentResult {
    bookingId: string;
    paymentId: string;
    razorpayPaymentId: string;
}

export interface CheckoutModalProps {
    open: boolean;
    onClose: () => void;

    title?: string;

    /* ---------- booking input (sent to create-order) ---------- */
    eventId: string;
    menTicketCount: number;
    womenTicketCount: number;
    otherTicketCount?: number;

    /* ---------- Razorpay prefill (optional, speeds up checkout) ---------- */
    prefill?: { name?: string; email?: string; contact?: string };

    /* ---------- order summary (display only) ---------- */
    eventTitle?: string;
    eventDate?: string;
    eventImage?: string;
    ticketLabel?: string;
    ticketPrice?: number;
    platformFee?: number;
    gstPercent?: number;
    couponCode?: string;
    discount?: number;

    partnerNote?: string;
    showPartner?: boolean;
    currencySymbol?: string;

    /* ---------- result callbacks ---------- */
    onSuccess?: (result: PaymentResult) => void;
    onFailure?: (message: string) => void;
    onAddPartner?: () => void;

    closeOnBackdrop?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.25cqw)";

const C = {
    pink: "#e0245e",
    pinkText: "#e0355f",
    pinkSoft: "#fde4ea",
    pinkBorder: "#f6cdd9",
    ink: "#1f1f24",
    grey: "#8a8a93",
    border: "#ececf0",
    white: "#ffffff",
    page: "#fbfafb",
    green: "#2f9e5b",
    red: "#c62828",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
const round2 = (n: number) => Math.round(n * 100) / 100;

const Icon = ({ children, width = 2 }: { children: React.ReactNode; width?: number }) => (
    <svg
        viewBox="0 0 24 24"
        style={{ width: "1em", height: "1em", display: "block", flexShrink: 0 }}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);
const CloseIcon = () => (
    <Icon width={2.4}>
        <path d="M6 6l12 12M18 6 6 18" />
    </Icon>
);
const LockIcon = () => (
    <svg viewBox="0 0 24 24" style={{ width: "1em", height: "1em", display: "block" }} fill="currentColor">
        <path d="M7 10V8a5 5 0 0 1 10 0v2h.5A1.500 1.500 0 0 1 19 11.500v8a1.500 1.500 0 0 1-1.500 1.500h-11A1.500 1.500 0 0 1 5 19.500v-8A1.500 1.500 0 0 1 6.500 10H7Zm2 0h6V8a3 3 0 0 0-6 0v2Z" />
    </svg>
);
const TicketIcon = () => (
    <Icon>
        <path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2h18v-2a2 2 0 0 1 0-4v0a2 2 0 0 0 0-4V6H3v2Z" />
        <path d="M10 9.500h4M10 13.500h4" />
    </Icon>
);
const PlusIcon = () => (
    <Icon width={2.2}>
        <path d="M12 5v14M5 12h14" />
    </Icon>
);
const Spinner = () => (
    <span
        aria-hidden
        style={{
            width: "1em",
            height: "1em",
            borderRadius: "50%",
            border: "0.15em solid rgba(255,255,255,.4)",
            borderTopColor: "#fff",
            animation: "wco-spin .7s linear infinite",
            display: "block",
        }}
    />
);

type PayStage = "idle" | "creating" | "awaiting" | "verifying";

/* -------------------------------- component -------------------------------- */
export default function CheckoutModal({
    open,
    onClose,
    title = "Checkout",

    eventId,
    menTicketCount,
    womenTicketCount,
    otherTicketCount = 0,

    prefill,

    eventTitle = "Sunrise Trails & New Connections",
    eventDate = "Sun, Oct 4, 2026 · 06:00 · Sinhagad G...",
    eventImage,
    ticketLabel = "Ticket × 1 (Man)",
    ticketPrice = 8,
    platformFee = 2,
    gstPercent = 18,
    couponCode = "WELVORS100",
    discount = 0,
    partnerNote = "Ticket price differs by gender — a partner's ticket is charged at their rate.",
    showPartner = true,
    currencySymbol = "₹",

    onSuccess,
    onFailure,
    onAddPartner,
    closeOnBackdrop = true,
    className,
    style,
}: CheckoutModalProps) {
    const { loadRazorpay, createOrder, verifyPayment } = usePayment();
    const [mounted, setMounted] = useState(false);
    const [stage, setStage] = useState<PayStage>("idle");
    const [error, setError] = useState<string | null>(null);
    /** Amount confirmed by backend (rupees). Backend is the source of truth. */
    const [serverAmount, setServerAmount] = useState<number | null>(null);

    const dialogRef = useRef<HTMLDivElement>(null);
    const busy = stage !== "idle";
    const busyRef = useRef(false);
    busyRef.current = busy;

    const closeRef = useRef(onClose);
    closeRef.current = onClose;

    useEffect(() => setMounted(true), []);

    // preload checkout.js as soon as the modal opens, so Pay feels instant
    useEffect(() => {
        if (open) loadRazorpay();
    }, [open, loadRazorpay]);

    // reset state every time the modal re-opens
    useEffect(() => {
        if (open) {
            setStage("idle");
            setError(null);
            setServerAmount(null);
        }
    }, [open]);

    /* Esc to close (not while paying), lock scroll, focus management */
    useEffect(() => {
        if (!open) return;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busyRef.current) closeRef.current();
        };
        document.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
            previouslyFocused?.focus?.();
        };
    }, [open]);

    if (!mounted || !open) return null;

    /* display totals (estimate only — backend amount overrides once known) */
    const gst = round2(((ticketPrice + platformFee) * gstPercent) / 100);
    const localTotal = round2(ticketPrice + platformFee + gst - discount);
    const shownTotal = serverAmount ?? localTotal;
    const money = (n: number) => `${currencySymbol}${n.toFixed(2)}`;

    /* ------------------------------ payment flow ------------------------------ */
    const fail = (msg: string) => {
        setStage("idle");
        setError(msg);
        onFailure?.(msg);
    };

    const handlePay = async () => {
        if (busyRef.current) return; // block double taps
        setError(null);

        /* guard: catch missing props before hitting the API */
        if (!eventId) return fail("eventId missing — CheckoutModal ko eventId prop pass karo.");
        if (!(menTicketCount + womenTicketCount + otherTicketCount > 0) || [menTicketCount, womenTicketCount, otherTicketCount].some((n) => typeof n !== "number"))
            return fail("Ticket count missing — menTicketCount / womenTicketCount props pass karo.");
        setStage("creating");

        try {
            /* ---- 1. load Razorpay SDK ---- */
            const loaded = await loadRazorpay();
            if (!loaded) return fail("Payment gateway load nahi hua. Internet check karke dobara try karo.");

            /* ---- 2. create order on backend (PaymentContext) ---- */
            const created = await createOrder({ eventId, menTicketCount, womenTicketCount, otherTicketCount });
            if (!created.ok) return fail(created.message || "Order create nahi hua. Dobara try karo.");

            const order = created.data;
            setServerAmount(Number(order.amountInRupees));

            /* ---- 3. open Razorpay checkout ---- */
            setStage("awaiting");

            const rzp = new window.Razorpay({
                key: order.razorpayKeyId,
                order_id: order.razorpayOrderId,
                amount: order.amount, // paise; must match the order
                currency: order.currency,
                name: "Welvors",
                description: eventTitle,
                prefill: prefill ?? {},
                notes: { bookingId: order.bookingId, paymentId: order.paymentId },
                theme: { color: C.pink },
                retry: { enabled: true, max_count: 3 },

                /* ---- 4. success from Razorpay -> verify on backend ---- */
                handler: async (resp: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {
                    setStage("verifying");
                    try {
                        /* verify via PaymentContext (sends only the 3 razorpay_* keys) */
                        const verified = await verifyPayment({
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature,
                        });

                        if (!verified.ok) {
                            // money may be captured; backend webhook should still reconcile it
                            return fail(
                                "Payment receive hua par confirm nahi ho paaya. Paisa kata hai to booking kuch minute mein update ho jayegi, ya support se contact karo."
                            );
                        }

                        setStage("idle");
                        onSuccess?.({
                            bookingId: order.bookingId,
                            paymentId: order.paymentId,
                            razorpayPaymentId: resp.razorpay_payment_id,
                        });
                    } catch {
                        fail("Network issue during confirmation. Booking status thodi der mein check karo.");
                    }
                },

                modal: {
                    // user closed Razorpay without paying
                    ondismiss: () => {
                        setStage((s) => (s === "verifying" ? s : "idle"));
                    },
                    confirm_close: true,
                },
            });

            rzp.on("payment.failed", (resp: any) => {
                // fires on each failed attempt; Razorpay lets the user retry inside its modal
                const reason = resp?.error?.description || "Payment fail ho gaya.";
                setError(reason);
            });

            rzp.open();
        } catch {
            fail("Kuch galat hua. Internet check karke dobara try karo.");
        }
    };

    const payLabel =
        stage === "creating"
            ? "Preparing payment…"
            : stage === "awaiting"
              ? "Complete payment in the window…"
              : stage === "verifying"
                ? "Confirming booking…"
                : `Pay ${money(shownTotal)} securely`;

    /* ------------------------------- styles ------------------------------- */
    const sectionLabel: React.CSSProperties = {
        margin: `0 0 ${U(3.2)} ${U(0.6)}`,
        fontSize: U(2.9),
        fontWeight: 500,
        letterSpacing: "0.12em",
        color: C.grey,
        textTransform: "uppercase",
    };
    const row: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: U(3),
        fontSize: U(3.5),
    };

    return createPortal(
        <div
            onMouseDown={(e) => {
                if (closeOnBackdrop && !busy && e.target === e.currentTarget) onClose();
            }}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
                boxSizing: "border-box",
                background: "rgba(20, 18, 30, 0.38)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                animation: "wco-fade .2s ease-out both",
            }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes wco-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes wco-pop  { from { opacity: 0; transform: translateY(14px) scale(.96) } to { opacity: 1; transform: none } }
        @keyframes wco-spin { to { transform: rotate(360deg) } }
        .wco-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease, background .15s ease, opacity .15s ease; }
        .wco-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .wco-btn:active:not(:disabled) { transform: scale(.985); }
        .wco-btn:disabled { cursor: not-allowed; opacity: .75; }
        .wco-btn:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
        .wco-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wco-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @media (prefers-reduced-motion: reduce) { .wco-dialog, .wco-backdrop { animation: none !important; } }
      `}</style>

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                aria-busy={busy}
                tabIndex={-1}
                className={`wco-dialog ${className ?? ""}`}
                style={{
                    width: "min(80%, 480px)",
                    maxHeight: "min(90%, 860px)",
                    containerType: "inline-size",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                    background: C.page,
                    borderRadius: 28,
                    boxShadow: "0 30px 80px rgba(20,10,40,.35), 0 0 0 1px rgba(255,255,255,.4)",
                    fontFamily: FONT,
                    color: C.ink,
                    overflow: "hidden",
                    outline: "none",
                    animation: "wco-pop .28s cubic-bezier(.2,.8,.2,1) both",
                    ...style,
                }}
            >
                {/* ------------------------------ header ------------------------------ */}
                <header
                    style={{
                        position: "relative",
                        flex: "0 0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: `${U(5)} ${U(5.5)} ${U(3)}`,
                    }}
                >
                    <h1 style={{ margin: 0, fontSize: U(4.6), fontWeight: 600, letterSpacing: "0.01em" }}>{title}</h1>
                    <button
                        type="button"
                        className="wco-btn"
                        aria-label="Close"
                        onClick={onClose}
                        disabled={busy}
                        style={{
                            position: "absolute",
                            right: U(4.4),
                            top: "50%",
                            transform: "translateY(-45%)",
                            width: U(9),
                            height: U(9),
                            borderRadius: "50%",
                            background: C.white,
                            border: `${HAIR} solid ${C.border}`,
                            boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                            color: C.ink,
                            fontSize: U(4.2),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                        }}
                    >
                        <CloseIcon />
                    </button>
                </header>

                {/* ------------------------------ scroll ------------------------------ */}
                <div className="wco-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
                    <div style={{ boxSizing: "border-box", padding: `${U(2)} ${U(5.5)} ${U(6)}` }}>
                        <h2 style={sectionLabel}>Order summary</h2>

                        <section
                            style={{
                                padding: `${U(5)} ${U(5)} ${U(5.4)}`,
                                background: C.white,
                                border: `${HAIR} solid ${C.pinkBorder}`,
                                borderRadius: U(5.4),
                                boxShadow: `0 ${U(1.4)} ${U(5)} rgba(224,36,94,.10)`,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: U(4),
                                    paddingBottom: U(4.6),
                                    borderBottom: `${HAIR} solid ${C.border}`,
                                }}
                            >
                                <div
                                    style={{
                                        width: U(13.4),
                                        height: U(13.4),
                                        borderRadius: U(3),
                                        flexShrink: 0,
                                        overflow: "hidden",
                                        background: "linear-gradient(160deg, #ffb35c 0%, #e8613c 55%, #3b2a2a 100%)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: U(6),
                                    }}
                                >
                                    {eventImage ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={eventImage} alt={eventTitle} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                    ) : (
                                        <span aria-hidden>🌄</span>
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: 0, fontSize: U(3.9), fontWeight: 600, lineHeight: 1.25 }}>{eventTitle}</h3>
                                    <p
                                        style={{
                                            margin: `${U(1.6)} 0 0`,
                                            fontSize: U(3.1),
                                            color: C.grey,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {eventDate}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: U(4.2), paddingTop: U(5) }}>
                                <div style={row}>
                                    <span>{ticketLabel}</span>
                                    <span style={{ fontWeight: 500 }}>{money(ticketPrice)}</span>
                                </div>
                                <div style={row}>
                                    <span>Platform fee</span>
                                    <span style={{ fontWeight: 500 }}>{money(platformFee)}</span>
                                </div>
                                <div style={row}>
                                    <span>GST ({gstPercent}%)</span>
                                    <span style={{ fontWeight: 500 }}>{money(gst)}</span>
                                </div>
                                {couponCode && (
                                    <div style={{ ...row, color: C.green }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: U(2.2) }}>
                                            <span style={{ fontSize: U(3.4), display: "flex" }}>
                                                <TicketIcon />
                                            </span>
                                            {couponCode} applied
                                        </span>
                                        <span style={{ fontWeight: 500 }}>-{money(discount)}</span>
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    marginTop: U(5),
                                    paddingTop: U(5),
                                    borderTop: `${U(0.35)} dashed ${C.border}`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: U(3),
                                }}
                            >
                                <span style={{ fontSize: U(4.1), fontWeight: 600 }}>Total payable</span>
                                <span style={{ fontSize: U(6.2), fontWeight: 700, color: C.pinkText, letterSpacing: "-0.01em" }}>
                                    {money(shownTotal)}
                                </span>
                            </div>
                        </section>

                        {showPartner && (
                            <>
                                <h2 style={{ ...sectionLabel, margin: `${U(8)} 0 ${U(3.2)} ${U(0.6)}` }}>Bring a partner</h2>
                                <section
                                    style={{
                                        padding: `${U(5)} ${U(5)} ${U(5.4)}`,
                                        background: C.white,
                                        border: `${HAIR} solid ${C.border}`,
                                        borderRadius: U(5.4),
                                        boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.04)`,
                                    }}
                                >
                                    <p style={{ margin: 0, fontSize: U(3.3), lineHeight: 1.5, color: "#6f6a68" }}>{partnerNote}</p>
                                    <button
                                        type="button"
                                        className="wco-btn"
                                        onClick={onAddPartner}
                                        disabled={busy}
                                        style={{
                                            marginTop: U(4.6),
                                            width: "100%",
                                            height: U(13),
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: U(2.4),
                                            borderRadius: U(4.2),
                                            background: C.pinkSoft + "55",
                                            border: `${U(0.45)} dashed ${C.pinkBorder}`,
                                            color: C.pinkText,
                                            fontSize: U(3.8),
                                            fontWeight: 500,
                                        }}
                                    >
                                        <span style={{ fontSize: U(4.2), display: "flex" }}>
                                            <PlusIcon />
                                        </span>
                                        Add partner ticket
                                    </button>
                                </section>
                            </>
                        )}
                    </div>
                </div>

                {/* ------------------------- pinned pay button ------------------------- */}
                <footer
                    style={{
                        flex: "0 0 auto",
                        padding: `${U(3.6)} ${U(5.5)} ${U(5.5)}`,
                        background: C.page,
                        borderTop: `${HAIR} solid ${C.border}`,
                    }}
                >
                    {error && (
                        <p role="alert" style={{ margin: `0 0 ${U(3)}`, fontSize: U(3.2), lineHeight: 1.45, color: C.red, textAlign: "center" }}>
                            {error}
                        </p>
                    )}
                    <button
                        type="button"
                        className="wco-btn"
                        onClick={handlePay}
                        disabled={busy}
                        style={{
                            width: "100%",
                            height: U(13.8),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: U(2.6),
                            borderRadius: U(4.6),
                            background: `linear-gradient(135deg, #ea2c68, ${C.pink})`,
                            color: C.white,
                            fontSize: U(4.1),
                            fontWeight: 600,
                            boxShadow: `0 ${U(1.4)} ${U(4)} rgba(224,36,94,.35)`,
                        }}
                    >
                        <span style={{ fontSize: U(4.4), display: "flex" }}>{busy ? <Spinner /> : <LockIcon />}</span>
                        {payLabel}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
}