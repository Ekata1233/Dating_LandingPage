"use client";

/* ------------------------------------------------------------------ */
/*  FRONTEND-ONLY auth flag.                                           */
/*  ⚠️  Ye SECURITY nahi hai — koi bhi localStorage set kar sakta hai. */
/*  Sirf UI ke liye (Login vs Logout button dikhana).                 */
/*  Real auth: httpOnly cookie + server session/JWT.                  */
/* ------------------------------------------------------------------ */

const KEY = "welvors_auth";
const EVENT = "welvors-auth-change";

export function setLoggedIn(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) localStorage.setItem(KEY, "1");
  else localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}

/** React hook — login/logout hone pe auto update */
import { useEffect, useState } from "react";

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