"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const BASE = "https://dating-app-backend-plum.vercel.app";
const REFER_EARN_URL = `${BASE}/api/onboarding/referEarn/get`;
const WAITLIST_URL = `${BASE}/api/user/waitlist/get`;
const REFERRAL_DASHBOARD_URL = `${BASE}/api/user/referral/dashboard`;
const REFERRAL_HISTORY_URL = `${BASE}/api/user/referral/history`;

export interface ReferEarn {
  signupReward: string;
  packageReward: string;
  waitlistReward: string;
  title: string;
  descriptions: { sortOrder: number; description: string }[];
}

export interface WaitlistPerk {
  title: string;
  value: number;
  subtitle: string;
}

export interface Waitlist {
  launchDate: string;
  originalPrice: string;
  discountAmount: string;
  finalPrice: string;
  welcomeCoins: number;
  perks: WaitlistPerk[];
  totalBenefitsValue: string;
  description: string;
}

export interface ReferralDashboard {
  referralCode: string;
  shareLink: string;
  stats: {
    totalEarned: number;
    joined: number;
    rewarded: number;
    pending: number;
  };
}

export interface ReferralHistoryItem {
  id: string;
  name: string;
  profileImage?: string;
  status: string; // SIGNUP_REWARDED | PURCHASE_REWARDED | PENDING | JOINED ...
  signupReward: string;
  purchaseReward: string;
  totalReward: number;
  joinedAt?: string;
  rewardedAt?: string;
}

interface LaunchData {
  referEarn: ReferEarn | null;
  waitlist: Waitlist | null;
  referral: ReferralDashboard | null;
  history: ReferralHistoryItem[];
  loading: boolean;
  error: string | null;
}

const LaunchContext = createContext<LaunchData>({
  referEarn: null,
  waitlist: null,
  referral: null,
  history: [],
  loading: true,
  error: null,
});

export function LaunchProvider({ children }: { children: React.ReactNode }) {
  const [referEarn, setReferEarn] = useState<ReferEarn | null>(null);
  const [waitlist, setWaitlist] = useState<Waitlist | null>(null);
  const [referral, setReferral] = useState<ReferralDashboard | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("welvors_token")
        : null;

    const authGet = (url: string) =>
      token
        ? fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .catch(() => null)
        : Promise.resolve(null);

    (async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          fetch(REFER_EARN_URL).then((r) => r.json()).catch(() => null),
          fetch(WAITLIST_URL).then((r) => r.json()).catch(() => null),
          authGet(REFERRAL_DASHBOARD_URL),
          authGet(REFERRAL_HISTORY_URL),
        ]);
        if (!alive) return;
        if (r1?.success && r1.data) setReferEarn(r1.data as ReferEarn);
        if (r2?.success && r2.data) setWaitlist(r2.data as Waitlist);
        if (r3?.success && r3.data) setReferral(r3.data as ReferralDashboard);
        if (r4?.success && r4.data?.history)
          setHistory(r4.data.history as ReferralHistoryItem[]);
        if (!r1?.data && !r2?.data && !r3?.data && !r4?.data)
          setError("Couldn't load rewards data.");
      } catch {
        if (alive) setError("Couldn't load rewards data.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <LaunchContext.Provider
      value={{ referEarn, waitlist, referral, history, loading, error }}
    >
      {children}
    </LaunchContext.Provider>
  );
}

export function useLaunchData() {
  return useContext(LaunchContext);
}