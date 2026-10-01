import type { ComponentType } from "react";

import ProfileBasicsStep from "./steps/Basics";
import WhoYoureSeeingStep from "./steps/Preference";
import IntentionStep from "./steps/Intentions";
import LifestyleStep from "./steps/Lifestyle";
import CareerStep from "./steps/Career";
import InterestsStep from "./steps/Interests";
import PhotosStep from "./steps/photo";
import BioStep from "./steps/Bio";
import PromptsStep from "./steps/Prompts";
import LocationStep from "./steps/Location";
import ReviewStep from "./steps/Review";

/* -------------------------------------------------------------------------- */
/*  The onboarding flow: one registry, one order, one place that knows the     */
/*  truth.                                                                     */
/*                                                                             */
/*  The step components were each authored as standalone mockups and every one  */
/*  of them shipped its own copy of the header ("Step n of 11", the title, the */
/*  percentage ring) and the progress bar. That chrome now lives in            */
/*  `app/onBoarding/layout.tsx` instead, which means the only thing the page    */
/*  has to know is *which* step is current — never how it is numbered or        */
/*  styled. This file is that "which".                                          */
/*                                                                             */
/*  `STEPS` is ordered: the array position IS the step number. There is no     */
/*  separate `step` field to fall out of sync. Adding a step means adding an   */
/*  entry, nothing else.                                                        */
/* -------------------------------------------------------------------------- */

export const TOTAL_STEPS = 11;

/**
 * Steps no longer take navigation handlers.
 *
 * They used to receive `onContinue` / `onSkip` and had to decide for themselves
 * whether they were valid. That put the validation rule in two places — the
 * button and the store — and the two could disagree. A step now owns its data
 * object and its schema, and submits itself, so the only prop in play is the
 * final `onFinish` on the last step.
 */
export type OnboardingStepComponent = ComponentType<{ onFinish?: () => void }>;

export interface OnboardingStepMeta {
  /** Stable key, also used as the React key so state resets between steps. */
  id: string;
  /** Shown in the layout header, under "Step n of 11". */
  title: string;
  Component: OnboardingStepComponent;
}

export const STEPS: OnboardingStepMeta[] = [
  { id: "basics", title: "The basics", Component: ProfileBasicsStep },
  { id: "preference", title: "Who you're seeing", Component: WhoYoureSeeingStep },
  { id: "intentions", title: "Your intentions", Component: IntentionStep },
  { id: "lifestyle", title: "Your lifestyle", Component: LifestyleStep },
  { id: "career", title: "Career & ambition", Component: CareerStep },
  { id: "interests", title: "Your interests", Component: InterestsStep },
  { id: "photos", title: "Your photos", Component: PhotosStep },
  { id: "bio", title: "About you", Component: BioStep },
  { id: "prompts", title: "Prompts", Component: PromptsStep },
  { id: "location", title: "Location", Component: LocationStep },
  { id: "review", title: "Review & finish", Component: ReviewStep },
];

/**
 * The percentage the original designs showed in the ring: a floored
 * `step / 11`, so step 6 reads 54% and not 55%. Kept floored deliberately so
 * the header matches the mockups it replaces, digit for digit.
 */
export function percentFor(step: number): number {
  return Math.floor((step / TOTAL_STEPS) * 100);
}

/** The exact fractional width the progress bar fills — not floored. */
export function progressFor(step: number): number {
  return (step / TOTAL_STEPS) * 100;
}
