import React from "react";

/**
 * WhoYoureSeeingStep
 * ------------------
 * Independent, dependency-free (React only) component for
 * "Step 2 of 11 – Who you're seeing".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, padding, radii, icons, cards, button) is expressed
 *    in "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <WhoYoureSeeingStep onChange={(v) => console.log(v)} onContinue={(v) => next(v)} />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--wys-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

.wys-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.wys-wrap *, .wys-wrap *::before, .wys-wrap *::after { box-sizing: border-box; }

.wys-root {
  --wys-u: calc(100cqw / 720);
  --wys-pink: #e23d68;
  --wys-ink: #1c1a17;
  --wys-muted: #8a8378;
  --wys-line: #efe7dd;
  --wys-track: #efe7dd;
  --wys-btn: #efeae3;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--wys-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.wys-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.wys-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--wys-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--wys-ink);
}
.wys-back svg { width: ${u(30)}; height: ${u(30)}; }
.wys-titles { flex: 1; min-width: 0; text-align: center; }
.wys-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--wys-pink);
}
.wys-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.wys-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.wys-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.wys-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.wys-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--wys-track);
  overflow: hidden;
}
.wys-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--wys-pink);
}

/* ---------- body ---------- */
.wys-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.wys-body::-webkit-scrollbar { display: none; }

.wys-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--wys-pink);
}
.wys-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(62)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.wys-options {
  display: flex;
  flex-direction: column;
  gap: ${u(30)};
  margin-top: ${u(58)};
}
.wys-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${u(30)};
  padding: ${u(30)} ${u(34)} ${u(30)} ${u(30)};
  border: ${u(3)} solid var(--wys-line);
  border-radius: ${u(36)};
  background: #fff;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.wys-card:hover { border-color: #e4d8c9; }
.wys-card:focus-visible { outline: ${u(4)} solid var(--wys-pink); outline-offset: ${u(3)}; }
.wys-card[aria-checked="true"] {
  border-color: var(--wys-pink);
  background: #fff8fa;
}

.wys-tile {
  flex: none;
  width: ${u(88)};
  height: ${u(88)};
  border-radius: ${u(26)};
  display: grid;
  place-items: center;
}
.wys-tile svg { width: ${u(46)}; height: ${u(46)}; }

.wys-text { flex: 1; min-width: 0; }
.wys-name {
  display: block;
  font-size: ${u(33)};
  font-weight: 500;
  line-height: 1.25;
}
.wys-desc {
  display: block;
  margin-top: ${u(8)};
  font-size: ${u(26)};
  line-height: 1.3;
  color: var(--wys-muted);
}

.wys-radio {
  flex: none;
  width: ${u(38)};
  height: ${u(38)};
  border-radius: 50%;
  border: ${u(3)} solid #e6dccf;
  display: grid;
  place-items: center;
  transition: border-color 0.15s ease;
}
.wys-radio i {
  width: ${u(20)};
  height: ${u(20)};
  border-radius: 50%;
  background: var(--wys-pink);
  transform: scale(0);
  transition: transform 0.15s ease;
}
.wys-card[aria-checked="true"] .wys-radio { border-color: var(--wys-pink); }
.wys-card[aria-checked="true"] .wys-radio i { transform: scale(1); }

/* ---------- footer ---------- */
.wys-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; }
.wys-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--wys-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.wys-continue:disabled { cursor: not-allowed; }
.wys-continue:not(:disabled) {
  background: var(--wys-pink);
  border-color: var(--wys-pink);
  color: #fff;
}
.wys-continue:focus-visible { outline: ${u(4)} solid var(--wys-pink); outline-offset: ${u(3)}; }

@media (prefers-reduced-motion: reduce) {
  .wys-card, .wys-radio, .wys-radio i, .wys-continue { transition: none; }
}
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const FemaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8.5" r="4.5" />
    <path d="M12 13v8M9 17.5h6" />
  </svg>
);
const MaleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="10" cy="14" r="5" />
    <path d="M13.6 10.4L20 4M15 4h5v5" />
  </svg>
);
const NonBinaryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="11.5" r="3.6" />
    <path d="M12 15.1V21M9.5 18.2h5" />
    <path d="M9.4 8.9L4.5 4M4.5 8V4h4" />
    <path d="M14.6 8.9L19.5 4M15.5 4h4v4" />
    <path d="M12 7.9V3.5" />
  </svg>
);

/* ---------- data ---------- */
export type Preference = "women" | "men" | "non-binary";

interface Option {
  id: Preference;
  name: string;
  description: string;
  icon: React.ReactNode;
  tileBg: string;
  tileFg: string;
}

const OPTIONS: Option[] = [
  { id: "women", name: "Women", description: "Show me women", icon: <FemaleIcon />, tileBg: "#fde7ed", tileFg: "#e23d68" },
  { id: "men", name: "Man", description: "Show me men", icon: <MaleIcon />, tileBg: "#e3f1fd", tileFg: "#3b9de8" },
  {
    id: "non-binary",
    name: "Non-binary",
    description: "Show me non-binary people",
    icon: <NonBinaryIcon />,
    tileBg: "#fdf1df",
    tileFg: "#e0a03a",
  },
];

/* ---------- component ---------- */
export interface WhoYoureSeeingStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  /** Allow choosing more than one option (default: false = single choice). */
  multiple?: boolean;
  /** Controlled value. Omit to let the component manage its own state. */
  value?: Preference[];
  defaultValue?: Preference[];
  onChange?: (value: Preference[]) => void;
  onBack?: () => void;
  onContinue?: (value: Preference[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

const WhoYoureSeeingStep: React.FC<WhoYoureSeeingStepProps> = ({
  step = 2,
  totalSteps = 11,
  percent = 18,
  multiple = false,
  value,
  defaultValue = [],
  onChange,
  onBack,
  onContinue,
  className,
  style,
}) => {
  const [inner, setInner] = React.useState<Preference[]>(defaultValue);
  const selected = value ?? inner;

  const toggle = (id: Preference) => {
    let next: Preference[];
    if (multiple) {
      next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
    } else {
      next = [id];
    }
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div className={`wys-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="wys-root" aria-label={`Step ${step} of ${totalSteps}: Who you're seeing`}>
        <div className="wys-header">
          <button type="button" className="wys-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="wys-titles">
            <p className="wys-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="wys-title">Who you're seeing</h2>
          </div>
          <div className="wys-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="wys-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="wys-body">
          <p className="wys-eyebrow">Preferences</p>
          <h1 className="wys-h1">Who are you interested in seeing for a date?</h1>

          <div
            className="wys-options"
            role={multiple ? "group" : "radiogroup"}
            aria-label="Who are you interested in seeing for a date?"
          >
            {OPTIONS.map((o) => {
              const checked = selected.includes(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  role={multiple ? "checkbox" : "radio"}
                  aria-checked={checked}
                  className="wys-card"
                  onClick={() => toggle(o.id)}
                >
                  <span className="wys-tile" style={{ background: o.tileBg, color: o.tileFg }}>
                    {o.icon}
                  </span>
                  <span className="wys-text">
                    <span className="wys-name">{o.name}</span>
                    <span className="wys-desc">{o.description}</span>
                  </span>
                  <span className="wys-radio" aria-hidden="true">
                    <i />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="wys-footer">
          <button
            type="button"
            className="wys-continue"
            disabled={selected.length === 0}
            onClick={() => onContinue?.(selected)}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};

export default WhoYoureSeeingStep;
