"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEventData, Event_Type } from "@/app/context/EventContext";
import { MoonLoader } from "react-spinners";

const C = {
  bg: "#FCF8F4",
  headingDark: "#2B2A28",
  pink: "#C21559",
  body: "#6B655F",
  label: "#9C948C",
  border: "#EDE4DC",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  badgeBg: "#FBE8EF",
  stripBg: "#F4EFE7",
  white: "#FFFFFF",
  lightPink: "#FFF0F3",
  amber: "#E8A53D",
  amberBg: "#FFF4E0",
};

type ModalType = "share" | null;

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time?: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm} IST`;
}

function getPrice(ev: Event_Type): string | null {
  const prices = [ev.menEntryPrice, ev.womenEntryPrice, ev.otherEntryPrice].filter(Boolean);
  if (prices.length === 0) return null;
  const nums = prices.map((p) => parseFloat(p!)).filter((n) => !isNaN(n));
  if (nums.length === 0) return prices[0] ?? null;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  if (min === max) return "\u20B9" + min;
  return "\u20B9" + min + " \u2013 \u20B9" + max;
}

function getSpotsText(ev: Event_Type): string {
  if (ev.spotsLeft != null && ev.spotsLeft > 0) return ev.spotsLeft + " spots left";
  if (ev.totalCapacity != null) return (ev.totalCapacity - ev.bookedCount) + " spots left";
  return "";
}

/* ---- SVG Icon Components ---- */
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ---- Main Component ---- */
export default function EventDetails() {
  const router = useRouter();
  const params = useParams();
  const { events, loading, error } = useEventData();
  const [modal, setModal] = useState<ModalType>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const event = useMemo(() => {
    if (!params?.id) return null;
    return events.find((e) => e.id === params.id) ?? null;
  }, [params?.id, events]);

  const toggleFaq = (index: number) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  const handleShare = async (type: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (type === "copy") {
      try { await navigator.clipboard.writeText(url); alert("Event link copied!"); } catch { alert("Unable to copy the link."); }
      return;
    }
    if (type === "whatsapp") {
      window.open("https://wa.me/?text=" + encodeURIComponent("Check out this event on Welvors: " + url), "_blank", "noopener,noreferrer");
      return;
    }
    if (type === "twitter") {
      window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("Check out this event on Welvors!") + "&url=" + encodeURIComponent(url), "_blank", "noopener,noreferrer");
      return;
    }
    if (type === "instagram") {
      try { await navigator.clipboard.writeText(url); alert("Event link copied. Share it on Instagram."); } catch { alert("Unable to copy."); }
    }
  };

  const faqs = [
    { q: "How is this event safe?", a: "All attendees are verified members with confirmed ID, phone, and background checks. Welvors team is present throughout. Trust-first environment only." },
    { q: "Can I bring a friend not on Welvors?", a: "No, this is exclusive to verified Welvors members. Your friend can join Welvors first!" },
    { q: "Will my attendance be visible to others?", a: "No, your attendance is private. You will only be visible to other attendees at the event." },
    { q: "Can I contact the host before the event?", a: "Yes, you will receive the host contact details and a Welvors event guide 24 hours before the event." },
  ];

  /* Loading */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: C.bg }}>
        <MoonLoader color={C.pink} speedMultiplier={2} />
      </div>
    );
  }

  /* Not found */
  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5" style={{ background: C.bg }}>
        <p className="text-lg font-semibold" style={{ color: C.headingDark }}>{error || "Event not found"}</p>
        <button type="button" onClick={() => router.back()} className="cursor-pointer rounded-xl border-0 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, " + C.ctaFrom + ", " + C.ctaTo + ")" }}>
          Go Back
        </button>
      </div>
    );
  }

  const price = getPrice(event);
  const spotsText = getSpotsText(event);
  const dateStr = formatDate(event.eventDate);
  const startTimeStr = formatTime(event.startTime);
  const endTimeStr = formatTime(event.endTime);
  const timeRange = startTimeStr && endTimeStr ? startTimeStr + " \u2013 " + endTimeStr : startTimeStr || endTimeStr || "";
  const handleBookNow = () => {
    if (typeof document === "undefined") return;
    const loginBtn = document.querySelector<HTMLElement>("[data-login-trigger]");
    loginBtn?.click();
  };
  return (
    <main style={{ background: C.bg, color: C.headingDark, fontFamily: "var(--font-quicksand), system-ui, sans-serif" }} className="pt-16">
      {/* HERO IMAGE */}
      <div className="relative w-full overflow-hidden" style={{ background: C.border }}>
        <img src={event.heroImage} alt={event.title} className="h-[240px] w-full object-cover sm:h-[340px] md:h-[400px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* TOP BAR */}
      <div className="relative z-20 mx-auto flex max-w-[1100px] -mt-14 items-center justify-between px-4 sm:px-6">
        <button type="button" onClick={() => router.back()} aria-label="Go back" className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white shadow-md transition hover:scale-105" style={{ color: C.headingDark }}>
          <BackIcon />
        </button>

      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-[1100px] px-4 pb-28 pt-6 sm:px-6">
        {/* Title + Meta */}
        <div className="mb-6">
          {event.eventTag && (
            <span className="mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide" style={{ background: C.badgeBg, color: C.pink }}>
              {event.eventTag}
            </span>
          )}
          <h1 className="mb-4 text-[26px] font-extrabold leading-tight sm:text-[32px]" style={{ fontFamily: "Georgia, serif", color: C.headingDark }}>
            {event.title}
          </h1>
          {event.fillingFast && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: C.amberBg, color: C.amber }}>
              <span className="h-2 w-2 rounded-full" style={{ background: C.amber }} />
              {event.fillingFastText || "Filling fast"}
            </div>
          )}
        </div>

        {/* Two-column */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* LEFT COLUMN */}
          <div className="min-w-0 flex-1">
            {/* Date / Time / Location cards */}
            <div className="mb-8 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: C.white, border: "1px solid " + C.border }}>
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                  <CalendarIcon />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.headingDark }}>{dateStr}</p>
                  {timeRange && <p className="mt-0.5 text-sm" style={{ color: C.body }}>{timeRange}</p>}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: C.white, border: "1px solid " + C.border }}>
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                  <MapPinIcon />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: C.headingDark }}>{event.fullAddress}</p>
                  <button type="button" className="mt-1 flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-xs font-bold" style={{ color: C.pink }}>
                    View on map <ArrowRightIcon />
                  </button>
                </div>
              </div>

              {event.totalCapacity != null && (
                <div className="flex items-start gap-3 rounded-2xl p-4" style={{ background: C.white, border: "1px solid " + C.border }}>
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                    <UsersIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.headingDark }}>{event.bookedCount} attending</p>
                    {spotsText && <p className="mt-0.5 text-xs font-semibold" style={{ color: event.fillingFast ? C.amber : C.body }}>{spotsText}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <section className="mb-8">
              <h2 className="mb-4 text-base font-extrabold uppercase tracking-wide" style={{ color: C.headingDark }}>About this event</h2>
              <div className="rounded-2xl p-5 sm:p-6" style={{ background: C.white, border: "1px solid " + C.border }}>
                <p className="text-[15px] leading-relaxed" style={{ color: C.body }}>
                  {event.title}. Join verified members for an exclusive in-person experience. All attendees go through Welvors trust verification. No pressure, no awkwardness, just real people looking for genuine connections.
                </p>
                {event.eventIntent && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: C.badgeBg, color: C.pink }}>
                      <ShieldIcon />
                      {event.eventIntent === "MIXED" ? "All genders welcome" : event.eventIntent === "WOMEN_ONLY" ? "Women only" : event.eventIntent === "MEN_ONLY" ? "Men only" : event.eventIntent}
                    </span>
                    {event.minAge != null && event.maxAge != null && (
                      <span className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: C.stripBg, color: C.body }}>
                        Age {event.minAge}–{event.maxAge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Feature Tags */}
            {event.featureTags && event.featureTags.length > 0 && (
              <section className="mb-8">
                <h2 className="mb-4 text-base font-extrabold uppercase tracking-wide" style={{ color: C.headingDark }}>Highlights</h2>
                <div className="flex flex-wrap gap-2">
                  {event.featureTags.map((tag) => (
                    <span key={tag.id} className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold" style={{ background: C.white, color: C.body, border: "1px solid " + C.border }}>
                      <TagIcon />
                      {tag.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Attendee Summary */}
            {event.bookingSummary && (
              <section className="mb-8">
                <div className="rounded-2xl p-5" style={{ background: C.white, border: "1px solid " + C.border }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: C.lightPink, color: C.pink }}>
                      <UsersIcon />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.headingDark }}>{event.bookingSummary}</p>
                      {event.last24HoursText && <p className="mt-0.5 text-xs" style={{ color: C.body }}>{event.last24HoursText}</p>}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FAQs */}
            <section>
              <h2 className="mb-4 text-base font-extrabold uppercase tracking-wide" style={{ color: C.headingDark }}>Frequently Asked Questions</h2>
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="mb-3 overflow-hidden rounded-2xl" style={{ background: C.white, border: "1px solid " + C.border }}>
                    <button type="button" onClick={() => toggleFaq(index)} className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-4 text-left" style={{ color: C.headingDark }}>
                      <span className="pr-4 text-sm font-bold">{faq.q}</span>
                      <span className="shrink-0 transition-transform duration-200" style={{ color: C.pink, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <ChevronDownIcon />
                      </span>
                    </button>
                    <div className="grid transition-all duration-200" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}>
                      <div className="overflow-hidden">
                        <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: C.body }}>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>

          {/* RIGHT COLUMN — Sticky sidebar */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* Price Card */}
              <div className="rounded-2xl p-5" style={{ background: C.white, border: "1px solid " + C.border }}>
                {price ? (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase tracking-wide" style={{ color: C.label }}>Price</p>
                    <p className="mt-1 text-2xl font-extrabold" style={{ color: C.headingDark }}>{price}</p>
                    {event.discountPercentage && parseFloat(event.discountPercentage) > 0 && (
                      <span className="mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold" style={{ background: C.badgeBg, color: C.pink }}>
                        {event.discountPercentage}% off
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-2xl font-extrabold" style={{ color: C.headingDark }}>Free</p>
                  </div>
                )}

                <button
                 onClick={handleBookNow}
                 type="button" className="wv-cta-magnetic wv-cta-shimmer px-2 mb-3 flex h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl border-0 text-[15px] font-extrabold text-white" style={{ background: "linear-gradient(135deg, " + C.ctaFrom + ", " + C.ctaTo + ")" }}>
                  <TicketIcon />
                  Book Now
                </button>

                {spotsText && (
                  <p className="text-center text-xs font-bold" style={{ color: event.fillingFast ? C.amber : C.body }}>
                    {spotsText}
                  </p>
                )}
              </div>

              {/* Quick Info */}
              <div className="rounded-2xl p-5" style={{ background: C.white, border: "1px solid " + C.border }}>
                <p className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ color: C.label }}>Event Info</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: C.lightPink, color: C.pink }}><CalendarIcon /></div>
                    <div>
                      <p className="text-xs" style={{ color: C.label }}>Date</p>
                      <p className="text-sm font-bold" style={{ color: C.headingDark }}>{dateStr}</p>
                    </div>
                  </div>
                  {timeRange && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: C.lightPink, color: C.pink }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: C.label }}>Time</p>
                        <p className="text-sm font-bold" style={{ color: C.headingDark }}>{timeRange}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: C.lightPink, color: C.pink }}><MapPinIcon /></div>
                    <div>
                      <p className="text-xs" style={{ color: C.label }}>Location</p>
                      <p className="text-sm font-bold" style={{ color: C.headingDark }}>{event.fullAddress}</p>
                    </div>
                  </div>
                  {event.totalCapacity != null && (
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: C.lightPink, color: C.pink }}><UsersIcon /></div>
                      <div>
                        <p className="text-xs" style={{ color: C.label }}>Capacity</p>
                        <p className="text-sm font-bold" style={{ color: C.headingDark }}>{event.bookedCount} / {event.totalCapacity} booked</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Safety Badge */}
              <div className="rounded-2xl p-4" style={{ background: C.lightPink, border: "1px solid " + C.badgeBg }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ background: C.pink, color: C.white }}>
                    <ShieldIcon />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: C.headingDark }}>Verified Event</p>
                    <p className="text-xs" style={{ color: C.body }}>All attendees are ID verified</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t px-4 py-3 lg:hidden" style={{ background: C.white, borderColor: C.border }}>
        <div className="flex-1">
          {price ? (
            <p className="text-lg font-extrabold" style={{ color: C.headingDark }}>{price}</p>
          ) : (
            <p className="text-lg font-extrabold" style={{ color: C.headingDark }}>Free</p>
          )}
        </div>
        <button type="button" className="wv-cta-magnetic flex h-[44px] cursor-pointer items-center gap-2 rounded-xl border-0 px-6 text-sm font-extrabold text-white" style={{ background: "linear-gradient(135deg, " + C.ctaFrom + ", " + C.ctaTo + ")" }}>
          <TicketIcon />
          Register
        </button>
      </div>

      {/* SHARE MODAL */}
      {modal === "share" && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
          <div className="relative w-full max-w-[420px] rounded-2xl p-6" style={{ background: C.white }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setModal(null)} aria-label="Close" className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent" style={{ color: C.body }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <h2 className="mb-5 pr-8 text-xl font-extrabold" style={{ color: C.headingDark }}>Share Event</h2>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleShare("whatsapp")} className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 font-bold transition hover:opacity-80" style={{ background: C.stripBg, color: C.headingDark }}>WhatsApp</button>
              <button type="button" onClick={() => handleShare("instagram")} className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 font-bold transition hover:opacity-80" style={{ background: C.stripBg, color: C.headingDark }}>Instagram</button>
              <button type="button" onClick={() => handleShare("twitter")} className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 font-bold transition hover:opacity-80" style={{ background: C.stripBg, color: C.headingDark }}>Twitter</button>
              <button type="button" onClick={() => handleShare("copy")} className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 font-bold transition hover:opacity-80" style={{ background: C.stripBg, color: C.headingDark }}>Copy Link</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
