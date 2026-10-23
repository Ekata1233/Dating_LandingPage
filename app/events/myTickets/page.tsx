"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  RefreshCw,
  Search,
  Ticket,
  TicketCheck,
  X,
} from "lucide-react";
import { MoonLoader } from "react-spinners";

import {
  useMyTickets,
  type MyTicketsBooking,
  type TicketFilter,
} from "@/app/context/EventContext";

/* -------------------------------------------------------------------------- */
/*  MyTickets                                                                 */
/*                                                                            */
/*  Full-width, responsive list of the events a member has booked.             */
/*  Data: GET /api/user/event/my-ticket?status=… (via useMyTickets).           */
/*                                                                            */
/*  Design language matches /events and /events/[id]:                          */
/*   - same warm palette, Inter headings, pink accents                         */
/*   - max-w-7xl content column, sticky sub-header                             */
/*   - responsive 1 / 2 / 3 column card grid                                   */
/* -------------------------------------------------------------------------- */

/* ------------------------------ status meta -------------------------------- */
type StatusMeta = { dot: string; text: string; bg: string; label: string };

const STATUS_STYLE: Record<string, StatusMeta> = {
  PAYMENT_PENDING: { dot: "#E8A53D", text: "#8A6410", bg: "#FFF4E0", label: "Payment pending" },
  PENDING: { dot: "#E8A53D", text: "#8A6410", bg: "#FFF4E0", label: "Pending" },
  CONFIRMED: { dot: "#3F8F5B", text: "#2C6A42", bg: "#EAF6EE", label: "Confirmed" },
  ATTENDED: { dot: "#3F8F5B", text: "#2C6A42", bg: "#EAF6EE", label: "Attended" },
  CANCELLED: { dot: "#C21559", text: "#8E1240", bg: "#FBE8EF", label: "Cancelled" },
  REFUND_PENDING: { dot: "#E8A53D", text: "#8A6410", bg: "#FFF4E0", label: "Refund pending" },
  REFUNDED: { dot: "#6B655F", text: "#5A554F", bg: "#F4EFE7", label: "Refunded" },
  EXPIRED: { dot: "#9C948C", text: "#6B655F", bg: "#F4EFE7", label: "Expired" },
};

const statusMeta = (status: string): StatusMeta =>
  STATUS_STYLE[status] ?? { dot: "#9C948C", text: "#6B655F", bg: "#F4EFE7", label: status };

/** A ticket is "inactive" (dimmed, no entry) for these statuses. */
const INACTIVE = new Set(["CANCELLED", "REFUNDED", "EXPIRED"]);

/* ------------------------------ filter chips ------------------------------- */
const FILTERS: { key: TicketFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PENDING", label: "Pending" },
  { key: "PAYMENT_PENDING", label: "Payment pending" },
  { key: "ATTENDED", label: "Attended" },
  { key: "CANCELLED", label: "Cancelled" },
  { key: "REFUND_PENDING", label: "Refund pending" },
  { key: "REFUNDED", label: "Refunded" },
  { key: "EXPIRED", label: "Expired" },
];

/* --------------------------------- tokens ---------------------------------- */
const C = {
  bg: "#FCF8F4",
  ink: "#2B2A28",
  pink: "#C21559",
  pinkDeep: "#A81249",
  body: "#6B655F",
  label: "#9C948C",
  border: "#EDE4DC",
  ctaFrom: "#C93B68",
  ctaTo: "#B31E52",
  stripBg: "#F4EFE7",
  white: "#FFFFFF",
  lightPink: "#FFF0F3",
};

/* Same font stack as the filter cards on /events — used everywhere on this page. */
const FONT_STACK =
  '"Inter", "Helvetica Neue", "Segoe UI", Arial, sans-serif';

/* --------------------------------- helpers --------------------------------- */

/** "Thu, Oct 22" (fixed locale so server and client always match) */
function formatDay(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** "7:30 PM" — prefers the event's startTime, falls back to the date. */
function formatTime(iso?: string | null, start?: string | null): string {
  if (start) return start;
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const PLACEHOLDER =
  "linear-gradient(165deg, #ffb36b 0%, #d9573f 48%, #4a2230 100%)";

function bookingTitle(b: MyTicketsBooking): string {
  return b.event?.title || "Event";
}

function bookingVenue(b: MyTicketsBooking): string {
  return b.event?.fullAddress || b.event?.venueName || "";
}

/** "MEN" → "Men", "WOMEN" → "Women", "COUPLE" → "Couple", "OTHER_DATES" → "Other Dates" */
function humanize(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/* -------------------------------- component -------------------------------- */
export default function MyTicketsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<TicketFilter>("ALL");
  const [query, setQuery] = useState("");

  const { bookings, loading, error, refetch } = useMyTickets(filter);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookings;
    return bookings.filter((b) => {
      const hay = [
        bookingTitle(b),
        bookingVenue(b),
        b.bookingNumber,
        ...b.tickets.map((t) => t.ticketId),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bookings, query]);

  const goToEvent = (b: MyTicketsBooking) => {
    const id = b?.id;
    if (id) router.replace(`/app/booking-confirmation/${id}`);
  };

  return (
    <main
      className="min-h-screen pb-20 pt-11 lg:pt-16"
      style={{
        background: C.bg,
        color: C.ink,
        fontFamily: FONT_STACK,
      }}
    >
      {/* ------------------------------ HERO STRIP ------------------------------ */}
      <div className="w-full" style={{ background: C.stripBg }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="mb-2 inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-full border-0 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wide backdrop-blur transition hover:bg-white"
              style={{ color: C.pink }}
            >
              <ArrowRight size={14} className="rotate-180" />
              All events
            </button>

            <h1
              className="text-[30px] font-extrabold leading-tight tracking-tight sm:text-[42px]"
              style={{ fontFamily: FONT_STACK, color: C.ink }}
            >
              My Tickets
            </h1>
            <p className="text-sm sm:text-base" style={{ color: C.body }}>
              Every event you&apos;ve booked — tap a ticket to view the event or
              show your entry pass.
            </p>
          </div>
        </div>
      </div>

      {/* ------------------------------ CONTROLS ------------------------------ */}
      <div
        className="sticky top-0 z-30 w-full backdrop-blur"
        style={{ background: "rgba(252, 248, 244, 0.85)", borderBottom: `1px solid ${C.border}` }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          {/* filter chips */}
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {FILTERS.map(({ key, label }) => {
              const on = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={on}
                  className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition"
                  style={{
                    background: on ? `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` : C.white,
                    color: on ? C.white : C.body,
                    border: `1px solid ${on ? "transparent" : C.border}`,
                    boxShadow: on ? "0 6px 16px -8px rgba(194,21,89,.6)" : "none",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* search */}
          <label
            className="flex w-full items-center gap-2 rounded-full px-4 py-2.5 transition focus-within:ring-2 lg:max-w-xs"
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              color: C.label,
            }}
          >
            <Search size={17} className="shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event, venue or ticket ID"
              aria-label="Search your tickets"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
              style={{ color: C.ink }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="flex cursor-pointer items-center"
                style={{ color: C.label }}
              >
                <X size={15} />
              </button>
            )}
          </label>
        </div>
      </div>

      {/* -------------------------------- GRID -------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <MoonLoader color={C.pink} size={30} speedMultiplier={1.6} />
          </div>
        ) : error ? (
          <div
            className="flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center"
            style={{ background: C.white, border: `1px solid ${C.border}` }}
          >
            <span
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: C.lightPink, color: C.pink }}
            >
              <Ticket size={26} />
            </span>
            <h3 className="text-lg font-bold" style={{ color: C.ink }}>
              Something went wrong
            </h3>
            <p className="mt-1 max-w-sm text-sm" style={{ color: C.body }}>
              {error}
            </p>
            <button
              type="button"
              onClick={refetch}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-3xl px-6 py-20 text-center"
            style={{ background: C.white, border: `1px solid ${C.border}` }}
          >
            <span
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: C.lightPink, color: C.pink }}
            >
              <Ticket size={26} />
            </span>
            <h3 className="text-lg font-bold" style={{ color: C.ink }}>
              No tickets found
            </h3>
            <p className="mt-1 max-w-sm text-sm" style={{ color: C.body }}>
              {query
                ? "Try a different search or clear the filters."
                : filter === "ALL"
                  ? "Tickets you book will show up here."
                  : "No tickets with this status."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="mt-6 cursor-pointer rounded-full px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5"
              style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
            >
              Browse events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((b) => (
              <BookingCard  key={b.id} booking={b} onView={() => goToEvent(b)} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------------------- booking card ------------------------------ */
function BookingCard({
  booking: b,
  onView,
}: {
  booking: MyTicketsBooking;
  onView: () => void;
}) {
  const st = statusMeta(b.status);
  const inactive = INACTIVE.has(b.status);
  const day = formatDay(b.event?.eventDate);
  const time = formatTime(b.event?.eventDate, b.event?.startTime);
  const venue = bookingVenue(b);
  const router = useRouter();
  function handleBookingCardClick() {
    router.replace(`/events/${b.event.id}`)
  }
  const ticketTypes = Array.from(
    new Set(b.tickets.map((t) => humanize(t.ticketType)).filter(Boolean))
  );

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1"
      style={{
        background: C.white,
        border: `1px solid ${C.border}`,
        boxShadow: "0 18px 50px -34px rgba(43,42,40,0.5)",
      }}
    >
      {/* poster */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16 / 9", background: PLACEHOLDER }}
      >
        {b.event?.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={b.event.heroImage}
            alt={bookingTitle(b)}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            style={{ filter: inactive ? "grayscale(.7)" : "none" }}
          />
        )}

        {/* status badge */}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide"
          style={{ background: st.bg, color: st.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.dot }} />
          {st.label}
        </span>

        {/* date chip */}
        {day && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
            <Calendar size={12} />
            {day}
          </span>
        )}
      </div>

      {/* info */}
      <div className="flex flex-1 flex-col p-5">
        <h2
          className="text-[19px] font-extrabold leading-snug tracking-tight"
          style={{ fontFamily: FONT_STACK, color: C.ink }}
        >
          {bookingTitle(b)}
        </h2>

        <div className="mt-3 flex flex-col gap-2 text-sm" style={{ color: C.body }}>
          <span className="inline-flex items-center gap-2">
            <Clock size={15} style={{ color: C.pink }} />
            {[day, time].filter(Boolean).join(" · ")}
          </span>
          {venue && (
            <span className="inline-flex items-center gap-2">
              <MapPin size={15} style={{ color: C.pink }} />
              <span className="line-clamp-1">{venue}</span>
            </span>
          )}
        </div>

        {/* stub detail */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {ticketTypes.map((type) => (
            <span
              key={type}
              className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ background: C.stripBg, color: C.body }}
            >
              {type}
            </span>
          ))}
          <span
            className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ background: C.stripBg, color: C.body }}
          >
            {b.ticketCount} {b.ticketCount === 1 ? "ticket" : "tickets"}
          </span>
          <span
            className="rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
            style={{ background: C.lightPink, color: C.pink }}
          >
            {b.bookingNumber}
          </span>
        </div>

        {/* actions */}
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={onView}
            disabled={!b.event?.id || inactive}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              background: inactive
                ? "#E6E0DA"
                : `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})`,
              color: inactive ? C.label : C.white,
            }}
          >
            <TicketCheck size={17} />
            {inactive ? st.label : "View ticket"}
          </button>
        </div>
      </div>
    </article>
  );
}

