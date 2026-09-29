import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ContactModal — compact, self-contained popup contact form.
 * - Never taller than the screen (max-height: 100dvh - 24px); scrolls inside if needed
 * - Blurred, dimmed backdrop above the page (high z-index)
 * - Closes on outside click, the X button, or Escape
 * - Scrollbar hidden, scrolling still works
 * - No dependencies besides React / ReactDOM
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <button onClick={() => setOpen(true)}>Contact us</button>
 *   <ContactModal isOpen={open} onClose={() => setOpen(false)} onSubmit={(d) => console.log(d)} />
 */

export type ContactFormData = {
  fullName: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other" | "";
  city: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ContactFormData) => void | Promise<void>;
};

const EMPTY: ContactFormData = { fullName: "", email: "", phone: "", gender: "", city: "" };
const GENDERS: ContactFormData["gender"][] = ["Male", "Female", "Other"];

const validate = (d: ContactFormData) => {
  const e: Partial<Record<keyof ContactFormData, string>> = {};
  if (d.fullName.trim().length < 2) e.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) e.email = "Enter a valid email.";
  if (!/^[6-9]\d{9}$/.test(d.phone)) e.phone = "Enter a valid 10-digit number.";
  if (!d.gender) e.gender = "Select one option.";
  if (d.city.trim().length < 2) e.city = "Enter your city.";
  return e;
};

export default function ContactModal({ isOpen, onClose, onSubmit}: Props) {
  const [data, setData] = useState<ContactFormData>(EMPTY);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const pressStartedOnBackdrop = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setData(EMPTY);
      setErrors({});
      setSent(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const set = <K extends keyof ContactFormData>(key: K, value: ContactFormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(data);
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      setSubmitting(true);
      await onSubmit?.({
        ...data,
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        city: data.city.trim(),
      });
      setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <>
      <style>{css}</style>
      <div
        className="cm-backdrop"
        onMouseDown={(e) => (pressStartedOnBackdrop.current = e.target === e.currentTarget)}
        onMouseUp={(e) => {
          if (pressStartedOnBackdrop.current && e.target === e.currentTarget) onClose();
          pressStartedOnBackdrop.current = false;
        }}
      >
        <div className="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-title">
          <div className="cm-top">
            <div className="cm-brand">
              <span className="cm-logo">w</span>
              <span className="cm-name">
                Wel<span>vors</span>
              </span>
            </div>
            <button className="cm-close" onClick={onClose} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>

          {sent ? (
            <div className="cm-done">
              <h2 id="cm-title">Thanks, {data.fullName.trim().split(" ")[0]}.</h2>
              <p>We've received your details and will get back to you.</p>
              <button className="cm-submit" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 id="cm-title">Get in touch.</h2>
              <p className="cm-sub">Share a few details and we'll reach out.</p>

              <div className="cm-grid">
                <div className="cm-f cm-span">
                  <label className="cm-label" htmlFor="cm-name">Full name</label>
                  <input
                    id="cm-name"
                    ref={firstFieldRef}
                    className={`cm-input ${errors.fullName ? "cm-err" : ""}`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    value={data.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                  />
                  {errors.fullName && <span className="cm-msg">{errors.fullName}</span>}
                </div>

                <div className="cm-f">
                  <label className="cm-label" htmlFor="cm-email">Email</label>
                  <input
                    id="cm-email"
                    type="email"
                    className={`cm-input ${errors.email ? "cm-err" : ""}`}
                    placeholder="you@example.com"
                    autoComplete="email"
                    value={data.email}
                    onChange={(e) => set("email", e.target.value)}
                  />
                  {errors.email && <span className="cm-msg">{errors.email}</span>}
                </div>

                <div className="cm-f">
                  <label className="cm-label" htmlFor="cm-phone">Mobile number</label>
                  <div className={`cm-phone ${errors.phone ? "cm-err" : ""}`}>
                    <span className="cm-cc">+91</span>
                    <input
                      id="cm-phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="Mobile number"
                      autoComplete="tel-national"
                      value={data.phone}
                      onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  {errors.phone && <span className="cm-msg">{errors.phone}</span>}
                </div>

                <div className="cm-f">
                  <span className="cm-label" id="cm-gender-label">Gender</span>
                  <div className="cm-seg" role="radiogroup" aria-labelledby="cm-gender-label">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        role="radio"
                        aria-checked={data.gender === g}
                        className={`cm-opt ${data.gender === g ? "cm-on" : ""} ${errors.gender ? "cm-err" : ""}`}
                        onClick={() => set("gender", g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                  {errors.gender && <span className="cm-msg">{errors.gender}</span>}
                </div>

                <div className="cm-f">
                  <label className="cm-label" htmlFor="cm-city">City</label>
                  <input
                    id="cm-city"
                    className={`cm-input ${errors.city ? "cm-err" : ""}`}
                    placeholder="Enter your city"
                    autoComplete="address-level2"
                    value={data.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                  {errors.city && <span className="cm-msg">{errors.city}</span>}
                </div>
              </div>
              <h1 className={`text-red-400 text-center text-[12px] pt-2 ${status!=="error"} hidden`}>Something Went Wrong, Please try again</h1>
              <button className="cm-submit" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Submit"}
              </button>

              <p className="cm-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
                Your details stay private
              </p>
            </form>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

const css = `
.cm-backdrop{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
  padding:12px;background:rgba(20,10,16,.35);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  animation:cm-fade .2s ease-out}
.cm-modal{position:relative;width:100%;max-width:520px;box-sizing:border-box;
  max-height:calc(100vh - 24px);max-height:calc(100dvh - 24px);
  overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none;
  background:#fff;border-radius:22px;padding:20px 24px 16px;box-shadow:0 30px 80px rgba(0,0,0,.28);color:#222;
  font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;animation:cm-rise .28s cubic-bezier(.2,.8,.2,1)}
.cm-modal::-webkit-scrollbar{display:none}
.cm-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.cm-brand{display:flex;align-items:center;gap:10px}
.cm-logo{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;color:#fff;font-weight:700;
  font-size:15px;background:linear-gradient(135deg,#f472a8,#e0195f);box-shadow:0 6px 16px rgba(224,25,95,.35)}
.cm-name{font-size:21px;font-weight:700;letter-spacing:-.4px;color:#222}
.cm-name span{color:#c2185b}
.cm-close{width:32px;height:32px;border-radius:50%;border:1px solid #e6e6e6;background:#fff;color:#222;
  display:grid;place-items:center;cursor:pointer;transition:background .15s}
.cm-close:hover{background:#f6f6f6}
.cm-modal h2{font-family:Georgia,"Times New Roman",serif;font-weight:400;font-size:27px;margin:0 0 4px;color:#222}
.cm-sub{margin:0 0 4px;color:#6f6a6a;font-size:14px;line-height:1.4}
.cm-grid{display:grid;grid-template-columns:1fr 1fr;column-gap:12px}
.cm-span{grid-column:1 / -1}
.cm-f{min-width:0}
.cm-label{display:block;margin:10px 0 5px;font-size:13px;font-weight:600;color:#222}
.cm-input,.cm-phone{width:100%;box-sizing:border-box;height:40px;border:1.5px solid #f3cfdc;border-radius:12px;
  background:#fff;transition:box-shadow .15s,border-color .15s}
.cm-input{padding:0 12px;font-size:15px;color:#222;outline:none;font-family:inherit}
.cm-input::placeholder,.cm-phone input::placeholder{color:#a9a4a6}
.cm-input:focus,.cm-phone:focus-within{border-color:#f3a6c2;box-shadow:0 0 0 4px rgba(244,114,168,.16)}
.cm-phone{display:flex;align-items:center}
.cm-cc{padding:0 10px;font-weight:600;font-size:15px;height:22px;line-height:22px;border-right:1.5px solid #f3cfdc}
.cm-phone input{flex:1;min-width:0;height:100%;border:0;outline:0;padding:0 10px;font-size:15px;
  background:transparent;color:#222;font-family:inherit}
.cm-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.cm-opt{height:40px;padding:0;border-radius:12px;border:1.5px solid #f3cfdc;background:#fff;font-size:13px;color:#444;
  cursor:pointer;font-family:inherit;transition:all .15s}
.cm-opt:hover{border-color:#f3a6c2}
.cm-opt:focus-visible{outline:none;box-shadow:0 0 0 4px rgba(244,114,168,.16)}
.cm-opt.cm-on{color:#fff;font-weight:600;border-color:transparent;background:linear-gradient(135deg,#f472a8,#e0195f)}
.cm-err{border-color:#e0195f !important}
.cm-msg{display:block;margin-top:4px;font-size:12px;color:#d0134f}
.cm-submit{width:100%;height:44px;margin-top:16px;border:0;border-radius:12px;color:#fff;font-size:16px;
  font-weight:700;cursor:pointer;font-family:inherit;background:linear-gradient(110deg,#f472a8,#e0195f);
  transition:transform .1s,opacity .15s}
.cm-submit:hover{opacity:.93}
.cm-submit:active{transform:scale(.99)}
.cm-submit:disabled{opacity:.6;cursor:not-allowed}
.cm-note{display:flex;align-items:center;justify-content:center;gap:6px;margin:10px 0 0;font-size:13px;color:#9a9494}
.cm-done p{color:#6f6a6a;font-size:15px;line-height:1.5;margin:0}
@keyframes cm-fade{from{opacity:0}to{opacity:1}}
@keyframes cm-rise{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.cm-backdrop,.cm-modal{animation:none}}
@media (max-width:520px){
  .cm-modal{padding:16px 16px 14px}
  .cm-grid{grid-template-columns:1fr}
}
`;
