import React from "react";

/**
 * YourPhotosStep
 * ---------------
 * Independent, dependency-free (React only) component for
 * "Step 7 of 11 – Your photos".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, tiles, icons, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <YourPhotosStep minPhotos={2} onChange={(photos) => console.log(photos)} />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--yph-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.yph-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.yph-wrap *, .yph-wrap *::before, .yph-wrap *::after { box-sizing: border-box; }

.yph-root {
  --yph-u: calc(100cqw / 720);
  --yph-pink: #e23d68;
  --yph-ink: #1c1a17;
  --yph-muted: #8a8378;
  --yph-line: #efe7dd;
  --yph-track: #efe7dd;
  --yph-btn: #efeae3;
  --yph-tile: #fdf2ef;
  --yph-tile-line: #f2b9be;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--yph-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.yph-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.yph-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--yph-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--yph-ink);
}
.yph-back svg { width: ${u(30)}; height: ${u(30)}; }
.yph-titles { flex: 1; min-width: 0; text-align: center; }
.yph-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--yph-pink);
}
.yph-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.yph-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.yph-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.yph-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.yph-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--yph-track);
  overflow: hidden;
}
.yph-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--yph-pink);
}

/* ---------- body ---------- */
.yph-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.yph-body::-webkit-scrollbar { display: none; }

.yph-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--yph-pink);
}
.yph-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(58)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.yph-sub {
  margin: ${u(22)} 0 0;
  font-size: ${u(26)};
  line-height: 1.5;
  color: var(--yph-muted);
}

.yph-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${u(20)};
  margin-top: ${u(48)};
}
.yph-tile {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4.4;
  border-radius: ${u(28)};
  border: ${u(3)} dashed var(--yph-tile-line);
  background: var(--yph-tile);
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  display: block;
}
.yph-tile.has-photo { border-style: solid; border-color: var(--yph-line); }
.yph-tile img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.yph-tile input[type="file"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.yph-plus {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: ${u(64)};
  height: ${u(64)};
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 ${u(6)} ${u(16)} rgba(60, 40, 20, 0.1);
  display: grid;
  place-items: center;
  color: var(--yph-pink);
  pointer-events: none;
}
.yph-plus svg { width: ${u(28)}; height: ${u(28)}; }
.yph-main-badge {
  position: absolute;
  top: ${u(16)};
  left: ${u(16)};
  padding: ${u(8)} ${u(16)};
  border-radius: ${u(10)};
  background: rgba(28, 26, 23, 0.75);
  color: #fff;
  font-size: ${u(19)};
  font-weight: 600;
  pointer-events: none;
}
.yph-remove {
  position: absolute;
  top: ${u(14)};
  right: ${u(14)};
  width: ${u(46)};
  height: ${u(46)};
  border-radius: 50%;
  border: none;
  background: rgba(28, 26, 23, 0.65);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;
}
.yph-remove svg { width: ${u(22)}; height: ${u(22)}; }

.yph-status {
  display: flex;
  align-items: center;
  gap: ${u(18)};
  margin-top: ${u(44)};
}
.yph-status-dot {
  flex: none;
  width: ${u(38)};
  height: ${u(38)};
  border-radius: 50%;
  border: ${u(3)} solid #e0d7c8;
  display: grid;
  place-items: center;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.yph-status-dot svg { width: ${u(22)}; height: ${u(22)}; color: #fff; opacity: 0; transition: opacity 0.15s ease; }
.yph-status.is-ready .yph-status-dot { border-color: var(--yph-pink); background: var(--yph-pink); }
.yph-status.is-ready .yph-status-dot svg { opacity: 1; }
.yph-status-text {
  font-size: ${u(26)};
  color: var(--yph-muted);
}
.yph-status-text b { color: var(--yph-ink); font-weight: 700; }

/* ---------- footer ---------- */
.yph-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; }
.yph-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--yph-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.yph-continue:disabled { cursor: not-allowed; }
.yph-continue:not(:disabled) {
  background: var(--yph-pink);
  border-color: var(--yph-pink);
  color: #fff;
}
.yph-continue:focus-visible,
.yph-back:focus-visible,
.yph-tile:focus-within { outline: ${u(4)} solid var(--yph-pink); outline-offset: ${u(3)}; }

@media (prefers-reduced-motion: reduce) {
  .yph-status-dot, .yph-status-dot svg, .yph-continue { transition: none; }
}
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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/* ---------- component ---------- */
export interface PhotoSlot {
  /** Data/object URL used for the preview. */
  url: string;
  /** The original File, when picked from disk. */
  file?: File;
}

export interface YourPhotosStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  /** Total number of slots in the grid. */
  slotCount?: number;
  /** Minimum photos required before Continue is enabled. */
  minPhotos?: number;
  /** Controlled photos, indexed by slot. Omit to let the component manage its own state. */
  value?: (PhotoSlot | null)[];
  onChange?: (photos: (PhotoSlot | null)[]) => void;
  onBack?: () => void;
  onContinue?: (photos: PhotoSlot[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

const YourPhotosStep: React.FC<YourPhotosStepProps> = ({
  step = 7,
  totalSteps = 11,
  percent = 63,
  slotCount = 6,
  minPhotos = 2,
  value,
  onChange,
  onBack,
  onContinue,
  className,
  style,
}) => {
  const [inner, setInner] = React.useState<(PhotoSlot | null)[]>(Array.from({ length: slotCount }, () => null));
  const photos = value ?? inner;

  const setPhotos = (next: (PhotoSlot | null)[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const handlePick = (index: number, file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const next = photos.slice();
    next[index] = { url, file };
    setPhotos(next);
  };

  const handleRemove = (index: number) => {
    const current = photos[index];
    if (current?.url) URL.revokeObjectURL(current.url);
    const next = photos.slice();
    next[index] = null;
    setPhotos(next);
  };

  const filledCount = photos.filter(Boolean).length;
  const ready = filledCount >= minPhotos;
  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div className={`yph-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="yph-root" aria-label={`Step ${step} of ${totalSteps}: Your photos`}>
        <div className="yph-header">
          <button type="button" className="yph-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="yph-titles">
            <p className="yph-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="yph-title">Your photos</h2>
          </div>
          <div className="yph-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="yph-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="yph-body">
          <p className="yph-eyebrow">Your profile</p>
          <h1 className="yph-h1">Add a few photos.</h1>
          <p className="yph-sub">
            Profiles with three or more clear photos get noticed more. Add up to {slotCount} — your first one is
            your main.
          </p>

          <div className="yph-grid">
            {photos.map((photo, i) => {
              const id = `yph-file-${i}`;
              return (
                <div key={i} className={`yph-tile${photo ? " has-photo" : ""}`}>
                  {photo ? (
                    <>
                      <img src={photo.url} alt={`Photo ${i + 1}`} />
                      <button
                        type="button"
                        className="yph-remove"
                        aria-label={`Remove photo ${i + 1}`}
                        onClick={() => handleRemove(i)}
                      >
                        <CloseIcon />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        id={id}
                        type="file"
                        accept="image/*"
                        aria-label={i === 0 ? "Add main photo" : `Add photo ${i + 1}`}
                        onChange={(e) => handlePick(i, e.target.files?.[0])}
                      />
                      <span className="yph-plus" aria-hidden="true">
                        <PlusIcon />
                      </span>
                    </>
                  )}
                  {i === 0 && <span className="yph-main-badge">Main</span>}
                </div>
              );
            })}
          </div>

          <div className={`yph-status${ready ? " is-ready" : ""}`}>
            <span className="yph-status-dot" aria-hidden="true">
              <CheckIcon />
            </span>
            <p className="yph-status-text">
              <b>
                {filledCount} of {slotCount}
              </b>{" "}
              added · need at least {minPhotos}
            </p>
          </div>
        </div>

        <div className="yph-footer">
          <button
            type="button"
            className="yph-continue"
            disabled={!ready}
            onClick={() => onContinue?.(photos.filter((p): p is PhotoSlot => !!p))}
          >
            Continue
          </button>
        </div>
      </section>
    </div>
  );
};

export default YourPhotosStep;
