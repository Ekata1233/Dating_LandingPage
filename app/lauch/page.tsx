"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLaunchData } from "../context/launchContext";

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
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

interface ApiUser {
  id: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  birth_date?: string;
  gender?: string;
  gender_option?: string;
}

const GENDER_LABEL: Record<string, string> = {
  MEN: "Man", WOMEN: "Woman", MAN: "Man", WOMAN: "Woman",
  NON_BINARY: "Non-binary", OTHER: "Other",
};
const ORIENTATION_LABEL: Record<string, string> = {
  STRAIGHT: "Straight", GAY: "Gay", LESBIAN: "Lesbian",
  BISEXUAL: "Bisexual", ASEXUAL: "Asexual", OTHER: "Other",
};

function labelize(v?: string, map?: Record<string, string>) {
  if (!v) return "—";
  if (map && map[v]) return map[v];
  return v.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function formatDob(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function inr(v: string | number) {
  return Number(v || 0).toLocaleString("en-IN");
}

// verify response me nahi aate — abhi static, baad me subscription API se replace
const STATIC = {
  spotNumber: 24,
  payment: {
    amount: "₹299", plan: "Founding · 1 mo Premium",
    txnId: "TXN2038687V1", dateTime: "20 Jul 2026, 5:58 PM", status: "Success",
  },
  referralCode: "HGJH468", // fallback agar referral API na aaye
  launchAt: "2026-07-24T12:00:00+05:30",
};

function useCountdown(target: string) {
  const [left, setLeft] = useState({ days: 0, hrs: 0, min: 0, sec: 0, done: false });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setLeft({ days: 0, hrs: 0, min: 0, sec: 0, done: true }); return; }
      setLeft({
        days: Math.floor(diff / 86400000),
        hrs: Math.floor((diff % 86400000) / 3600000),
        min: Math.floor((diff % 3600000) / 60000),
        sec: Math.floor((diff % 60000) / 1000),
        done: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 rounded-2xl border bg-white p-5" style={{ borderColor: C.border }}>{children}</div>;
}
function CardTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[13.5px] font-bold" style={{ color: C.headingDark }}>
      <span>{icon}</span>{children}
    </p>
  );
}
function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t py-3 text-[13px]" style={{ borderColor: C.rowBorder }}>
      <span style={{ color: C.label }}>{label}</span>
      <span className="text-right font-semibold" style={{ color: valueColor || C.headingDark }}>{value}</span>
    </div>
  );
}

export default function LaunchPage() {
  const router = useRouter();
  const { referEarn, waitlist, referral } = useLaunchData();

  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  let frameId: number;

  try {
    const raw = localStorage.getItem("welvors_user");
    const token = localStorage.getItem("welvors_token");

    if (!token || !raw) {
      router.replace("/");
      return;
    }

    const parsedUser = JSON.parse(raw) as ApiUser;

    frameId = requestAnimationFrame(() => {
      setUser(parsedUser);
      setLoading(false);
    });
  } catch {
    router.replace("/");

    frameId = requestAnimationFrame(() => {
      setLoading(false);
    });
  }

  return () => {
    if (frameId) cancelAnimationFrame(frameId);
  };
}, [router]);
  const t = useCountdown(waitlist?.launchDate || STATIC.launchAt);

  // referral — live, fallback ke sath
  const referralCode = referral?.referralCode ?? STATIC.referralCode;
  const shareLink = referral?.shareLink ?? "";

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  };

  const units = [
    { n: t.days, l: "Days" }, { n: t.hrs, l: "Hrs" },
    { n: t.min, l: "Min" }, { n: t.sec, l: "Sec" },
  ];

  const signup = referEarn?.signupReward ?? "100";
  const pkg = referEarn?.packageReward ?? "500";
  const perFriend = Number(signup) + Number(pkg);

  const referSteps = [
    { icon: "🔗", t: "Share your code", d: "Send your invite link via WhatsApp, Instagram or anywhere.", v: "", sub: "" },
    { icon: "🧑‍🤝‍🧑", t: "Friend joins Welvors", d: "They sign up & log in using your code.", v: `+₹${signup}`, sub: "to you" },
    { icon: "💎", t: "They buy any plan", d: "Premium, VIP or Elite — any package counts.", v: `+₹${pkg}`, sub: "to you" },
  ];

  if (loading) {
    return (
      <main style={{ backgroundColor: C.bg }} className="flex min-h-screen w-full items-center justify-center">
        <p className="text-[13px]" style={{ color: C.label }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={{ backgroundColor: C.bg }} className="min-h-screen w-full pt-[90px]">
      <div className="mx-auto max-w-lg px-4 pb-16">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold" style={{ backgroundColor: "#FCEDF2", color: C.pink }}>
            ✓ Founding member · confirmed
          </span>
          <h1 className="mt-3 text-[26px] font-bold sm:text-[28px]" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.headingDark }}>
            Welcome back, {user?.full_name || "there"}!
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: C.label }}>
            Spot <strong style={{ color: C.headingDark }}>#{STATIC.spotNumber}</strong> reserved.
          </p>
        </div>

        {/* Countdown */}
        <div className="mt-5 rounded-2xl border p-5 text-center" style={{ background: "linear-gradient(135deg, #FDF0F4 0%, #FBE4EC 100%)", borderColor: "#F6D6E1" }}>
          <p className="flex items-center justify-center gap-1.5 text-[12.5px] font-semibold" style={{ color: C.pink }}>🚀 Launching in</p>
          <div className="mt-3 flex justify-center gap-2.5">
            {units.map((u) => (
              <div key={u.l} className="flex w-[62px] flex-col items-center rounded-xl bg-white/70 py-2.5">
                <span className="text-[24px] font-bold leading-none" style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: C.pink }}>
                  {String(u.n).padStart(2, "0")}
                </span>
                <span className="mt-1 text-[9px] font-bold uppercase tracking-wider" style={{ color: C.label }}>{u.l}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11.5px] leading-relaxed" style={{ color: C.body }}>
            When this hits zero, Welvors goes live. As a founding member you&apos;re{" "}
            <strong style={{ color: C.headingDark }}>first through the door</strong> — we&apos;ll notify you the moment it opens.
          </p>
        </div>

        {/* Your details — LIVE */}
        <Card>
          <CardTitle icon="👤">Your details</CardTitle>
          <div className="mt-2">
            <DetailRow label="Name" value={user?.full_name || "—"} valueColor={C.pink} />
            <DetailRow label="Phone" value={user?.phone_number || "—"} valueColor={C.pink} />
            <DetailRow label="Email" value={user?.email || "—"} valueColor={C.pink} />
            <DetailRow label="Date of birth" value={formatDob(user?.birth_date)} />
            <DetailRow label="I am a" value={labelize(user?.gender, GENDER_LABEL)} />
            <DetailRow label="Orientation" value={labelize(user?.gender_option, ORIENTATION_LABEL)} valueColor={C.amber} />
          </div>
        </Card>

        {/* Payment — static */}
        <Card>
          <CardTitle icon="🧾">Payment details</CardTitle>
          <div className="mt-2">
            <DetailRow label="Amount paid" value={STATIC.payment.amount} valueColor={C.green} />
            <DetailRow label="Plan" value={STATIC.payment.plan} valueColor={C.amber} />
            <DetailRow label="Transaction ID" value={STATIC.payment.txnId} />
            <DetailRow label="Date & time" value={STATIC.payment.dateTime} />
            <DetailRow label="Status" value={`✓ ${STATIC.payment.status}`} valueColor={C.green} />
          </div>
        </Card>

        {/* Refer & earn */}
        <div className="mt-4 rounded-2xl border p-5" style={{ background: "linear-gradient(135deg, #FFFFFF 0%, #FDF1F4 100%)", borderColor: "#F6D6E1" }}>
          <CardTitle icon="🎁">Refer &amp; earn</CardTitle>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: C.body }}>
            Invite friends — earn up to <strong style={{ color: C.pink }}>₹{perFriend} per friend</strong> in your Welvors wallet.
          </p>

          {/* steps — signup/package reward API se */}
          <div className="mt-3 space-y-3">
            {referSteps.map((s) => (
              <div key={s.t} className="flex items-start gap-3">
                <span className="text-[15px]">{s.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-bold" style={{ color: C.headingDark }}>{s.t}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.label }}>{s.d}</p>
                </div>
                {s.v && (
                  <div className="flex-none text-right">
                    <p className="text-[12.5px] font-bold" style={{ color: C.green }}>{s.v}</p>
                    {s.sub && <p className="text-[9.5px]" style={{ color: C.label }}>{s.sub}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Your friend also gets — waitlist perks API se */}
          <div className="mt-4 rounded-xl border border-dashed p-3" style={{ borderColor: "#E8C4D2" }}>
            <p className="text-[10.5px] font-bold uppercase tracking-wider" style={{ color: C.label }}>
              Your friend also gets
            </p>
            <div className="mt-2 space-y-1.5">
              {(waitlist?.perks ?? []).map((p) => (
                <div key={p.title} className="flex items-center justify-between gap-3 text-[12px]">
                  <span className="flex min-w-0 items-center gap-1.5" style={{ color: C.body }}>
                    <span style={{ color: C.pink }}>✓</span>
                    <span className="truncate">
                      {p.title}
                      {p.subtitle ? <span style={{ color: C.label }}> · {p.subtitle}</span> : null}
                    </span>
                  </span>
                  <span className="flex-none font-semibold" style={{ color: C.green }}>₹{inr(p.value)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t pt-1.5 text-[12px]" style={{ borderColor: C.rowBorder }}>
                <span className="flex items-center gap-1.5 font-bold" style={{ color: C.headingDark }}>
                  💎 Total first-month value
                </span>
                <span className="font-bold" style={{ color: C.pink }}>₹{inr(waitlist?.totalBenefitsValue ?? 0)}+</span>
              </div>
              {waitlist?.welcomeCoins ? (
                <p className="text-right text-[10px]" style={{ color: C.label }}>
                  +{waitlist.welcomeCoins} Welcome Coins one-time
                </p>
              ) : null}
            </div>
          </div>

          {/* code + copy — live referralCode */}
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3" style={{ borderColor: "#E8C4D2" }}>
            <span className="text-[15px] font-bold tracking-wider" style={{ color: C.headingDark }}>{referralCode}</span>
            <button type="button" onClick={copyCode} className="rounded-full px-4 py-1.5 text-[12px] font-bold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: C.pink }}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Share invite link — live shareLink */}
          
           <a href={shareLink || undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-xl px-6 py-3 text-center text-[14px] font-bold text-white transition-opacity hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
              opacity: shareLink ? 1 : 0.6,
              pointerEvents: shareLink ? "auto" : "none",
            }}
          >
            🔗 Share invite link
          </a>

         <button
            type="button"
            onClick={() => router.push("/lauch/referral")}
            className="mt-2.5 w-full rounded-xl border bg-white px-6 py-3 text-[14px] font-bold transition-colors hover:bg-[#FCF8F4]"
            style={{ borderColor: "#F0CFDC", color: C.pink }}
          >
            📋 View referral history
          </button>
        </div>

        <p className="mt-5 text-center text-[11.5px] leading-relaxed" style={{ color: C.label }}>
          📩 We&apos;ll email &amp; SMS you the second Welvors launches. Nothing more to do for now — sit tight!
        </p>
      </div>
    </main>
  );
}