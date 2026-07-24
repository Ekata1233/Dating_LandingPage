// app/stepdone/page.tsx
"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Plan } from "../waitlist/waitlistConfig";
import StepDone from "../waitlist/steps/StepDone";
import { DONE_STORAGE_KEY } from "@/app/context/WaitlistContext";

interface DoneData {
  plan: Plan;
  fullName: string;
  phone: string;
  city: string;
  spotNumber: number | null;
}

/* ---- sessionStorage = external store (no effect, no setState) ---- */
const noopSubscribe = () => () => {};

const readRaw = (): string | null => {
  try {
    return sessionStorage.getItem(DONE_STORAGE_KEY);
  } catch {
    return null; // private mode / storage blocked
  }
};
const serverRaw = () => null;

const readHydrated = () => true;
const serverHydrated = () => false;

export default function StepDonePage() {
  const router = useRouter();

  const raw = useSyncExternalStore(noopSubscribe, readRaw, serverRaw);
  const hydrated = useSyncExternalStore(noopSubscribe, readHydrated, serverHydrated);

  const data: DoneData | null = useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DoneData;
    } catch {
      return null; // corrupt payload
    }
  }, [raw]);

  const goHome = () => {
    try {
      sessionStorage.removeItem(DONE_STORAGE_KEY);
    } catch {}
    router.push("/");
  };

  // SSR/hydration ke pehle kuch mat dikhao (mismatch avoid)
  if (!hydrated) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FCF8F4] p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(43,42,40,0.15)] sm:px-8">
        {data ? (
          <StepDone
            plan={data.plan}
            fullName={data.fullName}
            phone={data.phone}
            city={data.city}
            spotNumber={data.spotNumber}
            onClose={goHome}
          />
        ) : (
          /* ⬅ NO REDIRECT — session data nahi mila to ye dikhega */
          <div className="text-center">
            <h2
              className="text-[25px] leading-tight sm:text-[27px]"
              style={{
                fontFamily: 'Georgia, "Times New Roman", serif',
                color: "#2B2A28",
              }}
            >
              Session expired
            </h2>
            <p className="mt-3 text-[14.5px]" style={{ color: "#6B655F" }}>
              Agar aapne waitlist join kar li hai, confirmation aapke phone par
              bhej di gayi hai. Warna neeche se dobara try karein.
            </p>
            <button
              type="button"
              onClick={goHome}
              className="mt-6 w-full rounded-xl px-6 py-3.5 text-[15px] font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#CE3F63" }}
            >
              Back to home
            </button>
          </div>
        )}
      </div>
    </main>
  );
}