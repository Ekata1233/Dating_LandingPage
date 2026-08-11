"use client";

import React, { useEffect, useState } from "react";

import {
  C,
  HIGHLIGHTS,
  Plan,
  Status,
  FootNote,
  PrimaryButton,
  ErrorNote,
  BackLink,
} from "../waitlistConfig";

interface Props {
  fullName: string;
  plan: Plan;
  setPlan: (p: Plan) => void;
  status: Status;
  errorMsg: string;
  onBack: () => void;
  onConfirm: () => void;
}

/* ---- Waitlist config API (single source of truth) ---- */
const WAITLIST_API =
  "https://dating-app-backend-plum.vercel.app/api/user/waitlist/get";

/* ---- Payment order API (founding spot) ---- */
const PAYMENT_API =
  "https://dating-app-backend-plum.vercel.app/api/payments/create-order";

/* === SET THIS ONCE ===
   Put the exact localStorage/sessionStorage key that holds YOUR app's login
   token (find it with the console snippet: the key whose decoded payload's
   phone/id matches your logged-in user). Once set, we use ONLY this key and
   stop scanning — no more grabbing the wrong JWT.
   Leave it "" to fall back to auto-scan (less reliable). */
const TOKEN_KEY = "welvors_token";

const strip = (v: string) => v.replace(/^"|"$/g, "").trim();
const looksLikeJwt = (v: string) =>
  /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(v);

const getAuthToken = (): string => {
  if (typeof window === "undefined") return ""; // SSR guard

  // Preferred: read the exact key you configured.
  if (TOKEN_KEY) {
    const raw = strip(
      window.localStorage.getItem(TOKEN_KEY) ||
        window.sessionStorage.getItem(TOKEN_KEY) ||
        ""
    );
    if (raw) {
      // token may be nested inside a JSON blob under that key
      if (looksLikeJwt(raw)) return raw;
      try {
        const obj = JSON.parse(
          window.localStorage.getItem(TOKEN_KEY) ||
            window.sessionStorage.getItem(TOKEN_KEY) ||
            ""
        );
        const nested = obj?.token || obj?.accessToken || obj?.authToken || obj?.jwt;
        if (typeof nested === "string") return strip(nested);
      } catch {}
      return raw;
    }
    return "";
  }

  // Fallback auto-scan (only if TOKEN_KEY is left empty).
  for (const store of [window.localStorage, window.sessionStorage]) {
    for (let i = 0; i < store.length; i++) {
      const key = store.key(i);
      if (!key) continue;
      const raw = strip(store.getItem(key) || "");
      if (looksLikeJwt(raw)) return raw;
    }
  }
  for (const k of ["token", "accessToken", "authToken", "access_token", "jwt"]) {
    const v =
      window.localStorage.getItem(k) || window.sessionStorage.getItem(k);
    if (v) return strip(v);
  }
  return "";
};

interface ApiPerk {
  title: string;
  value: number;
  subtitle: string;
}

interface WaitlistConfig {
  originalPrice: string;
  discountAmount: string;
  finalPrice: string;
  welcomeCoins: number;
  perks: ApiPerk[];
  totalBenefitsValue: string;
  description: string;
}

const inr = (n: number | string) => "₹" + Number(n).toLocaleString("en-IN");

/* Cosmetic only — emoji is NOT in the API. Delete this whole block once
   your DB perk titles already start with an emoji. Prices never come
   from here; this only decorates the title. */
const EMOJI: Record<string, string> = {
  boost: "🚀",
  compliment: "❤️",
  date: "🗓️",
  rewind: "🔄",
  coin: "🪙",
};
const decorate = (title: string) => {
  const clean = title.replace(/"/g, "").trim();
  if (/^\p{Extended_Pictographic}/u.test(clean)) return clean; // already has emoji
  const key = Object.keys(EMOJI).find((k) => clean.toLowerCase().includes(k));
  return key ? `${EMOJI[key]} ${clean}` : clean;
};

export default function StepPlan({
  fullName,
  plan,
  setPlan,
  status,
  errorMsg,
  onBack,
  onConfirm,
}: Props) {
  const [cfg, setCfg] = useState<WaitlistConfig | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  /* ---- Founding-spot payment state ---- */
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

 const handleFoundingPay = async () => {
  setPayError("");
  setPaying(true);

  // Click ke synchronous moment pe hi tab kholo — popup blocker se bachne ke liye
  const payTab = window.open("", "_blank");

  try {
    const token = getAuthToken();

    // DEBUG: see who the token maps to (remove once working).
    try {
      if (token) {
        console.log("Sending token payload:", JSON.parse(atob(token.split(".")[1])));
      } else {
        console.log("No token found in browser storage.");
      }
    } catch {}

    const res = await fetch(PAYMENT_API, {
      method: "POST",
      headers: token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" },
      credentials: token ? "same-origin" : "include",
      body: JSON.stringify({
        description: "join waitlist",
        purpose: "WAITLIST",
      }),
    });

    const json = await res.json();
    const link = json?.data?.result?.paymentLink;
    if (json?.success && link) {
      if (payTab) {
        payTab.location.href = link;
      } else {
        // Tab block ho gaya to fallback: same tab
        window.location.href = link;
      }
      setPaying(false);
      return;
    }

    // Error case — khali tab band karo
    payTab?.close();

    const serverMsg = json?.message || json?.data?.message || "";
    if (/token|auth|login|unauthor/i.test(serverMsg) || !token) {
      setPayError(
        "You need to be logged in to reserve a founding spot. Please log in, then try again."
      );
    } else {
      setPayError(serverMsg || "Couldn't start payment. Please try again.");
    }
    setPaying(false);
  } catch (err) {
    payTab?.close();
    console.error("Payment order failed:", err);
    setPayError("Network error. Please try again.");
    setPaying(false);
  }
};

  useEffect(() => {
    let alive = true;
    fetch(WAITLIST_API)
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.success && j?.data) setCfg(j.data as WaitlistConfig);
        else setLoadFailed(true);
      })
      .catch(() => {
        if (alive) setLoadFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* ---- Everything below is derived purely from the API ---- */
  const price = cfg ? inr(cfg.finalPrice) : "";
  const strike = cfg ? inr(cfg.originalPrice) : "";
  const totalValue = cfg ? inr(cfg.totalBenefitsValue) : "";
  const discount =
    cfg && Number(cfg.originalPrice) > 0
      ? `${Math.round(
          ((Number(cfg.originalPrice) - Number(cfg.finalPrice)) /
            Number(cfg.originalPrice)) *
            100
        )}% OFF`
      : "";

  // Build perk rows from the API perks + a synthetic Welcome Coins row.
  const perkRows = cfg
    ? [
        ...cfg.perks.map((p) => ({
          title: decorate(p.title),
          meta: p.subtitle,
          value: inr(p.value),
          free: false,
        })),
        {
          title: "🪙 Welcome Coins",
          meta: `${cfg.welcomeCoins} coins · one-time joining bonus`,
          value: "FREE",
          free: true,
        },
      ]
    : [];

  const founding = plan === "founding";
  const priceReady = !!cfg;

  return (
    <>
      <BackLink onClick={onBack} />

      <p
        className="mt-4 flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em]"
        style={{ color: C.pink }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: C.pink }}
        />
        Founding batch · Filling fast
      </p>

      <h2
        className="mt-2 text-[24px] leading-tight sm:text-[26px]"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: C.headingDark,
        }}
      >
        Serious hearts,
        <br />
        early access.
      </h2>

      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.body }}>
        Joining as{" "}
        <strong style={{ color: C.headingDark }}>{fullName || "you"}</strong>.
        Choose how you&apos;d like to reserve your place — you&apos;re on the list
        either way.
      </p>

      {/* ---- Plan toggle ---- */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {(
          [
            {
              key: "founding" as const,
              title: "Founding spot",
              sub: priceReady ? `${price} · all perks` : "…",
            },
            { key: "free" as const, title: "Free waitlist", sub: "₹0 · basic access" },
          ]
        ).map((opt) => {
          const isSel = plan === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setPlan(opt.key)}
              aria-pressed={isSel}
              className="rounded-xl border-2 bg-white px-4 py-3 text-left transition-colors"
              style={{ borderColor: isSel ? "#E0709A" : "#EDE4DC" }}
            >
              <p
                className="text-[13.5px] font-bold"
                style={{ color: isSel ? C.pink : C.headingDark }}
              >
                {opt.title}
              </p>
              <p className="mt-0.5 text-[11.5px]" style={{ color: C.label }}>
                {opt.sub}
              </p>
            </button>
          );
        })}
      </div>

      {founding ? (
        loadFailed ? (
          <div
            className="mt-4 rounded-2xl border bg-white p-5 text-center text-[13px]"
            style={{ borderColor: "#EDE4DC", color: C.body }}
          >
            Couldn&apos;t load plan details right now. Please refresh and try again.
          </div>
        ) : !cfg ? (
          /* ---- Loading skeleton (no static fallback anymore) ---- */
          <div
            className="mt-4 space-y-3 rounded-2xl border p-5"
            style={{
              background: "linear-gradient(135deg, #FDF0F4 0%, #FBE4EC 100%)",
              borderColor: "#F6D6E1",
            }}
          >
            <div className="h-8 w-40 animate-pulse rounded-md bg-white/70" />
            <div className="h-3 w-56 animate-pulse rounded bg-white/60" />
            <div className="h-3 w-48 animate-pulse rounded bg-white/60" />
            <div className="h-3 w-52 animate-pulse rounded bg-white/60" />
          </div>
        ) : (
          <>
            {/* ---- Price card ---- */}
            <div
              className="mt-4 rounded-2xl border p-5"
              style={{
                background: "linear-gradient(135deg, #FDF0F4 0%, #FBE4EC 100%)",
                borderColor: "#F6D6E1",
              }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="text-[30px] font-bold leading-none"
                  style={{
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    color: C.headingDark,
                  }}
                >
                  {price}
                </span>
                <span className="text-[16px] line-through" style={{ color: C.label }}>
                  {strike}
                </span>
                <span
                  className="ml-auto rounded-full px-2.5 py-1 text-[10.5px] font-bold text-white"
                  style={{ backgroundColor: C.ctaPink }}
                >
                  {discount}
                </span>
              </div>

              <p className="mt-2 text-[12.5px] font-semibold" style={{ color: C.pink }}>
                One-time · becomes your first month of Premium at launch
              </p>

              <div className="my-3 h-px w-full" style={{ backgroundColor: "#F3D3DF" }} />

              <div className="space-y-3">
                {HIGHLIGHTS.map((h) => (
                  <div key={h.title} className="flex items-start gap-2.5">
                    <span
                      className="mt-1 h-4 w-4 flex-none rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
                      }}
                    />
                    <div>
                      <p
                        className="text-[13px] font-bold"
                        style={{ color: C.headingDark }}
                      >
                        {h.title}
                      </p>
                      <p
                        className="mt-0.5 text-[12px] leading-relaxed"
                        style={{ color: C.body }}
                      >
                        {h.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Perk breakdown ---- */}
            <div
              className="mt-4 rounded-2xl border bg-white p-5"
              style={{ borderColor: "#EDE4DC" }}
            >
              <p className="text-[13px] font-bold" style={{ color: C.headingDark }}>
                💎 Your first-month Premium perks
              </p>
              <p className="mt-1 text-[11.5px] leading-relaxed" style={{ color: C.label }}>
                Everything that unlocks the day we launch — free with your founding
                spot, for your first month.
              </p>

              <div className="mt-3">
                {perkRows.map((r) => (
                  <div
                    key={r.title}
                    className="flex items-center gap-3 border-t py-2.5"
                    style={{ borderColor: "#F3EDE7" }}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-[12.5px] font-bold"
                        style={{ color: C.headingDark }}
                      >
                        {r.title}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: C.label }}>
                        {r.meta}
                      </p>
                    </div>
                    {r.free ? (
                      <span
                        className="flex-none rounded-full px-2 py-0.5 text-[10px] font-bold"
                        style={{ backgroundColor: "#E4F5EA", color: "#3F8F5B" }}
                      >
                        FREE
                      </span>
                    ) : (
                      <span
                        className="flex-none text-[12.5px] font-bold"
                        style={{ color: C.headingDark }}
                      >
                        {r.value}
                      </span>
                    )}
                  </div>
                ))}

                <div
                  className="flex items-center gap-3 border-t py-3"
                  style={{ borderColor: "#F3EDE7" }}
                >
                  <span className="text-[15px]">💎</span>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[12.5px] font-bold"
                      style={{ color: C.headingDark }}
                    >
                      Total first-month value
                    </p>
                    <p className="text-[11px]" style={{ color: C.label }}>
                      + {cfg.welcomeCoins} Welcome Coins one-time
                    </p>
                  </div>
                  <span
                    className="flex-none text-[16px] font-bold"
                    style={{ color: C.pink }}
                  >
                    {totalValue}
                  </span>
                </div>
              </div>

              <p
                className="mt-2 border-t pt-3 text-center text-[12.5px]"
                style={{ borderColor: "#F3EDE7", color: C.body }}
              >
                You pay just{" "}
                <span className="line-through" style={{ color: C.label }}>
                  {strike}
                </span>{" "}
                <strong style={{ color: C.pink }}>{price}</strong> today
              </p>
            </div>
          </>
        )
      ) : (
        <div
          className="mt-4 rounded-2xl border bg-white p-5"
          style={{ borderColor: "#EDE4DC" }}
        >
          <p className="text-[13px] font-bold" style={{ color: C.headingDark }}>
            Free waitlist
          </p>
          <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: C.body }}>
            You&apos;ll get your invite when Welvors opens in your city — no
            payment, no perks. You can upgrade to a founding spot any time before
            launch, while spots last.
          </p>
        </div>
      )}

      <ErrorNote message={payError || (status === "error" ? errorMsg : "")} />

      <PrimaryButton
        onClick={founding ? handleFoundingPay : onConfirm}
        disabled={status === "sending" || paying || (founding && !priceReady)}
      >
        {founding
          ? paying
            ? "Redirecting to payment…"
            : priceReady
            ? `Reserve my spot — Pay ${price}`
            : "Loading…"
          : status === "sending"
          ? "Please wait…"
          : "Join the free waitlist"}
      </PrimaryButton>

      <FootNote>
        {founding ? "Secure payment · No spam" : "No payment needed · No spam"}
      </FootNote>
    </>
  );
}