import React from "react";

/**
 * PromptsStep
 * ------------
 * Independent, dependency-free (React only) component for
 * "Step 9 of 11 – Prompts".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, cards, icons, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <PromptsStep onChange={(answers) => console.log(answers)} />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--pr-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.pr-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.pr-wrap *, .pr-wrap *::before, .pr-wrap *::after { box-sizing: border-box; }

.pr-root {
  --pr-u: calc(100cqw / 720);
  --pr-pink: #e23d68;
  --pr-ink: #1c1a17;
  --pr-muted: #8a8378;
  --pr-line: #efe7dd;
  --pr-track: #efe7dd;
  --pr-btn: #efeae3;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--pr-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* ---------- header ---------- */
.pr-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.pr-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--pr-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--pr-ink);
}
.pr-back svg { width: ${u(30)}; height: ${u(30)}; }
.pr-titles { flex: 1; min-width: 0; text-align: center; }
.pr-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--pr-pink);
}
.pr-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.pr-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.pr-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.pr-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.pr-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--pr-track);
  overflow: hidden;
}
.pr-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--pr-pink);
}

/* ---------- body ---------- */
.pr-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.pr-body::-webkit-scrollbar { display: none; }

.pr-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--pr-pink);
}
.pr-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(58)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.pr-sub {
  margin: ${u(22)} 0 0;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--pr-muted);
}

.pr-slots {
  display: flex;
  flex-direction: column;
  gap: ${u(28)};
  margin-top: ${u(48)};
}

/* empty "choose a prompt" slot */
.pr-slot-empty {
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${u(24)};
  padding: ${u(26)} ${u(30)};
  border: ${u(3)} dashed #f4c2cf;
  border-radius: ${u(30)};
  background: #fff;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.pr-slot-plus {
  flex: none;
  width: ${u(64)};
  height: ${u(64)};
  border-radius: 50%;
  background: var(--pr-pink);
  color: #fff;
  display: grid;
  place-items: center;
}
.pr-slot-plus svg { width: ${u(28)}; height: ${u(28)}; }
.pr-slot-label { font-size: ${u(29)}; font-weight: 700; }

/* filled prompt card */
.pr-card {
  border: ${u(3)} solid var(--pr-line);
  border-radius: ${u(32)};
  background: #fff;
  padding: ${u(30)};
}
.pr-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${u(16)};
}
.pr-card-question {
  font-size: ${u(27)};
  font-weight: 700;
  line-height: 1.35;
  color: var(--pr-pink);
}
.pr-card-actions { display: flex; gap: ${u(12)}; flex: none; }
.pr-icon-btn {
  width: ${u(56)};
  height: ${u(56)};
  border-radius: 50%;
  border: ${u(2)} solid var(--pr-line);
  background: #fff;
  display: grid;
  place-items: center;
  color: var(--pr-muted);
  cursor: pointer;
}
.pr-icon-btn svg { width: ${u(26)}; height: ${u(26)}; }
.pr-icon-btn:hover { color: var(--pr-pink); border-color: #f4c2cf; }

.pr-card-textarea {
  width: 100%;
  min-height: ${u(150)};
  margin-top: ${u(22)};
  border: ${u(3)} solid var(--pr-line);
  border-radius: ${u(24)};
  background: #fff;
  font: inherit;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--pr-ink);
  padding: ${u(24)} ${u(28)};
  resize: vertical;
}
.pr-card-textarea::placeholder { color: var(--pr-muted); opacity: 1; }
.pr-card-textarea:focus {
  outline: none;
  border-color: var(--pr-pink);
  box-shadow: 0 0 0 ${u(4)} rgba(226, 61, 104, 0.15);
}
.pr-card-count {
  margin-top: ${u(14)};
  text-align: right;
  font-size: ${u(22)};
  color: var(--pr-muted);
}

.pr-add-more {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: ${u(14)};
  margin-top: ${u(8)};
  padding: ${u(18)} ${u(28)};
  border: ${u(2)} dashed #e0d7c8;
  border-radius: 999px;
  background: #fff;
  font: inherit;
  font-size: ${u(24)};
  font-weight: 600;
  color: var(--pr-muted);
  cursor: pointer;
}
.pr-add-more svg { width: ${u(24)}; height: ${u(24)}; }
.pr-add-more:hover { color: var(--pr-pink); border-color: #f4c2cf; }

/* prompt picker sheet */
.pr-sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(28, 26, 23, 0.35);
  display: flex;
  align-items: flex-end;
  z-index: 5;
}
.pr-sheet {
  width: 100%;
  max-height: 78%;
  background: #fff;
  border-radius: ${u(36)} ${u(36)} 0 0;
  box-shadow: 0 -${u(10)} ${u(30)} rgba(28, 26, 23, 0.18);
  display: flex;
  flex-direction: column;
  padding: ${u(30)};
}
.pr-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: none;
}
.pr-sheet-title { font-size: ${u(30)}; font-weight: 700; }
.pr-sheet-close {
  width: ${u(60)};
  height: ${u(60)};
  border-radius: 50%;
  border: ${u(2)} solid var(--pr-line);
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  color: var(--pr-ink);
}
.pr-sheet-close svg { width: ${u(26)}; height: ${u(26)}; }
.pr-sheet-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-top: ${u(24)};
  display: flex;
  flex-direction: column;
  gap: ${u(4)};
}
.pr-sheet-item {
  width: 100%;
  text-align: left;
  padding: ${u(26)} ${u(10)};
  border: 0;
  border-bottom: ${u(2)} solid var(--pr-line);
  background: none;
  font: inherit;
  font-size: ${u(27)};
  color: var(--pr-ink);
  cursor: pointer;
}
.pr-sheet-item:hover { color: var(--pr-pink); }
.pr-sheet-item:disabled { color: var(--pr-muted); cursor: not-allowed; }

/* ---------- footer ---------- */
.pr-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; text-align: center; }
.pr-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--pr-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.pr-continue:not(:disabled) {
  background: var(--pr-pink);
  border-color: var(--pr-pink);
  color: #fff;
}
.pr-skip {
  display: inline-block;
  margin-top: ${u(22)};
  background: none;
  border: 0;
  padding: ${u(6)} ${u(10)};
  font: inherit;
  font-size: ${u(26)};
  font-weight: 500;
  font-style: italic;
  color: var(--pr-ink);
  text-decoration: underline;
  text-underline-offset: ${u(4)};
  cursor: pointer;
}
.pr-continue:focus-visible,
.pr-back:focus-visible,
.pr-skip:focus-visible,
.pr-icon-btn:focus-visible,
.pr-add-more:focus-visible,
.pr-sheet-close:focus-visible,
.pr-sheet-item:focus-visible { outline: ${u(4)} solid var(--pr-pink); outline-offset: ${u(3)}; }
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);

/* ---------- data ---------- */
const DEFAULT_PROMPTS = [
  "A perfect Sunday looks like…",
  "The way to win me over is…",
  "I'm convinced that…",
  "My most controversial opinion is…",
  "Two truths and a lie…",
  "I get way too competitive about…",
  "The last trip that changed me…",
  "You should NOT go out with me if…",
];

interface Answer {
  prompt: string;
  answer: string;
}

/* ---------- component ---------- */
export interface PromptsStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  prompts?: string[];
  maxSlots?: number;
  maxLength?: number;
  /** Controlled value. Omit to let the component manage its own state. */
  value?: Answer[];
  onChange?: (answers: Answer[]) => void;
  onBack?: () => void;
  onContinue?: (answers: Answer[]) => void;
  onSkip?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const PromptsStep: React.FC<PromptsStepProps> = ({
  step = 9,
  totalSteps = 11,
  percent = 81,
  prompts = DEFAULT_PROMPTS,
  maxSlots = 3,
  maxLength = 250,
  value,
  onChange,
  onBack,
  onContinue,
  onSkip,
  className,
  style,
}) => {
  const [inner, setInner] = React.useState<Answer[]>([]);
  const answers = value ?? inner;
  const [pickerFor, setPickerFor] = React.useState<number | null>(null); // index being edited, or "new" via answers.length

  const setAnswers = (next: Answer[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const chosenPrompts = new Set(answers.map((a) => a.prompt));

  const openPickerForNew = () => setPickerFor(answers.length);
  const openPickerToChange = (index: number) => setPickerFor(index);
  const closePicker = () => setPickerFor(null);

  const choosePrompt = (prompt: string) => {
    if (pickerFor === null) return;
    const next = answers.slice();
    if (pickerFor < next.length) {
      next[pickerFor] = { ...next[pickerFor], prompt };
    } else {
      next.push({ prompt, answer: "" });
    }
    setAnswers(next);
    closePicker();
  };

  const updateAnswer = (index: number, text: string) => {
    const next = answers.slice();
    next[index] = { ...next[index], answer: text.slice(0, maxLength) };
    setAnswers(next);
  };

  const removeAnswer = (index: number) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const r = 32;
  const c = 2 * Math.PI * r;
  const canAddMore = answers.length < maxSlots;

  return (
    <div className={`pr-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="pr-root" aria-label={`Step ${step} of ${totalSteps}: Prompts`}>
        <div className="pr-header">
          <button type="button" className="pr-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="pr-titles">
            <p className="pr-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="pr-title">Prompts</h2>
          </div>
          <div className="pr-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="pr-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="pr-body">
          <p className="pr-eyebrow">Optional</p>
          <h1 className="pr-h1">Add a prompt or two.</h1>
          <p className="pr-sub">A little personality goes a long way. Pick a prompt you like and answer it your way.</p>

          <div className="pr-slots">
            {answers.map((a, i) => (
              <div className="pr-card" key={i}>
                <div className="pr-card-head">
                  <p className="pr-card-question">{a.prompt}</p>
                  <div className="pr-card-actions">
                    <button
                      type="button"
                      className="pr-icon-btn"
                      aria-label="Change prompt"
                      onClick={() => openPickerToChange(i)}
                    >
                      <PencilIcon />
                    </button>
                    <button
                      type="button"
                      className="pr-icon-btn"
                      aria-label="Remove prompt"
                      onClick={() => removeAnswer(i)}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                <textarea
                  className="pr-card-textarea"
                  placeholder="Your answer…"
                  value={a.answer}
                  maxLength={maxLength}
                  onChange={(e) => updateAnswer(i, e.target.value)}
                />
                <p className="pr-card-count">
                  {a.answer.length} / {maxLength}
                </p>
              </div>
            ))}

            {answers.length === 0 && (
              <button type="button" className="pr-slot-empty" onClick={openPickerForNew}>
                <span className="pr-slot-plus" aria-hidden="true">
                  <PlusIcon />
                </span>
                <span className="pr-slot-label">Choose a prompt</span>
              </button>
            )}

            {answers.length > 0 && canAddMore && (
              <button type="button" className="pr-add-more" onClick={openPickerForNew}>
                <PlusIcon />
                Add another prompt
              </button>
            )}
          </div>
        </div>

        <div className="pr-footer">
          <button type="button" className="pr-continue" onClick={() => onContinue?.(answers)}>
            Continue
          </button>
          <button type="button" className="pr-skip" onClick={onSkip}>
            Skip for now
          </button>
        </div>

        {pickerFor !== null && (
          <div className="pr-sheet-backdrop" onClick={closePicker}>
            <div className="pr-sheet" role="dialog" aria-modal="true" aria-label="Choose a prompt" onClick={(e) => e.stopPropagation()}>
              <div className="pr-sheet-head">
                <span className="pr-sheet-title">Choose a prompt</span>
                <button type="button" className="pr-sheet-close" aria-label="Close" onClick={closePicker}>
                  <CloseIcon />
                </button>
              </div>
              <div className="pr-sheet-list">
                {prompts.map((p) => {
                  const currentPrompt = pickerFor < answers.length ? answers[pickerFor].prompt : null;
                  const taken = chosenPrompts.has(p) && p !== currentPrompt;
                  return (
                    <button
                      key={p}
                      type="button"
                      className="pr-sheet-item"
                      disabled={taken}
                      onClick={() => choosePrompt(p)}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default PromptsStep;
