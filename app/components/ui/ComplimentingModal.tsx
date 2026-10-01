import React from "react";

/**
 * ComplimentingModal
 * --------------------
 * Independent, dependency-free (React only) popup component for the
 * "Complimenting" compliment/gift-sending card.
 *
 * Sizing:
 *  - Fixed width: 320px (as requested).
 *  - Height is automatic — it grows to fit its content, so the card always
 *    keeps clean proportions instead of stretching to fill an arbitrary box.
 *    Opening the gift picker adds a row of gift tiles, which grows the
 *    card's height in place (no separate popup, no clipped content).
 *  - It renders as a fixed-position overlay above everything else in the
 *    page (z-index: 1000), dimming the background. Clicking outside the
 *    card (on the backdrop) closes it.
 *
 * Usage:
 *   const [open, setOpen] = useState(true);
 *   {open && (
 *     <ComplimentingModal
 *       name="Aman"
 *       avatarUrl="/aman.jpg"
 *       comments={0}
 *       roses={124}
 *       balance="₹99,460"
 *       onClose={() => setOpen(false)}
 *       onSend={(text, gift) => sendCompliment(text, gift)}
 *     />
 *   )}
 */

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.cpl-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(28, 26, 23, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}
.cpl-backdrop * , .cpl-backdrop *::before, .cpl-backdrop *::after { box-sizing: border-box; }

.cpl-card {
  width: 320px;
  max-width: 100%;
  max-height: min(640px, 92vh);
  overflow-y: auto;
  background: #fff;
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(28, 26, 23, 0.28);
  padding: 18px 18px 16px;
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #1c1a17;
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.cpl-card::-webkit-scrollbar { display: none; width: 0; height: 0; }

.cpl-handle {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #d9d2c5;
  margin: 0 auto 14px;
}

.cpl-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e23d68;
}
.cpl-eyebrow svg { width: 15px; height: 15px; }

.cpl-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}
.cpl-avatar {
  flex: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  background: #eee6d6;
  display: grid;
  place-items: center;
}
.cpl-avatar img { width: 100%; height: 100%; object-fit: cover; }
.cpl-avatar svg { width: 55%; height: 55%; color: #b9b0a0; }
.cpl-name { font-size: 18px; font-weight: 700; }

.cpl-stats {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.cpl-stats::-webkit-scrollbar { display: none; }
.cpl-stat {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 999px;
  background: #f3f0eb;
  font-size: 10.5px;
  font-weight: 600;
  color: #3a352d;
  white-space: nowrap;
}
.cpl-stat .cpl-stat-emoji { font-size: 13px; line-height: 1; }
.cpl-stat svg { width: 14px; height: 14px; flex: none; }

.cpl-field { position: relative; margin-top: 16px; }
.cpl-textarea {
  width: 100%;
  min-height: 110px;
  border: 2px solid #efe7dd;
  border-radius: 20px;
  background: #fff;
  font: inherit;
  font-size: 14.5px;
  line-height: 1.5;
  color: #1c1a17;
  padding: 14px 16px 34px;
  resize: vertical;
}
.cpl-textarea::placeholder { color: #9b9488; opacity: 1; }
.cpl-textarea:focus {
  outline: none;
  border-color: #e23d68;
  box-shadow: 0 0 0 3px rgba(226, 61, 104, 0.14);
}
.cpl-try {
  position: absolute;
  right: 10px;
  bottom: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 999px;
  border: 1.5px solid #f6c7d2;
  background: #fff;
  color: #e23d68;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.cpl-try svg { width: 13px; height: 13px; }

.cpl-count {
  margin-top: 6px;
  text-align: right;
  font-size: 11.5px;
  color: #9b9488;
}
.cpl-count.is-at { color: #e23d68; }

.cpl-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}
.cpl-action {
  flex: 1;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 8px;
  border-radius: 999px;
  border: 2px solid #efe7dd;
  background: #fff;
  font: inherit;
  font-size: 13.5px;
  font-weight: 600;
  color: #1c1a17;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.cpl-action .cpl-action-emoji { font-size: 15px; line-height: 1; }
.cpl-action[aria-pressed="true"] { border-color: #e23d68; background: #fff8fa; }

.cpl-gift-panel {
  margin-top: 12px;
  padding: 12px;
  border-radius: 18px;
  background: #faf6ef;
  border: 1.5px solid #efe7dd;
}
.cpl-gift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.cpl-gift-item {
  aspect-ratio: 1;
  border-radius: 14px;
  border: 2px solid #efe7dd;
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
}
.cpl-gift-item[aria-pressed="true"] { border-color: #e23d68; background: #fff0f4; }
.cpl-gift-item:focus-visible { outline: 2.5px solid #e23d68; outline-offset: 2px; }

.cpl-send {
  width: 100%;
  margin-top: 16px;
  height: 50px;
  border: none;
  border-radius: 999px;
  background: #e23d68;
  color: #fff;
  font: inherit;
  font-size: 15.5px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease, box-shadow 0.15s ease;
  box-shadow: 0 10px 22px rgba(226, 61, 104, 0.3);
}
.cpl-send:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.cpl-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  border: none;
  background: #f3f0eb;
  color: #5c564e;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.cpl-close svg { width: 15px; height: 15px; }

.cpl-action:focus-visible,
.cpl-try:focus-visible,
.cpl-send:focus-visible,
.cpl-close:focus-visible { outline: 3px solid #e23d68; outline-offset: 2px; }
`;

/* ---------- icons ---------- */
const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.8 5.6L19 9l-5.2 1.4L12 16l-1.8-5.6L5 9l5.2-1.4L12 2z" />
    <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
  </svg>
);
const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
  </svg>
);
const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18h6M10 22h4" />
    <path d="M12 2a6 6 0 00-3.7 10.7c.5.4.7 1 .7 1.6V15h6v-.7c0-.6.2-1.2.7-1.6A6 6 0 0012 2z" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

/* ---------- data ---------- */
export interface GiftOption {
  id: string;
  emoji: string;
  label: string;
}

const DEFAULT_GIFTS: GiftOption[] = [
  { id: "gift-box", emoji: "🎁", label: "Gift box" },
  { id: "teddy", emoji: "🧸", label: "Teddy bear" },
  { id: "chocolate", emoji: "🍫", label: "Chocolate" },
  { id: "ring", emoji: "💍", label: "Ring" },
  { id: "bouquet", emoji: "💐", label: "Bouquet" },
  { id: "cake", emoji: "🎂", label: "Cake" },
  { id: "crown", emoji: "👑", label: "Crown" },
  { id: "diamond", emoji: "💎", label: "Diamond" },
];

const TRY_SUGGESTIONS = [
  "Your smile is honestly contagious.",
  "You have the best energy in every room.",
  "I love how genuine you are.",
];

/* ---------- component ---------- */
export interface ComplimentingModalProps {
  name: string;
  avatarUrl?: string;
  comments?: number;
  roses?: number;
  balance?: string;
  maxLength?: number;
  gifts?: GiftOption[];
  onClose?: () => void;
  onSend?: (text: string, gift: GiftOption | null) => void;
  className?: string;
}

const ComplimentingModal: React.FC<ComplimentingModalProps> = ({
  name,
  avatarUrl,
  comments = 0,
  roses = 0,
  balance,
  maxLength = 140,
  gifts = DEFAULT_GIFTS,
  onClose,
  onSend,
  className,
}) => {
  const [text, setText] = React.useState("");
  const [roseSelected, setRoseSelected] = React.useState(false);
  const [giftPickerOpen, setGiftPickerOpen] = React.useState(false);
  const [selectedGift, setSelectedGift] = React.useState<GiftOption | null>(null);
  const [tryIndex, setTryIndex] = React.useState(0);

  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleTry = () => {
    setText(TRY_SUGGESTIONS[tryIndex % TRY_SUGGESTIONS.length]);
    setTryIndex((i) => i + 1);
  };

  const toggleGiftPicker = () => setGiftPickerOpen((v) => !v);

  const pickGift = (g: GiftOption) => {
    setSelectedGift((cur) => (cur?.id === g.id ? null : g));
  };

  const count = text.length;
  const atLimit = count >= maxLength;
  const canSend = text.trim().length > 0;

  return (
    <div className={`cpl-backdrop${className ? " " + className : ""} `} onMouseDown={handleBackdropClick}>
      <style>{css}</style>
      <div className="cpl-card h-[380px]" ref={cardRef} role="dialog" aria-modal="true" aria-label="Send a compliment">
        <button type="button" className="cpl-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        {/* <div className="cpl-handle" aria-hidden="true" /> */}

        <p className="cpl-eyebrow">
          <SparkleIcon />
          Complimenting
        </p>

        <div className="cpl-profile">
          <div className="cpl-avatar">
            {avatarUrl ? <img src={avatarUrl} alt={name} /> : <PersonIcon />}
          </div>
          <span className="cpl-name">{name}</span>
        </div>

        <div className="cpl-stats">
          <span className="cpl-stat">
            <CommentIcon />
            {comments} comments
          </span>
          <span className="cpl-stat">
            <span className="cpl-stat-emoji">🌹</span>
            {roses} roses
          </span>
          {balance && (
            <span className="cpl-stat">
              <span className="cpl-stat-emoji">🪙</span>
              {balance} balance
            </span>
          )}
        </div>

        <div className="cpl-field">
          <textarea
            className="cpl-textarea"
            placeholder="Write a sweet compliment…"
            value={text}
            maxLength={maxLength}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            aria-label="Compliment message"
          />
          {/* <button type="button" className="cpl-try" onClick={handleTry}>
            <BulbIcon />
            Try
          </button> */}
        </div>
        <p className={`cpl-count${atLimit ? " is-at" : ""}`}>
          {count}/{maxLength}
        </p>

        <div className="cpl-actions">
          <button
            type="button"
            className="cpl-action"
            aria-pressed={roseSelected}
            onClick={() => setRoseSelected((v) => !v)}
          >
            <span className="cpl-action-emoji">🌹</span>
            Rose
          </button>
          <button
            type="button"
            className="cpl-action"
            aria-pressed={giftPickerOpen || !!selectedGift}
            aria-expanded={giftPickerOpen}
            onClick={toggleGiftPicker}
          >
            <span className="cpl-action-emoji">{selectedGift ? selectedGift.emoji : "🎁"}</span>
            {selectedGift ? selectedGift.label : "Select Gift"}
          </button>
        </div>

        {giftPickerOpen && (
          <div className="cpl-gift-panel">
            <div className="cpl-gift-grid">
              {gifts.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className="cpl-gift-item"
                  aria-pressed={selectedGift?.id === g.id}
                  aria-label={g.label}
                  title={g.label}
                  onClick={() => pickGift(g)}
                >
                  {g.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="cpl-send"
          disabled={!canSend}
          onClick={() => onSend?.(text, selectedGift)}
        >
          Send Compliment
        </button>
      </div>
    </div>
  );
};

export default ComplimentingModal;
