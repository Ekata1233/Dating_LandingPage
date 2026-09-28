import React from "react";

/**
 * ProfileBasicsSteps
 * ------------------
 * Independent, dependency-free (React only) component showing the two
 * "Step 1 of 11 – The basics" screens stacked one below the other.
 *
 * Responsiveness:
 *  - The root fills 100% of its parent's width and height.
 *  - Each screen is exactly as tall as the parent and as wide as the parent
 *    (the root scrolls vertically to reveal the second screen).
 *  - Every inner size (font, padding, radius, gaps, icons) is expressed in
 *    "design units" where 1 unit = 1/720 of the screen's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <ProfileBasicsSteps />
 *   </div>
 */

// 1 design unit = screen width / 720 (the width of the reference design)
const u = (n: number) => `calc(var(--pbs-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700&display=swap');

.pbs-root {
  --pbs-pink: #e23d68;
  --pbs-ink: #1c1a17;
  --pbs-muted: #7c756b;
  --pbs-line: #efe7dd;
  --pbs-track: #efe7dd;
  --pbs-btn: #efeae3;
  --pbs-bg: #ffffff;

  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
  background: #f3f0eb;
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--pbs-ink);
  box-sizing: border-box;
}
.pbs-root *, .pbs-root *::before, .pbs-root *::after { box-sizing: border-box; }

/* Each wrapper is the size container: 100% of parent's width & height */
.pbs-wrap {
  flex: 0 0 100%;
  width: 100%;
  min-height: 0;
  container-type: inline-size;
}
.pbs-wrap + .pbs-wrap { margin-top: 2px; }

.pbs-screen {
  --pbs-u: calc(100cqw / 720);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--pbs-bg);
  overflow: hidden;
  padding: 0 ${u(30)};
}

/* ---------- header ---------- */
.pbs-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.pbs-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--pbs-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--pbs-ink);
}
.pbs-back svg { width: ${u(30)}; height: ${u(30)}; }
.pbs-titles { flex: 1; min-width: 0; text-align: center; }
.pbs-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pbs-pink);
}
.pbs-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.pbs-ring {
  flex: none;
  position: relative;
  width: ${u(72)};
  height: ${u(72)};
}
.pbs-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.pbs-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}

.pbs-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--pbs-track);
  overflow: hidden;
}
.pbs-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--pbs-pink);
}

/* ---------- body (clipped like a scrolled viewport) ---------- */
.pbs-body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.pbs-body.is-top { justify-content: flex-start; }
.pbs-body.is-bottom { justify-content: flex-end; }
.pbs-content { flex: none; padding: ${u(30)} 0 ${u(24)}; }

.pbs-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pbs-pink);
}
.pbs-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(62)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.pbs-sub {
  margin: ${u(22)} 0 0;
  max-width: 82%;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--pbs-muted);
}

.pbs-field { margin-top: ${u(52)}; }
.pbs-field.is-first { margin-top: ${u(64)}; }
.pbs-label-row {
  display: flex;
  align-items: center;
  gap: ${u(18)};
  margin-bottom: ${u(18)};
}
.pbs-label {
  font-size: ${u(23)};
  color: var(--pbs-ink);
  line-height: 1.2;
}
.pbs-label.is-caps { text-transform: uppercase; }
.pbs-badge {
  padding: ${u(8)} ${u(16)};
  border-radius: ${u(10)};
  background: #fdeaf0;
  color: var(--pbs-pink);
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.pbs-control {
  position: relative;
  width: 100%;
  height: ${u(102)};
  border: ${u(3)} solid var(--pbs-line);
  border-radius: ${u(32)};
  background: #fff;
  display: flex;
  align-items: center;
}
.pbs-control input,
.pbs-control select {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: ${u(29)};
  color: var(--pbs-ink);
  padding: 0 ${u(66)} 0 ${u(36)};
  border-radius: inherit;
  appearance: none;
  -webkit-appearance: none;
  text-overflow: ellipsis;
}
.pbs-control input::placeholder { color: var(--pbs-muted); opacity: 1; }
.pbs-control select:invalid { color: var(--pbs-muted); }
.pbs-control select { cursor: pointer; }
.pbs-control:focus-within {
  border-color: var(--pbs-pink);
  box-shadow: 0 0 0 ${u(4)} rgba(226, 61, 104, 0.15);
}
.pbs-icon {
  position: absolute;
  right: ${u(30)};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: grid;
  place-items: center;
}
.pbs-icon.is-cal { color: var(--pbs-pink); }
.pbs-icon.is-cal svg { width: ${u(40)}; height: ${u(40)}; }
.pbs-icon.is-chev { color: var(--pbs-muted); }
.pbs-icon.is-chev svg { width: ${u(30)}; height: ${u(30)}; }

.pbs-hint {
  display: flex;
  align-items: center;
  gap: ${u(14)};
  margin: ${u(22)} 0 0;
  font-size: ${u(23)};
  color: var(--pbs-muted);
  line-height: 1.4;
}
.pbs-hint svg { flex: none; width: ${u(24)}; height: ${u(24)}; }

/* ---------- footer ---------- */
.pbs-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; }
.pbs-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--pbs-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
}
.pbs-continue:enabled:hover { filter: brightness(0.98); }
.pbs-continue:focus-visible,
.pbs-back:focus-visible {
  outline: ${u(4)} solid var(--pbs-pink);
  outline-offset: ${u(3)};
}
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 9l7 7 7-7" />
  </svg>
);
const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7 2a1 1 0 011 1v1h8V3a1 1 0 112 0v1h1a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zM5 9v11h14V9H5z" />
    <g>
      {[7.5, 11, 14.5].map((x) =>
        [12, 15, 18].map((y) => <rect key={`${x}-${y}`} x={x - 0.9} y={y - 0.6} width="1.8" height="1.4" rx="0.3" />)
      )}
    </g>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 118 0v3" />
  </svg>
);

/* ---------- small building blocks ---------- */
const Ring: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <div className="pbs-ring" role="img" aria-label={`${percent}% complete`}>
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
  );
};

const Header: React.FC<{ step: number; total: number; percent: number }> = ({ step, total, percent }) => (
  <>
    <div className="pbs-header">
      <button type="button" className="pbs-back" aria-label="Go back">
        <BackIcon />
      </button>
      <div className="pbs-titles">
        <p className="pbs-step">
          Step {step} of {total}
        </p>
        <h2 className="pbs-title">The basics</h2>
      </div>
      <Ring percent={percent} />
    </div>
    <div className="pbs-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <i style={{ width: `${(step / total) * 100 * 0.99}%` }} />
    </div>
  </>
);

const SelectField: React.FC<{
  label: string;
  placeholder: string;
  options: string[];
  optional?: boolean;
  hint?: string;
  first?: boolean;
}> = ({ label, placeholder, options, optional, hint, first }) => {
  const id = React.useId();
  return (
    <div className={`pbs-field${first ? " is-first" : ""}`}>
      <div className="pbs-label-row">
        <label className="pbs-label is-caps" htmlFor={id}>
          {label}
        </label>
        {optional && <span className="pbs-badge">Optional</span>}
      </div>
      <div className="pbs-control">
        <select id={id} defaultValue="" required>
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <span className="pbs-icon is-chev">
          <ChevronIcon />
        </span>
      </div>
      {hint && (
        <p className="pbs-hint">
          <LockIcon />
          {hint}
        </p>
      )}
    </div>
  );
};

const TextField: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  hint?: string;
  first?: boolean;
}> = ({ label, placeholder, type = "text", defaultValue, icon, hint, first }) => {
  const id = React.useId();
  return (
    <div className={`pbs-field${first ? " is-first" : ""}`}>
      <div className="pbs-label-row">
        <label className="pbs-label" htmlFor={id}>
          {label}
        </label>
      </div>
      <div className="pbs-control">
        <input id={id} type={type} placeholder={placeholder} defaultValue={defaultValue} />
        {icon && <span className="pbs-icon is-cal">{icon}</span>}
      </div>
      {hint && <p className="pbs-hint" style={{ marginTop: u(22) }}>{hint}</p>}
    </div>
  );
};

const Footer: React.FC = () => (
  <div className="pbs-footer">
    <button type="button" className="pbs-continue">
      Continue
    </button>
  </div>
);

const HEIGHTS = Array.from({ length: 41 }, (_, i) => {
  const cm = 140 + i * 2;
  return `${cm} cm`;
});
const GENDERS = ["Woman", "Man", "Non-binary", "Prefer to self-describe"];
const ORIENTATIONS = ["Straight", "Gay", "Lesbian", "Bisexual", "Other"];

/* ---------- main component ---------- */
export interface ProfileBasicsStepsProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  className?: string;
  style?: React.CSSProperties;
}

const ProfileBasicsSteps: React.FC<ProfileBasicsStepsProps> = ({
  step = 1,
  totalSteps = 11,
  percent = 9,
  className,
  style,
}) => {
  return (
    <div className={`pbs-root${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>

      {/* ---------- Screen 1 ---------- */}
      <div className="pbs-wrap">
        <section className="pbs-screen" aria-label="Profile basics, part 1">
          <Header step={step} total={totalSteps} percent={percent} />
          <div className="pbs-body is-top">
            <div className="pbs-content">
              <p className="pbs-eyebrow">About you</p>
              <h1 className="pbs-h1">Let's set up your profile.</h1>
              <p className="pbs-sub">A few basics to get you started — you can refine all of this later.</p>

              <TextField first label="Full name" placeholder="Full name" defaultValue="Sallu Ansari" />
              <TextField label="Email ID" type="email" placeholder="you@email.com" defaultValue="sallu@email.com" />
              <TextField
                label="Date of birth"
                placeholder="DD / MM / YYYY"
                icon={<CalendarIcon />}
                hint="We only show your age — never the full date."
              />
              <SelectField label="Height" placeholder="Select height" options={HEIGHTS} />
              <SelectField label="Gender" placeholder="Select gender" options={GENDERS} />
            </div>
          </div>
          <Footer />
        </section>
      </div>

      {/* ---------- Screen 2 (scrolled state) ---------- */}
      <div className="pbs-wrap">
        <section className="pbs-screen" aria-label="Profile basics, part 2">
          <Header step={step} total={totalSteps} percent={percent} />
          <div className="pbs-body is-bottom">
            <div className="pbs-content">
              <TextField label="Full name" placeholder="Full name" defaultValue="Sallu Ansari" />
              <TextField label="Email ID" type="email" placeholder="you@email.com" defaultValue="sallu@email.com" />
              <TextField
                label="Date of birth"
                placeholder="DD / MM / YYYY"
                icon={<CalendarIcon />}
                hint="We only show your age — never the full date."
              />
              <SelectField label="Height" placeholder="Select height" options={HEIGHTS} />
              <SelectField label="Gender" placeholder="Select gender" options={GENDERS} />
              <SelectField
                label="Sexual orientation"
                placeholder="Select orientation"
                options={ORIENTATIONS}
                optional
                hint="We use this to show you relevant matches."
              />
            </div>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );
};

export default ProfileBasicsSteps;
