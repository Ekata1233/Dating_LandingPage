"use client";

/* -------------------------------------------------------------------------- */
/*  Booking Confirmation page  (redesigned UI – data & logic unchanged)       */
/*                                                                            */
/*  Place at:  app/app/booking-confirmation/[bookingId]/page.tsx              */
/*  (any folder works — the route param must be named `bookingId`)            */
/*                                                                            */
/*  Data: usePaymentSuccess() from PaymentContext (no direct API calls)       */
/*                                                                            */
/*  Shows "Payment Successful" ONLY when booking.status === CONFIRMED and     */
/*  payment.status === COMPLETED. Otherwise shows a pending / failed state.   */
/*                                                                            */
/*  Receipt shows tickets grouped gender-wise (Men / Women / Other) using     */
/*  booking.tickets[].ticketType and booking.tickets[].ticketAmount.          */
/*                                                                            */
/*  Layout                                                                    */
/*   - fills the whole viewport (fixed, full height, own scroll)              */
/*   - sticky top bar; content is centred in a 1152px column                  */
/*   - < 1024px : single column  (status → tickets → receipt → event → CTAs)  */
/*   - ≥ 1024px : two columns    (status + tickets | receipt + event + CTAs)  */
/*   - 8-pt spacing scale, ≥ 48px touch targets, visible focus rings,         */
/*     semantic landmarks, aria-live status, reduced-motion safe              */
/* -------------------------------------------------------------------------- */

import { useMemo, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoonLoader } from "react-spinners";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Download,
  Link2,
  MapPin,
  Receipt,
  RefreshCw,
  Ticket,
  X,
} from "lucide-react";
import { PaymentSuccessData, usePaymentSuccess } from "@/app/context/PaymentContext";
import { useNavGuard } from "@/app/app/shared/useNavGuard";

/* ----------------------------- config (edit) ----------------------------- */
const MY_BOOKINGS_ROUTE = "/events/myTickets"; // your "My Bookings" page
const EVENT_ROUTE = (eventId: string) => `/events/${eventId}`; // your event details page

/* --------------------------------- theme --------------------------------- */
const C = {
  bg: "#FAF8F5",
  ink: "#1F1D1D",
  body: "#5F5953",
  label: "#837C75",
  border: "#ECE6E0",
  white: "#FFFFFF",
  pink: "#E85A7A",
  pinkDeep: "#D63F63",
  pinkSoft: "#FFEAF0",
  green: "#23995A",
  greenBg: "#E8F6EE",
  greenBorder: "#BFE6CF",
  amber: "#B97308",
  amberBg: "#FFF3DC",
  amberBorder: "#F3D9A4",
  red: "#C62828",
  redBg: "#FDECEC",
  redBorder: "#F3C4C4",
  qrBg: "#F6F3EE",
};

/* -------------------------------- helpers -------------------------------- */
function money(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
}

/** eventDate comes as midnight UTC — format in UTC so the day never shifts */
function formatEventDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function formatTime(time?: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatPaidAt(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

function pretty(v?: string | null): string {
  if (!v) return "";
  return v.replace(/[_-]+/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ---------------------------- gender helpers ---------------------------- */
const GENDER_LABEL: Record<string, string> = {
  MEN: "Men",
  WOMEN: "Women",
  OTHER: "Other",
};
const GENDER_ORDER = ["MEN", "WOMEN", "OTHER"];

const GENDER_CHIP: Record<string, { fg: string; bg: string }> = {
  MEN: { fg: "#2B65C4", bg: "#E8F0FD" },
  WOMEN: { fg: "#C2305A", bg: "#FFE9F0" },
  OTHER: { fg: "#6B3FC4", bg: "#F0E9FD" },
};

const genderLabel = (type?: string | null): string => {
  const key = (type || "OTHER").toUpperCase();
  return GENDER_LABEL[key] ?? pretty(key);
};

type GenderGroup = { type: string; count: number; amount: number };

/** Groups tickets by ticketType → [{ type: "MEN", count: 1, amount: 6 }, ...] */
function groupTicketsByGender(tickets: { ticketType?: string | null; ticketAmount?: number | null }[]): GenderGroup[] {
  const map = new Map<string, GenderGroup>();
  for (const t of tickets) {
    const key = (t.ticketType || "OTHER").toUpperCase();
    const g = map.get(key) ?? { type: key, count: 0, amount: 0 };
    g.count += 1;
    g.amount += Number(t.ticketAmount) || 0;
    map.set(key, g);
  }
  return Array.from(map.values()).sort((a, b) => {
    const ai = GENDER_ORDER.indexOf(a.type);
    const bi = GENDER_ORDER.indexOf(b.type);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

type ViewState = "success" | "pending" | "failed";

function viewState(d: PaymentSuccessData): ViewState {
  const b = (d.booking.status || "").toUpperCase();
  const p = (d.payment.status || "").toUpperCase();
  if (b === "CONFIRMED" && p === "COMPLETED") return "success";
  if (["FAILED", "CANCELLED", "REFUNDED"].includes(b) || ["FAILED", "CANCELLED", "REFUNDED"].includes(p)) return "failed";
  return "pending";
}

/** one place for everything that changes with the state */
const STATE_THEME: Record<ViewState, { fg: string; soft: string; border: string }> = {
  success: { fg: C.pink, soft: C.pinkSoft, border: "#F8CBD8" },
  pending: { fg: C.amber, soft: C.amberBg, border: C.amberBorder },
  failed: { fg: C.red, soft: C.redBg, border: C.redBorder },
};

/* -------------------------------- pieces --------------------------------- */
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`overflow-hidden rounded-3xl ${className}`}
      style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(31,29,29,.04), 0 12px 32px -20px rgba(31,29,29,.28)" }}
    >
      {children}
    </section>
  );
}

function CardHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 pb-1 pt-5 sm:px-6 sm:pt-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.pinkSoft, color: C.pink }}>
        {icon}
      </span>
      <h2 className="m-0 text-base font-bold tracking-tight" style={{ color: C.ink }}>
        {children}
      </h2>
    </div>
  );
}

function Row({
  label,
  value,
  valueColor,
  mono,
}: {
  label: string;
  value: ReactNode;
  valueColor?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-sm" style={{ color: C.label }}>
        {label}
      </dt>
      <dd
        className={`m-0 min-w-0 break-all text-right text-sm font-semibold tabular-nums ${mono ? "font-mono text-[13px]" : ""}`}
        style={{ color: valueColor ?? C.ink }}
      >
        {value}
      </dd>
    </div>
  );
}

function Divider() {
  return <div className="my-2 border-t border-dashed" style={{ borderColor: C.border }} />;
}

function Pill({ children, fg, bg, border }: { children: ReactNode; fg: string; bg: string; border?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
      style={{ color: fg, background: bg, border: border ? `1px solid ${border}` : undefined }}
    >
      {children}
    </span>
  );
}

/* --------------------------------- page ---------------------------------- */
export default function BookingConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = useMemo(() => {
    const raw = params?.bookingId;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  }, [params]);

  const { data, loading, refreshing, error, reload: load } = usePaymentSuccess(bookingId);

  /* Every route out of here goes to My Bookings (a slow page to mount) —
     lock the buttons on first click so a double tap can't push twice. */
  const goBookings = useNavGuard();
  const gotoMyBookings = () => goBookings.run(() => router.push(MY_BOOKINGS_ROUTE));

  /* ------------------------------ actions ------------------------------ */
  const handleShare = async () => {
    if (!data) return;
    const url = `${window.location.origin}${EVENT_ROUTE(data.event.id)}`;
    const text = `I've booked my spot at ${data.event.title} on Welvors! Join me?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: data.event.title, text, url });
      } catch {
        /* user dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Event link copied.");
    } catch {
      toast.error("Link not copied");
    }
  };

  const handleDownload = () => {
    // Prints only the receipt area (see print CSS below). User can "Save as PDF".
    window.print();
  };

  /* shared page styles (scrollbar, focus ring, entrance animation, print) */
  const styles = (
    <style>{`
      #wv-page { scrollbar-width: thin; scrollbar-color: #D9D2CB transparent; -webkit-font-smoothing: antialiased; }
      #wv-page::-webkit-scrollbar { width: 8px; }
      #wv-page::-webkit-scrollbar-thumb { background: #D9D2CB; border-radius: 8px; }
      #wv-page::-webkit-scrollbar-track { background: transparent; }
      .wv-focus:focus-visible { outline: 2px solid ${C.pink}; outline-offset: 2px; }
      .wv-btn { transition: transform .12s ease, filter .15s ease, background-color .15s ease; }
      .wv-btn:hover { filter: brightness(1.04); }
      .wv-btn:active { transform: scale(.985); }
      @keyframes wv-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
      @keyframes wv-pop  { 0% { transform: scale(.6); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
      @keyframes wv-ring { 0% { transform: scale(.9); opacity: .55; } 100% { transform: scale(1.35); opacity: 0; } }
      .wv-rise { animation: wv-rise .5s cubic-bezier(.2,.7,.2,1) both; }
      .wv-pop  { animation: wv-pop .55s cubic-bezier(.3,1.4,.5,1) .15s both; }
      .wv-ring { animation: wv-ring 2.4s ease-out .6s infinite; }
      @media (prefers-reduced-motion: reduce) { .wv-rise, .wv-pop, .wv-ring { animation: none !important; } }
      @media print {
        #wv-page { position: static !important; overflow: visible !important; }
        body * { visibility: hidden !important; }
        #wv-receipt, #wv-receipt * { visibility: visible !important; }
        #wv-receipt { position: absolute; inset: 0; padding: 24px; display: block !important; }
        #wv-receipt > * + * { margin-top: 24px; }
        .wv-no-print { display: none !important; }
      }
    `}</style>
  );

  /* ------------------------------ loading ------------------------------ */
  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4"
        style={{ background: C.bg }}
        role="status"
        aria-live="polite"
      >
        <MoonLoader color={C.pink} speedMultiplier={2} size={25} />
        <span className="sr-only">Loading your booking</span>
      </div>
    );
  }

  /* ------------------------------- error ------------------------------- */
  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ background: C.bg }}>
        {styles}
        <div
          role="alert"
          className="w-full max-w-md rounded-3xl px-6 py-10 text-center sm:px-10"
          style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 12px 32px -20px rgba(31,29,29,.28)" }}
        >
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: C.redBg, color: C.red }}>
            <X size={28} strokeWidth={2.6} />
          </span>
          <p className="m-0 mt-6 text-lg font-bold" style={{ color: C.ink }}>
            {error || "Kuch galat hua."}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => load()}
              className="wv-btn wv-focus h-12 cursor-pointer rounded-2xl border-0 px-6 text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C.pink}, ${C.pinkDeep})` }}
            >
              Try again
            </button>
            <button
              type="button"
              onClick={gotoMyBookings}
              disabled={goBookings.pending}
              className="wv-btn wv-focus h-12 cursor-pointer rounded-2xl px-6 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: C.white, color: C.ink, border: `1px solid ${C.border}` }}
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { booking, payment, event } = data;
  const state = viewState(data);
  const theme = STATE_THEME[state];
  const tickets = booking.tickets ?? [];
  const genderGroups = groupTicketsByGender(tickets);
  const timeStr = [formatTime(event.startTime), formatTime(event.endTime)].filter(Boolean).join(" – ");
  const dateLine = [formatEventDate(event.eventDate), timeStr].filter(Boolean).join(" · ");
  const paidVia = payment.paidVia ? pretty(payment.paidVia) : null;
  const paidAmount = payment.amount ?? booking.paidAmount ?? booking.totalAmount;

  const heading =
    state === "success" ? "Payment Successful!" : state === "pending" ? "Confirming your payment…" : "Payment not completed";

  const statusLabel = state === "success" ? "Captured" : state === "pending" ? "Pending" : pretty(payment.status) || "Failed";

  return (
    <main
      id="wv-page"
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto overflow-x-hidden"
      style={{ background: C.bg, color: C.ink, fontFamily: "var(--font-quicksand), 'DM Sans', system-ui, sans-serif" }}
    >
      {styles}

      {/* ------------------------------ top bar ------------------------------ */}
      <header
        className="wv-no-print sticky top-0 z-10 w-full"
        style={{ background: "rgba(250,248,245,.9)", borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
      >
        <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[48px_1fr_48px] items-center px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={gotoMyBookings}
            disabled={goBookings.pending}
            aria-label="Back to my bookings"
            className="wv-btn wv-focus flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: C.white, color: C.ink, boxShadow: "0 0 0 1px rgba(31,29,29,.06), 0 4px 12px -6px rgba(0,0,0,.2)" }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="m-0 text-center text-lg font-bold tracking-tight">Booking Confirmation</h1>
          <span aria-hidden />
        </div>
      </header>

      {/* ------------------------------ content ------------------------------ */}
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
        <div id="wv-receipt" className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* =========================== left column =========================== */}
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
            {/* ----------------------------- status ----------------------------- */}
            <section
              aria-live="polite"
              className="wv-rise flex flex-col items-center rounded-3xl px-6 pb-8 pt-10 text-center sm:px-8"
              style={{
                background: `linear-gradient(180deg, ${theme.soft} 0%, ${C.white} 70%)`,
                border: `1px solid ${theme.border}`,
                boxShadow: "0 1px 2px rgba(31,29,29,.04), 0 12px 32px -20px rgba(31,29,29,.28)",
              }}
            >
              <div className="relative flex h-28 w-28 items-center justify-center">
                {state === "success" && (
                  <span aria-hidden className="wv-ring absolute inset-0 rounded-full" style={{ border: `2px solid ${theme.fg}` }} />
                )}
                <span
                  className="wv-pop flex h-24 w-24 items-center justify-center rounded-full"
                  style={{ background: C.white, boxShadow: `0 0 0 8px ${theme.soft}, 0 10px 24px -10px ${theme.fg}` }}
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full"
                    style={{ background: theme.fg, color: C.white }}
                  >
                    {state === "success" ? (
                      <Check size={30} strokeWidth={3.2} />
                    ) : state === "pending" ? (
                      <Clock size={28} strokeWidth={2.6} />
                    ) : (
                      <X size={30} strokeWidth={3.2} />
                    )}
                  </span>
                </span>
              </div>

              <h2 className="m-0 mt-7 text-[28px] font-extrabold leading-tight tracking-tight sm:text-[32px]">{heading}</h2>

              <p className="m-0 mt-3 max-w-[34ch] text-base leading-relaxed" style={{ color: C.body }}>
                {state === "success" ? (
                  <>
                    Your spot is confirmed for the <strong style={{ color: C.ink }}>{event.title}</strong>.
                  </>
                ) : state === "pending" ? (
                  "Payment receive hua hai, booking confirm ho rahi hai. Thodi der mein refresh karo."
                ) : (
                  "Yeh booking confirm nahi hui. Agar paisa kata hai to 5–7 din mein refund ho jayega."
                )}
              </p>

              {state === "success" && (
                <span
                  className="mt-6 inline-flex items-center rounded-full px-5 py-2.5 text-[15px] font-bold tabular-nums"
                  style={{ background: C.greenBg, color: C.green, border: `1px solid ${C.greenBorder}` }}
                >
                  {money(paidAmount)} paid{paidVia ? ` · ${paidVia}` : ""}
                </span>
              )}

              {state === "pending" && (
                <button
                  type="button"
                  onClick={() => load(true)}
                  disabled={refreshing}
                  className="wv-no-print wv-btn wv-focus mt-6 inline-flex h-12 cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-70"
                  style={{ background: C.amberBg, color: C.amber, border: `1px solid ${C.amberBorder}` }}
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  {refreshing ? "Checking…" : "Refresh status"}
                </button>
              )}
            </section>

            {/* ----------------------------- tickets ----------------------------- */}
            {state === "success" &&
              tickets.map((t, i) => {
                const chip = GENDER_CHIP[(t.ticketType || "OTHER").toUpperCase()] ?? GENDER_CHIP.OTHER;
                return (
                  <Card key={t.id} className="wv-rise relative" >
                    <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
                      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.label }}>
                        <Ticket size={15} />
                        {tickets.length > 1 ? `Ticket ${i + 1} of ${tickets.length}` : "Entry ticket"}
                      </span>
                      <Pill fg={chip.fg} bg={chip.bg}>
                        {genderLabel(t.ticketType)}
                      </Pill>
                    </div>

                    <div className="flex justify-center px-5 pb-2 pt-6 sm:px-6">
                      <div
                        className="flex aspect-square w-full max-w-[260px] items-center justify-center rounded-2xl p-5"
                        style={{ background: C.qrBg, border: `1px solid ${C.border}` }}
                      >
                        {t.qrCodeUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.qrCodeUrl}
                            alt={`Ticket QR ${t.ticketId}`}
                            className="h-full w-full object-contain"
                            style={{ imageRendering: "pixelated", mixBlendMode: "multiply" }}
                          />
                        ) : (
                          <span className="text-sm" style={{ color: C.label }}>
                            QR not available
                          </span>
                        )}
                      </div>
                    </div>

                    {/* perforation */}
                    <div className="relative my-5" aria-hidden>
                      <div className="border-t border-dashed" style={{ borderColor: "#DDD5CD" }} />
                      <span
                        className="absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
                        style={{ background: C.bg, border: `1px solid ${C.border}` }}
                      />
                      <span
                        className="absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full"
                        style={{ background: C.bg, border: `1px solid ${C.border}` }}
                      />
                    </div>

                    <div className="px-5 pb-6 text-center sm:px-6">
                      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: C.label }}>
                        Ticket ID
                      </p>
                      <p className="m-0 mt-1 break-all font-mono text-base font-bold tracking-wider" style={{ color: C.ink }}>
                        {t.ticketId}
                      </p>
                      <p className="m-0 mt-3 text-sm" style={{ color: C.label }}>
                        Show this QR at the entrance
                      </p>
                    </div>
                  </Card>
                );
              })}
          </div>

          {/* =========================== right column ========================== */}
          <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
            {/* ----------------------------- receipt ----------------------------- */}
            <Card className="wv-rise">
              <CardHeading icon={<Receipt size={18} />}>Payment receipt</CardHeading>

              <dl className="m-0 px-5 pb-4 pt-3 sm:px-6">
                <Row label="Booking No." value={booking.bookingNumber} mono />
                {payment.transactionId && <Row label="Transaction ID" value={payment.transactionId} mono />}
                {payment.orderId && <Row label="Order ID" value={payment.orderId} mono />}
                {paidVia && <Row label="Paid via" value={paidVia} />}
                {payment.paidAt && <Row label="Paid on" value={formatPaidAt(payment.paidAt)} />}

                <Divider />

                {/* gender-wise ticket rows (falls back to a single row if no ticket details) */}
                {genderGroups.length > 0 ? (
                  genderGroups.map((g) => (
                    <Row key={g.type} label={`${genderLabel(g.type)} tickets × ${g.count}`} value={money(g.amount)} />
                  ))
                ) : (
                  <Row label={`Tickets × ${booking.ticketCount}`} value={money(booking.ticketAmount)} />
                )}

                {booking.discountAmount > 0 && (
                  <Row label="You saved" value={`−${money(booking.discountAmount)}`} valueColor={C.green} />
                )}
                <Row label="Platform fee" value={money(booking.platformFee)} />
                <Row label="GST" value={money(booking.gstAmount)} />
              </dl>

              {/* total */}
              <div
                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-5 sm:px-6"
                style={{ background: theme.soft, borderTop: `1px solid ${theme.border}` }}
              >
                <div>
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.14em]" style={{ color: C.label }}>
                    Amount
                  </p>
                  <p className="m-0 mt-1 text-[28px] font-extrabold leading-none tabular-nums tracking-tight" style={{ color: C.ink }}>
                    {money(paidAmount)}
                  </p>
                </div>
                <Pill
                  fg={state === "success" ? C.green : state === "pending" ? C.amber : C.red}
                  bg={C.white}
                  border={theme.border}
                >
                  {state === "success" && <Check size={13} strokeWidth={3} />}
                  {statusLabel}
                </Pill>
              </div>
            </Card>

            {/* ------------------------------ event ------------------------------ */}
            <Card className="wv-rise">
              <CardHeading icon={<Calendar size={18} />}>Event details</CardHeading>

              <div className="px-5 pb-3 pt-3 sm:px-6">
                <div className="flex items-start gap-4 py-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: C.pinkSoft, color: C.pink }}
                  >
                    <Calendar size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[17px] font-bold leading-snug">{event.title}</p>
                    {dateLine && (
                      <p className="m-0 mt-1 text-sm leading-relaxed" style={{ color: C.body }}>
                        {dateLine}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t" style={{ borderColor: C.border }} />

                <div className="flex items-start gap-4 py-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: C.pinkSoft, color: C.pink }}
                  >
                    <MapPin size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 text-[17px] font-bold leading-snug">{event.venueName || event.city || "Venue"}</p>
                    {event.fullAddress && (
                      <p className="m-0 mt-1 text-sm leading-relaxed" style={{ color: C.body }}>
                        {event.fullAddress}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* ----------------------------- actions ----------------------------- */}
            <div className="wv-no-print flex flex-col gap-3">
              {state === "success" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="wv-btn wv-focus flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl border-0 text-base font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${C.pink}, ${C.pinkDeep})`,
                      boxShadow: "0 12px 24px -12px rgba(214,63,99,.7)",
                    }}
                  >
                    <Download size={19} />
                    Download Receipt
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="wv-btn wv-focus flex h-14 cursor-pointer items-center justify-center gap-2.5 rounded-2xl text-base font-bold"
                    style={{ background: C.white, color: C.pink, border: `1.5px solid ${C.pink}` }}
                  >
                    <Link2 size={19} />
                    Share with Match
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={gotoMyBookings}
                disabled={goBookings.pending}
                aria-busy={goBookings.slow || undefined}
                className="wv-btn wv-focus flex h-14 cursor-pointer items-center justify-center gap-2 rounded-2xl text-base font-bold disabled:cursor-not-allowed disabled:opacity-60"
                style={{ background: C.white, color: C.body, border: `1px solid ${C.border}` }}
              >
                {goBookings.slow && (
                  <MoonLoader size={16} color={C.pinkDeep} speedMultiplier={1.2} />
                )}
                {goBookings.slow ? "Opening…" : "View My Bookings"}
              </button>
              {state === "success" && (
                <p className="m-0 mt-1 text-center text-sm" style={{ color: C.label }}>
                  Let them know you&apos;ve secured your spot!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
