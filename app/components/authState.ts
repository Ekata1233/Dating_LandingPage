"use client";

/* ------------------------------------------------------------------ */
/*  FRONTEND-ONLY auth flag using cookies.                             */
/*  ⚠️  Ye SECURITY nahi hai — sirf UI ke liye (Login vs Logout).      */
/*  Real auth: httpOnly cookie + server session/JWT.                   */
/* ------------------------------------------------------------------ */

import { useEffect, useState } from "react";

const EVENT = "welvors-auth-change";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setLoggedIn(value: boolean) {
  if (typeof window === "undefined") return;
  // We don't set any cookie here — the session cookie is httpOnly (set by server).
  // This just triggers a re-render for UI components.
  window.dispatchEvent(new Event(EVENT));
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  // Check if the session cookie exists
  return getCookie("session") !== null;
}

/** React hook — login/logout hone pe auto update */
export function useAuth() {
  const [loggedIn, setState] = useState(false);

  useEffect(() => {
    const sync = () => setState(isLoggedIn());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync); // dusre tab me change
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return loggedIn;
}