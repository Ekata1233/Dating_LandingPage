"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useRouter, useParams } from "next/navigation";
import { MoonLoader } from "react-spinners";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Flame,
  Gift,
  Heart,
  MapPin,
  Martini,
  Mountain,
  Music,
  PartyPopper,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Sunset,
  Ticket,
  Users,
  Utensils,
  Wine,
  X,
} from "lucide-react";

import { EventDetails, useEventDetails } from "@/app/context/EventContext";
import { useMyProfile } from "@/app/app/shared/useMyProfile";
import { getClientToken } from "@/utils/token";

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
  badgeBg: "#FBE8EF",
  stripBg: "#F4EFE7",
  white: "#FFFFFF",
  lightPink: "#FFF0F3",
  amber: "#E8A53D",
  amberBg: "#FFF4E0",
  green: "#3F8F5B",
  greenBg: "#EAF6EE",
};

/* ---------------------------- helpers ---------------------------- */

function pretty(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function intentLabel(intent?: string | null): string {
  switch ((intent || "").toUpperCase()) {
    case "MIXED":
      return "All genders welcome";
    case "WOMEN_ONLY":
      return "Women only";
    case "MEN_ONLY":
      return "Men only";
    default:
      return pretty(intent);
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatTime(time?: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  const ampm = h >= 12 ? "PM" : "AM";
  const hr = h % 12 || 12;
  return `${hr}:${String(m).padStart(2, "0")} ${ampm}`;
}

function timeRange(start?: string | null, end?: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} - ${e}`;
  return s || e || "";
}

/* ---------------------------- pricing ---------------------------- */

type Bucket = "men" | "women" | "other";

interface PriceView {
  amount: number | null;
  original: number | null;
  hasDiscount: boolean;
  discountPercent: number | null;
}

function toNumber(value?: string | number | null): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

function priceView(
  originalRaw?: string | null,
  discountedRaw?: string | null,
  discountRaw?: string | null
): PriceView {
  const original = toNumber(originalRaw);
  const discounted = toNumber(discountedRaw);
  const percent = toNumber(discountRaw);
  const hasDiscount =
    original != null && discounted != null && discounted > 0 && discounted < original;
  return {
    amount: hasDiscount ? discounted : original,
    original,
    hasDiscount,
    discountPercent: hasDiscount ? percent : null,
  };
}

function bucketForGender(gender?: string | null): Bucket {
  const g = (gender || "").toLowerCase();
  if (g.includes("women") || g.includes("female") || g.includes("woman")) return "women";
  if (g.includes("men") || g.includes("male") || g.includes("man")) return "men";
  return "other";
}

/**
 * Logged in -> the price for the member's gender. Logged out (or gender not on
 * file) -> the highest entry price, so nobody is quoted below the real range.
 */
function selectPrice(details: EventDetails, gender: string | null): PriceView {
  const buckets: Record<Bucket, PriceView> = {
    men: priceView(details.menEntryPrice, details.menDiscountedPrice, details.discountPercentage),
    women: priceView(details.womenEntryPrice, details.womenDiscountedPrice, details.discountPercentage),
    other: priceView(details.otherEntryPrice, details.otherDiscountedPrice, details.discountPercentage),
  };

  if (gender && gender.trim()) {
    return buckets[bucketForGender(gender)];
  }

  const paid = (Object.values(buckets) as PriceView[]).filter(
    (view) => view.amount != null && view.amount > 0
  );
  if (paid.length === 0) return buckets.men;

  return paid.reduce((highest, view) =>
    (view.amount ?? 0) > (highest.amount ?? 0) ? view : highest
  );
}

function formatPrice(amount: number | null): string {
  if (amount == null) return "—";
  if (amount <= 0) return "Free";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/* ------------------------------ icons ---------------------------- */

type IconComponent = ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;

const ICONS: Record<string, IconComponent> = {
  heart: Heart,
  love: Heart,
  sunset: Sunset,
  users: Users,
  people: Users,
  music: Music,
  dj: Music,
  glass: Martini,
  drink: Martini,
  drinks: Martini,
  wine: Wine,
  building: Building2,
  hotel: Building2,
  food: Utensils,
  meal: Utensils,
  meals: Utensils,
  camera: Camera,
  star: Star,
  mountain: Mountain,
  trek: Mountain,
  gift: Gift,
  party: PartyPopper,
  flame: Flame,
  location: MapPin,
  map: MapPin,
};

function ApiIcon({
  name,
  size = 20,
  className,
  strokeWidth = 2,
}: {
  name?: string | null;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = ICONS[(name || "").toLowerCase()] ?? Sparkles;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}

/* ---------------------------- auth flag --------------------------- */

function useLoggedIn(): boolean {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const sync = () => setLoggedIn(getClientToken() !== null);
    sync();
    window.addEventListener("welvors-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("welvors-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return loggedIn;
}

/* -------------------------- small pieces -------------------------- */

function SectionHeading({
  icon,
  title,
  className,
}: {
  icon?: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <h2
      className={`mb-4 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[0.14em] ${className ?? ""}`}
      style={{ color: C.ink }}
    >
      {icon && (
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: C.lightPink, color: C.pink }}
        >
          {icon}
        </span>
      )}
      {title}
    </h2>
  );
}

function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 ${className ?? ""}`}
      style={{ background: C.white, border: `1px solid ${C.border}` }}
    >
      {children}
    </div>
  );
}

/* ------------------------------ page ----------------------------- */

type ModalType = "share" | null;

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const eventId = useMemo(() => {
    const raw = params?.id;
    return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : null;
  }, [params]);

  const { details, loading, error } = useEventDetails(eventId);
  const loggedIn = useLoggedIn();
  const { profile } = useMyProfile();
  const gender = profile?.gender ?? null;

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalType>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const price = useMemo(
    () => (details ? selectPrice(details, loggedIn ? gender : null) : null),
    [details, loggedIn, gender]
  );

  const gallery = useMemo(
    () => (details?.galleryImages ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [details]
  );

  const itinerary = useMemo(
    () => (details?.itinerary ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [details]
  );

  const amenities = useMemo(
    () => (details?.amenities ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [details]
  );

  const whyItems = useMemo(
    () => (details?.whyShouldCome ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [details]
  );

  const handleBookNow = () => {
    if (!loggedIn) {
      const loginBtn = document.querySelector<HTMLElement>("[data-login-trigger]");
      loginBtn?.click();
      return;
    }
    toast.info("Booking opens soon.");
  };

  const handleShare = async (type: string) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (type === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Event link copied.");
      } catch {
        toast.error("Unable to copy the link.");
      }
      setModal(null);
      return;
    }
    if (type === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this event on Welvors: ${url}`)}`, "_blank", "noopener,noreferrer");
      setModal(null);
      return;
    }
    if (type === "twitter") {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out this event on Welvors!")}&url=${encodeURIComponent(url)}`,
        "_blank",
        "noopener,noreferrer"
      );
      setModal(null);
    }
  };

  /* ---------------------------- loading ---------------------------- */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: C.bg }}>
        <MoonLoader color={C.pink} speedMultiplier={2} />
      </div>
    );
  }

  /* -------------------------- not found ---------------------------- */
  if (error || !details || !price) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-5"
        style={{ background: C.bg }}
      >
        <p className="text-lg font-semibold" style={{ color: C.ink }}>
          {error || "Event not found"}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="cursor-pointer rounded-xl border-0 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
          style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const stats = details.bookingStats ?? null;
  const totalCapacity = stats?.totalCapacity ?? details.totalCapacity ?? null;
  const bookedCount = stats?.bookedCount ?? null;
  const spotsLeft =
    stats?.spotsLeft ??
    (totalCapacity != null && bookedCount != null ? totalCapacity - bookedCount : null);
  const bookingPercentage =
    stats?.bookingPercentage ??
    (totalCapacity ? Math.round(((bookedCount ?? 0) / totalCapacity) * 100) : null);
  const fillingFast = stats?.fillingFast ?? false;
  const fillingFastText = stats?.fillingFastText || (fillingFast ? "Filling fast" : "");
  const intent = intentLabel(details.eventIntent);
  const hasAge = details.minAge != null && details.maxAge != null;
  const dateStr = formatDate(details.eventDate);
  const timeStr = timeRange(details.startTime, details.endTime);
  const mapQuery =
    details.latitude != null && details.longitude != null
      ? `${details.latitude},${details.longitude}`
      : details.fullAddress;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const featureTags = (details.featureTags ?? []).slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  const faqs = details.faqs ?? [];
  const safety = details.safetyFeatures ?? [];
  const partner = details.eventPartner ?? null;

  return (
    <main
      style={{ background: C.bg, color: C.ink, fontFamily: "var(--font-quicksand), system-ui, sans-serif" }}
      className="pb-24 pt-16 lg:pb-5"
    >
      {/* ---------------------------- HERO ---------------------------- */}
      <div
        className="relative w-full overflow-hidden"
        style={{ background: C.stripBg }}
      >
        {details.heroImage ? (
          <>
            <img
              src={details.heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
            />
            <img
              src={details.heroImage}
              alt={details.title}
              className="relative z-[1] mx-auto block h-[300px] w-full object-contain sm:h-[400px] md:h-[480px] lg:h-[540px]"
            />
          </>
        ) : (
          <div className="h-[220px] w-full" style={{ background: C.stripBg }} />
        )}
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/5 to-black/20" />

        {/* floating controls */}
        <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1100px] items-center justify-between px-4 pt-5 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90 shadow-md backdrop-blur transition hover:scale-105"
            style={{ color: C.ink }}
          >
            <ArrowRight size={18} className="rotate-180" />
          </button>

          <div className="flex items-center gap-2 hidden">
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-label="Save event"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90 shadow-md backdrop-blur transition hover:scale-105"
              style={{ color: saved ? C.pink : C.ink }}
            >
              <Heart size={18} fill={saved ? C.pink : "none"} />
            </button>
            <button
              type="button"
              onClick={() => setModal("share")}
              aria-label="Share event"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90 shadow-md backdrop-blur transition hover:scale-105"
              style={{ color: C.ink }}
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>

        {/* hero badges */}
        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1100px] flex-wrap items-center gap-2 px-4 pb-5 sm:px-6">
          {details.eventTag && (
            <span
              className="rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white"
              style={{ background: C.pink }}
            >
              {details.eventTag}
            </span>
          )}
          {fillingFast && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold"
              style={{ background: C.amberBg, color: C.amber }}
            >
              <Flame size={13} />
              {fillingFastText}
            </span>
          )}
        </div>
      </div>

      {/* --------------------------- CONTENT --------------------------- */}
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        {/* header card */}
        <div
          className="relative z-10 -mt-8 rounded-3xl p-5 shadow-[0_18px_50px_-30px_rgba(43,42,40,0.5)] sm:-mt-12 sm:p-7"
          style={{ background: C.white, border: `1px solid ${C.border}` }}
        >
          {intent && (
            <span
              className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ background: C.badgeBg, color: C.pink }}
            >
              <ShieldCheck size={13} />
              {intent}
            </span>
          )}
          <h1
            className="text-[26px] font-bold leading-tight sm:text-[38px]"
            style={{ fontFamily: "var(--font-brand-serif), Georgia, serif", color: C.ink }}
          >
            {details.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {dateStr && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: C.body }}>
                <Calendar size={16} style={{ color: C.pink }} />
                {dateStr}
              </span>
            )}
            {timeStr && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: C.body }}>
                <Clock size={16} style={{ color: C.pink }} />
                {timeStr}
              </span>
            )}
            {details.fullAddress && (
              <span className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: C.body }}>
                <MapPin size={16} style={{ color: C.pink }} />
                {details.fullAddress}
              </span>
            )}
          </div>

          {hasAge && (
            <div className="mt-4">
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{ background: C.stripBg, color: C.body }}
              >
                Age {details.minAge}–{details.maxAge}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* ----------------------- LEFT COLUMN ----------------------- */}
          <div className="min-w-0 flex-1 space-y-10">
            {/* quick facts */}
            <section className="grid gap-3 sm:grid-cols-2">
              <Card className="!p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                    <Calendar size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>
                      Date &amp; time
                    </p>
                    <p className="mt-0.5 text-sm font-bold" style={{ color: C.ink }}>
                      {formatShortDate(details.eventDate)}
                    </p>
                    {timeStr && <p className="text-xs" style={{ color: C.body }}>{timeStr}</p>}
                  </div>
                </div>
              </Card>

              <Card className="!p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                    <MapPin size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>
                      Venue
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-bold" style={{ color: C.ink }}>
                      {details.fullAddress}
                    </p>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener,noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold no-underline"
                      style={{ color: C.pink }}
                    >
                      View on map <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </Card>

              {totalCapacity != null && (
                <Card className="!p-4 sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                      <Users size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>
                        Attending
                      </p>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: C.ink }}>
                        {bookedCount ?? 0} of {totalCapacity} booked
                      </p>
                      {bookingPercentage != null && (
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.stripBg }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, bookingPercentage))}%`,
                              background: `linear-gradient(90deg, ${C.ctaFrom}, ${C.ctaTo})`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </section>

            {/* about */}
            {details.aboutEvent && (
              <section>
                <SectionHeading title="About this event" />
                <Card>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed" style={{ color: C.body }}>
                    {details.aboutEvent}
                  </p>
                </Card>
              </section>
            )}

            {/* gallery */}
            {gallery.length > 0 && (
              <section>
                <SectionHeading icon={<Camera size={15} />} title="Gallery" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {gallery.map((img, index) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setLightbox(index)}
                      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border-0 p-0"
                      style={{ background: C.stripBg, border: `1px solid ${C.border}` }}
                    >
                      <img
                        src={img.imageUrl}
                        alt={`${details.title} photo ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* why you should come */}
            {whyItems.length > 0 && (
              <section>
                <SectionHeading title="Why you should come" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {whyItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl p-4"
                      style={{ background: C.white, border: `1px solid ${C.border}` }}
                    >
                      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.lightPink, color: C.pink }}>
                        <ApiIcon name={item.icon} size={18} />
                      </span>
                      <p className="text-sm font-bold" style={{ color: C.ink }}>
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: C.body }}>
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* itinerary */}
            {itinerary.length > 0 && (
              <section>
                <SectionHeading icon={<Clock size={15} />} title="Event itinerary" />
                <Card>
                  <ol className="relative m-0 list-none space-y-6 p-0 pl-1">
                    {itinerary.map((item, index) => {
                      const meta = [
                        item.location,
                        item.dayNumber != null ? `Day ${item.dayNumber}` : "",
                        item.date ? formatShortDate(item.date) : "",
                        item.elevation ? `${item.elevation} elevation` : "",
                        item.distance ? `${item.distance} distance` : "",
                        item.accommodation ? `Stay: ${item.accommodation}` : "",
                        item.meals ? `Meals: ${item.meals}` : "",
                      ].filter(Boolean) as string[];

                      return (
                        <li key={item.id} className="relative flex gap-4 pl-1">
                          <div className="flex flex-col items-center">
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold text-white"
                              style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
                            >
                              {index + 1}
                            </span>
                            {index < itinerary.length - 1 && (
                              <span className="mt-1 w-px flex-1" style={{ background: C.border }} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 pb-1">
                            {(item.time || meta.length > 0) && (
                              <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                                {item.time && (
                                  <span className="inline-flex items-center gap-1 text-xs font-bold" style={{ color: C.pink }}>
                                    <Clock size={12} />
                                    {formatTime(item.time)}
                                  </span>
                                )}
                              </div>
                            )}
                            <p className="text-sm font-bold" style={{ color: C.ink }}>
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="mt-1 text-sm leading-relaxed" style={{ color: C.body }}>
                                {item.description}
                              </p>
                            )}
                            {meta.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {meta.map((chip) => (
                                  <span
                                    key={chip}
                                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                                    style={{ background: C.stripBg, color: C.body }}
                                  >
                                    {chip}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </Card>
              </section>
            )}

            {/* amenities */}
            {amenities.length > 0 && (
              <section>
                <SectionHeading title="What's included" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {amenities.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-2xl p-4"
                      style={{ background: C.white, border: `1px solid ${C.border}` }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: C.greenBg, color: C.green }}>
                        <ApiIcon name={item.icon} size={18} />
                      </span>
                      <p className="text-sm font-bold" style={{ color: C.ink }}>
                        {item.name}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* highlights (feature tags) */}
            {featureTags.length > 0 && (
              <section>
                <SectionHeading title="Highlights" />
                <div className="flex flex-wrap gap-2">
                  {featureTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold"
                      style={{ background: C.white, color: C.body, border: `1px solid ${C.border}` }}
                    >
                      <Sparkles size={13} style={{ color: C.pink }} />
                      {tag.label}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* safety */}
            {safety.length > 0 && (
              <section>
                <SectionHeading icon={<ShieldCheck size={15} />} title="Safety & support" />
                <Card>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {safety.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ background: C.greenBg, color: C.green }}>
                          <Check size={15} />
                        </span>
                        <p className="text-sm font-semibold" style={{ color: C.ink }}>
                          {item.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>
            )}

            {/* faqs */}
            {faqs.length > 0 && (
              <section>
                <SectionHeading title="Frequently asked questions" />
                <div className="space-y-3">
                  {faqs.map((faq, index) => {
                    const isOpen = openFaq === index;
                    return (
                      <div
                        key={faq.id}
                        className="overflow-hidden rounded-2xl"
                        style={{ background: C.white, border: `1px solid ${C.border}` }}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : index)}
                          className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-4 text-left"
                          style={{ color: C.ink }}
                        >
                          <span className="pr-4 text-sm font-bold">{faq.question}</span>
                          <span
                            className="shrink-0 transition-transform duration-200"
                            style={{ color: C.pink, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                          >
                            <ChevronDown size={16} />
                          </span>
                        </button>
                        <div
                          className="grid transition-all duration-200"
                          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
                        >
                          <div className="overflow-hidden">
                            <p className="whitespace-pre-line px-4 pb-4 text-sm leading-relaxed" style={{ color: C.body }}>
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* terms */}
            {details.termsConditions && (
              <section>
                <SectionHeading title="Terms & conditions" />
                <Card>
                  <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: C.body }}>
                    {details.termsConditions}
                  </p>
                </Card>
              </section>
            )}

            {/* partner */}
            {partner && (
              <section>
                <SectionHeading title="Organised by" />
                <Card>
                  <div className="flex items-center gap-4">
                    {partner.logo && (
                      <img
                        src={partner.logo}
                        alt={partner.businessName}
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                        style={{ border: `1px solid ${C.border}` }}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold" style={{ color: C.ink }}>
                        {partner.businessName}
                      </p>
                      <p className="text-xs" style={{ color: C.body }}>
                        {[pretty(partner.businessType), partner.city].filter(Boolean).join(" • ")}
                      </p>
                      {partner.contactPerson && (
                        <p className="mt-0.5 text-xs" style={{ color: C.label }}>
                          Contact: {partner.contactPerson}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </section>
            )}
          </div>

          {/* ----------------------- RIGHT COLUMN ----------------------- */}
          <div className="w-full shrink-0 lg:w-[350px]">
            <div className="space-y-4 lg:sticky lg:top-24">
              {/* price card */}
              <div
                className="rounded-3xl p-5 shadow-[0_18px_50px_-35px_rgba(43,42,40,0.55)]"
                style={{ background: C.white, border: `1px solid ${C.border}` }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>
                  {loggedIn ? "Your price" : "Price"}
                </p>
                <div className="mt-1 flex items-end gap-3">
                  <span className="text-[30px] font-extrabold leading-none" style={{ color: C.ink }}>
                    {formatPrice(price.amount)}
                  </span>
                  {price.hasDiscount && price.original != null && (
                    <span className="pb-0.5 text-sm font-semibold line-through" style={{ color: C.label }}>
                      {formatPrice(price.original)}
                    </span>
                  )}
                </div>

                {price.hasDiscount && price.discountPercent != null && (
                  <span
                    className="mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                    style={{ background: C.badgeBg, color: C.pink }}
                  >
                    {price.discountPercent}% off
                  </span>
                )}

                {!loggedIn && (
                  <p className="mt-3 text-xs" style={{ color: C.label }}>
                    Sign in to see the price for you.
                  </p>
                )}

                <button
                  onClick={handleBookNow}
                  type="button"
                  className="wv-cta-magnetic wv-cta-shimmer mt-4 mb-3 flex h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-0 px-2 text-[15px] font-extrabold text-white"
                  style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
                >
                  <Ticket size={18} />
                  Book Now
                </button>

                {spotsLeft != null && spotsLeft > 0 && (
                  <p className="text-center text-xs font-bold" style={{ color: fillingFast ? C.amber : C.body }}>
                    {spotsLeft} spots left
                  </p>
                )}
                {stats?.last24HoursText && (
                  <p className="mt-1 text-center text-[11px]" style={{ color: C.label }}>
                    {stats.last24HoursText}
                  </p>
                )}

                {bookingPercentage != null && (
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: C.stripBg }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, bookingPercentage))}%`,
                        background: `linear-gradient(90deg, ${C.ctaFrom}, ${C.ctaTo})`,
                      }}
                    />
                  </div>
                )}
              </div>

              {/* event info card */}
              <div className="rounded-3xl p-5" style={{ background: C.white, border: `1px solid ${C.border}` }}>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>
                  Event info
                </p>
                <div className="space-y-3">
                  <InfoRow icon={<Calendar size={16} />} label="Date" value={dateStr || "—"} />
                  {timeStr && <InfoRow icon={<Clock size={16} />} label="Time" value={timeStr} />}
                  <InfoRow icon={<MapPin size={16} />} label="Location" value={details.fullAddress} />
                  {details.eventType && (
                    <InfoRow icon={<Sparkles size={16} />} label="Type" value={pretty(details.eventType)} />
                  )}
                  {totalCapacity != null && (
                    <InfoRow
                      icon={<Users size={16} />}
                      label="Capacity"
                      value={`${bookedCount ?? 0} / ${totalCapacity} booked`}
                    />
                  )}
                </div>

                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener,noreferrer"
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold no-underline transition hover:opacity-90"
                  style={{ background: C.lightPink, color: C.pink }}
                >
                  <MapPin size={14} />
                  Open in Maps
                </a>
              </div>

              {/* safety badge card */}
              {safety.length > 0 && (
                <div
                  className="rounded-3xl p-4"
                  style={{ background: C.greenBg, border: `1px solid ${C.border}` }}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ background: C.green }}>
                      <ShieldCheck size={18} />
                    </span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: C.ink }}>
                        Trusted experience
                      </p>
                      <p className="text-xs" style={{ color: C.body }}>
                        {safety.length} safety measures in place
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- MOBILE BOTTOM BAR -------------------- */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t px-4 py-3 lg:hidden"
        style={{ background: C.white, borderColor: C.border }}
      >
        <div className="flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: C.label }}>
            {loggedIn ? "Your price" : "Price"}
          </p>
          <p className="text-lg font-extrabold leading-tight" style={{ color: C.ink }}>
            {formatPrice(price.amount)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleBookNow}
          className="wv-cta-magnetic flex h-[44px] cursor-pointer items-center gap-2 rounded-xl border-0 px-6 text-sm font-extrabold text-white"
          style={{ background: `linear-gradient(135deg, ${C.ctaFrom}, ${C.ctaTo})` }}
        >
          <Ticket size={16} />
          Register
        </button>
      </div>

      {/* -------------------------- LIGHTBOX -------------------------- */}
      {lightbox !== null && gallery[lightbox] && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90"
            style={{ color: C.ink }}
          >
            <X size={20} />
          </button>
          <img
            src={gallery[lightbox].imageUrl}
            alt={`${details.title} photo ${lightbox + 1}`}
            className="max-h-[82vh] max-w-[92vw] rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox - 1 + gallery.length) % gallery.length);
                }}
                className="absolute left-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90"
                style={{ color: C.ink }}
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lightbox + 1) % gallery.length);
                }}
                className="absolute right-3 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white/90"
                style={{ color: C.ink }}
              >
                <ArrowRight size={20} />
              </button>
            </>
          )}
        </div>
      )}

      {/* ------------------------- SHARE MODAL ------------------------- */}
      {modal === "share" && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="relative w-full max-w-[420px] rounded-3xl p-6"
            style={{ background: C.white }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModal(null)}
              aria-label="Close"
              className="absolute right-4 top-4 cursor-pointer border-0 bg-transparent"
              style={{ color: C.body }}
            >
              <X size={22} />
            </button>
            <h2 className="mb-1 pr-8 text-xl font-extrabold" style={{ color: C.ink }}>
              Share event
            </h2>
            <p className="mb-5 text-sm" style={{ color: C.body }}>
              {details.title}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <ShareButton label="WhatsApp" onClick={() => handleShare("whatsapp")} />
              <ShareButton label="Twitter" onClick={() => handleShare("twitter")} />
              <ShareButton label="Copy Link" icon={<Copy size={15} />} onClick={() => handleShare("copy")} />
              <ShareButton
                label="More"
                icon={<Share2 size={15} />}
                onClick={async () => {
                  const url = window.location.href;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: details.title, url });
                      setModal(null);
                    } catch {
                      /* user dismissed */
                    }
                  } else {
                    await handleShare("copy");
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: C.lightPink, color: C.pink }}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px]" style={{ color: C.label }}>
          {label}
        </p>
        <p className="text-sm font-bold" style={{ color: C.ink }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ShareButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 text-sm font-bold transition hover:opacity-80"
      style={{ background: C.stripBg, color: C.ink }}
    >
      {icon}
      {label}
    </button>
  );
}
