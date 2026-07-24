"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import StepDone from "../waitlist/steps/StepDone";
import { DONE_STORAGE_KEY, type Plan } from "@/app/context/WaitlistContext";

interface DoneData {
  plan: Plan;
  fullName: string;
  phone: string;
  city: string;
  spotNumber: number | null;
}

const DEV_FALLBACK: DoneData = {
  plan: "founding",
  fullName: "Test User",
  phone: "9876543210",
  city: "Pune",
  spotNumber: 24,
};

export default function StepDonePage() {
  const router = useRouter();

  const data = useMemo<DoneData | null>(() => {
    // During SSR / first render
    if (typeof window === "undefined") {
      return null;
    }

    let payload: DoneData | null = null;

    try {
      const raw = sessionStorage.getItem(DONE_STORAGE_KEY);
      if (raw) payload = JSON.parse(raw) as DoneData;
    } catch {}

    if (!payload && process.env.NODE_ENV === "development") {
      payload = DEV_FALLBACK;
    }

    return payload;
  }, []);

  useEffect(() => {
    if (!data) {
      router.replace("/");
    }
  }, [data, router]);

  if (!data) return null;

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
            sessionStorage.removeItem(DONE_STORAGE_KEY);
            router.push("/");
          }}
        />
      </div>
    </main>
  );
}