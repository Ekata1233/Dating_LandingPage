import React from "react";

/**
 * RequestDateModal
 * -----------------
 * Independent, dependency-free (React only) popup component for the
 * "Request a date with …" card.
 *
 * Sizing:
 *  - Fixed width: 320px (matches ComplimentingModal).
 *  - Height is automatic — it grows to fit its content, so the card keeps
 *    clean proportions instead of stretching to fill an arbitrary box.
 *  - Renders as a fixed-position overlay above everything else on the page
 *    (z-index: 1000), dimming the background. Clicking the backdrop
 *    (outside the card) or pressing Escape closes it via onClose.
 *
 * Usage:
 *   const [open, setOpen] = useState(true);
 *   {open && (
 *     <RequestDateModal
 *       name="Sanyogeeta Deshmukh"
 *       age={24}
 *       city="Mumbai"
 *       avatarUrl="/sanyogeeta.jpg"
 *       activity="Dinner with good company"
 *       date="2026-09-30"
 *       time="10:25 AM"
 *       onClose={() => setOpen(false)}
 *       onSend={(payload) => sendDateRequest(payload)}
 *       onCancel={() => setOpen(false)}
 *     />
 *   )}
 */

const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.rdm-backdrop {
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
.rdm-backdrop *, .rdm-backdrop *::before, .rdm-backdrop *::after { box-sizing: border-box; }

.rdm-card {
  width: 320px;
  max-width: 100%;
  max-height: min(700px, 92vh);
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
.rdm-card::-webkit-scrollbar { display: none; width: 0; height: 0; }

.rdm-handle {
  width: 44px;
  height: 5px;
  border-radius: 999px;
  background: #d9d2c5;
  margin: 0 auto 16px;
}

.rdm-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #f3f0eb;
  color: #5c564e;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.rdm-close svg { width: 15px; height: 15px; }

.rdm-title {
  margin: 0;
  padding-right: 34px;
  font-size: 21px;
  font-weight: 700;
  line-height: 1.25;
}

.rdm-sub {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: #7c756b;
}

.rdm-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 18px;
  background: #f3f0eb;
}
.rdm-avatar {
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  overflow: hidden;
  background: #eee6d6;
  display: grid;
  place-items: center;
}
.rdm-avatar img { width: 100%; height: 100%; object-fit: cover; }
.rdm-avatar svg { width: 55%; height: 55%; color: #b9b0a0; }
.rdm-profile-text { min-width: 0; }
.rdm-profile-name { font-size: 15.5px; font-weight: 700; line-height: 1.3; }
.rdm-profile-city { margin-top: 2px; font-size: 12.5px; color: #7c756b; }

.rdm-safety {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  padding: 14px;
  border-radius: 18px;
  background: #e6f6ea;
  color: #1b7a3d;
}
.rdm-safety svg { flex: none; width: 18px; height: 18px; margin-top: 1px; }
.rdm-safety p { margin: 0; font-size: 12.5px; line-height: 1.5; }

.rdm-section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  font-size: 15px;
  font-weight: 700;
}
.rdm-section-label .rdm-boost {
  font-size: 11.5px;
  font-weight: 600;
  color: #7c756b;
}
.rdm-section-label svg { width: 14px; height: 14px; color: #e0a03a; }

.rdm-bill-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 12px;
}
.rdm-bill-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  border-radius: 999px;
  border: 2px solid #efe7dd;
  background: #f9f7f2;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #1c1a17;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}
.rdm-bill-emoji { font-size: 16px; line-height: 1; flex: none; }
.rdm-bill-option[aria-pressed="true"] {
  border-color: #e23d68;
  background: #fff;
  color: #e23d68;
}

.rdm-message-label {
  margin-top: 18px;
  font-size: 15px;
  font-weight: 700;
}
.rdm-textarea {
  width: 100%;
  min-height: 84px;
  margin-top: 10px;
  border: 2px solid #efe7dd;
  border-radius: 18px;
  background: #fff;
  font: inherit;
  font-size: 13.5px;
  line-height: 1.5;
  color: #1c1a17;
  padding: 13px 15px;
  resize: vertical;
}
.rdm-textarea::placeholder { color: #9b9488; opacity: 1; }
.rdm-textarea:focus {
  outline: none;
  border-color: #e23d68;
  box-shadow: 0 0 0 3px rgba(226, 61, 104, 0.14);
}

.rdm-send {
  width: 100%;
  margin-top: 18px;
  height: 50px;
  border: none;
  border-radius: 999px;
  background: #e23d68;
  color: #fff;
  font: inherit;
  font-size: 15.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 22px rgba(226, 61, 104, 0.3);
  transition: opacity 0.15s ease, box-shadow 0.15s ease;
}
.rdm-send:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

.rdm-cancel {
  width: 100%;
  margin-top: 10px;
  height: 50px;
  border: 2px solid #efe7dd;
  border-radius: 999px;
  background: #fff;
  color: #1c1a17;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
.rdm-cancel:hover { background: #f9f7f2; }

.rdm-bill-option:focus-visible,
.rdm-send:focus-visible,
.rdm-cancel:focus-visible,
.rdm-close:focus-visible { outline: 3px solid #e23d68; outline-offset: 2px; }
`;

/* ---------- icons ---------- */
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l7 3v6c0 5-3.4 8.9-7 11-3.6-2.1-7-6-7-11V5l7-3z" />
  </svg>
);
const SparkIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z" />
  </svg>
);
const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
);

/* ---------- data ---------- */
export type BillOption = "ill-pay" | "split" | "you-pay" | "decide-there";

interface BillChoice {
  id: BillOption;
  emoji: string;
  label: string;
}

const BILL_OPTIONS: BillChoice[] = [
  { id: "ill-pay", emoji: "🧑‍💼", label: "I'll pay" },
  { id: "split", emoji: "🤝", label: "Split (TTMM)" },
  { id: "you-pay", emoji: "🧑‍💼", label: "You pay" },
  { id: "decide-there", emoji: "🧑‍💼", label: "Decide there" },
];

/* ---------- component ---------- */
export interface RequestDatePayload {
  billOption: BillOption;
  message: string;
}

export interface RequestDateModalProps {
  name: string;
  age?: number;
  city?: string;
  avatarUrl?: string;
  activity?: string;
  date?: string;
  time?: string;
  defaultBillOption?: BillOption;
  messagePlaceholder?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onSend?: (payload: RequestDatePayload) => void;
  className?: string;
}

const RequestDateModal: React.FC<RequestDateModalProps> = ({
  name,
  age,
  city,
  avatarUrl,
  activity = "Dinner with good company",
  date,
  time,
  defaultBillOption = "ill-pay",
  messagePlaceholder,
  onClose,
  onCancel,
  onSend,
  className,
}) => {
  const [billOption, setBillOption] = React.useState<BillOption>(defaultBillOption);
  const [message, setMessage] = React.useState("");

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

  const placeholder = messagePlaceholder ?? `Hey ${name}! I'd love to join you for walk…`;

  return (
    <div className={`rdm-backdrop${className ? " " + className : ""}`} onMouseDown={handleBackdropClick}>
      <style>{css}</style>
      <div className="rdm-card" role="dialog" aria-modal="true" aria-label={`Request a date with ${name}`}>
        <button type="button" className="rdm-close" aria-label="Close" onClick={onClose}>
          <CloseIcon />
        </button>
        <div className="rdm-handle" aria-hidden="true" />

        <h2 className="rdm-title">Request a date with {name}</h2>
        <p className="rdm-sub">
          Ask to join {activity}
          {date ? ` · ${date}` : ""}
          {time ? ` · ${time}` : ""}. If they accept, you can meet right away.
        </p>

        <div className="rdm-profile">
          <div className="rdm-avatar">
            {avatarUrl ? <img src={avatarUrl} alt={name} /> : <PersonIcon />}
          </div>
          <div className="rdm-profile-text">
            <div className="rdm-profile-name">
              {name}
              {age ? `, ${age}` : ""}
            </div>
            {city && <div className="rdm-profile-city">{city}</div>}
          </div>
        </div>

        <div className="rdm-safety">
          <ShieldIcon />
          <p>Meet in the public venue. Your exact location stays private until they accept.</p>
        </div>

        <div className="rdm-section-label">
          Bill suggestion <span className="rdm-boost">· boosts your chance</span>
          <SparkIcon />
        </div>
        <div className="rdm-bill-grid" role="radiogroup" aria-label="Bill suggestion">
          {BILL_OPTIONS.map((b) => (
            <button
              key={b.id}
              type="button"
              role="radio"
              aria-checked={billOption === b.id}
              aria-pressed={billOption === b.id}
              className="rdm-bill-option"
              onClick={() => setBillOption(b.id)}
            >
              <span className="rdm-bill-emoji">{b.emoji}</span>
              {b.label}
            </button>
          ))}
        </div>

        <label className="rdm-message-label" htmlFor="rdm-message">
          Add a message
        </label>
        <textarea
          id="rdm-message"
          className="rdm-textarea"
          placeholder={placeholder}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button type="button" className="rdm-send" onClick={() => onSend?.({ billOption, message })}>
          Send date request
        </button>
        <button
          type="button"
          className="rdm-cancel"
          onClick={() => {
            onCancel?.();
            onClose?.();
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RequestDateModal;
