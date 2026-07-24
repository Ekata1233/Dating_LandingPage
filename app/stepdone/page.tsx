// app/stepdone/page.tsx
"use client";

import React, { useMemo, useEffect, useSyncExternalStore } from "react";
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

// Dev me direct /stepdone kholne pe ye dummy data use hoga.
// Production build me ye kabhi trigger nahi hoga.
const DEV_FALLBACK: DoneData = {
  plan: "founding",
  fullName: "Test User",
  phone: "9876543210",
  city: "Pune",
  spotNumber: 24,
};

/* ---- external store readers (no effect, no setState) ---- */

// sessionStorage ek external system hai — subscribe ki zaroorat nahi
// kyunki ye page load pe ek baar hi padhna hai.
const noopSubscribe = () => () => {};

const readRaw = (): string | null => {
  try {
    return sessionStorage.getItem(DONE_STORAGE_KEY);
  } catch {
    return null; // private mode / storage blocked
  }
};

const serverRaw = () => null;

// Hydration ho chuki hai ya nahi — server pe false, client pe true
const readHydrated = () => true;
const serverHydrated = () => false;

export default function StepDonePage() {
  const router = useRouter();

  const raw = useSyncExternalStore(noopSubscribe, readRaw, serverRaw);
  const hydrated = useSyncExternalStore(noopSubscribe, readHydrated, serverHydrated);

  const data: DoneData | null = useMemo(() => {
    if (raw) {
      try {
        return JSON.parse(raw) as DoneData;
      } catch {
        // corrupt payload — ignore
      }
    }
    return null;
  }, [raw]);

  // Payload nahi mila (production me direct URL hit) -> home
  // Ye effect setState nahi karta, sirf navigation — warning nahi aayegi.
  useEffect(() => {
    if (hydrated && !data) router.replace("/");
  }, [hydrated, data, router]);

  if (!hydrated || !data) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FCF8F4] p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white px-6 py-8 shadow-[0_24px_60px_rgba(43,42,40,0.15)] sm:px-8">
        <StepDone
          plan={data.plan}
          fullName={data.fullName}
          phone={data.phone}
          city={data.city}
          spotNumber={data.spotNumber}
          onClose={() => {
            try {
              sessionStorage.removeItem(DONE_STORAGE_KEY);
            } catch {}
            router.push("/");
          }}
        />
      </div>
    </main>
  );
}