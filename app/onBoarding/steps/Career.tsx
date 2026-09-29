import React from "react";

/**
 * CareerAmbitionStep
 * -------------------
 * Independent, dependency-free (React only) component for
 * "Step 5 of 11 – Career & ambition".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, fields, icons, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <CareerAmbitionStep />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--cab-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.cab-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.cab-wrap *, .cab-wrap *::before, .cab-wrap *::after { box-sizing: border-box; }

.cab-root {
  --cab-u: calc(100cqw / 720);
  --cab-pink: #e23d68;
  --cab-ink: #1c1a17;
  --cab-muted: #8a8378;
  --cab-line: #efe7dd;
  --cab-track: #efe7dd;
  --cab-btn: #efeae3;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--cab-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.cab-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.cab-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--cab-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--cab-ink);
}
.cab-back svg { width: ${u(30)}; height: ${u(30)}; }
.cab-titles { flex: 1; min-width: 0; text-align: center; }
.cab-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cab-pink);
}
.cab-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.cab-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.cab-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.cab-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.cab-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--cab-track);
  overflow: hidden;
}
.cab-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--cab-pink);
}

/* ---------- body ---------- */
.cab-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.cab-body::-webkit-scrollbar { display: none; }

.cab-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--cab-pink);
}
.cab-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(56)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.cab-sub {
  margin: ${u(20)} 0 0;
  font-size: ${u(25)};
  line-height: 1.5;
  color: var(--cab-muted);
}

/* section headings */
.cab-section-head {
  display: flex;
  align-items: center;
  gap: ${u(16)};
  margin-top: ${u(56)};
  margin-bottom: ${u(28)};
}
.cab-section-head.is-first { margin-top: ${u(50)}; }
.cab-section-emoji { font-size: ${u(34)}; line-height: 1; }
.cab-section-name {
  font-size: ${u(30)};
  font-weight: 700;
}

/* fields */
.cab-field { margin-top: ${u(24)}; }
.cab-field.is-first { margin-top: 0; }
.cab-control {
  position: relative;
  width: 100%;
  height: ${u(100)};
  border: ${u(3)} solid var(--cab-line);
  border-radius: ${u(30)};
  background: #fff;
  display: flex;
  align-items: center;
}
.cab-control input,
.cab-control select {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: ${u(28)};
  color: var(--cab-ink);
  padding: 0 ${u(36)};
  border-radius: inherit;
  appearance: none;
  -webkit-appearance: none;
  text-overflow: ellipsis;
}
.cab-control.has-icon input,
.cab-control.has-icon select { padding-right: ${u(66)}; }
.cab-control input::placeholder { color: var(--cab-muted); opacity: 1; }
.cab-control select:invalid { color: var(--cab-muted); }
.cab-control select { cursor: pointer; }
.cab-control:focus-within {
  border-color: var(--cab-pink);
  box-shadow: 0 0 0 ${u(4)} rgba(226, 61, 104, 0.15);
}
.cab-icon {
  position: absolute;
  right: ${u(30)};
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: grid;
  place-items: center;
}
.cab-icon.is-cal { color: var(--cab-pink); }
.cab-icon.is-cal svg { width: ${u(38)}; height: ${u(38)}; }
.cab-icon.is-chev { color: var(--cab-muted); }
.cab-icon.is-chev svg { width: ${u(30)}; height: ${u(30)}; }

/* ---------- footer ---------- */
.cab-footer { flex: none; padding: ${u(16)} 0 ${u(28)}; text-align: center; }
.cab-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--cab-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
}
.cab-skip {
  display: inline-block;
  margin-top: ${u(22)};
  background: none;
  border: 0;
  padding: ${u(6)} ${u(10)};
  font: inherit;
  font-size: ${u(26)};
  font-weight: 500;
  font-style: italic;
  color: var(--cab-ink);
  text-decoration: underline;
  text-underline-offset: ${u(4)};
  cursor: pointer;
}
.cab-continue:focus-visible,
.cab-back:focus-visible,
.cab-skip:focus-visible { outline: ${u(4)} solid var(--cab-pink); outline-offset: ${u(3)}; }
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
  </svg>
);

/* ---------- small building blocks ---------- */
const Ring: React.FC<{ percent: number }> = ({ percent }) => {
  const r = 32;
  const c = 2 * Math.PI * r;
  return (
    <div className="cab-ring" role="img" aria-label={`${percent}% complete`}>
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

const TextField: React.FC<{
  label: string;
  placeholder: string;
  type?: string;
  defaultValue?: string;
  icon?: React.ReactNode;
  first?: boolean;
}> = ({ label, placeholder, type = "text", defaultValue, icon, first }) => (
  <div className={`cab-field${first ? " is-first" : ""}`}>
    <div className={`cab-control${icon ? " has-icon" : ""}`}>
      <input aria-label={label} type={type} placeholder={placeholder} defaultValue={defaultValue} />
      {icon && <span className="cab-icon is-cal">{icon}</span>}
    </div>
  </div>
);

const SelectField: React.FC<{
  label: string;
  placeholder: string;
  options: string[];
  first?: boolean;
}> = ({ label, placeholder, options, first }) => (
  <div className={`cab-field${first ? " is-first" : ""}`}>
    <div className="cab-control has-icon">
      <select aria-label={label} defaultValue="" required>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span className="cab-icon is-chev">
        <ChevronIcon />
      </span>
    </div>
  </div>
);

const EDUCATION_LEVELS = [
  "High school",
  "Some college",
  "Associate degree",
  "Bachelor's degree",
  "Master's degree",
  "Doctorate",
];
const PROFESSIONS = [
  "Student",
  "Engineering & tech",
  "Design & creative",
  "Business & finance",
  "Healthcare",
  "Education",
  "Other",
];

/* ---------- main component ---------- */
export interface CareerAmbitionStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  onBack?: () => void;
  onContinue?: () => void;
  onSkip?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const CareerAmbitionStep: React.FC<CareerAmbitionStepProps> = ({
  step = 5,
  totalSteps = 11,
  percent = 45,
  onBack,
  onContinue,
  onSkip,
  className,
  style,
}) => {
  return (
    <div className={`cab-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="cab-root" aria-label={`Step ${step} of ${totalSteps}: Career & ambition`}>
        <div className="cab-header">
          <button type="button" className="cab-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="cab-titles">
            <p className="cab-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="cab-title">Career &amp; ambition</h2>
          </div>
          <Ring percent={percent} />
        </div>
        <div className="cab-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="cab-body">
          <p className="cab-eyebrow">Career &amp; ambition</p>
          <h1 className="cab-h1">Education &amp; ambition.</h1>
          <p className="cab-sub">
            What you've studied, what you do, and where you're headed — it helps us match you with people on a
            similar path.
          </p>

          <div className="cab-section-head is-first">
            <span className="cab-section-emoji" aria-hidden="true">
              🎓
            </span>
            <span className="cab-section-name">Education</span>
          </div>
          <TextField first label="College / institution name" placeholder="College / institution name" />
          <SelectField label="Highest education" placeholder="Highest education" options={EDUCATION_LEVELS} />
          <TextField label="Degree / course" placeholder="Degree / course · e.g. B.Tech Computer" />
          <TextField label="Graduation year" placeholder="2026" defaultValue="2026" icon={<CalendarIcon />} />

          <div className="cab-section-head">
            <span className="cab-section-emoji" aria-hidden="true">
              💼
            </span>
            <span className="cab-section-name">Work</span>
          </div>
          <SelectField first label="Profession" placeholder="Profession · select" options={PROFESSIONS} />
        </div>

        <div className="cab-footer">
          <button type="button" className="cab-continue" onClick={onContinue}>
            Continue
          </button>
          <button type="button" className="cab-skip" onClick={onSkip}>
            Skip for now
          </button>
        </div>
      </section>
    </div>
  );
};

export default CareerAmbitionStep;
