"use client";

import type { ReactNode } from "react";

import { OnBoardingDataProvider } from "../context/OnBoardingDataContext";
import { ProfileProvider } from "../context/OnBoardingApiContext";
import { OnboardingFormProvider, useOnboardingForm } from "../context/OnboardingFormContext";
import { OnboardingProvider, useOnboarding } from "../context/OnboardingContext";

/* -------------------------------------------------------------------------- */
/*  /onBoarding - shared card + header chrome for every onboarding step.      */
/* -------------------------------------------------------------------------- */

const SCALE = 0.86;

// 1 design unit = card width / 720 * SCALE
const u = (n: number) => `calc(var(--onb-u) * ${n})`;

const css = `
.onb-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #FFF5F8;
  box-sizing: border-box;
}

.onb-page *,
.onb-page *::before,
.onb-page *::after {
  box-sizing: border-box;
}

/* ---------- card ---------- */

.onb-card {
  --onb-scale: ${SCALE};
  --onb-u: calc(100cqw / 720 * var(--onb-scale));

  /* WELVORS brand palette */
  --onb-pink: #E11D63;
  --onb-pink-light: #F26FA6;
  --onb-pink-soft: #FFF5F8;

  --onb-ink: #1C1A17;
  --onb-muted: #8A8378;

  --onb-line: #F8DCE7;
  --onb-track: #F8DCE7;

  /*
   * 4:5 at every viewport.
   * The 100dvh term caps the width so the card can never
   * grow taller than the screen it is centred in.
   */
  width: min(92vw, 480px, (100dvh - 3rem) * 0.8);
  aspect-ratio: 4 / 5;

  container-type: inline-size;

  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: #fff;
  color: var(--onb-ink);

  font-family:
    "DM Sans",
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;

  border-radius: ${u(16)};

  box-shadow:
    0 ${u(30)} ${u(70)} rgba(225, 29, 99, 0.10),
    0 0 0 1px rgba(225, 29, 99, 0.05);
}

/* ---------- scrollbar ---------- */

.onb-card,
.onb-card * {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.onb-card::-webkit-scrollbar,
.onb-card *::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

/* ---------- header ---------- */

.onb-header {
  flex: none;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: ${u(16)};
  padding: ${u(24)} ${u(30)} 0;
}

/* ---------- back button ---------- */

.onb-back {
  flex: none;

  width: ${u(80)};
  height: ${u(80)};

  border-radius: 50%;
  border: ${u(2)} solid var(--onb-line);

  background: #fff;

  box-shadow:
    0 ${u(4)} ${u(14)}
    rgba(225, 29, 99, 0.08);

  display: grid;
  place-items: center;

  padding: 0;
  cursor: pointer;

  color: var(--onb-ink);

  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.onb-back:hover {
  transform: scale(1.04);

  border-color: var(--onb-pink-light);

  box-shadow:
    0 ${u(6)} ${u(18)}
    rgba(225, 29, 99, 0.14);
}

.onb-back:active {
  transform: scale(0.98);
}

.onb-back svg {
  width: ${u(30)};
  height: ${u(30)};
}

/* Holds the back button's space on the first step */
.onb-back-slot {
  flex: none;

  width: ${u(80)};
  height: ${u(80)};
}

/* ---------- titles ---------- */

.onb-titles {
  flex: 1;
  min-width: 0;

  text-align: center;
}

.onb-step {
  margin: 0;

  font-size: ${u(19)};
  font-weight: 600;

  letter-spacing: 0.14em;
  text-transform: uppercase;

  color: var(--onb-pink);
}

.onb-title {
  margin: ${u(6)} 0 0;

  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---------- progress ring ---------- */

.onb-ring {
  flex: none;

  position: relative;

  width: ${u(72)};
  height: ${u(72)};
}

.onb-ring svg {
  width: 100%;
  height: 100%;

  transform: rotate(-90deg);
}

.onb-ring span {
  position: absolute;
  inset: 0;

  display: grid;
  place-items: center;

  font-size: ${u(19)};
  font-weight: 600;

  color: var(--onb-ink);
}

/* ---------- progress bar ---------- */

.onb-progress {
  flex: none;

  height: ${u(12)};

  margin: ${u(28)} ${u(30)} 0;

  border-radius: 999px;

  background: var(--onb-track);

  overflow: hidden;
}

.onb-progress > i {
  display: block;

  height: 100%;

  border-radius: 999px;

  background: var(--onb-pink);

  transition:
    width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---------- step content ---------- */

.onb-body {
  flex: 1;

  min-height: 0;

  display: flex;
  flex-direction: column;
}

/* ---------- accessibility ---------- */

.onb-back:focus-visible {
  outline: ${u(4)} solid var(--onb-pink);
  outline-offset: ${u(3)};
}

/* ---------- reduced motion ---------- */

@media (prefers-reduced-motion: reduce) {
  .onb-progress > i,
  .onb-back {
    transition: none;
  }
}

/* ---------- smaller screens ---------- */

@media (max-width: 480px) {
  .onb-page {
    padding: 12px 8px;
  }

  .onb-card {
    width: min(96vw, 480px, (100dvh - 1.5rem) * 0.8);
  }
}
`;

/* -------------------------------------------------------------------------- */
/*  Back icon                                                                 */
/* -------------------------------------------------------------------------- */

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Progress ring                                                             */
/* -------------------------------------------------------------------------- */

const Ring: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div
      className="onb-ring"
      role="img"
      aria-label={`${percent}% complete`}
    >
      <svg viewBox="0 0 72 72">
        {/* Track */}
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#F8DCE7"
          strokeWidth="5"
        />

        {/* Progress */}
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#E11D63"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${(c * percent) / 100} ${c}`}
        />
      </svg>

      <span>{percent}%</span>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Card + header                                                             */
/* -------------------------------------------------------------------------- */

function OnBoardingShell({ children }: { children: ReactNode }) {
  const {
    step,
    total,
    percent,
    progress,
    title,
    canGoBack,
    back,
  } = useOnboarding();

  const form = useOnboardingForm();

  /*
   * Going back must not carry a stale validation error
   * from the previous step.
   */
  const handleBack = () => {
    form.clearErrors();
    back();
  };

  return (
    <div className="onb-page">
      <style>{css}</style>

      <div className="onb-card">
        <div className="onb-header">
          {canGoBack ? (
            <button
              type="button"
              className="onb-back"
              aria-label="Go back"
              onClick={handleBack}
            >
              <BackIcon />
            </button>
          ) : (
            <span
              className="onb-back-slot"
              aria-hidden="true"
            />
          )}

          <div
            className="onb-titles"
            aria-live="polite"
          >
            <p className="onb-step">
              Step {step} of {total}
            </p>

            <h2 className="onb-title">
              {title}
            </h2>
          </div>

          <Ring percent={percent} />
        </div>

        <div
          className="onb-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label="Onboarding progress"
        >
          <i
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <div className="onb-body">
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Onboarding flow                                                           */
/* -------------------------------------------------------------------------- */

function OnBoardingFlow({
  children,
}: {
  children: ReactNode;
}) {
  const { next, isLast } = useOnboarding();

  return (
    <ProfileProvider>
      <OnBoardingDataProvider>
        <OnboardingFormProvider onAdvance={isLast ? () => {} : next}>
          <OnBoardingShell>{children}</OnBoardingShell>
        </OnboardingFormProvider>
      </OnBoardingDataProvider>
    </ProfileProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                    */
/* -------------------------------------------------------------------------- */

export default function OnBoardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OnboardingProvider>
      <OnBoardingFlow>
        {children}
      </OnBoardingFlow>
    </OnboardingProvider>
  );
}