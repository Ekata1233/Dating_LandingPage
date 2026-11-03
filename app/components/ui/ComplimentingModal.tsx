import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import { SendComplimentRequest, useUsersData } from "@/app/context/UsersContext";
import React from "react";
import { toast } from "sonner";

/**
 * ComplimentingModal
 * ------------------
 * Layout (top to bottom):
 *   1. Header   – avatar, name + age, "Complimenting" + what is being complimented
 *   2. Balances – compliments, roses and wallet in one divided strip
 *   3. Message  – fixed-height field. The optional gift grid swaps into the SAME
 *                 space, so the card never changes height.
 *   4. Options  – "Add a rose" switch (and an optional "Add a gift" row)
 *   5. Send     – primary action
 *
 * Sizing:
 *   - Desktop / tablet: centred dialog, 420px wide, height follows its content.
 *   - Phones (<= 520px): bottom sheet, full width, respects the safe area.
 *   - The card only scrolls as a last resort on very short screens.
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

const CARD_WIDTH = 420;
const FIELD_HEIGHT = 148;

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.cpl-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(28, 26, 23, 0.52);
  -webkit-backdrop-filter: blur(3px);
  backdrop-filter: blur(3px);
  animation: cpl-fade 0.18s ease-out;
}
.cpl-backdrop *, .cpl-backdrop *::before, .cpl-backdrop *::after { box-sizing: border-box; }

.cpl-card {
  --cpl-pink: #e23d68;
  --cpl-pink-deep: #b3234b;
  --cpl-pink-soft: #fdecef;
  --cpl-ink: #1f1b18;
  --cpl-muted: #6b645a;
  --cpl-line: #ece3d8;
  --cpl-surface: #faf6f0;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: ${CARD_WIDTH}px;
  max-height: calc(100vh - 32px);
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 24px 20px 20px;
  background: #fff;
  border-radius: 24px;
  box-shadow:
    0 1px 2px rgba(28, 26, 23, 0.06),
    0 24px 60px rgba(28, 26, 23, 0.28);
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
@keyframes cpl-sheet {
  from { transform: translateY(40px); opacity: 0.6; }
  to { transform: none; opacity: 1; }
}

/* ---- close ---- */
.cpl-close {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 2;
  width: 32px;
  height: 32px;
  padding: 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 50%;
  background: #f3f0eb;
  color: #5c564e;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}
/* 44px tap target without changing the look */
.cpl-close::after { content: ""; position: absolute; inset: -6px; }
.cpl-close:hover { background: #e9e4dc; }
.cpl-close:active { transform: scale(0.92); }
.cpl-close svg { width: 14px; height: 14px; }

/* ---- header ---- */
.cpl-head {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-right: 40px; /* room for the close button */
}
.cpl-avatar {
  flex: none;
  width: 56px;
  height: 56px;
  margin: 3px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: #eee6d6;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--cpl-pink);
}
.cpl-avatar img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cpl-avatar svg { width: 55%; height: 55%; color: #b9b0a0; }

.cpl-head-text { flex: 1 1 auto; min-width: 0; }
.cpl-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.01em;
}
.cpl-age { font-weight: 400; color: #4a443b; }
.cpl-sub {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.3;
  color: var(--cpl-muted);
}
.cpl-sub svg { flex: none; width: 13px; height: 13px; color: var(--cpl-pink); }
.cpl-tag {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--cpl-pink-soft);
  color: var(--cpl-pink-deep);
  font-size: 12px;
  font-weight: 600;
}

/* ---- balances ---- */
.cpl-stats {
  display: grid;
  grid-template-columns: repeat(var(--cpl-cols, 3), minmax(0, 1fr));
  background: var(--cpl-surface);
  border: 1px solid var(--cpl-line);
  border-radius: 16px;
}
.cpl-stat {
  min-width: 0;
  padding: 10px 6px;
  text-align: center;
}
.cpl-stat + .cpl-stat { border-left: 1px solid var(--cpl-line); }
.cpl-stat-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.cpl-stat-value svg { flex: none; width: 17px; height: 17px; }
.cpl-stat-value span { font-size: 16px; line-height: 1; }
.cpl-stat-value b { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
.cpl-stat-label { margin-top: 2px; font-size: 12px; color: var(--cpl-muted); }

/* ---- message / gift area (fixed height so the card never jumps) ---- */
.cpl-field {
  position: relative;
  height: ${FIELD_HEIGHT}px;
}
.cpl-textarea {
  display: block;
  width: 100%;
  height: 100%;
  padding: 14px 16px 32px;
  border: 1.5px solid var(--cpl-line);
  border-radius: 16px;
  background: #fff;
  font: inherit;
  font-size: 16px; /* keeps iOS from zooming on focus */
  line-height: 1.45;
  color: var(--cpl-ink);
  resize: none;
  overflow-y: auto;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.cpl-textarea::placeholder { color: #9b9488; opacity: 1; }
.cpl-textarea:hover { border-color: #e0d3c3; }
.cpl-textarea:focus {
  outline: none;
  border-color: var(--cpl-pink);
  box-shadow: 0 0 0 3px rgba(226, 61, 104, 0.14);
}
.cpl-count {
  position: absolute;
  right: 14px;
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
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 8px;
  border: 1.5px solid var(--cpl-line);
  border-radius: 16px;
  background: var(--cpl-surface);
}
.cpl-gift-item {
  min-height: 0;
  padding: 0;
  display: grid;
  place-items: center;
  border: 1.5px solid var(--cpl-line);
  border-radius: 12px;
  background: #fff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.12s ease, border-color 0.15s ease, background-color 0.15s ease;
}
.cpl-gift-item:hover { border-color: #f1b9c6; transform: translateY(-1px); }
.cpl-gift-item:active { transform: scale(0.94); }
.cpl-gift-item[aria-pressed="true"] { border-color: var(--cpl-pink); background: #fff0f4; }

/* ---- option rows (rose / gift) ---- */
.cpl-options { display: flex; flex-direction: column; gap: 8px; }
.cpl-row {
  width: 100%;
  min-height: 56px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid var(--cpl-line);
  border-radius: 16px;
  background: #fff;
  font: inherit;
  text-align: left;
  color: var(--cpl-ink);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.1s ease;
}
.cpl-row:hover { border-color: #f1b9c6; background: #fffafb; }
.cpl-row:active { transform: scale(0.99); }
.cpl-row.is-on { border-color: var(--cpl-pink); background: #fff8fa; }
.cpl-row-icon {
  flex: none;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--cpl-pink-soft);
  font-size: 19px;
  line-height: 1;
}
.cpl-row-text { flex: 1 1 auto; min-width: 0; }
.cpl-row-title { font-size: 15px; font-weight: 600; line-height: 1.3; }
.cpl-row-sub {
  margin-top: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
  color: var(--cpl-muted);
}
.cpl-chevron { flex: none; width: 16px; height: 16px; color: #9b9488; transition: transform 0.18s ease; }
.cpl-chevron.is-open { transform: rotate(180deg); }

.cpl-switch {
  flex: none;
  position: relative;
  width: 42px;
  height: 24px;
  border-radius: 999px;
  background: #ddd4c8;
  transition: background-color 0.18s ease;
}
.cpl-switch::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(28, 26, 23, 0.3);
  transition: transform 0.18s ease;
}
.cpl-row.is-on .cpl-switch { background: var(--cpl-pink); }
.cpl-row.is-on .cpl-switch::after { transform: translateX(18px); }

/* ---- send ---- */
.cpl-send {
  width: 100%;
  height: 52px;
  border: none;
  border-radius: 999px;
  background: var(--cpl-pink);
  color: #fff;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px rgba(226, 61, 104, 0.28);
  transition: opacity 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease, filter 0.15s ease;
}
.cpl-send:hover:not(:disabled) { filter: brightness(1.05); box-shadow: 0 10px 22px rgba(226, 61, 104, 0.34); }
.cpl-send:active:not(:disabled) { transform: scale(0.985); }
.cpl-send:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }

.cpl-close:focus-visible,
.cpl-row:focus-visible,
.cpl-gift-item:focus-visible,
.cpl-send:focus-visible { outline: 3px solid var(--cpl-pink); outline-offset: 2px; }

/* ---- phones: bottom sheet ---- */
@media (max-width: 520px) {
  .cpl-backdrop { align-items: flex-end; padding: 0; }
  .cpl-card {
    max-width: none;
    max-height: 92vh;
    max-height: 92dvh;
    padding: 24px 16px calc(16px + env(safe-area-inset-bottom, 0px));
    border-radius: 24px 24px 0 0;
    animation: cpl-sheet 0.24s cubic-bezier(0.2, 0.9, 0.3, 1);
  }
}

@media (max-width: 360px) {
  .cpl-name { font-size: 18px; }
  .cpl-stat-value { font-size: 16px; }
}

@media (prefers-reduced-motion: reduce) {
  .cpl-backdrop, .cpl-card { animation: none; }
  .cpl-card *, .cpl-card *::before, .cpl-card *::after { transition: none !important; }
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
  <svg viewBox="0 0 24 24" fill="none" stroke="#3a4252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`cpl-chevron${open ? " is-open" : ""}`}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
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
  id: string;
  name: string;
  age?: number;
  /** What is being complimented, e.g. "Photo" or "Prompt" */
  tag?: string;
  avatarUrl?: string;
  maxLength?: number;
  gifts?: GiftOption[];
  /** Shows the "Add a gift" row. Off by default, matching the current behaviour. */
  showGifts?: boolean;
  /** Kept for API compatibility. The "Try Ideas" button is currently hidden. */
  suggestions?: string[];
  onClose?: () => void;
  onSend?: (text: string, gift: GiftOption | null, withRose: boolean) => void;
  className?: string;
}

const ComplimentingModal: React.FC<ComplimentingModalProps> = ({
  id,
  name,
  age,
  tag,
  avatarUrl,
  maxLength = 140,
  gifts = DEFAULT_GIFTS,
  showGifts = false,
  onClose,
  onSend,
  className,
}) => {
  const [text, setText] = React.useState("");
  const [roseAdded, setRoseAdded] = React.useState(false);
  const [giftPickerOpen, setGiftPickerOpen] = React.useState(false);
  const [selectedGift, setSelectedGift] = React.useState<GiftOption | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { sendCompliment } = useUsersData()
  const { balances: apiBalances } = useUserProfileData();
  const comments = apiBalances?.compliments?.balance ?? 0;
  const roses = apiBalances?.roses?.balance ?? 0;
  const balance = apiBalances?.wallet?.formattedBalance;
  const statCols = balance ? 3 : 2;

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

  /* focus the message box whenever it is visible */
  React.useEffect(() => {
    if (!giftPickerOpen) textareaRef.current?.focus();
  }, [giftPickerOpen]);

  const pickGift = (g: GiftOption) => {
    setSelectedGift((cur) => (cur?.id === g.id ? null : g));
    setGiftPickerOpen(false); // back to the message, card size never changes
  };

  const count = text.length;
  const atLimit = count >= maxLength;
  const canSend = text.trim().length > 0;

  const handleSend = async () => {
    if (!canSend) return;
    if (roseAdded) {
      const compObj: SendComplimentRequest = {
        receiverId: id,
        compliment: {
          message: text,
          ideaId: "cmv6amm1c0001oz1tpm81gezh",
          targetType: null,
          targetId: null,
        },
        rose: {
          targetType: null,
          targetId: null,
        }
      }
      const response = await sendCompliment(compObj)
      if (response.success) {
        toast.success(response.message)
      }
      else {
        toast.error(response.message || "Could't Send Compliment.")
      }
    }
    else {
      const compObj: SendComplimentRequest = {
        receiverId: id,
        compliment: {
          message: text,
          ideaId: "cmv6amm1c0001oz1tpm81gezh",
          targetType: null,
          targetId: null,
        },
      }
      const response = await sendCompliment(compObj)
      if (response.success) {
        toast.success(response.message)
      }
      else {
        toast.error(response.message || "Could't Send Compliment.")
      }
    }
    onSend?.(text.trim(), selectedGift, roseAdded);
  };

  const placeholder = tag
    ? `Say what you liked about their ${tag.toLowerCase()}…`
    : "Write a sweet compliment…";

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

        {/* 1. header */}
        <div className="cpl-head">
          <div className="cpl-avatar">
            {avatarUrl ? <img src={avatarUrl} alt={name} /> : <PersonIcon />}
          </div>
          <div className="cpl-head-text">
            <div className="cpl-name" title={age != null ? `${name}, ${age}` : name}>
              {name}
              {age != null && <span className="cpl-age">, {age}</span>}
            </div>
            <div className="cpl-sub">
              <SparkleIcon />
              <span>Complimenting</span>
              {tag && <span className="cpl-tag">{tag}</span>}
            </div>
          </div>
        </div>

        {/* 2. balances */}
        <div
          className="cpl-stats"
          style={{ "--cpl-cols": statCols } as React.CSSProperties}
        >
          <div className="cpl-stat">
            <div className="cpl-stat-value">
              <CommentIcon />
              <b>{comments}</b>
            </div>
            <div className="cpl-stat-label">Comments</div>
          </div>
          <div className="cpl-stat">
            <div className="cpl-stat-value">
              <span aria-hidden="true">🌹</span>
              <b>{roses}</b>
            </div>
            <div className="cpl-stat-label">Roses</div>
          </div>
          {balance && (
            <div className="cpl-stat">
              <div className="cpl-stat-value">
                <CoinIcon />
                <b>{balance}</b>
              </div>
              <div className="cpl-stat-label">Balance</div>
            </div>
          )}
        </div>

        {/* 3. message OR gift grid (same space) */}
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
                placeholder={placeholder}
                value={text}
                maxLength={maxLength}
                onChange={(e) => setText(e.target.value.slice(0, maxLength))}
                aria-label="Compliment message"
              />
              <span className={`cpl-count${atLimit ? " is-at" : ""}`} aria-live="polite">
                {count}/{maxLength}
              </span>
            </>
          )}
        </div>

        {/* 4. options */}
        <div className="cpl-options">
          <button
            type="button"
            role="switch"
            aria-checked={roseAdded}
            className={`cpl-row${roseAdded ? " is-on" : ""}`}
            onClick={() => setRoseAdded((v) => !v)}
          >
            <span className="cpl-row-icon" aria-hidden="true">🌹</span>
            <span className="cpl-row-text">
              <span className="cpl-row-title" style={{ display: "block" }}>
                {roseAdded ? "Rose added" : "Add a rose"}
              </span>
              <span className="cpl-row-sub" style={{ display: "block" }}>
                Sends a rose with your compliment
              </span>
            </span>
            <span className="cpl-switch" aria-hidden="true" />
          </button>

          {showGifts && (
            <button
              type="button"
              className={`cpl-row${selectedGift ? " is-on" : ""}`}
              aria-expanded={giftPickerOpen}
              onClick={() => setGiftPickerOpen((v) => !v)}
            >
              <span className="cpl-row-icon" aria-hidden="true">
                {selectedGift ? selectedGift.emoji : "🎁"}
              </span>
              <span className="cpl-row-text">
                <span className="cpl-row-title" style={{ display: "block" }}>
                  {selectedGift ? selectedGift.label : "Add a gift"}
                </span>
                <span className="cpl-row-sub" style={{ display: "block" }}>
                  {selectedGift ? "Tap to change" : "Pick one to send along"}
                </span>
              </span>
              <ChevronIcon open={giftPickerOpen} />
            </button>
          )}
        </div>

        {/* 5. send */}
        <button
          type="button"
          className="cpl-send"
          disabled={!canSend}
          onClick={handleSend}
        >
          Send compliment
        </button>
      </div>
    </div>
  );
};

export default ComplimentingModal;
