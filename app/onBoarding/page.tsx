"use client";

import { useOnboarding } from "../context/OnboardingContext";
import { STEPS } from "./onboardingConfig";

/**
 * The body of the flow.
 *
 * The card, the step counter and the progress bar belong to `layout.tsx`; this
 * page only decides *which* step is showing. That split is why a step file
 * never needs to know its own number — the layout counts, the page swaps.
 *
 * Steps own their data object and their schema, and submit themselves, so the
 * validation gate lives in the form provider rather than here. What's left for
 * this page is the swap.
 */
function OnBoardingPage() {
  const { stepIndex, isLast, finish } = useOnboarding();

  const current = STEPS[stepIndex];
  if (!current) return null;

  /* `key` is the step id, so switching steps remounts the outgoing component.
     That is what stops one step's transient UI state (a half-typed prompt
     answer, an in-flight geolocation request) surviving into the next one. The
     data itself is unaffected — it lives in the provider, above this. */
  return <current.Component key={current.id} {...(isLast ? { onFinish: finish } : {})} />;
}

export default OnBoardingPage;
