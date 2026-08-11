// app/stepdone/page.tsx
"use client";

import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "../waitlist/waitlistConfig";
import StepDone from "../waitlist/steps/StepDone";
import { DONE_STORAGE_KEY } from "@/app/context/WaitlistContext";

type PaymentStatus = "success" | "failed";

interface DoneData {
  plan: Plan;
  fullName: string;
  phone: string;
  city: string;
  spotNumber: number | null;
  paymentStatus?: PaymentStatus;
}

/* ---- Waitlist details API (source of truth for payment/spot) ---- */
const WAITLIST_USER_API =
  "https://dating-app-backend-plum.vercel.app/api/user/waitlist-user/get";

interface WaitlistUser {
  id: string;
  userId: string;
  waitlistNumber: number;
  plan: "PAID" | "FREE";
  amountPaid: string;
  paymentStatus: "COMPLETED" | "PENDING" | "FAILED";
  paymentId: string | null;
  launchBenefit: string | null;
  premiumActivated: boolean;
  createdAt: string;
}

/* ---- localStorage = external store (no effect, no setState) ---- */
const noopSubscribe = () => () => {};

const readRaw = (): string | null => {
  try {
    return localStorage.getItem(DONE_STORAGE_KEY);
  } catch {
    return null;
  }
};
const serverRaw = () => null;

const readHydrated = () => true;
const serverHydrated = () => false;

/* ---- welvors_token padho ---- */
const readToken = (): string => {
  try {
    return (
      localStorage.getItem("welvors_token") ||
      sessionStorage.getItem("welvors_token") ||
      ""
    ).replace(/^"|"$/g, "");
  } catch {
    return "";
  }
};

/* ---- JWT payload (name/phone fallback ke liye) ---- */
interface TokenPayload {
  id?: string;
  userId?: string;
  sub?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  phone_number?: string;
  phone?: string;
}

const readTokenPayload = (): TokenPayload | null => {
  try {
    const t = readToken();
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1])) as TokenPayload;
  } catch {
    return null;
  }
};

export default function StepDonePage() {
  const router = useRouter();

  const raw = useSyncExternalStore(noopSubscribe, readRaw, serverRaw);
  const hydrated = useSyncExternalStore(noopSubscribe, readHydrated, serverHydrated);

  /* ---- Backend se waitlist entry fetch (real verification) ---- */
  const [wl, setWl] = useState<WaitlistUser | null>(null);
  const [wlLoading, setWlLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const token = readToken();
    if (!token) {
      setWlLoading(false);
      return;
    }
    fetch(WAITLIST_USER_API, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j) => {
        if (!alive) return;
        if (j?.success && j?.data) setWl(j.data as WaitlistUser);
        setWlLoading(false);
      })
      .catch(() => {
        if (alive) setWlLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  /* ---- Name/phone/city: localStorage pehle, warna token payload ---- */
  const data: DoneData | null = useMemo(() => {
    let base: DoneData | null = null;

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DoneData;
        if (parsed?.fullName) base = parsed;
      } catch {}
    }

    if (!base) {
      const p = readTokenPayload();
      if (p) {
        base = {
          plan: "founding",
          fullName: p.full_name || p.fullName || p.name || "",
          phone: p.phone_number?.replace("+91", "") || p.phone || "",
          city: "",
          spotNumber: null,
        };
      }
    }

    if (!base) return null;

    /* API mila to wahi source of truth hai */
    if (wl) {
      return {
        ...base,
        plan: wl.plan === "PAID" ? ("founding" as Plan) : ("free" as Plan),
        spotNumber: wl.waitlistNumber ?? base.spotNumber,
        paymentStatus:
          wl.paymentStatus === "COMPLETED" ? "success" : "failed",
      };
    }
    return base;
  }, [raw, wl]);

  const isPaid =
    !!data && (data.plan === "free" || data.paymentStatus === "success");

  const goHome = () => router.push("/");

  const retry = () => {
    try {
      localStorage.removeItem(DONE_STORAGE_KEY);
    } catch {}
    router.push("/?waitlist=1");
  };

  if (!hydrated) return null;

  /* API ka jawab aane tak loading — galat screen flash na ho */
  if (wlLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FCF8F4] p-4">
        <p className="text-[14px]" style={{ color: "#6B655F" }}>
          Confirming your spot…
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FCF8F4] p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(43,42,40,0.15)] sm:px-8">
        {isPaid && data ? (
          <StepDone
            plan={data.plan}
            fullName={data.fullName}
            phone={data.phone}
            city={data.city}
            spotNumber={data.spotNumber}
            userId={wl?.userId || ""}
            paymentId={wl?.paymentId || ""}
            amountPaid={wl?.amountPaid || ""}
            onClose={goHome}
          />
        ) : (
          <div className="text-center">
            <h2
              className="text-[25px] leading-tight sm:text-[27px]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: "#2B2A28",
              }}
            >
              {data ? "Payment didn't go through" : "Nothing to show here"}
            </h2>

            <p
              className="mt-3 text-[14.5px] leading-relaxed"
              style={{ color: "#6B655F" }}
            >
              {data
                ? "Your spot isn't reserved yet. If any amount was deducted, it will be refunded within 5–7 working days."
                : "If you've already joined the waitlist, your confirmation is on its way by SMS. Otherwise, head back and grab your spot."}
            </p>

            <button
              type="button"
              onClick={data ? retry : goHome}
              className="mt-6 w-full rounded-xl px-6 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#CE3F63" }}
            >
              {data ? "Try again" : "Back to home"}
            </button>

            {data && (
              <button
                type="button"
                onClick={goHome}
                className="mt-3 w-full text-[13.5px] font-medium hover:opacity-70"
                style={{ color: "#6B655F" }}
              >
                Back to home
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}