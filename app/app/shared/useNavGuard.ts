"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  useNavGuard                                                                */
/*                                                                            */
/*  Click guard for buttons that navigate to a slow page (or kick off a slow   */
/*  action). The first click locks the button immediately so a double click    */
/*  can't fire twice; the spinner only appears if the navigation is still in   */
/*  flight after `showAfterMs` — a fast route swap never flashes a loader.     */
/*                                                                            */
/*  `pending`  — true from the first click until unmount (or safety timeout).  */
/*               Use for `disabled`.                                          */
/*  `slow`     — true only when the click is genuinely taking time.           */
/*               Use to swap the label for a spinner.                          */
/*                                                                            */
/*  Usage:                                                                     */
/*    const nav = useNavGuard();                                              */
/*    <button disabled={nav.pending} onClick={() => nav.run(() =>             */
/*        router.push("/events/myTickets"))}>                                 */
/*      {nav.slow ? <MoonLoader size={14} /> : "View ticket"}                 */
/*    </button>                                                               */
/* -------------------------------------------------------------------------- */

export interface NavGuard {
  /** True after the first click, until unmount or the safety timeout. */
  pending: boolean;
  /** True only when the action is genuinely taking time (spinner flag). */
  slow: boolean;
  /** Runs the action once; further calls are no-ops while pending. */
  run: (action: () => void) => void;
}

export function useNavGuard(resetMs = 5000, showAfterMs = 300): NavGuard {
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const pendingRef = useRef(false);
  const slowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (slowTimer.current) clearTimeout(slowTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  const run = useCallback(
    (action: () => void) => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      setPending(true);

      /* Spinner only if the action is still running after the delay. On a
         fast navigation the page unmounts first and this never fires. */
      if (showAfterMs > 0) {
        slowTimer.current = setTimeout(() => setSlow(true), showAfterMs);
      }

      try {
        action();
      } catch {
        pendingRef.current = false;
        setPending(false);
        if (slowTimer.current) {
          clearTimeout(slowTimer.current);
          slowTimer.current = null;
        }
        setSlow(false);
        return;
      }
      /* If the navigation never happens (same route, blocked push), unlock so
         the button isn't dead forever. On a real navigation the page
         unmounts and this never matters. */
      if (resetMs > 0) {
        resetTimer.current = setTimeout(() => {
          pendingRef.current = false;
          setPending(false);
          setSlow(false);
        }, resetMs);
      }
    },
    [resetMs, showAfterMs]
  );

  return { pending, slow, run };
}

export default useNavGuard;
