import React from "react";

/**
 * LocationStep
 * -------------
 * Independent, dependency-free (React only) component for
 * "Step 10 of 11 – Location".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, map card, toggle, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <LocationStep city="Hadapsar, Pune, India" nearbyCount={240} />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--loc-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.loc-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.loc-wrap *, .loc-wrap *::before, .loc-wrap *::after { box-sizing: border-box; }

.loc-root {
  --loc-u: calc(100cqw / 720);
  --loc-pink: #e23d68;
  --loc-ink: #1c1a17;
  --loc-muted: #8a8378;
  --loc-line: #efe7dd;
  --loc-track: #efe7dd;
  --loc-btn: #efeae3;
  --loc-green: #34c759;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--loc-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.loc-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.loc-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--loc-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--loc-ink);
}
.loc-back svg { width: ${u(30)}; height: ${u(30)}; }
.loc-titles { flex: 1; min-width: 0; text-align: center; }
.loc-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--loc-pink);
}
.loc-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.loc-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.loc-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.loc-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.loc-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--loc-track);
  overflow: hidden;
}
.loc-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--loc-pink);
}

/* ---------- body ---------- */
.loc-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.loc-body::-webkit-scrollbar { display: none; }

.loc-eyebrow {
  margin: ${u(8)} 0 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--loc-pink);
}
.loc-h1 {
  margin: ${u(18)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(58)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}
.loc-sub {
  margin: ${u(22)} 0 0;
  font-size: ${u(27)};
  line-height: 1.5;
  color: var(--loc-muted);
}

.loc-label {
  margin: ${u(48)} 0 ${u(18)};
  font-size: ${u(29)};
  font-weight: 700;
}
.loc-city-field {
  width: 100%;
  height: ${u(104)};
  display: flex;
  align-items: center;
  border: ${u(3)} solid var(--loc-line);
  border-radius: ${u(30)};
  background: #fff;
  padding: 0 ${u(34)};
}
.loc-city-field input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: ${u(29)};
  font-weight: 600;
  color: var(--loc-ink);
}
.loc-city-field:focus-within {
  border-color: var(--loc-pink);
  box-shadow: 0 0 0 ${u(4)} rgba(226, 61, 104, 0.15);
}

/* map card */
.loc-map {
  position: relative;
  margin-top: ${u(30)};
  width: 100%;
  aspect-ratio: 690 / 340;
  border-radius: ${u(30)};
  border: ${u(2)} solid var(--loc-line);
  overflow: hidden;
  background: #f2ecdf;
}
.loc-map svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.loc-map-pin {
  position: absolute;
  top: 48%;
  left: 50%;
  transform: translate(-50%, -100%);
  width: ${u(56)};
  height: ${u(56)};
  color: var(--loc-pink);
  filter: drop-shadow(0 ${u(6)} ${u(8)} rgba(226, 61, 104, 0.35));
}
.loc-map-badge {
  position: absolute;
  left: ${u(22)};
  bottom: ${u(22)};
  display: inline-flex;
  align-items: center;
  gap: ${u(12)};
  padding: ${u(16)} ${u(24)};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 ${u(6)} ${u(16)} rgba(28, 26, 23, 0.12);
  font-size: ${u(24)};
  font-weight: 600;
  color: var(--loc-ink);
}
.loc-map-badge svg { width: ${u(24)}; height: ${u(24)}; color: var(--loc-pink); flex: none; }

/* toggle card */
.loc-toggle-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(24)};
  margin-top: ${u(30)};
  padding: ${u(30)};
  border: ${u(3)} solid var(--loc-line);
  border-radius: ${u(30)};
  background: #fff;
}
.loc-toggle-text { min-width: 0; }
.loc-toggle-title { font-size: ${u(27)}; font-weight: 700; }
.loc-toggle-sub { margin-top: ${u(6)}; font-size: ${u(23)}; color: var(--loc-muted); }

.loc-switch {
  flex: none;
  position: relative;
  width: ${u(108)};
  height: ${u(58)};
  border-radius: 999px;
  border: none;
  background: #ddd6c8;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.loc-switch.is-on { background: var(--loc-green); }
.loc-switch i {
  position: absolute;
  top: ${u(6)};
  left: ${u(6)};
  width: ${u(46)};
  height: ${u(46)};
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 ${u(3)} ${u(8)} rgba(28, 26, 23, 0.25);
  transition: transform 0.2s ease;
}
.loc-switch.is-on i { transform: translateX(calc(${u(108)} - ${u(58)})); }

/* ---------- footer ---------- */
.loc-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; }
.loc-continue {
  width: 100%;
  height: ${u(94)};
  border: ${u(3)} solid #e6dfd5;
  border-radius: ${u(28)};
  background: var(--loc-btn);
  color: #5c564e;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${u(14)};
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.loc-continue:disabled { cursor: not-allowed; }
.loc-continue:not(:disabled) {
  background: var(--loc-pink);
  border-color: var(--loc-pink);
  color: #fff;
}
.loc-continue:focus-visible,
.loc-back:focus-visible,
.loc-switch:focus-visible { outline: ${u(4)} solid var(--loc-pink); outline-offset: ${u(3)}; }

.loc-spinner {
  width: ${u(14)};
  height: ${u(14)};
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  animation: loc-pulse 1s ease-in-out infinite;
}
.loc-spinner:nth-child(2) { animation-delay: 0.15s; }
.loc-spinner:nth-child(3) { animation-delay: 0.3s; }
@keyframes loc-pulse {
  0%, 80%, 100% { opacity: 0.25; transform: scale(0.85); }
  40% { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .loc-switch i, .loc-continue { transition: none; }
  .loc-spinner { animation: none; }
}
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);
const PinSmallIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8zm0 11a3 3 0 110-6 3 3 0 010 6z" />
  </svg>
);

/* decorative, non-geographic map background */
const MapBackground: React.FC = () => (
  <svg viewBox="0 0 690 340" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="690" height="340" fill="#f2ecdf" />
    <rect x="0" y="0" width="690" height="340" fill="#eee6d6" opacity="0.6" />
    <path d="M-20 260 L200 180 L340 220 L520 120 L720 160" stroke="#f2b563" strokeWidth="10" fill="none" opacity="0.55" />
    <path d="M-20 60 L180 140 L360 60 L560 150 L720 90" stroke="#f2b563" strokeWidth="7" fill="none" opacity="0.45" />
    <path d="M120 -20 L180 360" stroke="#e88a4a" strokeWidth="14" fill="none" opacity="0.5" />
    <path d="M420 -20 L480 360" stroke="#e88a4a" strokeWidth="10" fill="none" opacity="0.4" />
    <path d="M-20 200 L720 260" stroke="#d9d0bd" strokeWidth="3" fill="none" />
    <path d="M-20 40 L720 20" stroke="#d9d0bd" strokeWidth="3" fill="none" />
    <circle cx="590" cy="50" r="60" fill="#d8e8c8" opacity="0.7" />
    <circle cx="60" cy="120" r="50" fill="#f3c9d1" opacity="0.5" />
    <circle cx="345" cy="170" r="180" fill="#fbe2e8" opacity="0.35" />
  </svg>
);

/* ---------- component ---------- */
export interface LocationStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  city?: string;
  onCityChange?: (city: string) => void;
  nearbyCount?: number;
  useCurrentLocation?: boolean;
  onUseCurrentLocationChange?: (on: boolean) => void;
  loading?: boolean;
  onBack?: () => void;
  onContinue?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const LocationStep: React.FC<LocationStepProps> = ({
  step = 10,
  totalSteps = 11,
  percent = 90,
  city: cityProp,
  onCityChange,
  nearbyCount = 240,
  useCurrentLocation: useCurrentLocationProp,
  onUseCurrentLocationChange,
  loading = false,
  onBack,
  onContinue,
  className,
  style,
}) => {
  const [cityInner, setCityInner] = React.useState("Hadapsar, Pune, India");
  const city = cityProp ?? cityInner;

  const [toggleInner, setToggleInner] = React.useState(true);
  const useCurrentLocation = useCurrentLocationProp ?? toggleInner;

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (cityProp === undefined) setCityInner(e.target.value);
    onCityChange?.(e.target.value);
  };

  const toggle = () => {
    const next = !useCurrentLocation;
    if (useCurrentLocationProp === undefined) setToggleInner(next);
    onUseCurrentLocationChange?.(next);
  };

  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div className={`loc-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="loc-root" aria-label={`Step ${step} of ${totalSteps}: Location`}>
        <div className="loc-header">
          <button type="button" className="loc-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="loc-titles">
            <p className="loc-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="loc-title">Location</h2>
          </div>
          <div className="loc-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="loc-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="loc-body">
          <p className="loc-eyebrow">Nearby</p>
          <h1 className="loc-h1">Where are you based?</h1>
          <p className="loc-sub">
            We use this to show you people in your city. Only your city is ever shown — never your exact location.
          </p>

          <label className="loc-label" htmlFor="loc-city">
            City
          </label>
          <div className="loc-city-field">
            <input
              id="loc-city"
              type="text"
              value={city}
              onChange={handleCityChange}
              disabled={useCurrentLocation}
              placeholder="Enter your city"
              aria-label="City"
            />
          </div>

          <div className="loc-map" role="img" aria-label={`Map showing ${city}`}>
            <MapBackground />
            <span className="loc-map-pin">
              <PinIcon />
            </span>
            <span className="loc-map-badge">
              <PinSmallIcon />
              {nearbyCount}+ verified people near you
            </span>
          </div>

          <div className="loc-toggle-card">
            <div className="loc-toggle-text">
              <div className="loc-toggle-title">Use my current location</div>
              <div className="loc-toggle-sub">Keep your city up to date automatically</div>
            </div>
            <button
              type="button"
              className={`loc-switch${useCurrentLocation ? " is-on" : ""}`}
              role="switch"
              aria-checked={useCurrentLocation}
              aria-label="Use my current location"
              onClick={toggle}
            >
              <i />
            </button>
          </div>
        </div>

        <div className="loc-footer">
          <button type="button" className="loc-continue" disabled={loading} onClick={onContinue}>
            {loading ? (
              <>
                <span className="loc-spinner" />
                <span className="loc-spinner" />
                <span className="loc-spinner" />
              </>
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default LocationStep;
