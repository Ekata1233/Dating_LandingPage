"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setLoggedIn, useAuth } from "../authState";
import LoginModal from "../auth/LoginModal";


interface NavbarProps {
  /** Optional logo image URL. Agar na do toh gradient "W" fallback dikhega. */
  logoSrc?: string;
}

const NAV_LINKS = [
  { label: "Why Welvors", href: "#why" },
  { label: "Features", href: "#members-see" },
  { label: "Commitment Mode", href: "#commitment" },
];

// Brand colors inline rakhe hain taaki Tailwind theme pe depend na kare
const COLORS = {
  // Frosted / translucent backgrounds
  bgTranslucent: "rgba(252, 248, 244, 0.72)", // navbar (see-through + blur)
  bgDropdown: "rgba(252, 248, 244, 0.92)", // mobile menu (zyada opaque = readable)
  border: "rgba(43, 42, 40, 0.06)",
  brandDark: "#2B2A28",
  brandPink: "#C21559",
  linkText: "#403B37",
  loginBorder: "#E7DFD9",
  waitlistBg: "#FCE1EC",
  waitlistText: "#C21559",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
};

// Frosted-glass blur (inline, cross-browser)
const blur = {
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

function Navbar({ logoSrc }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const loggedIn = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const isLaunch = pathname === "/lauch";

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleLogout = () => {
    setLoggedIn(false);
    setOpen(false);
    router.push("/");
  };

  const handleLoginSuccess = () => {
    setLoggedIn(true);
    setLoginOpen(false);
    router.push("/lauch");
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        backgroundColor: isLaunch ? "#FFFFFF" : COLORS.bgTranslucent,
        borderBottom: `1px solid ${COLORS.border}`,
        ...(isLaunch ? {} : blur),
        transform: mounted ? "translateY(0)" : "translateY(-100%)",
        opacity: mounted ? 1 : 0,
        transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <nav className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Logo */}

        {(() => {
          const logoInner = (
            <>
              <span
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #F26FA6 0%, #E11D63 100%)",
                  boxShadow: "0 6px 16px rgba(225,29,99,0.35)",
                }}
              >
                {logoSrc ? (
                  <img
                    src={logoSrc}
                    alt="Welvors"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  "W"
                )}
              </span>

              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: COLORS.brandDark }}
              >
                Wel<span style={{ color: COLORS.brandPink }}>vors</span>
              </span>
            </>
          );

          // Launch page pe logo clickable NAHI — member wapas home na jaaye
          return isLaunch ? (
            <div className="flex items-center gap-3 cursor-default select-none">
              {logoInner}
            </div>
          ) : (
            <Link href="/" className="flex items-center gap-3">
              {logoInner}
            </Link>
          );
        })()}

        {/* Center/Right: Desktop links + actions */}
        <div className="hidden items-center gap-8 md:flex">
          {!isLaunch && (
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-[15px] text-gray-700 font-bold transition-colors duration-150 hover:text-pink-500"
                  style={{  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          )}

          <div className="flex items-center gap-3">
            {loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="group relative overflow-hidden rounded-full border px-5 py-2 text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:shadow-[0_4px_16px_rgba(194,21,89,0.15)] hover:scale-105 active:scale-95"
                style={{
                  borderColor: COLORS.loginBorder,
                  color: COLORS.brandDark,
                  backgroundColor: "white",
                }}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Log out</span>
                <span
                  className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${COLORS.ctaFrom}, ${COLORS.ctaTo})` }}
                />
              </button>
            ) : (
              <button
                type="button"
                data-login-trigger
                onClick={() => setLoginOpen(true)}
                className="group relative overflow-hidden rounded-full px-5 py-2 text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:shadow-[0_4px_16px_rgba(194,21,89,0.25)] hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.ctaFrom}, ${COLORS.ctaTo})`,
                  color: "white",
                }}
              >
                <span className="relative z-10">Log in</span>
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-14deg] transition-transform duration-500 group-hover:translate-x-[120%]" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile: launch page pe Log out, warna hamburger */}
        {isLaunch ? (
          <button
            type="button"
            onClick={handleLogout}
            className="group relative overflow-hidden rounded-full border px-4 py-2 text-[14px] font-semibold md:hidden cursor-pointer transition-all duration-300 hover:shadow-[0_4px_16px_rgba(194,21,89,0.15)] active:scale-95"
            style={{ borderColor: COLORS.loginBorder, color: COLORS.brandDark, backgroundColor: "white" }}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Log out</span>
            <span
              className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 rounded-full"
              style={{ background: `linear-gradient(135deg, ${COLORS.ctaFrom}, ${COLORS.ctaTo})` }}
            />
          </button>
        ) : (
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          style={{ color: COLORS.brandDark }}
        >
          {open ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
        )}
      </nav>

      {/* Mobile dropdown panel */}
      {!isLaunch && (
        <div
          className="md:hidden overflow-hidden"
          style={{
            maxHeight: open ? "400px" : "0",
            opacity: open ? 1 : 0,
            transition: "max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease",
            backgroundColor: COLORS.bgDropdown,
            borderTop: open ? `1px solid ${COLORS.border}` : "none",
            ...blur,
          }}
        >
          <ul className="flex flex-col px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-[15px] font-medium transition-colors hover:bg-[#f6efe9]"
                  style={{ color: COLORS.linkText }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 px-4 pb-5 sm:px-6">
            {loggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                className="group relative overflow-hidden rounded-full border px-5 py-2.5 text-center text-[15px] font-semibold cursor-pointer transition-all duration-300 active:scale-95"
                style={{
                  borderColor: COLORS.loginBorder,
                  color: COLORS.brandDark,
                  backgroundColor: "white",
                }}
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Log out</span>
                <span
                  className="absolute inset-0 translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${COLORS.ctaFrom}, ${COLORS.ctaTo})` }}
                />
              </button>
            ) : (
              <button
                type="button"
                data-login-trigger
                onClick={() => {
                  setOpen(false);
                  setLoginOpen(true);
                }}
                className="group relative overflow-hidden rounded-full px-5 py-2.5 text-center text-[15px] font-semibold cursor-pointer transition-all duration-300 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.ctaFrom}, ${COLORS.ctaTo})`,
                  color: "white",
                }}
              >
                <span className="relative z-10">Log in</span>
                <span className="absolute inset-0 bg-white/20 translate-x-[-100%] skew-x-[-14deg] transition-transform duration-500 group-hover:translate-x-[120%]" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Login modal */}
      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </header>
  );
}

export default Navbar;