"use client";

/* -------------------------------------------------------------------------- */
/*  Booking Confirmation page                                                 */
/*                                                                            */
/*  Place at:  app/app/booking-confirmation/[bookingId]/page.tsx              */
/*  (any folder works — the route param must be named `bookingId`)            */
/*                                                                            */
/*  Data: usePaymentSuccess() from PaymentContext (no direct API calls)       */
/*                                                                            */
/*  Shows "Payment Successful" ONLY when booking.status === CONFIRMED and     */
/*  payment.status === COMPLETED. Otherwise shows a pending / failed state.   */
/* -------------------------------------------------------------------------- */

import { useMemo, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoonLoader } from "react-spinners";
import { toast } from "sonner";
import { ArrowLeft, Calendar, Check, Clock, Download, Link2, MapPin, RefreshCw, X } from "lucide-react";
import { PaymentSuccessData, usePaymentSuccess } from "@/app/context/PaymentContext";



/* ----------------------------- config (edit) ----------------------------- */
const MY_BOOKINGS_ROUTE = "/app/bookings"; // your "My Bookings" page
const EVENT_ROUTE = (eventId: string) => `/app/events/${eventId}`; // your event details page

/* --------------------------------- theme --------------------------------- */
const C = {
  bg: "#FAF8F5",
  ink: "#222020",
  body: "#6B655F",
  label: "#8E8781",
  border: "#EEE9E4",
  white: "#FFFFFF",
  pink: "#E85A7A",
  pinkSoft: "#FFEAF0",
  green: "#2FA866",
  greenBg: "#E9F7EF",
  greenBorder: "#BFE6CF",
  amber: "#C98512",
  amberBg: "#FFF4E0",
  red: "#C62828",
  redBg: "#FDECEC",
  qrBg: "#F4F1EC",
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

type ViewState = "success" | "pending" | "failed";

function viewState(d: PaymentSuccessData): ViewState {
  const b = (d.booking.status || "").toUpperCase();
  const p = (d.payment.status || "").toUpperCase();
  if (b === "CONFIRMED" && p === "COMPLETED") return "success";
  if (["FAILED", "CANCELLED", "REFUNDED"].includes(b) || ["FAILED", "CANCELLED", "REFUNDED"].includes(p)) return "failed";
  return "pending";
}

/* -------------------------------- pieces --------------------------------- */
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[28px] ${className}`}
      style={{ background: C.white, border: `1px solid ${C.border}`, boxShadow: "0 6px 24px -18px rgba(34,32,32,.35)" }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 ml-1 mt-8 text-[13px] font-bold uppercase tracking-[0.12em]" style={{ color: C.label }}>
      {children}
    </p>
  );
}

function ReceiptRow({ label, value, valueColor, last }: { label: string; value: ReactNode; valueColor?: string; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-4 py-4"
      style={{ borderBottom: last ? "none" : `1px solid ${C.border}` }}
    >
      <span className="text-[15px]" style={{ color: C.label }}>
        {label}
      </span>
      <span className="break-all text-right text-[15px] font-bold" style={{ color: valueColor ?? C.ink }}>
        {value}
      </span>
    </div>
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
      toast.error("Link copy nahi ho paaya.");
    }
  };

  const handleDownload = () => {
    // Prints only the receipt area (see print CSS below). User can "Save as PDF".
    window.print();
  };

  /* ------------------------------ loading ------------------------------ */
  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: C.bg }}>
        <MoonLoader color={C.pink} speedMultiplier={2} />
      </div>
    );
  }

  /* ------------------------------- error ------------------------------- */
  if (error || !data) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: C.bg }}>
        <p className="text-lg font-semibold" style={{ color: C.ink }}>
          {error || "Kuch galat hua."}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => load()}
            className="cursor-pointer rounded-xl border-0 px-5 py-3 text-sm font-bold text-white"
            style={{ background: C.pink }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.push(MY_BOOKINGS_ROUTE)}
            className="cursor-pointer rounded-xl px-5 py-3 text-sm font-bold"
            style={{ background: C.white, color: C.ink, border: `1px solid ${C.border}` }}
          >
            My Bookings
          </button>
        </div>
      </div>
    );
  }

  const { booking, payment, event } = data;
  const state = viewState(data);
  const tickets = booking.tickets ?? [];
  const timeStr = [formatTime(event.startTime), formatTime(event.endTime)].filter(Boolean).join(" – ");
  const dateLine = [formatEventDate(event.eventDate), timeStr].filter(Boolean).join(" · ");
  const paidVia = payment.paidVia ? pretty(payment.paidVia) : null;
  const paidAmount = payment.amount ?? booking.paidAmount ?? booking.totalAmount;

  const heading =
    state === "success" ? "Payment Successful!" : state === "pending" ? "Confirming your payment…" : "Payment not completed";

  return (
    <main
      id="wv-page"
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden pb-12"
      style={{ background: C.bg, color: C.ink, fontFamily: "var(--font-quicksand), 'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        #wv-page { scrollbar-width: thin; scrollbar-color: #D9D2CB transparent; }
        #wv-page::-webkit-scrollbar { width: 8px; }
        #wv-page::-webkit-scrollbar-thumb { background: #D9D2CB; border-radius: 8px; }
        #wv-page::-webkit-scrollbar-track { background: transparent; }
        @media print {
          #wv-page { position: static !important; overflow: visible !important; }
          body * { visibility: hidden !important; }
          #wv-receipt, #wv-receipt * { visibility: visible !important; }
          #wv-receipt { position: absolute; inset: 0; padding: 24px; }
          .wv-no-print { display: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[560px] px-4">
        {/* ------------------------------ header ------------------------------ */}
        <header className="wv-no-print relative flex h-16 items-center justify-center">
          <button
            type="button"
            onClick={() => router.push(MY_BOOKINGS_ROUTE)}
            aria-label="Back"
            className="absolute left-0 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0"
            style={{ background: C.white, color: C.ink, boxShadow: "0 4px 14px -6px rgba(0,0,0,.2)" }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="m-0 text-[19px] font-bold">Booking Confirmation</h1>
        </header>

        <div id="wv-receipt">
          {/* ------------------------------ status ------------------------------ */}
          <section className="mt-8 flex flex-col items-center text-center">
            <div
              className="flex h-[120px] w-[120px] items-center justify-center rounded-full"
              style={{ background: state === "success" ? C.pinkSoft : state === "pending" ? C.amberBg : C.redBg }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{
                  border: `3.5px solid ${state === "success" ? C.pink : state === "pending" ? C.amber : C.red}`,
                  color: state === "success" ? C.pink : state === "pending" ? C.amber : C.red,
                }}
              >
                {state === "success" ? <Check size={28} strokeWidth={3} /> : state === "pending" ? <Clock size={26} strokeWidth={2.6} /> : <X size={28} strokeWidth={3} />}
              </span>
            </div>

            <h2 className="mb-2 mt-7 text-[30px] font-extrabold leading-tight sm:text-[34px]">{heading}</h2>

            <p className="m-0 text-[16px]" style={{ color: C.body }}>
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
                className="mt-6 inline-flex rounded-full px-5 py-2 text-[15px] font-bold"
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
                className="wv-no-print mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border-0 px-5 py-2.5 text-sm font-bold"
                style={{ background: C.amberBg, color: C.amber }}
              >
                <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Checking…" : "Refresh status"}
              </button>
            )}
          </section>

          {/* ------------------------------ tickets ------------------------------ */}
          {state === "success" &&
            tickets.map((t, i) => (
              <Card key={t.id} className="mt-8 flex flex-col items-center px-6 pb-7 pt-10">
                <div className="flex h-[250px] w-[250px] items-center justify-center rounded-3xl" style={{ background: C.qrBg }}>
                  {t.qrCodeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.qrCodeUrl} alt={`Ticket QR ${t.ticketId}`} className="h-[200px] w-[200px]" style={{ imageRendering: "pixelated" }} />
                  ) : (
                    <span className="text-sm" style={{ color: C.label }}>
                      QR not available
                    </span>
                  )}
                </div>
                <p className="mb-1 mt-6 text-center text-[16px] font-bold uppercase tracking-[0.22em]" style={{ color: C.label }}>
                  Ticket ID: {t.ticketId}
                </p>
                <p className="m-0 text-[14px]" style={{ color: C.label }}>
                  {tickets.length > 1 ? `Ticket ${i + 1} of ${tickets.length} · ${pretty(t.ticketType)} · ` : ""}Show this QR at the entrance
                </p>
              </Card>
            ))}

          {/* ------------------------------ receipt ------------------------------ */}
          <SectionLabel>Payment receipt</SectionLabel>
          <Card className="px-6 py-1">
            <ReceiptRow label="Booking No." value={booking.bookingNumber} />
            {payment.transactionId && <ReceiptRow label="Transaction ID" value={payment.transactionId} />}
            {payment.orderId && <ReceiptRow label="Order ID" value={payment.orderId} />}
            {paidVia && <ReceiptRow label="Paid via" value={paidVia} />}
            {payment.paidAt && <ReceiptRow label="Paid on" value={formatPaidAt(payment.paidAt)} />}
            <ReceiptRow label={`Tickets × ${booking.ticketCount}`} value={money(booking.ticketAmount)} />
            {booking.discountAmount > 0 && <ReceiptRow label="You saved" value={money(booking.discountAmount)} valueColor={C.green} />}
            <ReceiptRow label="Platform fee" value={money(booking.platformFee)} />
            <ReceiptRow label="GST" value={money(booking.gstAmount)} />
            <ReceiptRow label="Amount" value={money(paidAmount)} />
            <ReceiptRow
              label="Status"
              last
              value={state === "success" ? "✓ Captured" : state === "pending" ? "Pending" : pretty(payment.status) || "Failed"}
              valueColor={state === "success" ? C.green : state === "pending" ? C.amber : C.red}
            />
          </Card>

          {/* ------------------------------ event ------------------------------ */}
          <SectionLabel>Event details</SectionLabel>
          <Card className="px-6 py-1">
            <div className="flex items-center gap-5 py-6" style={{ borderBottom: `1px solid ${C.border}` }}>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: C.pinkSoft, color: C.pink }}>
                <Calendar size={22} />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[18px] font-bold">{event.title}</p>
                {dateLine && (
                  <p className="m-0 mt-1 text-[15px]" style={{ color: C.label }}>
                    {dateLine}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-5 py-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: C.pinkSoft, color: C.pink }}>
                <MapPin size={22} />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[18px] font-bold">{event.venueName || event.city || "Venue"}</p>
                {event.fullAddress && (
                  <p className="m-0 mt-1 text-[15px]" style={{ color: C.label }}>
                    {event.fullAddress}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* ------------------------------ actions ------------------------------ */}
        <div className="wv-no-print mt-8 flex flex-col gap-4">
          {state === "success" && (
            <>
              <button
                type="button"
                onClick={handleDownload}
                className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-[22px] border-0 text-[19px] font-bold text-white transition hover:brightness-105"
                style={{ background: C.pink, boxShadow: "0 12px 28px -14px rgba(232,90,122,.8)" }}
              >
                <Download size={20} />
                Download Receipt
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex h-16 cursor-pointer items-center justify-center gap-2 rounded-[22px] text-[19px] font-bold transition hover:opacity-90"
                style={{ background: C.white, color: C.pink, border: `2px solid ${C.pink}` }}
              >
                <Link2 size={20} />
                Share with Match
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => router.push(MY_BOOKINGS_ROUTE)}
            className="flex h-16 cursor-pointer items-center justify-center rounded-[22px] text-[19px] font-bold transition hover:opacity-90"
            style={{ background: C.white, color: C.body, border: `1px solid ${C.border}` }}
          >
            View My Bookings
          </button>
          {state === "success" && (
            <p className="m-0 text-center text-[15px]" style={{ color: C.label }}>
              Let them know you&apos;ve secured your spot!
            </p>
          )}
        </div>
      </div>
    </main>
  );
}