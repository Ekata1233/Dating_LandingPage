// app/stepdone/page.tsx
"use client";

import React, { useMemo, useSyncExternalStore } from "react";
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

/* ---- JWT se userId nikalna (welvors_token) ---- */
const readUserId = (): string => {
  try {
    const t = (
      localStorage.getItem("welvors_token") ||
      sessionStorage.getItem("welvors_token") ||
      ""
    ).replace(/^"|"$/g, "");
    if (!t) return "";
    const payload = JSON.parse(atob(t.split(".")[1]));
    return payload?.id || payload?.userId || payload?.sub || "";
  } catch {
    return "";
  }
};

/* ---- JWT payload padho (name/phone fallback ke liye) ---- */
const readTokenPayload = (): any => {
  try {
    const t = (
      localStorage.getItem("welvors_token") ||
      sessionStorage.getItem("welvors_token") ||
      ""
    ).replace(/^"|"$/g, "");
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1]));
  } catch {
    return null;
  }
};

export default function StepDonePage() {
  const router = useRouter();

  const raw = useSyncExternalStore(noopSubscribe, readRaw, serverRaw);
  const hydrated = useSyncExternalStore(noopSubscribe, readHydrated, serverHydrated);

  /* ---- URL se payment status (backend return redirect se aata hai) ---- */
  const urlStatus =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("status")
      : null;

  const data: DoneData | null = useMemo(() => {
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DoneData;
        if (parsed?.fullName) return parsed;
      } catch {}
    }
    // Fallback: /stepdone pe aaye hain (payment redirect) aur logged-in token hai
    // -> StepDone dikhao, chahe query param na ho
    if (urlStatus !== "failed") {
      const p = typeof window !== "undefined" ? readTokenPayload() : null;
      if (p) {
        return {
          plan: "founding",
          fullName: p?.full_name || p?.fullName || p?.name || "",
          phone: p?.phone_number?.replace?.("+91", "") || p?.phone || "",
          city: "",
          spotNumber: null,
          paymentStatus: "success",
        };
      }
    }
    return null;
  }, [raw, urlStatus]);

  // Free plan pe payment lagta hi nahi -> success maano
  const isPaid =
    !!data &&
    (data.plan === "free" ||
      data.paymentStatus === "success" ||
      urlStatus === "success");

  const userId = hydrated ? readUserId() : "";

  const goHome = () => router.push("/");

  // Retry -> home pe waitlist modal auto-open (home page pe ?waitlist=1 handle karna hoga)
  const retry = () => {
    try {
      localStorage.removeItem(DONE_STORAGE_KEY);
    } catch {}
    router.push("/?waitlist=1");
  };

  if (!hydrated) return null;

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
            userId={userId}
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