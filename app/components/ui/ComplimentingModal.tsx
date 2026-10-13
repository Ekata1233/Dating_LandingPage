import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import React from "react";

/**
 * ComplimentingModal (square, no-scroll)
 * --------------------------------------
 * - Card is a fixed square (360 x 360). It never scrolls and never grows.
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
 *     comments={0}
 *     roses={14}
 *     balance="₹4,691"
 *     onClose={() => setOpen(false)}
 *     onSend={(text, gift, withRose) => sendCompliment(text, gift, withRose)}
 *   />
 */

const SIZE = 360;

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
  padding: 16px;
  box-sizing: border-box;
}
.cpl-backdrop *, .cpl-backdrop *::before, .cpl-backdrop *::after { box-sizing: border-box; }

.cpl-card {
  --cpl-pink: #e23d68;
  --cpl-pink-soft: #fdecef;
  --cpl-border: #efe7dd;
  width: min(${SIZE}px, calc(100vw - 32px));
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background: #fff;
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(28, 26, 23, 0.28);
  padding: 8px 14px 14px;
  font-family: 'DM Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  color: #1c1a17;
}

.cpl-handle {
  flex: none;
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #d9d2c5;
  margin: 0 auto 8px;
}

.cpl-close {
  position: absolute;
  top: 10px;
  right: 12px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: #f3f0eb;
  color: #5c564e;
  display: grid;
  place-items: center;
  cursor: pointer;
  z-index: 2;
}
.cpl-close svg { width: 14px; height: 14px; }

/* ---- header card ---- */
.cpl-head {
  flex: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
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
.cpl-avatar img { width: 100%; height: 100%; object-fit: cover; }
.cpl-avatar svg { width: 55%; height: 55%; color: #b9b0a0; }
.cpl-head-text { min-width: 0; }
.cpl-head-top {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.cpl-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #fbe0e7;
  color: var(--cpl-pink);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.cpl-pill svg { width: 11px; height: 11px; }
.cpl-tag { font-size: 12px; font-weight: 500; color: #6b645a; }
.cpl-name {
  margin-top: 3px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
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
  padding: 7px 6px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cpl-stat svg { width: 14px; height: 14px; flex: none; }
.cpl-stat b { font-weight: 700; font-size: 12.5px; }
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
  width: 100%;
  height: 100%;
  border: 2px solid var(--cpl-border);
  border-radius: 20px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  line-height: 1.45;
  color: #1c1a17;
  padding: 12px 14px 38px;
  resize: none;
}
.cpl-textarea::placeholder { color: #9b9488; opacity: 1; }
.cpl-textarea:focus {
  outline: none;
  border-color: var(--cpl-pink);
  box-shadow: 0 0 0 3px rgba(226, 61, 104, 0.14);
}
.cpl-try {
  position: absolute;
  left: 10px;
  bottom: 9px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 11px;
  border-radius: 999px;
  border: 1.5px solid #f6c7d2;
  background: #fff;
  color: var(--cpl-pink);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.cpl-try svg { width: 12px; height: 12px; }
.cpl-count {
  position: absolute;
  right: 14px;
  bottom: 12px;
  font-size: 11.5px;
  color: #9b9488;
  pointer-events: none;
}
.cpl-count.is-at { color: var(--cpl-pink); }

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
  font-size: 22px;
  cursor: pointer;
  padding: 0;
}
.cpl-gift-item[aria-pressed="true"] { border-color: var(--cpl-pink); background: #fff0f4; }

/* ---- actions ---- */
.cpl-actions {
  flex: none;
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.cpl-action {
  flex: 1 1 0;
  min-width: 0;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 999px;
  border: 2px solid var(--cpl-border);
  background: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  color: #1c1a17;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
.cpl-action .cpl-emoji { font-size: 16px; line-height: 1; }
.cpl-action[aria-pressed="true"] { border-color: var(--cpl-pink); background: #fff8fa; }

.cpl-send {
  flex: none;
  width: 100%;
  margin-top: 10px;
  height: 46px;
  border: none;
  border-radius: 999px;
  background: var(--cpl-pink);
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(226, 61, 104, 0.28);
  transition: opacity 0.15s ease;
}
.cpl-send:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

.cpl-close:focus-visible,
.cpl-try:focus-visible,
.cpl-action:focus-visible,
.cpl-gift-item:focus-visible,
.cpl-send:focus-visible { outline: 3px solid var(--cpl-pink); outline-offset: 2px; }
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

const TRY_SUGGESTIONS = [
  "Your smile is honestly contagious.",
  "You have the best energy in every room.",
  "I love how genuine you are.",
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
  /** Optional replacement for the built-in "Try Ideas" suggestions */
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
  suggestions = TRY_SUGGESTIONS,
  onClose,
  onSend,
  className,
}) => {
  const [text, setText] = React.useState("");
  const [roseAdded, setRoseAdded] = React.useState(false);
  const [giftPickerOpen, setGiftPickerOpen] = React.useState(false);
  const [selectedGift, setSelectedGift] = React.useState<GiftOption | null>(null);
  const [tryIndex, setTryIndex] = React.useState(0);
    const { balances: apiBalances } = useUserProfileData()
  const comments = apiBalances?.compliments.balance
  const roses = apiBalances?.roses.balance
  const balance = apiBalances?.wallet.formattedBalance
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
    if (!suggestions.length) return;
    setText(suggestions[tryIndex % suggestions.length].slice(0, maxLength));
    setTryIndex((i) => i + 1);
  };

  const pickGift = (g: GiftOption) => {
    setSelectedGift((cur) => (cur?.id === g.id ? null : g));
    setGiftPickerOpen(false); // return to the message box, card size never changes
  };

  const count = text.length;
  const atLimit = count >= maxLength;
  const canSend = text.trim().length > 0;

  return (
    <div
      className={`cpl-backdrop${className ? " " + className : ""}`}
      onMouseDown={handleBackdropClick}
    >
      <style>{css}</style>
      <div className="cpl-card" role="dialog" aria-modal="true" aria-label="Send a compliment">
        <button type="button" className="cpl-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        {/* <div className="cpl-handle hidden h-5"  /> */}

        {/* header */}
        <div className="cpl-head mt-5">
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
            <div className="cpl-name">
              {name}
              {age != null && <span className="cpl-age">, {age}</span>}
            </div>
          </div>
        </div>

        {/* stats */}
        <div className="cpl-stats ">
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
                className="cpl-textarea"
                placeholder="Write a sweet compliment…"
                value={text}
                maxLength={maxLength}
                onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                aria-label="Compliment message"
              />
              {/* <button type="button" className="cpl-try" onClick={handleTry}>
                <SparkleIcon />
                Try Ideas
              </button> */}
              <span className={`cpl-count${atLimit ? " is-at" : ""}`}>
                {count}/{maxLength}
              </span>
            </>
          )}
        </div>

        {/* actions */}
        <span className="cpl-actions mx-auto w-fit ">
          <button
            type="button"
            className="cpl-action flex items-center justify-center px-3 py-2 rounded-md"
            aria-pressed={roseAdded}
            onClick={() => setRoseAdded((v) => !v)}
          >
            <span className="cpl-emoji" aria-hidden="true">🌹</span>
            {roseAdded ? "Rose added" : "Add Rose"}
          </button>
        </span>

        <button
          type="button"
          className="cpl-send"
          disabled={!canSend}
          onClick={() => onSend?.(text, selectedGift, roseAdded)}
        >
          Send Compliment
        </button>
      </div>
    </div>
  );
};

export default ComplimentingModal;
