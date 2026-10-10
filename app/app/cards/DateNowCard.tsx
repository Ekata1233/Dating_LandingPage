import React from "react";

/* -------------------------------------------------------------------------- */
/*  DateNowCard                                                               */
/*                                                                            */
/*  A fully fluid card. It fills 100% width and 100% height of its PARENT and */
/*  every inner element (fonts, paddings, gaps, radii, icons, buttons,        */
/*  avatar…) scales with the card itself using CSS container-query units.     */
/*                                                                            */
/*  Usage:                                                                    */
/*    <div style={{ width: 360, height: 620 }}>                               */
/*      <DateNowCard />                                                       */
/*    </div>                                                                  */
/*                                                                            */
/*  Rules:                                                                    */
/*    • The parent must have a width and a height (px, %, vh, grid/flex cell) */
/*    • Zero dependencies (no Tailwind, no CSS files, no icon library)        */
/* -------------------------------------------------------------------------- */

export interface DateNowCardProps {
  /** Hero image URL */
  image?: string;
  /** Top-left green pill text */
  liveLabel?: string;
  /** Top-left dark pill text */
  nearLabel?: string;
  /** Match percentage (0-100) */
  matchPercent?: number;
  /** Trust percentage (0-100) */
  trustPercent?: number;
  /** Date text, e.g. "2026-09-23" */
  date?: string;
  /** Time text, e.g. "11:00 AM" */
  time?: string;
  /** Category tag, e.g. "Coffee" */
  category?: string;
  /** Card title */
  title?: string;
  /** Small grey chips under the title */
  chips?: { icon?: string; label: string }[];
  /** Host details */
  host?: {
    name: string;
    age?: number;
    role?: string;
    avatar?: string;
  };
  /** Label of the main action button */
  requestLabel?: string;
  /** Label of the profile button */
  profileLabel?: string;

  onRequest?: () => void;
  onProfile?: () => void;
  onDismiss?: () => void;
  onReport?: () => void;

  className?: string;
  style?: React.CSSProperties;
}

/* One design unit (U) = 1% of the card width, but never more than what the   */
/* card height can afford, so content always fits both wide and tall parents. */
/* The design was drawn at a ~0.6 width/height ratio.                          */
const U = (n: number) => `calc(var(--dnc-u) * ${n})`;

const COLORS = {
  pink: "#f43f6b",
  pinkDeep: "#e11d48",
  pinkSoft: "#fde4ea",
  ink: "#1f2233",
  inkSoft: "#6b7080",
  chipGrey: "#f3f4f6",
  border: "#e5e7eb",
  live: "#34a853",
  purple: "#8b5cf6",
  purpleTag: "#8b5cf6",
  trust: "#10b981",
  white: "#ffffff",
};

/* ------------------------------ tiny SVG icons ----------------------------- */
const iconBase: React.CSSProperties = {
  width: "1em",
  height: "1em",
  display: "block",
  flexShrink: 0,
};

const PinIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="currentColor" aria-hidden>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
  </svg>
);

const FlagIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 4 2 4H5" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="currentColor" aria-hidden>
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.8 4.5 6.5 4.5c2 0 3.6 1 5.5 3 1.9-2 3.5-3 5.5-3 3.7 0 5.6 3.900 4.100 7.300C19.500 16.400 12 21 12 21Z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" style={iconBase} fill="currentColor" aria-hidden>
    <path d="M12 2 4 5v6c0 5 3.400 9.400 8 11 4.600-1.600 8-6 8-11V5l-8-3Zm-1.200 14L7 12.200l1.400-1.400 2.400 2.400 4.800-4.800L17 9.800 10.800 16Z" />
  </svg>
);

/* --------------------------------- default data ---------------------------- */
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1000&q=80";

const DEFAULT_CHIPS = [
  { icon: "⏱️", label: "Flexible" },
  { icon: "🤷", label: "Decide there" },
];

/* -------------------------------- component -------------------------------- */
export default function DateNowCard({
  image = DEFAULT_IMAGE,
  liveLabel = "Live · Pune",
  nearLabel = "Near you",
  matchPercent = 35,
  trustPercent = 98,
  date = "2026-09-23",
  time = "11:00 AM",
  category = "Coffee",
  title = "Coffee & deep talks",
  chips = DEFAULT_CHIPS,
  host = { name: "Sidhi Deshmukh", age: 18, role: "Host, Organizer" },
  requestLabel = "Request Date",
  profileLabel = "Profile",
  onRequest,
  onProfile,
  onDismiss,
  onReport,
  className,
  style,
}: DateNowCardProps) {
  const [imgFailed, setImgFailed] = React.useState(false);

  const initials = host.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* Outer element = the size container. It simply fills the parent.          */
  /* Inner element = the actual card; it measures itself in cq units.         */
  return (
    <div
      className={className}
      style={{
        width: "100%",
        height: "100%",
        containerType: "size",
        ...style,
      }}
    >
      {/* Local CSS: only for pseudo-states that inline styles cannot express */}
      <style>{`
        .dnc-btn { cursor: pointer; border: 0; font: inherit; transition: transform .12s ease, filter .12s ease; }
        .dnc-btn:hover { filter: brightness(1.05); }
        .dnc-btn:active { transform: scale(.97); }
        .dnc-btn:focus-visible { outline: 2px solid ${COLORS.pinkDeep}; outline-offset: 2px; }
        .dnc-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
      `}</style>

      <article
        style={
          {
            "--dnc-u": "min(1cqw, 0.6cqh)",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: COLORS.white,
            borderRadius: U(6),
            overflow: "hidden",
            boxShadow: `0 ${U(1)} ${U(4)} rgba(31,34,51,.14)`,
            fontFamily:
              "'Poppins', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
            color: COLORS.ink,
            boxSizing: "border-box",
          } as React.CSSProperties
        }
      >
        {/* ------------------------------ HERO IMAGE ------------------------------ */}
        <div
          style={{
            position: "relative",
            flex: "1 1 0",
            minHeight: 0,
            background: `linear-gradient(135deg, #3b2f2a, #a26a4a)`,
            overflow: "hidden",
          }}
        >
          {!imgFailed && (
            <img
              src={image}
              alt={title}
              onError={() => setImgFailed(true)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}

          {/* top-left pills */}
          <div
            style={{
              position: "absolute",
              top: U(3.5),
              left: U(3.5),
              right: U(14),
              display: "flex",
              alignItems: "center",
              gap: U(2),
              fontSize: U(3.2),
              fontWeight: 600,
              color: COLORS.white,
            }}
          >
            <span
              className="dnc-ellipsis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: U(1.8),
                background: COLORS.live,
                padding: `${U(1.9)} ${U(3.6)}`,
                borderRadius: U(4),
              }}
            >
              <span
                style={{
                  width: U(1.6),
                  height: U(1.6),
                  borderRadius: "50%",
                  background: COLORS.white,
                  flexShrink: 0,
                }}
              />
              {liveLabel}
            </span>

            <span
              className="dnc-ellipsis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: U(1.4),
                background: "rgba(20,20,28,.72)",
                padding: `${U(1.9)} ${U(3.4)}`,
                borderRadius: U(4),
              }}
            >
              <span style={{ color: "#ff5a5f", fontSize: U(3.4), display: "flex" }}>
                <PinIcon />
              </span>
              {nearLabel}
            </span>
          </div>

          {/* report / flag button */}
          <button
            type="button"
            className="dnc-btn"
            aria-label="Report"
            onClick={onReport}
            style={{
              position: "absolute",
              top: U(3.5),
              right: U(3.5),
              width: U(8.4),
              height: U(8.4),
              borderRadius: "50%",
              background: "rgba(20,20,28,.72)",
              color: COLORS.white,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: U(3.8),
              padding: 0,
            }}
          >
            <FlagIcon />
          </button>

          {/* match / trust pill */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              bottom: U(3),
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: U(1.6),
              background: COLORS.white,
              padding: `${U(1.9)} ${U(4)}`,
              borderRadius: U(5),
              fontSize: U(3.1),
              fontWeight: 700,
              whiteSpace: "nowrap",
              boxShadow: `0 ${U(0.5)} ${U(2)} rgba(0,0,0,.18)`,
            }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: U(1), color: COLORS.purple }}>
              <HeartIcon />
              {matchPercent}% match
            </span>
            <span style={{ color: COLORS.inkSoft, fontWeight: 400 }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: U(1), color: COLORS.trust }}>
              <ShieldIcon />
              {trustPercent}% trust
            </span>
          </div>
        </div>

        {/* ------------------------------- DETAILS -------------------------------- */}
        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            flexDirection: "column",
            gap: U(2.4),
            padding: `${U(3)} ${U(3.6)} ${U(3.6)}`,
            boxSizing: "border-box",
          }}
        >
          {/* date / time / category */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: U(2),
              fontSize: U(2.9),
              fontWeight: 600,
              color: COLORS.white,
              minWidth: 0,
            }}
          >
            <Tag bg={COLORS.pink} shadow="rgba(244,63,107,.35)">
              <CalendarIcon />
              {date}
            </Tag>
            <Tag bg="#1c2438" shadow="rgba(28,36,56,.35)">
              <ClockIcon />
              {time}
            </Tag>
            <Tag bg={COLORS.purpleTag} shadow="rgba(139,92,246,.35)">
              {category}
            </Tag>
          </div>

          {/* title */}
          <h2
            className="dnc-ellipsis"
            style={{
              margin: 0,
              fontSize: U(5.8),
              lineHeight: 1.15,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </h2>

          {/* soft chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: U(2) }}>
            {chips.map((c, i) => (
              <span
                key={i}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: U(1.4),
                  background: COLORS.chipGrey,
                  border: `${U(0.15)} solid ${COLORS.border}`,
                  padding: `${U(1.5)} ${U(3)}`,
                  borderRadius: U(4),
                  fontSize: U(2.8),
                  fontWeight: 500,
                  color: COLORS.ink,
                  whiteSpace: "nowrap",
                }}
              >
                {c.icon && <span>{c.icon}</span>}
                {c.label}
              </span>
            ))}
          </div>

          {/* host row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: U(3),
              padding: U(2.6),
              border: `${U(0.15)} solid ${COLORS.border}`,
              borderRadius: U(4.2),
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: U(11),
                height: U(11),
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                background: `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.purple})`,
                color: COLORS.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: U(3.6),
                fontWeight: 600,
              }}
            >
              {host.avatar ? (
                <img
                  src={host.avatar}
                  alt={host.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initials
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: U(0.4) }}>
              <span className="dnc-ellipsis" style={{ fontSize: U(3.6), fontWeight: 500 }}>
                {host.name}
                {host.age !== undefined ? `, ${host.age}` : ""}
              </span>
              {host.role && (
                <span className="dnc-ellipsis" style={{ fontSize: U(2.8), color: COLORS.inkSoft }}>
                  {host.role}
                </span>
              )}
            </div>

            <button
              type="button"
              className="dnc-btn"
              onClick={onProfile}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: U(1.4),
                flexShrink: 0,
                background: `linear-gradient(135deg, ${COLORS.pink}, ${COLORS.pinkDeep})`,
                color: COLORS.white,
                fontSize: U(3.2),
                fontWeight: 500,
                padding: `${U(2.1)} ${U(4)}`,
                borderRadius: U(5),
                boxShadow: `0 ${U(0.8)} ${U(2)} rgba(244,63,107,.35)`,
              }}
            >
              {profileLabel}
              <ArrowIcon />
            </button>
          </div>

          {/* action row */}
          <div style={{ display: "flex", alignItems: "stretch", gap: U(2.6), height: U(13.5) }}>
            <button
              type="button"
              className="dnc-btn"
              aria-label="Dismiss"
              onClick={onDismiss}
              style={{
                flex: "0 0 auto",
                aspectRatio: "1 / 1",
                height: "100%",
                background: COLORS.pinkSoft,
                color: COLORS.pinkDeep,
                borderRadius: U(4.2),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: U(4.2),
                padding: 0,
              }}
            >
              <CloseIcon />
            </button>

            <button
              type="button"
              className="dnc-btn"
              onClick={onRequest}
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: U(2.4),
                background: `linear-gradient(90deg, ${COLORS.pink}, ${COLORS.pinkDeep})`,
                color: COLORS.white,
                fontSize: U(4.4),
                fontWeight: 500,
                borderRadius: U(4.2),
                boxShadow: `0 ${U(1)} ${U(3)} rgba(225,29,72,.35)`,
              }}
            >
              <span style={{ fontSize: U(4.6), display: "flex" }}>
                <CalendarIcon />
              </span>
              <span className="dnc-ellipsis">{requestLabel}</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ------------------------------ small helper ------------------------------- */
function Tag({
  bg,
  shadow,
  children,
}: {
  bg: string;
  shadow: string;
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: U(1.4),
        background: bg,
        padding: `${U(1.7)} ${U(2.8)}`,
        borderRadius: U(2.8),
        boxShadow: `0 ${U(0.6)} ${U(1.6)} ${shadow}`,
        whiteSpace: "nowrap",
        minWidth: 0,
      }}
    >
      {children}
    </span>
  );
}
