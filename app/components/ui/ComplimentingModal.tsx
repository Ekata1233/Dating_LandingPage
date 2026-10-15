import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import React from "react";

/**
 * ComplimentingModal (square, no-scroll)
 * --------------------------------------
 * - Card is a fixed square. It never scrolls and never grows.
 * - The message box is the flexible element: it absorbs whatever height is left.
 * - Opening "Select Gift" swaps the message box for a 4x2 gift grid in the SAME
 *   space, so the card keeps its size. Picking a gift returns to the message.
 * - Header card shows avatar, COMPLIMENTING pill, tag (e.g. "Photo"), name, age.
 *
 * Usage:
 *   <ComplimentingModal
 *     name="Ankush"
 *     age={21}
 *     tag="Photo"
 *     avatarUrl="/ankush.jpg"
 *     onClose={() => setOpen(false)}
 *     onSend={(text, gift, withRose) => sendCompliment(text, gift, withRose)}
 *   />
 */

const SIZE = 380;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.cpl-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(28, 26, 23, 0.5);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
  animation: cpl-fade 0.18s ease-out;
}
.cpl-backdrop *, .cpl-backdrop *::before, .cpl-backdrop *::after { box-sizing: border-box; }

.cpl-card {
  --cpl-pink: #e23d68;
  --cpl-pink-soft: #fdecef;
  --cpl-border: #efe7dd;
  --cpl-ink: #1c1a17;
  --cpl-muted: #6b645a;
  width: min(${SIZE}px, calc(100vw - 32px));
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: #fff;
  border-radius: 28px;
  box-shadow:
    0 1px 2px rgba(28, 26, 23, 0.06),
    0 24px 60px rgba(28, 26, 23, 0.28);
  padding: 12px 16px 16px;
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: var(--cpl-ink);
  -webkit-font-smoothing: antialiased;
  animation: cpl-pop 0.22s cubic-bezier(0.2, 0.9, 0.3, 1);
}

@keyframes cpl-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes cpl-pop {
  from { opacity: 0; transform: translateY(10px) scale(0.97); }
  to { opacity: 1; transform: none; }
}

/* ---- close ---- */
.cpl-close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #f3f0eb;
  color: #5c564e;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;
  padding: 0;
  transition: background-color 0.15s ease, transform 0.1s ease;
}
/* enlarges the tap target to 44px without changing the look */
.cpl-close::after { content: ""; position: absolute; inset: -7px; }
.cpl-close:hover { background: #e9e4dc; }
.cpl-close:active { transform: scale(0.92); }
.cpl-close svg { width: 14px; height: 14px; }

/* ---- header card ---- */
.cpl-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
  padding: 8px 14px 8px 10px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fff7f9 0%, var(--cpl-pink-soft) 100%);
  border: 1.5px solid #f8dde4;
}
.cpl-avatar {
  flex: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  border: 2.5px solid var(--cpl-pink);
  background: #eee6d6;
  display: grid;
  place-items: center;
}
.cpl-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cpl-avatar svg { width: 55%; height: 55%; color: #b9b0a0; }
.cpl-head-text { flex: 1 1 auto; min-width: 0; }
.cpl-head-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  white-space: nowrap;
}
.cpl-pill {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #fbe0e7;
  color: var(--cpl-pink);
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.3;
}
.cpl-pill svg { width: 11px; height: 11px; }
.cpl-tag {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--cpl-muted);
}
.cpl-name {
  margin-top: 2px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cpl-age { font-weight: 400; color: #4a443b; }

/* ---- stat chips ---- */
.cpl-stats {
  flex: none;
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.cpl-stat {
  flex: 1 1 0;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  height: 30px;
  padding: 0 8px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.cpl-stat svg { width: 14px; height: 14px; flex: none; }
.cpl-stat b { font-weight: 700; font-size: 13px; }
.cpl-stat--comments { background: #eef0f4; color: #3a4252; }
.cpl-stat--roses { background: #fdecef; color: #b3234b; }
.cpl-stat--balance { background: #fbf4e0; color: #9a5a12; }

/* ---- message / gift area (flexible) ---- */
.cpl-field {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  margin-top: 10px;
}
.cpl-textarea {
  display: block;
  width: 100%;
  height: 100%;
  border: 2px solid var(--cpl-border);
  border-radius: 20px;
  background: #fff;
  font: inherit;
  font-size: 15px; /* 16px-ish keeps iOS from zooming on focus */
  line-height: 1.45;
  color: var(--cpl-ink);
  padding: 12px 16px 30px;
  resize: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.cpl-textarea::placeholder { color: #9b9488; opacity: 1; }
.cpl-textarea:hover { border-color: #e4d9cb; }
.cpl-textarea:focus {
  outline: none;
  border-color: var(--cpl-pink);
  box-shadow: 0 0 0 3px rgba(226, 61, 104, 0.14);
}
.cpl-count {
  position: absolute;
  right: 16px;
  bottom: 10px;
  font-size: 12px;
  color: #8a8478;
  font-variant-numeric: tabular-nums;
  pointer-events: none;
}
.cpl-count.is-at { color: var(--cpl-pink); font-weight: 600; }

.cpl-gift-panel {
  width: 100%;
  height: 100%;
  padding: 8px;
  border-radius: 20px;
  background: #faf6ef;
  border: 2px solid var(--cpl-border);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
}
.cpl-gift-item {
  min-height: 0;
  border-radius: 14px;
  border: 2px solid var(--cpl-border);
  background: #fff;
  display: grid;
  place-items: center;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  transition: transform 0.12s ease, border-color 0.15s ease, background-color 0.15s ease;
}
.cpl-gift-item:hover { border-color: #f1b9c6; transform: translateY(-1px); }
.cpl-gift-item:active { transform: scale(0.94); }
.cpl-gift-item[aria-pressed="true"] { border-color: var(--cpl-pink); background: #fff0f4; }

/* ---- actions ---- */
.cpl-actions {
  flex: none;
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 10px;
}
.cpl-action {
  min-width: 140px;
  height: 38px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 999px;
  border: 2px solid var(--cpl-border);
  background: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  color: var(--cpl-ink);
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}
.cpl-action .cpl-emoji { font-size: 16px; line-height: 1; }
.cpl-action:hover { border-color: #f1b9c6; background: #fffafb; }
.cpl-action:active { transform: scale(0.97); }
.cpl-action[aria-pressed="true"] { border-color: var(--cpl-pink); background: #fff8fa; color: #b3234b; }

.cpl-send {
  flex: none;
  width: 100%;
  margin-top: 10px;
  height: 48px;
  border: none;
  border-radius: 999px;
  background: var(--cpl-pink);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(226, 61, 104, 0.28);
  transition: opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.cpl-send:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 10px 22px rgba(226, 61, 104, 0.34); }
.cpl-send:active:not(:disabled) { transform: scale(0.985); }
.cpl-send:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

.cpl-close:focus-visible,
.cpl-action:focus-visible,
.cpl-gift-item:focus-visible,
.cpl-send:focus-visible { outline: 3px solid var(--cpl-pink); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .cpl-backdrop, .cpl-card { animation: none; }
  .cpl-card *, .cpl-card *::before, .cpl-card *::after { transition: none !important; }
}

@media (max-width: 360px) {
  .cpl-stat { padding: 0 6px; font-size: 11.5px; }
  .cpl-name { font-size: 18px; }
}
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
/* SVG coin instead of the 🪙 emoji, which renders as an empty box on older Android */
const CoinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" fill="#F4B63F" stroke="#C98516" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="6" stroke="#C98516" strokeWidth="1.4" />
    <path d="M12 8.5v7M10 10.2h3a1 1 0 010 2h-2a1 1 0 000 2h3" stroke="#9A5A12" strokeWidth="1.2" strokeLinecap="round" />
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

/* ---------- component ---------- */
export interface ComplimentingModalProps {
  name: string;
  age?: number;
  /** What is being complimented, e.g. "Photo" or "Prompt" */
  tag?: string;
  avatarUrl?: string;
  maxLength?: number;
  gifts?: GiftOption[];
  /** Kept for API compatibility. The "Try Ideas" button is currently hidden. */
  suggestions?: string[];
  onClose?: () => void;
  onSend?: (text: string, gift: GiftOption | null, withRose: boolean) => void;
  className?: string;
}

const ComplimentingModal: React.FC<ComplimentingModalProps> = ({
  name,
  age,
  tag,
  avatarUrl,
  maxLength = 140,
  gifts = DEFAULT_GIFTS,
  onClose,
  onSend,
  className,
}) => {
  const [text, setText] = React.useState("");
  const [roseAdded, setRoseAdded] = React.useState(false);
  const [giftPickerOpen] = React.useState(false);
  const [selectedGift, setSelectedGift] = React.useState<GiftOption | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const { balances: apiBalances } = useUserProfileData();
  const comments = apiBalances?.compliments?.balance ?? 0;
  const roses = apiBalances?.roses?.balance ?? 0;
  const balance = apiBalances?.wallet?.formattedBalance;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  /* Escape to close */
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* lock page scroll behind the modal */
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* focus the message box when it is visible */
  React.useEffect(() => {
    if (!giftPickerOpen) textareaRef.current?.focus();
  }, [giftPickerOpen]);

  const pickGift = (g: GiftOption) => {
    setSelectedGift((cur) => (cur?.id === g.id ? null : g));
    // gift picker closes here when it is wired up; card size never changes
  };

  const count = text.length;
  const atLimit = count >= maxLength;
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend?.(text.trim(), selectedGift, roseAdded);
  };

  return (
    <div
      className={`cpl-backdrop${className ? " " + className : ""}`}
      onMouseDown={handleBackdropClick}
    >
      <style>{css}</style>
      <div
        className="cpl-card"
        role="dialog"
        aria-modal="true"
        aria-label={`Send a compliment to ${name}`}
      >
        <button type="button" className="cpl-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>

        {/* header */}
        <div className="cpl-head">
          <div className="cpl-avatar">
            {avatarUrl ? <img src={avatarUrl} alt={name} /> : <PersonIcon />}
          </div>
          <div className="cpl-head-text">
            <div className="cpl-head-top">
              <span className="cpl-pill">
                <SparkleIcon />
                Complimenting
              </span>
              {tag && <span className="cpl-tag">• {tag}</span>}
            </div>
            <div className="cpl-name" title={age != null ? `${name}, ${age}` : name}>
              {name}
              {age != null && <span className="cpl-age">, {age}</span>}
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="cpl-stats">
          <span className="cpl-stat cpl-stat--comments">
            <CommentIcon />
            <b>{comments}</b> comments
          </span>
          <span className="cpl-stat cpl-stat--roses">
            <span aria-hidden="true">🌹</span>
            <b>{roses}</b> roses
          </span>
          {balance && (
            <span className="cpl-stat cpl-stat--balance">
              <CoinIcon />
              <b>{balance}</b>
            </span>
          )}
        </div>

        {/* message OR gift grid (same space) */}
        <div className="cpl-field">
          {giftPickerOpen ? (
            <div className="cpl-gift-panel" role="group" aria-label="Choose a gift">
              {gifts.slice(0, 8).map((g) => (
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
          ) : (
            <>
              <textarea
                ref={textareaRef}
                className="cpl-textarea"
                placeholder="Write a sweet compliment…"
                value={text}
                maxLength={maxLength}
                onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                aria-label="Compliment message"
              />
              <span
                className={`cpl-count${atLimit ? " is-at" : ""}`}
                aria-live="polite"
              >
                {count}/{maxLength}
              </span>
            </>
          )}
        </div>

        {/* actions */}
        <div className="cpl-actions">
          <button
            type="button"
            className="cpl-action"
            aria-pressed={roseAdded}
            onClick={() => setRoseAdded((v) => !v)}
          >
            <span className="cpl-emoji" aria-hidden="true">🌹</span>
            {roseAdded ? "Rose added" : "Add Rose"}
          </button>
        </div>

        <button
          type="button"
          className="cpl-send"
          disabled={!canSend}
          onClick={handleSend}
        >
          Send Compliment
        </button>
      </div>
    </div>
  );
};

export default ComplimentingModal;
