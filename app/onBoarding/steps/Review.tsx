import React from "react";

/**
 * ReviewFinishStep
 * -----------------
 * Independent, dependency-free (React only) component for
 * "Step 11 of 11 – Review & finish".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, avatar, rows, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <ReviewFinishStep
 *       name="Aman Ingale"
 *       age={20}
 *       photoUrl="/me.jpg"
 *       phoneVerified
 *       orientationLabel="Prefer not to say"
 *       rows={[
 *         { label: "Gender", value: "Men" },
 *         { label: "Interested in", value: "Women" },
 *         { label: "Looking for", value: "Something casual" },
 *         { label: "Lifestyle", value: "Not specified" },
 *         { label: "Education", value: "Undergraduate" },
 *         { label: "Photos", value: "3 added" },
 *       ]}
 *       onFinish={() => createProfile()}
 *     />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--rf-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.rf-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.rf-wrap *, .rf-wrap *::before, .rf-wrap *::after { box-sizing: border-box; }

.rf-root {
  --rf-u: calc(100cqw / 720);
  --rf-pink: #e23d68;
  --rf-ink: #1c1a17;
  --rf-muted: #8a8378;
  --rf-line: #efe7dd;
  --rf-track: #efe7dd;
  --rf-green: #1f9d55;
  --rf-green-bg: #e6f6ea;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--rf-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.rf-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.rf-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--rf-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--rf-ink);
}
.rf-back svg { width: ${u(30)}; height: ${u(30)}; }
.rf-titles { flex: 1; min-width: 0; text-align: center; }
.rf-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rf-pink);
}
.rf-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.rf-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.rf-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.rf-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.rf-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--rf-track);
  overflow: hidden;
}
.rf-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--rf-pink);
}

/* ---------- body ---------- */
.rf-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.rf-body::-webkit-scrollbar { display: none; }

.rf-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--rf-pink);
}
.rf-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(58)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.rf-sub {
  margin: ${u(22)} 0 0;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--rf-muted);
}

.rf-card {
  margin-top: ${u(48)};
  border: ${u(2)} solid var(--rf-line);
  border-radius: ${u(36)};
  background: #fff;
  box-shadow: 0 ${u(14)} ${u(34)} rgba(28, 26, 23, 0.06);
  overflow: hidden;
}

.rf-profile {
  display: flex;
  align-items: flex-start;
  gap: ${u(26)};
  padding: ${u(34)} ${u(34)} ${u(30)};
}
.rf-avatar {
  flex: none;
  width: ${u(120)};
  height: ${u(120)};
  border-radius: 50%;
  overflow: hidden;
  background: #eee6d6;
  display: grid;
  place-items: center;
}
.rf-avatar img { width: 100%; height: 100%; object-fit: cover; }
.rf-avatar svg { width: 60%; height: 60%; color: #b9b0a0; }

.rf-profile-text { min-width: 0; padding-top: ${u(6)}; }
.rf-name {
  margin: 0;
  font-size: ${u(38)};
  font-weight: 700;
  line-height: 1.2;
}
.rf-orientation {
  margin-top: ${u(6)};
  font-size: ${u(26)};
  color: var(--rf-muted);
}
.rf-verified {
  display: inline-flex;
  align-items: center;
  gap: ${u(10)};
  margin-top: ${u(18)};
  padding: ${u(12)} ${u(22)};
  border-radius: 999px;
  background: var(--rf-green-bg);
  color: var(--rf-green);
  font-size: ${u(23)};
  font-weight: 600;
}
.rf-verified svg { width: ${u(22)}; height: ${u(22)}; }

.rf-rows { border-top: ${u(2)} solid var(--rf-line); }
.rf-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${u(20)};
  padding: ${u(30)} ${u(34)};
  border-bottom: ${u(2)} solid var(--rf-line);
}
.rf-row:last-child { border-bottom: none; }
.rf-row-label { font-size: ${u(26)}; color: var(--rf-muted); }
.rf-row-value {
  font-size: ${u(27)};
  font-weight: 700;
  text-align: right;
}

/* ---------- footer ---------- */
.rf-footer { flex: none; padding: ${u(20)} 0 ${u(36)}; }
.rf-finish {
  width: 100%;
  height: ${u(98)};
  border: none;
  border-radius: ${u(30)};
  background: var(--rf-pink);
  color: #fff;
  font: inherit;
  font-size: ${u(30)};
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 ${u(14)} ${u(30)} rgba(226, 61, 104, 0.32);
  transition: filter 0.15s ease;
}
.rf-finish:hover { filter: brightness(0.97); }
.rf-finish:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.rf-finish:focus-visible,
.rf-back:focus-visible { outline: ${u(4)} solid var(--rf-pink); outline-offset: ${u(3)}; }
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 13l4 4L19 7" />
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

/* ---------- data ---------- */
export interface ReviewRow {
  label: string;
  value: string;
}

/* ---------- component ---------- */
export interface ReviewFinishStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  name: string;
  age: number;
  photoUrl?: string;
  orientationLabel?: string;
  phoneVerified?: boolean;
  rows: ReviewRow[];
  finishing?: boolean;
  onBack?: () => void;
  onFinish?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_ROWS: ReviewRow[] = [
  { label: "Gender", value: "Men" },
  { label: "Interested in", value: "Women" },
  { label: "Looking for", value: "Something casual" },
  { label: "Lifestyle", value: "Not specified" },
  { label: "Education", value: "Undergraduate" },
  { label: "Photos", value: "3 added" },
];

const ReviewFinishStep: React.FC<ReviewFinishStepProps> = ({
  step = 11,
  totalSteps = 11,
  percent = 100,
  name = "Aman Ingale",
  age = 20,
  photoUrl,
  orientationLabel = "Prefer not to say",
  phoneVerified = true,
  rows = DEFAULT_ROWS,
  finishing = false,
  onBack,
  onFinish,
  className,
  style,
}) => {
  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div className={`rf-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="rf-root" aria-label={`Step ${step} of ${totalSteps}: Review & finish`}>
        <div className="rf-header">
          <button type="button" className="rf-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="rf-titles">
            <p className="rf-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="rf-title">Review &amp; finish</h2>
          </div>
          <div className="rf-ring" role="img" aria-label={`${percent}% complete`}>
            <svg viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={r} fill="none" stroke="#efe7dd" strokeWidth="5" />
              <circle
                cx="36"
                cy="36"
                r={r}
                fill="none"
                stroke="#e23d68"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${(c * percent) / 100} ${c}`}
              />
            </svg>
            <span>{percent}%</span>
          </div>
        </div>
        <div className="rf-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="rf-body">
          <p className="rf-eyebrow">Almost done</p>
          <h1 className="rf-h1">Looks good?</h1>
          <p className="rf-sub">Here's your profile so far. You can change anything later.</p>

          <div className="rf-card">
            <div className="rf-profile">
              <div className="rf-avatar">
                {photoUrl ? <img src={photoUrl} alt={name} /> : <PersonIcon />}
              </div>
              <div className="rf-profile-text">
                <p className="rf-name">
                  {name}, {age}
                </p>
                {orientationLabel && <p className="rf-orientation">{orientationLabel}</p>}
                {phoneVerified && (
                  <span className="rf-verified">
                    <CheckIcon />
                    Phone verified
                  </span>
                )}
              </div>
            </div>

            <div className="rf-rows">
              {rows.map((row) => (
                <div className="rf-row" key={row.label}>
                  <span className="rf-row-label">{row.label}</span>
                  <span className="rf-row-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rf-footer">
          <button type="button" className="rf-finish" disabled={finishing} onClick={onFinish}>
            {finishing ? "Creating your profile…" : "Create my profile"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default ReviewFinishStep;
