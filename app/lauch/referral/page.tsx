"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLaunchData, ReferralHistoryItem } from "../../context/launchContext"; // path adjust

const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  border: "#EDE4DC",
  rowBorder: "#F3EDE7",
  green: "#3F8F5B",
  amber: "#B8860B",
};

type TabKey = "joined" | "rewarded" | "pending";

function initials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// status ko readable line me
function statusNote(h: ReferralHistoryItem) {
  const s = (h.status || "").toUpperCase();
  const purchased = Number(h.purchaseReward) > 0;
  if (s === "SIGNUP_REWARDED" && !purchased) return "Joined · ₹500 pending on plan";
  if (s === "PURCHASE_REWARDED" || purchased) return "Joined · Bought a plan";
  if (s === "PENDING" || s === "JOINED") return "Just joined with your code";
  return "Joined";
}

// row right-side amount + caption
function rewardView(h: ReferralHistoryItem) {
  const s = (h.status || "").toUpperCase();
  const total = h.totalReward ?? 0;
  const signup = Number(h.signupReward) || 0;
  const purchased = Number(h.purchaseReward) > 0;

  if (s === "PURCHASE_REWARDED" || (purchased && signup)) {
    return { amount: `+₹${total}`, caption: "credited", color: C.green };
  }
  if (s === "SIGNUP_REWARDED") {
    return { amount: `+₹${signup}`, caption: "₹500 pending", color: C.green };
  }
  if (s === "PENDING" || s === "JOINED") {
    return { amount: "", caption: "₹100 soon", color: C.label };
  }
  return { amount: total ? `+₹${total}` : "", caption: "credited", color: C.green };
}

// tab filter — status ke hisaab
function inTab(h: ReferralHistoryItem, tab: TabKey) {
  const s = (h.status || "").toUpperCase();
  if (tab === "joined") return true; // sab joined
  if (tab === "rewarded") return h.totalReward > 0 || s.includes("REWARD");
  if (tab === "pending") return Number(h.purchaseReward) === 0 || s === "PENDING" || s === "JOINED";
  return true;
}

export default function ReferralHistoryPage() {
  const router = useRouter();
  const { referral, history } = useLaunchData();
  const [tab, setTab] = useState<TabKey>("joined");
  const [ready, setReady] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("welvors_token");

  if (!token) {
    router.replace("/");
    return;
  }

  const id = requestAnimationFrame(() => {
    setReady(true);
  });

  return () => cancelAnimationFrame(id);
}, [router]);
  if (!ready) {
    return (
      <main style={{ backgroundColor: C.bg }} className="flex min-h-screen w-full items-center justify-center">
        <p className="text-[13px]" style={{ color: C.label }}>Loading…</p>
      </main>
    );
  }

  const code = referral?.referralCode ?? "—";
  const stats = referral?.stats ?? { totalEarned: 0, joined: 0, rewarded: 0, pending: 0 };

  const joinedCount = history.length;
  const rewardedCount = history.filter((h) => inTab(h, "rewarded")).length;
  const pendingCount = history.filter((h) => inTab(h, "pending")).length;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "joined", label: "Joined", count: joinedCount },
    { key: "rewarded", label: "Rewarded", count: rewardedCount },
    { key: "pending", label: "Pending", count: pendingCount },
  ];

  const rows = history.filter((h) => inTab(h, tab));

  return (
    <main style={{ backgroundColor: C.bg }} className="min-h-screen w-full pt-[90px]">
      <div className="mx-auto max-w-2xl px-4 pb-16">
        {/* Back */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/lauch")}
            className="rounded-full border bg-white px-4 py-2 text-[13px] font-semibold transition-colors hover:bg-[#FCF8F4]"
            style={{ borderColor: C.border, color: C.headingDark }}
          >
            ← Back to my account
          </button>
        </div>

        {/* Title */}
        <h1
          className="mt-4 text-center text-[28px] font-bold"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.headingDark }}
        >
          Referral history
        </h1>
        <p className="mt-1 text-center text-[13px]" style={{ color: C.label }}>
          Your code <strong style={{ color: C.headingDark }}>{code}</strong> — up to ₹600 per friend.
        </p>

        {/* Stat cards */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { big: `₹${stats.totalEarned.toLocaleString("en-IN")}`, sub: "Total earned" },
            { big: `${stats.joined}`, sub: "Friends joined" },
            { big: `${stats.pending}`, sub: "Pending" },
          ].map((s) => (
            <div key={s.sub} className="rounded-2xl border bg-white p-4 text-center" style={{ borderColor: C.border }}>
              <p className="text-[22px] font-bold" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.pink }}>{s.big}</p>
              <p className="mt-0.5 text-[11.5px] font-semibold" style={{ color: C.body }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* List card */}
        <div className="mt-5 rounded-2xl border bg-white" style={{ borderColor: C.border }}>
          {/* Tabs */}
          <div className="flex gap-6 border-b px-5 pt-4" style={{ borderColor: C.rowBorder }}>
            {tabs.map((tb) => {
              const active = tab === tb.key;
              return (
                <button
                  key={tb.key}
                  type="button"
                  onClick={() => setTab(tb.key)}
                  className="relative pb-3 text-[13.5px] font-semibold transition-colors"
                  style={{ color: active ? C.pink : C.label }}
                >
                  {tb.label} {tb.count}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full" style={{ backgroundColor: C.pink }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Rows */}
          {rows.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-[14px] font-semibold" style={{ color: C.headingDark }}>No referrals yet</p>
              <p className="mt-1 text-[12.5px]" style={{ color: C.label }}>
                Share your code <strong style={{ color: C.headingDark }}>{code}</strong> — jab dost join karenge, yahan dikhenge.
              </p>
            </div>
          ) : (
            <div>
              {rows.map((h, i) => {
                const rv = rewardView(h);
                return (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 px-5 py-3.5"
                    style={{ borderTop: i === 0 ? "none" : `1px solid ${C.rowBorder}` }}
                  >
                    {h.profileImage ? (
                      <img src={h.profileImage} alt={h.name} className="h-10 w-10 flex-none rounded-full object-cover" />
                    ) : (
                      <span
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-[12px] font-bold"
                        style={{ backgroundColor: "#FCEDF2", color: C.pink }}
                      >
                        {initials(h.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-bold" style={{ color: C.headingDark }}>{h.name || "Friend"}</p>
                      <p className="text-[11.5px]" style={{ color: C.label }}>{statusNote(h)}</p>
                    </div>
                    <div className="flex-none text-right">
                      {rv.amount && (
                        <p className="text-[13px] font-bold" style={{ color: rv.color }}>{rv.amount}</p>
                      )}
                      <p className="text-[10px]" style={{ color: C.label }}>{rv.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed" style={{ color: C.label }}>
          ₹100 on friend&apos;s join · ₹500 when they buy any plan · rewards land in your Welvors wallet.
        </p>
      </div>
    </main>
  );
}