"use client";

import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  DatePlansStore  ("Date Plan Wallet")                                      */
/*                                                                            */
/*  Self-contained, backend-driven screen. Same rules as the other screens:   */
/*   - fills 100% width / height of its PARENT                                */
/*   - every size is in `cqw` (1% of the parent's width)                      */
/*   - content scrolls vertically, scrollbar hidden                           */
/*   - header and the purchase bar stay pinned                                */
/*                                                                            */
/*  Backend mapping (response.data):                                          */
/*    availableDatePlan             -> "7 plans" in the hero                  */
/*    packages[] (isActive, sortOrder)                                        */
/*      planCount                   -> big "05"                               */
/*      pricePerPlan                -> "200/each"                             */
/*      price                       -> "900 total" (also the payable amount)  */
/*      discount                    -> "SAVE 10%" in the purchase bar         */
/*      isPopular                   -> "Popular" pill + default selection     */
/*    info.howOnePlanWorks[]        -> "How one plan works" (numbered)        */
/*    info.whyPeopleBuyPlans[]      -> "Why people buy plans"                 */
/*    info.goodToKnow[]             -> "Good to know"                         */
/*                                                                            */
/*  Prices are wallet coins, so a coin icon is shown instead of ₹.            */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 390, height: 800 }}>                               */
/*      <DatePlansStore fluid onPurchase={(pkg) => buy(pkg.id)} />            */
/*    </div>                                                                  */
/* -------------------------------------------------------------------------- */

/* ---------------------------------- types ---------------------------------- */
export interface DatePlanPackage {
  id: string;
  title: string;
  description?: string;
  planCount: number;
  price: string;
  pricePerPlan: string;
  discount: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
}

export interface DatePlanInfoItem {
  title: string;
  description: string;
}

export interface DatePlanData {
  availableDatePlan: number;
  packages: DatePlanPackage[];
  info?: {
    howOnePlanWorks?: DatePlanInfoItem[];
    whyPeopleBuyPlans?: DatePlanInfoItem[];
    goodToKnow?: DatePlanInfoItem[];
  };
}

export interface DatePlansStoreProps {
  title?: string;
  showHeader?: boolean;
  showBack?: boolean;
  onBack?: () => void;

  /** Hero copy (not part of the API) */
  eyebrow?: string;
  headline?: string;
  subline?: string;
  heroImage?: string;
  footnote?: string;
  ctaLabel?: string;

  /** Called when the person taps "Get plans" */
  onPurchase?: (pkg: DatePlanPackage) => Promise<void> | void;

  fluid?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/* --------------------------------- helpers --------------------------------- */
/** 1 unit = 1% of the parent's width */
const U = (n: number) => `${n}cqw`;
const HAIR = "max(1px, 0.3cqw)";

const C = {
  accent: "#ea7a14",
  accentDeep: "#d96a08",
  accentSoft: "#fdebd6",
  ink: "#1f1f24",
  grey: "#8a8a93",
  greyLight: "#b3b3b8",
  border: "#ececf0",
  white: "#ffffff",
  page: "#f8f9fb",
};

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

const num = (v: string | number) => Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const pad2 = (n: number) => String(n).padStart(2, "0");

type IconName =
  | "back" | "clipboard" | "pin" | "calendar" | "shield" | "infinity"
  | "eye" | "bolt" | "target" | "coin";

const ICONS: Record<Exclude<IconName, "coin">, React.ReactNode> = {
  back: <path d="M15 5l-7 7 7 7" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM9 12h6M9 16h4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6-5.500-6-11a6 6 0 0 1 12 0c0 5.500-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.200" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  infinity: <path d="M12 12c-2-3-3.500-4-5.500-4a4 4 0 0 0 0 8c2 0 3.500-1 5.500-4Zm0 0c2 3 3.500 4 5.500 4a4 4 0 0 0 0-8c-2 0-3.500 1-5.500 4Z" />,
  eye: (
    <>
      <path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bolt: <path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.500" />
    </>
  ),
};

const Icon = ({ name }: { name: Exclude<IconName, "coin"> }) => (
  <svg
    viewBox="0 0 24 24"
    style={{ width: "1em", height: "1em", display: "block", flexShrink: 0 }}
    fill={name === "bolt" ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={name === "back" ? 2.4 : 2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {ICONS[name]}
  </svg>
);

const Coin = () => (
  <svg viewBox="0 0 24 24" style={{ width: "1em", height: "1em", display: "block", flexShrink: 0 }}>
    <circle cx="12" cy="12" r="11" fill="#f5b400" />
    <circle cx="12" cy="12" r="8" fill="#ffd54a" stroke="#d99a00" strokeWidth="1.500" />
    <path d="M8 15V10l4-2 4 2v5M8 15h8M10 15v-4M12 15v-4M14 15v-4" stroke="#b97a00" strokeWidth="1.200" fill="none" />
  </svg>
);

const PERKS: { icon: Exclude<IconName, "coin">; label: string }[] = [
  { icon: "pin", label: "Any venue you like" },
  { icon: "calendar", label: "Today or this weekend" },
  { icon: "shield", label: "You approve who joins" },
  { icon: "infinity", label: "Plans never expire" },
];

type RowStyle = { icon: IconName; fg: string; bg: string };
const HOW_STYLES: RowStyle[] = [
  { icon: "pin", fg: "#e5483f", bg: "#fbe9e4" },
  { icon: "eye", fg: "#3b6fd6", bg: "#e6eefb" },
];
const WHY_STYLES: RowStyle[] = [
  { icon: "bolt", fg: "#f0b400", bg: "#fdf3c8" },
  { icon: "target", fg: "#e5483f", bg: "#fde6e6" },
];
const GOOD_STYLES: RowStyle[] = [
  { icon: "coin", fg: "#f0b400", bg: "#fdf0cf" },
  { icon: "calendar", fg: "#e5483f", bg: "#fbe4e8" },
];

/* -------------------------------- component -------------------------------- */
export default function DatePlansStore({
  title = "Date Plan Wallet",
  showHeader = true,
  showBack = true,
  onBack,
  eyebrow = "Post a date",
  headline = "Turn a plan into a real date",
  subline = "Each plan lets you post one date on Date Now – any activity type.",
  heroImage,
  footnote = "Date Plans never expire. Unused plans stay in your wallet.",
  ctaLabel = "Get plans",
  onPurchase,
  fluid = false,
  className,
  style,
}: DatePlansStoreProps) {
  const { setActiveSection } = useActiveSection();
  const {
    datePlans: data,
    datePlansLoading: loading,
    datePlansError: error,
    refetchDatePlans: reload,
  } = useUserProfileData();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const router = useRouter()

  const packages = useMemo(
    () => (data?.packages ?? []).filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder),
    [data]
  );

  /* default pick: the popular one, else the middle pack */
  const defaultId = packages.find((p) => p.isPopular)?.id ?? packages[Math.floor(packages.length / 2)]?.id ?? null;
  const selected = packages.find((p) => p.id === (pickedId ?? defaultId)) ?? null;

  const handleBack = () => {
    router.push("/app/home")
  };
  const handlePurchase = async () => {
    if (!selected || buying) return;
    setBuying(true);
    try {
      await onPurchase?.(selected);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  const sectionTitle: React.CSSProperties = {
    margin: `${U(8)} 0 ${U(4)} ${U(1)}`,
    fontSize: U(3.1),
    fontWeight: 500,
    letterSpacing: "0.12em",
    color: C.grey,
    textTransform: "uppercase",
  };

  /** one white card with divided rows */
  const InfoCard = ({ rows, styles, numbered }: { rows: DatePlanInfoItem[]; styles: RowStyle[]; numbered?: boolean }) => (
    <section
      style={{
        padding: `${U(1.4)} ${U(4.4)}`,
        background: C.white,
        borderRadius: U(5),
        boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.05)`,
      }}
    >
      {rows.map((row, i) => {
        const s = styles[i % styles.length];
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: U(4),
              padding: `${U(3.6)} 0`,
              borderTop: i === 0 ? "none" : `${HAIR} solid ${C.border}`,
            }}
          >
            <span
              style={{
                width: U(10),
                height: U(10),
                borderRadius: U(3),
                flexShrink: 0,
                background: s.bg,
                color: s.fg,
                fontSize: U(4.6),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {s.icon === "coin" ? <Coin /> : <Icon name={s.icon} />}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: U(3.9), fontWeight: 500, lineHeight: 1.25 }}>
                {numbered ? `${i + 1} · ${row.title}` : row.title}
              </h3>
              <p style={{ margin: `${U(1.2)} 0 0`, fontSize: U(3.1), lineHeight: 1.4, color: C.grey }}>
                {row.description}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );

  const how = data?.info?.howOnePlanWorks ?? [];
  const why = data?.info?.whyPeopleBuyPlans ?? [];
  const good = data?.info?.goodToKnow ?? [];

  return (
    <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden ">
        <div
          className={
            fluid
              ? "absolute inset-0 overflow-hidden"
              : "  mt-2 w-[320px] sm:w-[300px] h-[480px] sm:h-[520px] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out "
          }
        >
          <div
            className={className}
            style={{
              width: "100%",
              height: "100%",
              containerType: "inline-size",
              display: "flex",
              flexDirection: "column",
              background: C.page,
              fontFamily: FONT,
              color: C.ink,
              ...style,
            }}
          >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .wdp-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .wdp-btn:hover:not(:disabled) { filter: brightness(1.05); }
        .wdp-btn:active:not(:disabled) { transform: scale(.98); }
        .wdp-btn:disabled { cursor: not-allowed; }
        .wdp-btn:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; }
        .wdp-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .wdp-scroll::-webkit-scrollbar { display: none; width: 0; height: 0; }
        @keyframes wdp-pulse { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
        .wdp-skel { background: #eceef2; animation: wdp-pulse 1.2s ease-in-out infinite; }
      `}</style>

            {/* ------------------------------ header ------------------------------ */}
            {showHeader && (
              <header
                style={{
                  position: "relative",
                  flex: "0 0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: U(10),
                  padding: `${U(4)} ${U(5)} ${U(3)}`,
                  boxSizing: "content-box",
                  background: C.page,
                }}
              >
                <button
                  type="button"
                  className="wdp-btn"
                  aria-label="Go back"
                  onClick={handleBack}
                  style={{
                    position: "absolute",
                    left: U(3.1),
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: U(10),
                    height: U(10),
                    borderRadius: "50%",
                    background: C.white,
                    border: `${HAIR} solid ${C.border}`,
                    boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.06)`,
                    color: C.ink,
                    fontSize: U(4.2),
                    display: showBack ? "flex" : "none",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <Icon name="back" />
                </button>
                <h1 style={{ margin: 0, fontSize: U(4.3), fontWeight: 600, letterSpacing: "0.02em" }}>{title}</h1>
              </header>
            )}

            {/* ------------------------------ scroll ------------------------------ */}
            <div className="wdp-scroll" style={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
              <div
                style={{
                  boxSizing: "border-box",
                  padding: `${U(1)} ${U(4.2)} ${U(8)}`,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* ============================ PART 1: hero ============================ */}
                <section
                  style={{
                    position: "relative",
                    padding: `${U(5.4)} ${U(4.6)} ${U(5.2)}`,
                    borderRadius: U(6),
                    color: C.white,
                    background: `"linear-gradient(to top, rgba(210,110,20,.88) 0%, rgba(150,75,10,.55) 35%, rgba(150,75,10,.12) 80%, rgba(150,75,10,.08) 100%)", url(${`https://ik.imagekit.io/aezmcynwbe/welvors/DatePlanBg.jpeg`}) center / cover`,
                    boxShadow: `0 ${U(2)} ${U(5)} rgba(234,122,20,.3)`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: U(1.8),
                      fontSize: U(2.7),
                      fontWeight: 500,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span style={{ fontSize: U(3), display: "flex" }}>
                      <Icon name="clipboard" />
                    </span>
                    {eyebrow}
                  </div>
                  <h2
                    style={{
                      margin: `${U(3)} 0 0`,
                      fontSize: U(6.6),
                      fontWeight: 600,
                      lineHeight: 1.1,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {headline}
                  </h2>
                  <p style={{ margin: `${U(3)} 0 0`, fontSize: U(3.3), lineHeight: 1.45, opacity: 0.92 }}>{subline}</p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${PERKS.length}, minmax(0, 1fr))`,
                      gap: U(2.2),
                      marginTop: U(5.4),
                    }}
                  >
                    {PERKS.map((p) => (
                      <div
                        key={p.label}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: U(1.4),
                          padding: `${U(3)} ${U(1)}`,
                          minHeight: U(14.6),
                          boxSizing: "border-box",
                          textAlign: "center",
                          borderRadius: U(3.6),
                          background: "rgba(255,255,255,.14)",
                          border: `${HAIR} solid rgba(255,255,255,.3)`,
                          fontSize: U(2.4),
                          lineHeight: 1.2,
                        }}
                      >
                        <span style={{ fontSize: U(3.4), display: "flex" }}>
                          <Icon name={p.icon} />
                        </span>
                        <span>{p.label}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: U(5.2),
                      fontSize: U(3),
                      fontWeight: 500,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Date plans available
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: U(2.4), marginTop: U(1.4) }}>
                    {loading && !data ? (
                      <span className="wdp-skel" style={{ width: U(14), height: U(10), borderRadius: U(2) }} />
                    ) : (
                      <span style={{ fontSize: U(11.5), fontWeight: 500, lineHeight: 1 }}>
                        {(data?.availableDatePlan ?? 0).toLocaleString("en-IN")}
                      </span>
                    )}
                    <span style={{ fontSize: U(5), fontWeight: 500 }}>plans</span>
                  </div>
                </section>

                {/* ============================ PART 2: packs ============================ */}
                <h2 style={sectionTitle}>Buy more plans</h2>

                {error && !packages.length ? (
                  <section
                    style={{
                      padding: `${U(6)} ${U(4)}`,
                      textAlign: "center",
                      background: C.white,
                      border: `${HAIR} solid ${C.border}`,
                      borderRadius: U(5),
                    }}
                  >
                    <p style={{ margin: 0, fontSize: U(3.4), color: C.grey }}>{error}</p>
                    <button
                      type="button"
                      className="wdp-btn"
                      onClick={reload}
                      style={{
                        marginTop: U(4),
                        height: U(10),
                        padding: `0 ${U(6)}`,
                        borderRadius: U(5),
                        background: C.accentSoft,
                        color: C.accent,
                        fontSize: U(3.5),
                        fontWeight: 600,
                      }}
                    >
                      Try again
                    </button>
                  </section>
                ) : (
                  <div
                    role="radiogroup"
                    aria-label="Date plan packs"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: U(3.1),
                      paddingTop: U(2.4),
                    }}
                  >
                    {loading && !packages.length
                      ? [0, 1, 2].map((i) => (
                        <div key={i} className="wdp-skel" style={{ height: U(36), borderRadius: U(5) }} />
                      ))
                      : packages.map((p) => {
                        const active = p.id === selected?.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            className="wdp-btn"
                            onClick={() => setPickedId(p.id)}
                            style={{
                              position: "relative",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              padding: `${U(6.4)} ${U(1)} ${U(4.4)}`,
                              minWidth: 0,
                              textAlign: "center",
                              borderRadius: U(5),
                              background: C.white,
                              border: `${U(0.5)} solid ${active ? C.accent : "transparent"}`,
                              boxShadow: `0 ${U(0.8)} ${U(3)} rgba(0,0,0,.06)`,
                              color: C.ink,
                            }}
                          >
                            {p.isPopular && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: U(-2.4),
                                  left: "50%",
                                  transform: "translateX(-50%)",
                                  padding: `${U(1.2)} ${U(3.2)}`,
                                  borderRadius: U(3),
                                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})`,
                                  color: C.white,
                                  fontSize: U(2.5),
                                  fontWeight: 500,
                                  letterSpacing: "0.04em",
                                  textTransform: "uppercase",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Popular
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: U(6.4),
                                fontWeight: 500,
                                lineHeight: 1,
                                color: active ? C.accent : C.ink,
                              }}
                            >
                              {pad2(p.planCount)}
                            </span>
                            <span style={{ marginTop: U(2.2), fontSize: U(2.6), color: C.grey }}>Date Plans</span>
                            <span
                              style={{
                                marginTop: U(2.6),
                                display: "flex",
                                alignItems: "center",
                                gap: U(1),
                                fontSize: U(3),
                                fontWeight: 600,
                              }}
                            >
                              <span style={{ fontSize: U(2.8), display: "flex" }}>
                                <Coin />
                              </span>
                              {num(p.pricePerPlan)}/each
                            </span>
                            <span
                              style={{
                                marginTop: U(1.4),
                                display: "flex",
                                alignItems: "center",
                                gap: U(1),
                                fontSize: U(2.4),
                                color: C.greyLight,
                              }}
                            >
                              <span style={{ fontSize: U(2.4), display: "flex" }}>
                                <Coin />
                              </span>
                              {num(p.price)} total
                            </span>
                            <span
                              aria-hidden
                              style={{
                                marginTop: U(3.4),
                                width: U(5.2),
                                height: U(5.2),
                                borderRadius: "50%",
                                boxSizing: "border-box",
                                border: `${U(0.4)} solid ${active ? C.accent : "#dcdce0"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {active && (
                                <span
                                  style={{ width: U(2.8), height: U(2.8), borderRadius: "50%", background: C.accent }}
                                />
                              )}
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}

                {/* ============================ PART 3: info ============================ */}
                {how.length > 0 && (
                  <>
                    <h2 style={sectionTitle}>How one plan works</h2>
                    <InfoCard rows={how} styles={HOW_STYLES} numbered />
                  </>
                )}
                {why.length > 0 && (
                  <>
                    <h2 style={sectionTitle}>Why people buy plans</h2>
                    <InfoCard rows={why} styles={WHY_STYLES} />
                  </>
                )}
                {good.length > 0 && (
                  <>
                    <h2 style={sectionTitle}>Good to know</h2>
                    <InfoCard rows={good} styles={GOOD_STYLES} />
                  </>
                )}
              </div>
            </div>

            {/* ------------------------- pinned purchase bar ------------------------- */}
            <footer
              style={{
                flex: "0 0 auto",
                boxSizing: "border-box",
                padding: `${U(4)} ${U(5)} ${U(4.4)}`,
                background: C.white,
                borderTop: `${HAIR} solid ${C.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: U(3),
                  padding: `0 ${U(0.4)}`,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: U(2.2),
                    minWidth: 0,
                    fontSize: U(3.1),
                    fontWeight: 500,
                    letterSpacing: "0.1em",
                    color: C.grey,
                    whiteSpace: "nowrap",
                  }}
                >
                  {selected ? `${pad2(selected.planCount)} PLANS` : "SELECT A PACK"}
                  {selected && selected.discount > 0 && (
                    <span
                      style={{
                        padding: `${U(0.8)} ${U(2.4)}`,
                        borderRadius: U(2),
                        background: C.accentSoft,
                        color: C.accent,
                        fontSize: U(2.8),
                        fontWeight: 600,
                      }}
                    >
                      SAVE {selected.discount}%
                    </span>
                  )}
                </span>
                {selected && (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: U(2),
                      fontSize: U(4.8),
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ fontSize: U(5.4), display: "flex" }}>
                      <Coin />
                    </span>
                    {num(selected.price)}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="wdp-btn"
                onClick={handlePurchase}
                disabled={!selected || buying}
                style={{
                  marginTop: U(3.4),
                  width: "100%",
                  height: U(13.6),
                  borderRadius: U(4.2),
                  background: selected ? `linear-gradient(135deg, ${C.accent}, ${C.accentDeep})` : "#e6e6ea",
                  color: selected ? C.white : "#8d8d8d",
                  fontSize: U(4.1),
                  fontWeight: 500,
                  boxShadow: selected ? `0 ${U(1.2)} ${U(3.4)} rgba(234,122,20,.35)` : "none",
                }}
              >
                {buying ? "Processing…" : ctaLabel}
              </button>

              <p style={{ margin: `${U(3)} 0 0`, textAlign: "center", fontSize: U(2.9), color: C.greyLight }}>{footnote}</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
