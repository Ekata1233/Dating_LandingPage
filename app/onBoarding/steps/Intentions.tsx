import React from "react";

/**
 * YourIntentionsSteps
 * -------------------
 * Independent, dependency-free (React only) component showing the two
 * "Step 3 of 11 – Your intentions" screens stacked one below the other:
 *   1. the top of the list (first four options, the fifth peeking in)
 *   2. the list scrolled to the bottom (all remaining options)
 * Both screens share one selection, so choosing an option on either
 * screen is reflected on the other.
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Each screen is exactly as wide and as tall as the parent; the root scrolls
 *    vertically to reveal the second screen.
 *  - Every inner size (fonts, padding, radii, radios, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the screen's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <YourIntentionsSteps onChange={(id) => console.log(id)} />
 *   </div>
 */

// 1 design unit = screen width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--yis-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

.yis-root {
  --yis-pink: #e23d68;
  --yis-ink: #1c1a17;
  --yis-muted: #857e73;
  --yis-line: #efe7dd;
  --yis-track: #efe7dd;
  --yis-btn: #efeae3;

  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f3f0eb;
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--yis-ink);
  box-sizing: border-box;
}
.yis-root *, .yis-root *::before, .yis-root *::after { box-sizing: border-box; }

/* Each wrapper is the size container: 100% of the parent's width and height */
.yis-wrap {
  flex: 0 0 100%;
  width: 100%;
  min-height: 0;
  container-type: inline-size;
}
.yis-wrap + .yis-wrap { margin-top: 2px; }

.yis-screen {
  --yis-u: calc(100cqw / 720);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  overflow: hidden;
  padding: 0 ${u(30)};
}

/* ---------- header ---------- */
.yis-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.yis-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--yis-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--yis-ink);
}
.yis-back svg { width: ${u(30)}; height: ${u(30)}; }
.yis-titles { flex: 1; min-width: 0; text-align: center; }
.yis-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--yis-pink);
}
.yis-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.yis-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.yis-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.yis-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.yis-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--yis-track);
  overflow: hidden;
}
.yis-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--yis-pink);
}

/* ---------- body (clipped like a scrolled viewport) ---------- */
.yis-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.yis-body.is-top { justify-content: flex-start; }
.yis-body.is-bottom { justify-content: flex-end; }
.yis-content { flex: none; padding: ${u(30)} 0 ${u(24)}; }
.yis-body.is-bottom .yis-content { padding-bottom: ${u(56)}; }

.yis-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--yis-pink);
}
.yis-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(62)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.yis-sub {
  margin: ${u(22)} 0 0;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--yis-muted);
}

.yis-options {
  display: flex;
  flex-direction: column;
  gap: ${u(24)};
  margin-top: ${u(58)};
}
.yis-body.is-bottom .yis-options { margin-top: 0; }

.yis-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${u(24)};
  padding: ${u(30)} ${u(34)} ${u(30)} ${u(32)};
  border: ${u(3)} solid var(--yis-line);
  border-radius: ${u(36)};
  background: #fff;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.yis-card:hover { border-color: #e4d8c9; }
.yis-card:focus-visible { outline: ${u(4)} solid var(--yis-pink); outline-offset: ${u(3)}; }
.yis-card[aria-checked="true"] { border-color: var(--yis-pink); background: #fff8fa; }

.yis-text { flex: 1; min-width: 0; }
.yis-name {
  display: block;
  font-size: ${u(31)};
  font-weight: 500;
  line-height: 1.3;
}
.yis-desc {
  display: block;
  margin-top: ${u(8)};
  padding-right: ${u(20)};
  font-size: ${u(25)};
  line-height: 1.32;
  color: var(--yis-muted);
}

.yis-radio {
  flex: none;
  width: ${u(38)};
  height: ${u(38)};
  border-radius: 50%;
  border: ${u(3)} solid #e6dccf;
  display: grid;
  place-items: center;
  transition: border-color 0.15s ease;
}
.yis-radio i {
  width: ${u(20)};
  height: ${u(20)};
  border-radius: 50%;
  background: var(--yis-pink);
  transform: scale(0);
  transition: transform 0.15s ease;
}
.yis-card[aria-checked="true"] .yis-radio { border-color: var(--yis-pink); }
.yis-card[aria-checked="true"] .yis-radio i { transform: scale(1); }

/* ---------- footer ---------- */
.yis-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; }
.yis-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--yis-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.yis-continue:disabled { cursor: not-allowed; }
.yis-continue:not(:disabled) {
  background: var(--yis-pink);
  border-color: var(--yis-pink);
  color: #fff;
}
.yis-continue:focus-visible,
.yis-back:focus-visible { outline: ${u(4)} solid var(--yis-pink); outline-offset: ${u(3)}; }

@media (prefers-reduced-motion: reduce) {
  .yis-card, .yis-radio, .yis-radio i, .yis-continue { transition: none; }
}
`;

/* ---------- data ---------- */
export type Intention =
  | "casual"
  | "long-term"
  | "dating-with-intention"
  | "life-partner"
  | "figuring-out"
  | "long-term-open-short";

interface Option {
  id: Intention;
  name: string;
  description: string;
}

const OPTIONS: Option[] = [
  { id: "casual", name: "Something casual", description: "Keeping it light and easy, no pressure for now." },
  {
    id: "long-term",
    name: "Long-term relationship",
    description: "Something serious and committed, no rush on timelines.",
  },
  {
    id: "dating-with-intention",
    name: "Dating with intention",
    description: "Getting to know someone genuinely, not just passing time.",
  },
  { id: "life-partner", name: "Life partner", description: "Ready to settle down and build a life together." },
  {
    id: "figuring-out",
    name: "Still figuring it out",
    description: "Open to a real connection, taking it as it comes.",
  },
  {
    id: "long-term-open-short",
    name: "Long-term, open to short-term",
    description: "Hoping for something lasting, but seeing where it goes.",
  },
];

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

/* ---------- shared pieces ---------- */
interface ScreenProps {
  step: number;
  totalSteps: number;
  percent: number;
  selected: Intention | null;
  onSelect: (id: Intention) => void;
  onBack?: () => void;
  onContinue?: () => void;
  align: "top" | "bottom";
  label: string;
}

const Screen: React.FC<ScreenProps> = ({
  step,
  totalSteps,
  percent,
  selected,
  onSelect,
  onBack,
  onContinue,
  align,
  label,
}) => {
  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div className="yis-wrap">
      <section className="yis-screen" aria-label={label}>
        <div className="yis-header">
          <button type="button" className="yis-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="yis-titles">
            <p className="yis-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="yis-title">Your intentions</h2>
          </div>
          <div className="yis-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="yis-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className={`yis-body ${align === "top" ? "is-top" : "is-bottom"}`}>
          <div className="yis-content">
            {align === "top" && (
              <>
                <p className="yis-eyebrow">Your intentions</p>
                <h1 className="yis-h1">"What kind of love are you ready for?"</h1>
                <p className="yis-sub">However you love, you belong here — and we'll find your person.</p>
              </>
            )}

            <div className="yis-options" role="radiogroup" aria-label="What kind of love are you ready for?">
              {OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={selected === o.id}
                  className="yis-card"
                  onClick={() => onSelect(o.id)}
                >
                  <span className="yis-text">
                    <span className="yis-name">{o.name}</span>
                    <span className="yis-desc">{o.description}</span>
                  </span>
                  <span className="yis-radio" aria-hidden="true">
                    <i />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="yis-footer">
          <button type="button" className="yis-continue" disabled={!selected} onClick={onContinue}>
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};

/* ---------- main component ---------- */
export interface YourIntentionsStepsProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  /** Controlled value. Omit to let the component manage its own state. */
  value?: Intention | null;
  defaultValue?: Intention | null;
  onChange?: (value: Intention) => void;
  onBack?: () => void;
  onContinue?: (value: Intention) => void;
  className?: string;
  style?: React.CSSProperties;
}

const YourIntentionsSteps: React.FC<YourIntentionsStepsProps> = ({
  step = 3,
  totalSteps = 11,
  percent = 27,
  value,
  defaultValue = null,
  onChange,
  onBack,
  onContinue,
  className,
  style,
}) => {
  const [inner, setInner] = React.useState<Intention | null>(defaultValue);
  const selected = value !== undefined ? value : inner;

  const select = (id: Intention) => {
    if (value === undefined) setInner(id);
    onChange?.(id);
  };
  const handleContinue = () => {
    if (selected) onContinue?.(selected);
  };

  const shared = { step, totalSteps, percent, selected, onSelect: select, onBack, onContinue: handleContinue };

  return (
    <div className={`yis-root${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <Screen {...shared} align="top" label="Your intentions, part 1" />
      <Screen {...shared} align="bottom" label="Your intentions, part 2" />
    </div>
  );
};

export default YourIntentionsSteps;
