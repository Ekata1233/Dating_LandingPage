"use client";

import React, { useEffect, useState } from "react";
import {
  C,
  PayMethod,
  Status,
  FootNote,
  PrimaryButton,
  ErrorNote,
  BackLink,
} from "../waitlistConfig";

interface CardState {
  number: string;
  expiry: string;
  cvv: string;
}

interface Props {
  payMethod: PayMethod;
  setPayMethod: (m: PayMethod) => void;
  upiId: string;
  setUpiId: (v: string) => void;
  card: CardState;
  setCard: React.Dispatch<React.SetStateAction<CardState>>;
  status: Status;
  errorMsg: string;
  onBack: () => void;
  onPay: () => void;
  onResetError: () => void;
}

/* ---- Price API (display only — charged amount server-side order se aata hai) ---- */
const WAITLIST_API =
  "https://dating-app-backend-plum.vercel.app/api/user/waitlist/get";
const inr = (n: number | string) => "₹" + Number(n).toLocaleString("en-IN");

/* ------------------------------------------------------------------ */
/*  ⚠️  PCI-DSS / RBI                                                  */
/*  Ye card fields sirf UI hain. Production me raw card number/CVV     */
/*  apne server pe kabhi mat bhejo — Razorpay Checkout (rzp.open) use  */
/*  karo. Agar Razorpay modal use kar rahe ho to in card fields ki     */
/*  zaroorat hi nahi, delete kar do.                                   */
/* ------------------------------------------------------------------ */
export default function StepPayment({
  payMethod,
  setPayMethod,
  upiId,
  setUpiId,
  card,
  setCard,
  status,
  errorMsg,
  onBack,
  onPay,
  onResetError,
}: Props) {
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(WAITLIST_API)
      .then((r) => r.json())
      .then((j) => {
        if (alive && j?.success && j?.data) setPrice(inr(j.data.finalPrice));
      })
      .catch(() => {
        /* display stays as … ; charge amount server-side */
      });
    return () => {
      alive = false;
    };
  }, []);

  const priceLabel = price ?? "…";
  const priceReady = price !== null;

  const inputCls =
    "mt-2 w-full rounded-xl border px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-[#E8A2BE]";
  const inputStyle = { borderColor: "#EDE4DC", color: C.headingDark };

  return (
    <>
      <BackLink onClick={onBack} />

      <h2
        className="mt-4 text-[24px] leading-tight sm:text-[26px]"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: C.headingDark,
        }}
      >
        Secure your spot.
      </h2>

      {/* Order summary */}
      <div
        className="mt-4 flex items-center gap-3 rounded-xl px-4 py-3.5"
        style={{ backgroundColor: "#F5EFE7" }}
      >
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold" style={{ color: C.headingDark }}>
            Founding spot
          </p>
          <p className="mt-0.5 text-[12px]" style={{ color: C.body }}>
            One-time · becomes your 1st month of Premium
          </p>
        </div>
        <span
          className="flex-none text-[20px] font-bold"
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            color: C.headingDark,
          }}
        >
          {priceLabel}
        </span>
      </div>

      {/* Method toggle */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {(
          [
            { key: "upi" as const, label: "UPI", icon: "📱" },
            { key: "card" as const, label: "Card", icon: "💳" },
          ]
        ).map((m) => {
          const isSel = payMethod === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setPayMethod(m.key);
                onResetError();
              }}
              aria-pressed={isSel}
              className="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-[14px] font-semibold transition-colors"
              style={{
                borderColor: isSel ? "#E8A2BE" : "#EDE4DC",
                backgroundColor: isSel ? "#FDF2F6" : "#FFFFFF",
                color: isSel ? C.pink : C.headingDark,
              }}
            >
              <span className="text-[13px]">{m.icon}</span>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ---- UPI ---- */}
      {payMethod === "upi" && (
        <>
          <label
            className="mt-4 block text-[12.5px] font-bold"
            style={{ color: C.headingDark }}
          >
            UPI ID
          </label>
          <input
            type="text"
            inputMode="email"
            placeholder="yourname@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value.trim())}
            className={inputCls}
            style={inputStyle}
          />
        </>
      )}

      {/* ---- Card ---- */}
      {payMethod === "card" && (
        <>
          <label
            className="mt-4 block text-[12.5px] font-bold"
            style={{ color: C.headingDark }}
          >
            Card number
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            value={card.number}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(0, 16);
              setCard((c) => ({
                ...c,
                number: d.replace(/(.{4})/g, "$1 ").trim(),
              }));
            }}
            className={inputCls}
            style={inputStyle}
          />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label
                className="block text-[12.5px] font-bold"
                style={{ color: C.headingDark }}
              >
                Expiry
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                value={card.expiry}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCard((c) => ({
                    ...c,
                    expiry: d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d,
                  }));
                }}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label
                className="block text-[12.5px] font-bold"
                style={{ color: C.headingDark }}
              >
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                placeholder="123"
                value={card.cvv}
                onChange={(e) =>
                  setCard((c) => ({
                    ...c,
                    cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                  }))
                }
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>
        </>
      )}

      <ErrorNote message={status === "error" ? errorMsg : ""} />

      <PrimaryButton
        onClick={onPay}
        disabled={status === "sending" || !priceReady}
        className="mt-5"
      >
        {status === "sending"
          ? "Processing…"
          : priceReady
          ? `Pay ${priceLabel}`
          : "Loading…"}
      </PrimaryButton>

      <FootNote>Secure payment · No spam</FootNote>
    </>
  );
}