import React from "react";

/**
 * AboutYouStep
 * -------------
 * Independent, dependency-free (React only) component for
 * "Step 8 of 11 – About you".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, textarea, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <AboutYouStep onChange={(text) => console.log(text)} />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--aby-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.aby-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.aby-wrap *, .aby-wrap *::before, .aby-wrap *::after { box-sizing: border-box; }

.aby-root {
  --aby-u: calc(100cqw / 720);
  --aby-pink: #e23d68;
  --aby-ink: #1c1a17;
  --aby-muted: #8a8378;
  --aby-line: #efe7dd;
  --aby-track: #efe7dd;
  --aby-btn: #efeae3;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--aby-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.aby-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.aby-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--aby-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--aby-ink);
}
.aby-back svg { width: ${u(30)}; height: ${u(30)}; }
.aby-titles { flex: 1; min-width: 0; text-align: center; }
.aby-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--aby-pink);
}
.aby-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.aby-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.aby-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.aby-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.aby-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--aby-track);
  overflow: hidden;
}
.aby-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--aby-pink);
}

/* ---------- body ---------- */
.aby-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.aby-body::-webkit-scrollbar { display: none; }

.aby-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--aby-pink);
}
.aby-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(60)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.aby-sub {
  margin: ${u(22)} 0 0;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--aby-muted);
}

.aby-label {
  margin: ${u(52)} 0 ${u(20)};
  font-size: ${u(29)};
  font-weight: 700;
}

.aby-field { position: relative; }
.aby-textarea {
  width: 100%;
  min-height: ${u(258)};
  border: ${u(3)} solid var(--aby-line);
  border-radius: ${u(34)};
  background: #fff;
  font: inherit;
  font-size: ${u(28)};
  line-height: 1.55;
  color: var(--aby-ink);
  padding: ${u(32)} ${u(34)};
  resize: vertical;
}
.aby-textarea::placeholder { color: var(--aby-muted); opacity: 1; }
.aby-textarea:focus {
  outline: none;
  border-color: var(--aby-pink);
  box-shadow: 0 0 0 ${u(4)} rgba(226, 61, 104, 0.15);
}

.aby-count {
  margin-top: ${u(18)};
  text-align: right;
  font-size: ${u(24)};
  color: var(--aby-muted);
}
.aby-count.is-near { color: #c9862c; }
.aby-count.is-at { color: var(--aby-pink); }

.aby-spacer { flex: 1; min-height: ${u(20)}; }

/* ---------- footer ---------- */
.aby-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; text-align: center; }
.aby-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--aby-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.aby-continue:disabled { cursor: not-allowed; }
.aby-continue:not(:disabled) {
  background: var(--aby-pink);
  border-color: var(--aby-pink);
  color: #fff;
}
.aby-skip {
  display: inline-block;
  margin-top: ${u(22)};
  background: none;
  border: 0;
  padding: ${u(6)} ${u(10)};
  font: inherit;
  font-size: ${u(26)};
  font-weight: 500;
  font-style: italic;
  color: var(--aby-ink);
  text-decoration: underline;
  text-underline-offset: ${u(4)};
  cursor: pointer;
}
.aby-continue:focus-visible,
.aby-back:focus-visible,
.aby-skip:focus-visible { outline: ${u(4)} solid var(--aby-pink); outline-offset: ${u(3)}; }

@media (prefers-reduced-motion: reduce) {
  .aby-continue { transition: none; }
}
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);

/* ---------- component ---------- */
export interface AboutYouStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  placeholder?: string;
  maxLength?: number;
  /** Minimum characters required before Continue is enabled. Set 0 to always allow. */
  minLength?: number;
  /** Controlled value. Omit to let the component manage its own state. */
  value?: string;
  defaultValue?: string;
  onChange?: (text: string) => void;
  onBack?: () => void;
  onContinue?: (text: string) => void;
  onSkip?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const AboutYouStep: React.FC<AboutYouStepProps> = ({
  step = 8,
  totalSteps = 11,
  percent = 72,
  placeholder = "Building products by day, planning my next trek by night. Looking for someone equally driven and equally curious…",
  maxLength = 300,
  minLength = 1,
  value,
  defaultValue = "",
  onChange,
  onBack,
  onContinue,
  onSkip,
  className,
  style,
}) => {
  const [inner, setInner] = React.useState(defaultValue);
  const text = value ?? inner;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value.slice(0, maxLength);
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const count = text.length;
  const nearLimit = count >= maxLength * 0.9 && count < maxLength;
  const atLimit = count >= maxLength;
  const ready = count >= minLength;

  const r = 32;
  const c = 2 * Math.PI * r;
  const textareaId = React.useId();

  return (
    <div className={`aby-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="aby-root" aria-label={`Step ${step} of ${totalSteps}: About you`}>
        <div className="aby-header">
          <button type="button" className="aby-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="aby-titles">
            <p className="aby-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="aby-title">About you</h2>
          </div>
          <div className="aby-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="aby-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="aby-body">
          <p className="aby-eyebrow">About you</p>
          <h1 className="aby-h1">Tell us your story.</h1>
          <p className="aby-sub">
            A few honest lines about who you are and what you're looking for. This sits at the top of your profile.
          </p>

          <label className="aby-label" htmlFor={textareaId}>
            About you
          </label>
          <div className="aby-field">
            <textarea
              id={textareaId}
              className="aby-textarea"
              placeholder={placeholder}
              value={text}
              maxLength={maxLength}
              onChange={handleChange}
            />
          </div>
          <p className={`aby-count${atLimit ? " is-at" : nearLimit ? " is-near" : ""}`}>
            {count} / {maxLength}
          </p>

          <div className="aby-spacer" />
        </div>

        <div className="aby-footer">
          <button
            type="button"
            className="aby-continue"
            disabled={!ready}
            onClick={() => onContinue?.(text)}
          >
            Continue
          </button>
          <button type="button" className="aby-skip" onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutYouStep;
