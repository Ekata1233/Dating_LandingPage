import React from "react";

/**
 * YourInterestsStep
 * ------------------
 * Independent, dependency-free (React only) component for
 * "Step 6 of 11 – Your interests".
 *
 * Responsiveness:
 *  - Root fills 100% of its parent's width and height.
 *  - Every inner size (fonts, chips, pills, icons, button) is expressed in
 *    "design units" where 1 unit = 1/720 of the component's own width
 *    (CSS container query units), so small elements resize with their parent.
 *
 * Usage:
 *   <div style={{ width: 360, height: 700 }}>
 *     <YourInterestsStep onChange={(ids) => console.log(ids)} />
 *   </div>
 */

// 1 design unit = component width / 720 (width of the reference design)
const u = (n: number) => `calc(var(--yin-u) * ${n})`;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

.yin-wrap {
  width: 100%;
  height: 100%;
  min-height: 0;
  container-type: inline-size;
  box-sizing: border-box;
}
.yin-wrap *, .yin-wrap *::before, .yin-wrap *::after { box-sizing: border-box; }

.yin-root {
  --yin-u: calc(100cqw / 720);
  --yin-pink: #e23d68;
  --yin-pink-dark: #d81f52;
  --yin-ink: #1c1a17;
  --yin-muted: #8a8378;
  --yin-line: #efe7dd;
  --yin-track: #efe7dd;
  --yin-panel: #fdeef1;
  --yin-panel-line: #f3b9c8;

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 ${u(30)};
  background: #fff;
  color: var(--yin-ink);
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* ---------- header ---------- */
.yin-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
  padding-top: ${u(24)};
}
.yin-back {
  flex: none;
  width: ${u(80)};
  height: ${u(80)};
  border-radius: 50%;
  border: ${u(2)} solid var(--yin-line);
  background: #fff;
  box-shadow: 0 ${u(4)} ${u(14)} rgba(60, 40, 20, 0.08);
  display: grid;
  place-items: center;
  padding: 0;
  cursor: pointer;
  color: var(--yin-ink);
}
.yin-back svg { width: ${u(30)}; height: ${u(30)}; }
.yin-titles { flex: 1; min-width: 0; text-align: center; }
.yin-step {
  margin: 0;
  font-size: ${u(19)};
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--yin-pink);
}
.yin-title {
  margin: ${u(6)} 0 0;
  font-size: ${u(30)};
  font-weight: 500;
  line-height: 1.2;
}
.yin-ring { flex: none; position: relative; width: ${u(72)}; height: ${u(72)}; }
.yin-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.yin-ring span {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: ${u(19)};
  font-weight: 600;
}
.yin-progress {
  flex: none;
  height: ${u(12)};
  margin-top: ${u(28)};
  border-radius: 999px;
  background: var(--yin-track);
  overflow: hidden;
}
.yin-progress > i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--yin-pink);
}

/* ---------- body ---------- */
.yin-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${u(30)} 0 ${u(24)};
  scrollbar-width: none;
}
.yin-body::-webkit-scrollbar { display: none; }

.yin-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(16)};
}
.yin-eyebrow {
  margin: 0;
  font-size: ${u(21)};
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--yin-pink);
}
.yin-count {
  flex: none;
  padding: ${u(8)} ${u(18)};
  border-radius: 999px;
  background: #fdeaf0;
  color: var(--yin-pink);
  font-size: ${u(21)};
  font-weight: 600;
}
.yin-h1 {
  margin: ${u(16)} 0 0;
  font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
  font-size: ${u(58)};
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

/* selected chips row */
.yin-chips {
  display: flex;
  align-items: center;
  gap: ${u(16)};
  margin-top: ${u(36)};
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: ${u(4)};
}
.yin-chips::-webkit-scrollbar { display: none; }
.yin-chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: ${u(12)};
  padding: ${u(18)} ${u(22)};
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, var(--yin-pink) 0%, var(--yin-pink-dark) 100%);
  color: #fff;
  font: inherit;
  font-size: ${u(24)};
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}
.yin-chip .yin-emoji { font-size: ${u(24)}; line-height: 1; }
.yin-chip svg { width: ${u(22)}; height: ${u(22)}; }

/* search */
.yin-search {
  position: relative;
  margin-top: ${u(24)};
  display: flex;
  align-items: center;
  height: ${u(96)};
  border: ${u(3)} solid var(--yin-line);
  border-radius: 999px;
  background: #fff;
}
.yin-search svg {
  flex: none;
  width: ${u(32)};
  height: ${u(32)};
  margin-left: ${u(32)};
  color: var(--yin-muted);
}
.yin-search input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  font: inherit;
  font-size: ${u(27)};
  color: var(--yin-ink);
  padding: 0 ${u(30)} 0 ${u(18)};
}
.yin-search input::placeholder { color: var(--yin-muted); opacity: 1; }
.yin-search:focus-within { border-color: var(--yin-pink); box-shadow: 0 0 0 ${u(4)} rgba(226, 61, 104, 0.15); }

/* category panel */
.yin-categories {
  display: flex;
  flex-direction: column;
  gap: ${u(28)};
  margin-top: ${u(28)};
}
.yin-category {
  border: ${u(3)} solid var(--yin-line);
  border-radius: ${u(36)};
  background: #fff;
  overflow: hidden;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.yin-category.is-active {
  border-color: var(--yin-panel-line);
  background: var(--yin-panel);
}
.yin-cat-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${u(24)};
  padding: ${u(26)} ${u(30)};
  background: transparent;
  border: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
}
.yin-cat-icon {
  flex: none;
  width: ${u(88)};
  height: ${u(88)};
  border-radius: ${u(24)};
  background: #f6ead9;
  display: grid;
  place-items: center;
  font-size: ${u(40)};
}
.yin-cat-text { flex: 1; min-width: 0; }
.yin-cat-name {
  display: block;
  font-size: ${u(30)};
  font-weight: 700;
  color: var(--yin-pink);
  line-height: 1.25;
}
.yin-cat-sub {
  display: block;
  margin-top: ${u(4)};
  font-size: ${u(24)};
  color: var(--yin-muted);
}
.yin-cat-radio {
  flex: none;
  width: ${u(38)};
  height: ${u(38)};
  border-radius: 50%;
  border: ${u(3)} solid #e6b9c6;
  display: grid;
  place-items: center;
}
.yin-cat-radio i {
  width: ${u(20)};
  height: ${u(20)};
  border-radius: 50%;
  background: var(--yin-pink);
  transform: scale(0);
  transition: transform 0.15s ease;
}
.yin-category.is-active .yin-cat-radio i { transform: scale(1); }

.yin-cat-body {
  padding: 0 ${u(30)} ${u(32)};
  border-top: ${u(2)} solid rgba(226, 61, 104, 0.18);
}
.yin-pills {
  display: flex;
  flex-wrap: wrap;
  gap: ${u(18)};
  padding-top: ${u(28)};
}
.yin-pill {
  display: inline-flex;
  align-items: center;
  gap: ${u(14)};
  padding: ${u(20)} ${u(26)};
  border-radius: 999px;
  border: ${u(2)} solid #eadfce;
  background: #fff;
  font: inherit;
  font-size: ${u(25)};
  font-weight: 600;
  color: var(--yin-ink);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
.yin-pill svg { width: ${u(26)}; height: ${u(26)}; flex: none; }
.yin-pill[aria-pressed="true"] {
  background: var(--yin-pink);
  border-color: var(--yin-pink);
  color: #fff;
}

/* ---------- footer ---------- */
.yin-footer { flex: none; padding: ${u(16)} 0 ${u(36)}; }
.yin-continue {
  width: 100%;
  height: ${u(94)};
  border: none;
  border-radius: ${u(28)};
  background: var(--yin-pink);
  color: #fff;
  font: inherit;
  font-size: ${u(28)};
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 ${u(10)} ${u(24)} rgba(226, 61, 104, 0.28);
  transition: background-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.yin-continue:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  box-shadow: none;
  background: #efeae3;
  color: #5c564e;
}
.yin-continue:focus-visible,
.yin-back:focus-visible { outline: ${u(4)} solid var(--yin-pink); outline-offset: ${u(3)}; }

@media (prefers-reduced-motion: reduce) {
  .yin-category, .yin-cat-radio i, .yin-pill, .yin-continue { transition: none; }
}
`;

/* ---------- icons ---------- */
const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const ClapperIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 9.5l1.4-3.6a1.2 1.2 0 011.55-.68l13.3 5.1a1.2 1.2 0 01.68 1.55L19 15" />
    <path d="M3 9.5V19a1 1 0 001 1h16a1 1 0 001-1v-8H3z" />
    <path d="M6.5 9.5l2-4M11 9.5l2-4M15.5 9.5l2-4" />
  </svg>
);

/* ---------- data ---------- */
export interface InterestItem {
  id: string;
  label: string;
  emoji?: string;
}
export interface InterestCategory {
  id: string;
  name: string;
  subtitle?: string;
  emoji?: string;
  items: InterestItem[];
}

const DEFAULT_CATEGORIES: InterestCategory[] = [
  {
    id: "fan-favorites",
    name: "Fan Favorites",
    subtitle: "Select interests",
    emoji: "🎬",
    items: [
      { id: "movies-tv", label: "Movies & TV Shows" },
      { id: "music", label: "Music" },
      { id: "food", label: "Food" },
      { id: "drinks", label: "Drinks" },
      { id: "books", label: "Books" },
      { id: "sports", label: "Sports" },
      { id: "travel", label: "Travel" },
      { id: "games", label: "Games" },
      { id: "pets", label: "Pets" },
      { id: "fitness", label: "Fitness" },
    ],
  },
  {
    id: "creative",
    name: "Creative",
    subtitle: "Select interests",
    emoji: "🎨",
    items: [
      { id: "poetry", label: "Poetry", emoji: "🎨" },
      { id: "photography", label: "Photography", emoji: "🎨" },
      { id: "drawing", label: "Drawing", emoji: "🎨" },
      { id: "writing", label: "Writing", emoji: "🎨" },
      { id: "painting", label: "Painting", emoji: "🎨" },
    ],
  },
];

const MAX_INTERESTS = 10;

/* ---------- component ---------- */
export interface YourInterestsStepProps {
  step?: number;
  totalSteps?: number;
  percent?: number;
  categories?: InterestCategory[];
  max?: number;
  /** Controlled value: ordered list of selected interest ids. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  onBack?: () => void;
  onContinue?: (ids: string[]) => void;
  className?: string;
  style?: React.CSSProperties;
}

const YourInterestsStep: React.FC<YourInterestsStepProps> = ({
  step = 6,
  totalSteps = 11,
  percent = 54,
  categories = DEFAULT_CATEGORIES,
  max = MAX_INTERESTS,
  value,
  defaultValue = ["poetry", "photography", "drawing"],
  onChange,
  onBack,
  onContinue,
  className,
  style,
}) => {
  const [inner, setInner] = React.useState<string[]>(defaultValue);
  const selected = value ?? inner;
  const [query, setQuery] = React.useState("");
  const [openCategory, setOpenCategory] = React.useState<string | null>(categories[0]?.id ?? null);

  const allItems = React.useMemo(() => {
    const map = new Map<string, InterestItem & { categoryId: string }>();
    categories.forEach((c) => c.items.forEach((it) => map.set(it.id, { ...it, categoryId: c.id })));
    return map;
  }, [categories]);

  const setSelected = (next: string[]) => {
    if (value === undefined) setInner(next);
    onChange?.(next);
  };

  const toggle = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((v) => v !== id));
    } else {
      if (selected.length >= max) return;
      setSelected([...selected, id]);
    }
  };

  const q = query.trim().toLowerCase();
  const visibleCategories = q
    ? categories
        .map((c) => ({ ...c, items: c.items.filter((it) => it.label.toLowerCase().includes(q)) }))
        .filter((c) => c.items.length > 0)
    : categories;

  const r = 32;
  const c = 2 * Math.PI * r;

  return (
    <div className={`yin-wrap${className ? " " + className : ""}`} style={style}>
      <style>{css}</style>
      <section className="yin-root" aria-label={`Step ${step} of ${totalSteps}: Your interests`}>
        <div className="yin-header">
          <button type="button" className="yin-back" aria-label="Go back" onClick={onBack}>
            <BackIcon />
          </button>
          <div className="yin-titles">
            <p className="yin-step">
              Step {step} of {totalSteps}
            </p>
            <h2 className="yin-title">Your interests</h2>
          </div>
          <div className="yin-ring" role="img" aria-label={`${percent}% complete`}>
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
        <div className="yin-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
          <i style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>

        <div className="yin-body">
          <div className="yin-row">
            <p className="yin-eyebrow">Your interests</p>
            <span className="yin-count">
              {selected.length}/{max}
            </span>
          </div>
          <h1 className="yin-h1">Interests</h1>

          {selected.length > 0 && (
            <div className="yin-chips" role="list" aria-label="Selected interests">
              {selected.map((id) => {
                const item = allItems.get(id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    role="listitem"
                    className="yin-chip"
                    onClick={() => toggle(id)}
                    aria-label={`Remove ${item.label}`}
                  >
                    {item.emoji && <span className="yin-emoji">{item.emoji}</span>}
                    {item.label}
                    <CloseIcon />
                  </button>
                );
              })}
            </div>
          )}

          <label className="yin-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search interests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search interests"
            />
          </label>

          <div className="yin-categories">
            {visibleCategories.map((cat) => {
              const isOpen = q ? true : openCategory === cat.id;
              const activeCount = cat.items.filter((it) => selected.includes(it.id)).length;
              return (
                <div key={cat.id} className={`yin-category${isOpen ? " is-active" : ""}`}>
                  <button
                    type="button"
                    className="yin-cat-head"
                    aria-expanded={isOpen}
                    onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  >
                    <span className="yin-cat-icon" aria-hidden="true">
                      {cat.emoji ?? <ClapperIcon />}
                    </span>
                    <span className="yin-cat-text">
                      <span className="yin-cat-name">{cat.name}</span>
                      <span className="yin-cat-sub">
                        {activeCount > 0 ? `${activeCount} selected` : cat.subtitle ?? "Select interests"}
                      </span>
                    </span>
                    <span className="yin-cat-radio" aria-hidden="true">
                      <i />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="yin-cat-body">
                      <div className="yin-pills">
                        {cat.items.map((it) => {
                          const active = selected.includes(it.id);
                          const disabled = !active && selected.length >= max;
                          return (
                            <button
                              key={it.id}
                              type="button"
                              className="yin-pill"
                              aria-pressed={active}
                              disabled={disabled}
                              onClick={() => toggle(it.id)}
                            >
                              <ClapperIcon />
                              {it.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="yin-footer">
          <button
            type="button"
            className="yin-continue"
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

export default YourInterestsStep;
