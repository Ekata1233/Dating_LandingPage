"use client";

import Link from "next/link";
import React, { SVGProps } from "react";

/* ------------------------------------------------------------------ */
/*  Brand colors inline                                                */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#EFEAE4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#5F5A55",
  label: "#8A827B",
  divider: "#DCD5CD",
};

/* ------------------------------------------------------------------ */
/*  Registered entity — copyright line ke liye.                        */
/*  NOTE: legal entity yahin set karo (FTFL Technology Pvt. Ltd.).     */
/* ------------------------------------------------------------------ */
const COMPANY = "Infynod Tech Private Limited ";

/* ------------------------------------------------------------------ */
/*  Inline SVG icons                                                   */
/* ------------------------------------------------------------------ */
const Icon = {
  Heart: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5 8.6 5 10 6.5 12 8c2-1.5 3.4-3 5.5-3C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21z" />
    </svg>
  ),
  Instagram: (p: SVGProps<SVGSVGElement>) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  X: (p: SVGProps<SVGSVGElement>) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M17.5 3h3.2l-7 8 8.2 10h-6.4l-5-6.2L4.7 21H1.5l7.5-8.6L1.2 3h6.6l4.5 5.7L17.5 3zm-1.1 16h1.8L7.7 4.9H5.8L16.4 19z" />
    </svg>
  ),
  LinkedIn: (p: SVGProps<SVGSVGElement>) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95C21.4 8.75 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4V9z" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  SmartLink                                                          */
/*  Hash links (#why) ke liye plain <a> — next/link inhe route nav     */
/*  samajhta hai jisse page reload hota hai. Routes ke liye <Link>.     */
/* ------------------------------------------------------------------ */
function SmartLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} style={style}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className} style={style}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/*  Link columns                                                       */
/* ------------------------------------------------------------------ */
const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Why Welvors", href: "#why" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Join waitlist", href: "#waitlist" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/footer/aboutus" },
      { label: "Careers", href: "/footer/careers" },
      { label: "Press", href: "/footer/press" },
      { label: "Become a partner", href: "/footer/partner" },
      { label: "Contact us", href: "/footer/contact" },
    ],
  },
  {
    heading: "Legal & Safety",
    links: [
      { label: "Privacy Policy", href: "/legalSafty/privacyPolicy" },
      { label: "Terms & Conditions", href: "/legalSafty/termCondition" },
      { label: "Cookie Policy", href: "/legalSafty/cookiePolicy" },
      { label: "Community Guidelines", href: "/legalSafty/community" },
      { label: "Safety & Trust", href: "/legalSafty/safetyTrust" },
      { label: "Refund & Cancellation", href: "/legalSafty/refund" },
      { label: "Grievance Redressal", href: "/legalSafty/grievance" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/welvors__official?utm_source=qr&igsh=MXN5bzA0Y2g1emoxMg==", icon: <Icon.Instagram /> },
  
];

const BOTTOM_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: C.bg }} className="w-full">
      {/* Link hover — inline color ko override karne ke liye scoped CSS */}
      <style>{`
        .welvors-footer-link { transition: color .15s ease; }
        .welvors-footer-link:hover { color: ${C.pink} !important; }
      `}</style>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        {/* ==================== Top grid ==================== */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* ---- Brand column ---- */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)",
                }}
              >
                <Icon.Heart />
              </span>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: C.headingDark }}
              >
                Wel<span style={{ color: C.pink }}>vors</span>
              </span>
            </Link>

            <p
              className="mt-4 max-w-xs text-[14px] leading-relaxed"
              style={{ color: C.body }}
            >
              Dating, done right. Real people, verified profiles, and a safer
              way to meet someone who actually gets you.
            </p>

            {/* Socials */}
            <div className="mt-5 flex items-center gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ color: C.headingDark }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* ---- Link columns ---- */}
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3
                className="text-[11.5px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: C.label }}
              >
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <SmartLink
                      href={l.href}
                      className="welvors-footer-link text-[14px]"
                      style={{ color: C.body }}
                    >
                      {l.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ==================== Bottom bar ==================== */}
    
<div
  className="mt-12 flex flex-col items-center gap-4 border-t pt-6"
  style={{ borderColor: C.divider }}
>
  <p
    className="text-center text-[12px] leading-5"
    style={{ color: C.label }}
  >
  Welvors is a product of Infynod Tech Private Limited · CIN:
    U62020PN2026PTC258333 · Office No. 307, 3rd Floor, Amanora Chamber,
    Hadapsar–Kharadi Road, Hadapsar, Pune, Maharashtra – 411028 ·{" "}
    <a
      href="mailto:info@infynod.com"
      className="welvors-footer-link"
      style={{ color: C.headingDark }}
    >
      info@infynod.com
    </a>
  </p>

  <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
    <p className="text-[13px]" style={{ color: C.label }}>
      © {year} {COMPANY} · All rights reserved.
    </p>

    <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {BOTTOM_LINKS.map((l) => (
        <SmartLink
          key={l.label}
          href={l.href}
          className="welvors-footer-link text-[13px] font-semibold"
          style={{ color: C.headingDark }}
        >
          {l.label}
        </SmartLink>
      ))}

      <span
        className="flex items-center gap-1.5 text-[13px]"
        style={{ color: C.label }}
      >
        Made with care in India
        <span className="text-[10px] font-semibold tracking-wider">
          IN
        </span>
      </span>
    </div>
  </div>
</div>


      </div>
    </footer>
  );
}

export default Footer;