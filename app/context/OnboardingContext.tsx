//Only for Ui
"use client";
import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { STEPS, TOTAL_STEPS, percentFor, progressFor } from "../onBoarding/onboardingConfig";

/* -------------------------------------------------------------------------- */
/*  Where the flow currently is.                                                */
/*                                                                             */
/*  The layout renders the card and its header (step counter, title, ring,      */
/*  progress bar); the page renders the step itself. Both need to agree on       */
/*  which step is showing, and neither is the parent of the other in a way that */
/*  lets one own the state - so it lives here instead.                           */
/*                                                                             */
/*  `stepIndex` is zero-based internally. Everything user-facing (the counter,  */
/*  the ring, the bar) is derived from the 1-based `step`.                       */
/* -------------------------------------------------------------------------- */

const STORAGE_KEY = "welvors_onboarding_step";

/** Must match `ONBOARDING_DONE_PATH` in `proxy.ts`. */
const ONBOARDING_DONE_PATH = "/app/profile";

function clampIndex(index: number): number {
  return Math.min(Math.max(index, 0), TOTAL_STEPS - 1);
}

/**
 * The saved position is read through `useSyncExternalStore` rather than a
 * `useState` initialiser or a `useEffect`. Both of those are wrong here: the
 * initialiser makes the client's first render disagree with the server's HTML
 * (a hydration mismatch), and the effect means every subscriber renders twice
 * on load. This hook is built for exactly this case - a value that differs
 * between server and client, read from outside React.
 */
const emptySubscribe = () => () => {};

function readStoredStep(): number {
  try {
    const stored = Number(window.sessionStorage.getItem(STORAGE_KEY));
    if (Number.isInteger(stored) && stored >= 0 && stored < TOTAL_STEPS) return stored;
  } catch {
    /* Private mode / storage disabled - fall through to step 1. */
  }
  return 0;
}

/** The server has no sessionStorage, so it always renders step 1. */
const getServerStep = () => 0;

interface OnboardingState {
  /** Zero-based index into `STEPS`. */
  stepIndex: number;
  /** One-based, for display. */
  step: number;
  total: number;
  /** Floored, for the ring. */
  percent: number;
  /** Exact fraction, for the progress bar width. */
  progress: number;
  /** The current step's title, for the layout header. */
  title: string;
  isFirst: boolean;
  isLast: boolean;
  canGoBack: boolean;
  next: () => void;
  back: () => void;
  goTo: (index: number) => void;
  /**
   * Called by the last step's "Finish" button, after the review save has
   * succeeded. Clears the saved position and leaves the route, because
   * `proxy.ts` treats a completed profile as ineligible for `/onBoarding`.
   */
  finish: () => void;
}

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const savedIndex = useSyncExternalStore(emptySubscribe, readStoredStep, getServerStep);

  /* The live position. `savedIndex` is only read on mount (that's the point of
     the external store - it avoids a hydration mismatch), so navigation has to
     live in state or every move would have to round-trip through storage and
     re-render to read it back. */
  const [override, setOverride] = useState<number | null>(null);

  const goTo = useCallback((index: number) => {
    const clamped = clampIndex(index);
    setOverride(clamped);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, String(clamped));
    } catch {
      /* Storage unavailable - the flow still works, it just starts from step 1
         again on the next full page load. */
    }
  }, []);

  const stepIndex = override ?? savedIndex;

  /* Relative navigation is derived from the step actually being shown, not from
     what was last read out of storage. The two can disagree for a render after
     a `goTo`, and computing "the next step" from the stale one is how you end up
     stuck on the same step when you press Continue twice quickly. */
  const next = useCallback(() => goTo(stepIndex + 1), [goTo, stepIndex]);
  const back = useCallback(() => goTo(stepIndex - 1), [goTo, stepIndex]);

  const finish = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* Nothing to clean up if storage is unavailable. */
    }
    /* Drop the in-memory position too. Clearing storage alone would leave the
       override in place, so a refresh would land back on Review. */
    setOverride(0);

    /* Leave the route. `proxy.ts` redirects /onBoarding to /app/profile once the
       backend reports `onboardingCompleted`, so staying here would leave the flow
       open and re-editable after the profile exists — and a refresh would land
       back on step 1 looking like nothing happened. */
    router.push(ONBOARDING_DONE_PATH);
  }, [router]);

  const value = useMemo<OnboardingState>(() => {
    const step = stepIndex + 1;

    return {
      stepIndex,
      step,
      total: TOTAL_STEPS,
      percent: percentFor(step),
      progress: progressFor(step),
      title: STEPS[stepIndex]?.title ?? "",
      isFirst: stepIndex === 0,
      isLast: stepIndex === TOTAL_STEPS - 1,
      canGoBack: stepIndex > 0,
      next,
      back,
      goTo,
      finish,
    };
  }, [stepIndex, next, back, goTo, finish]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  }
  return ctx;
}
