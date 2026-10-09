import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ROSE_IMAGE } from "../shared/mockData";
import { Loader, Notice } from "../shared/Loader";
import { mapUsersToProfiles, mergeUserDetails } from "../shared/mapUser";
import type { Profile, SwipeHandlers } from "../shared/types";
import { useUserDetails, useUsersData } from "@/app/context/UsersContext";
import ProfileDetailSections, { Section } from "./ProfileDetailSections";
import {
  Astroid,
  Briefcase,
  Calendar,
  Church,
  Heart,
  Languages,
  LucideIcon,
  MapPin,
  Moon,
  Ruler,
  Users,
} from "lucide-react";
import ComplimentingModal, { GiftOption } from "@/app/components/ui/ComplimentingModal";

/** Horizontal drag distance (px) that commits a like / nope. */
const SWIPE_THRESHOLD = 88;

/**
 * How long a card has to stay on screen before its deep profile is requested.
 * Fast swipers never cross this, so a burst of swipes costs one request for the
 * card that is actually looked at rather than one per card.
 */
const DETAILS_PREFETCH_DELAY_MS = 700;

/** Card scroll depth (px) that counts as "the user opened the profile". */
const DETAILS_SCROLL_TRIGGER_PX = 40;

type SwipeDir = "left" | "right" | "up";

type Fact = {
  label: string;
  value: string | undefined | null;
  icon: LucideIcon;
};

export interface HomeMainProps extends SwipeHandlers {
  /**
   * Cards to show. Leave unset to use the live discover feed from
   * `useUsersData()`; pass an array to preview or override the feed.
   */
  profiles?: Profile[];
  /**
   * Fill the parent edge to edge instead of rendering the 300px desktop frame.
   * The mobile shell sets this so the card is full-bleed.
   */
  fluid?: boolean;
  onBoost?: () => void;
}

function HomeMain({
  profiles: profilesProp,
  fluid = false,
  onSwipe,
  onRewind,
  onOpenProfile,
}: HomeMainProps) {
  const [current, setCurrent] = useState(0);
  const [roseOpen, setRoseOpen] = useState(false);
  const [swipeDir, setSwipeDir] = useState<SwipeDir | null>(null);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const { users, loading, error, refetch } = useUsersData();
  const cardScrollRef = useRef<HTMLDivElement>(null);
  const swipeTimer = useRef<number | null>(null);
  function sendCompliment(text: string, gift: GiftOption) {

  }
  /* Pointer bookkeeping. `engaged` only flips once the gesture is clearly
     horizontal, so vertical scrolling of the card body keeps working. */
  const gesture = useRef({ startX: 0, startY: 0, engaged: false, pointerId: null as number | null });

  /* An explicit `profiles` prop wins (previews, tests); otherwise the live
     feed drives the deck. There is no seeded fallback: a slow request now
     shows a loader rather than fake people, because mock cards made a stalled
     network look like a working feed. */
  const profiles = useMemo(
    () => profilesProp ?? mapUsersToProfiles(users),
    [profilesProp, users]
  );

  /* A new deck (first load, or a refetch) has to rewind the index. */
  const deckKey = profiles.map((p) => p.id).join("|");
  const [lastDeck, setLastDeck] = useState(deckKey);
  if (lastDeck !== deckKey) {
    setLastDeck(deckKey);
    setCurrent(0);
  }

  const profile: Profile | undefined = profiles[current];

  /* ------------------------------------------------------------------ */
  /*  Deep profile                                                      */
  /*                                                                    */
  /*  `useUserDetails` only reads the cache — it never fetches by itself, */
  /*  and `ensure()` is a no-op once a user is cached or in flight. So   */
  /*  the call sites below can all fire freely. Requests are made at     */
  /*  rising intent:                                                     */
  /*    1. the card has been still for DETAILS_PREFETCH_DELAY_MS,        */
  /*    2. the card body is scrolled,                                    */
  /*    3. the expand action / ArrowUp (explicit intent, fires at once). */
  /* ------------------------------------------------------------------ */
  const { details, state: detailsState, ensure: requestDetails, refresh: detailsRetry } =
    useUserDetails(profile?.id);

  /* Keep the latest `ensure` in a ref so the idle timer below is keyed only on
     the card. If `ensure` changed identity on every render, listing it as an
     effect dependency would restart the timer each render and it would never
     fire. */
  const requestDetailsRef = useRef(requestDetails);
  useEffect(() => {
    requestDetailsRef.current = requestDetails;
  }, [requestDetails]);

  /* (1) Idle prefetch. The timer is cleared when the card changes, so a quick
     swipe through several people never queues a request for each one. */
  useEffect(() => {
    if (!profile?.id) return;

    const timer = window.setTimeout(() => requestDetailsRef.current?.(), DETAILS_PREFETCH_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [profile?.id]);

  /* The feed profile enriched with whatever the details endpoint returned. */
  const enriched = useMemo(
    () => (profile && details ? mergeUserDetails(profile, details) : profile),
    [profile, details]
  );

  /* (2) Scrolling into the card body is the clearest "open profile" signal. */
  const handleCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > DETAILS_SCROLL_TRIGGER_PX) requestDetails();
  };

  /* Don't let a pending swipe timer fire after unmount. */
  useEffect(
    () => () => {
      if (swipeTimer.current !== null) window.clearTimeout(swipeTimer.current);
    },
    []
  );

  const resetCard = useCallback(() => {
    swipeTimer.current = null;
    setSwipeDir(null);
    setDrag({ x: 0, y: 0, active: false });
    setCurrent((p) => (profiles.length ? (p + 1) % profiles.length : 0));
    if (cardScrollRef.current) cardScrollRef.current.scrollTop = 0;
  }, [profiles.length]);

  const goNext = useCallback(
    (dir: SwipeDir) => {
      if (swipeDir || !profile) return;
      setSwipeDir(dir);
      /* Hand control back to the CSS classes so the card animates off screen
         from wherever the drag left it (an active drag pins an inline
         transform with transitions disabled). */
      setDrag((d) => ({ ...d, active: false }));
      onSwipe?.(profile.id, dir);
      swipeTimer.current = window.setTimeout(resetCard, dir === "up" ? 480 : 380);
    },
    [swipeDir, profile, onSwipe, resetCard]
  );

  /* Not wired to a button right now (see the commented-out Rewind button). */
  const handleRewind = () => {
    if (swipeDir || !profiles.length) return;
    setCurrent((p) => (p - 1 + profiles.length) % profiles.length);
    if (cardScrollRef.current) cardScrollRef.current.scrollTop = 0;
    onRewind?.();
  };
  void handleRewind;

  const openProfile = useCallback(() => {
    if (!profile) return;
    /* (3) Explicit intent — don't wait for the idle prefetch. */
    requestDetails();
    onOpenProfile?.(profile.id);
    const el = cardScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [onOpenProfile, profile, requestDetails]);

  const closeProfile = useCallback(() => {
    const el = cardScrollRef.current;
    if (el) el.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    /* Keyboard shortcuts are a desktop affordance; the mobile shell drives
       the same actions from the on-screen buttons and drag gestures. */
    if (fluid) return;

    const onKey = (e: KeyboardEvent) => {
      if (swipeDir) return;

      /* Don't hijack keys while the user is typing somewhere else on the page. */
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          goNext("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          goNext("right");
          break;
        case "ArrowUp":
          e.preventDefault();
          openProfile();
          break;
        case "ArrowDown":
          e.preventDefault();
          closeProfile();
          break;
        case " ":
          e.preventDefault();
          goNext("up");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fluid, swipeDir, goNext, openProfile, closeProfile]);

  /* ----------------------------- drag to swipe ---------------------------- */

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    gesture.current = {
      startX: e.clientX,
      startY: e.clientY,
      engaged: false,
      pointerId: e.pointerId,
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (g.pointerId !== e.pointerId || swipeDir) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (!g.engaged) {
      /* Vertical intent first: let the card body scroll instead. */
      if (Math.abs(dy) > 10 && Math.abs(dy) >= Math.abs(dx)) {
        g.pointerId = null;
        return;
      }
      if (Math.abs(dx) < 8) return;

      g.engaged = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
    }

    setDrag({ x: dx, y: dy * 0.25, active: true });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (g.pointerId !== e.pointerId) return;

    if (g.engaged) {
      /* A cancelled pointer (e.g. the browser took over the gesture) should
         never commit a swipe. */
      if (e.type !== "pointercancel" && drag.x > SWIPE_THRESHOLD) goNext("right");
      else if (e.type !== "pointercancel" && drag.x < -SWIPE_THRESHOLD) goNext("left");
      else setDrag({ x: 0, y: 0, active: false });

      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* capture is best-effort */
      }
    }

    gesture.current = { startX: 0, startY: 0, engaged: false, pointerId: null };
  };

  /* The feed can legitimately be empty (no matches yet) or fail, and it is in
     flight on first paint. Each of those is a different message, so they are no
     longer collapsed into one placeholder frame. */
  if (!profile || !enriched) {
    const frame = fluid ? "h-full w-full" : "h-screen w-full";

    if (loading) {
      return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
          <Loader label="Finding people nearby…" hint="This only takes a moment." />
        </main>
      );
    }

    if (error) {
      return (
        <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
          <Notice
            title="Couldn't load people"
            detail="Check your connection and try again."
            actionLabel="Try again"
            onAction={refetch}
          />
        </main>
      );
    }

    return (
      <main className={`flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
        <Notice
          title="No one new right now"
          detail="Pull in a wider distance or check back shortly."
          actionLabel="Refresh"
          onAction={refetch}
        />
      </main>
    );
  }

  /* The feed only carries a subset of the fields the desktop card can show, so
     rows without a real value are dropped instead of rendering a dash. */
  const facts = ([
    { label: "Birth Date", value: enriched.birth_date, icon: Calendar },
    { label: "Height", value: enriched.height, icon: Ruler },
    { label: "Location", value: enriched.location, icon: MapPin },
    { label: "Occupation", value: enriched.occupation, icon: Briefcase },
    { label: "Looking for", value: enriched.lookingFor, icon: Heart },
    { label: "Religion", value: enriched.religion, icon: Church },
    { label: "Community", value: enriched.community, icon: Users },
    { label: "Mother tongue", value: enriched.motherTongue, icon: Languages },
    { label: "Zodiac", value: enriched.zodiac, icon: Moon },
  ] as Fact[]).filter((fact) => Boolean(fact.value));

  const gallery = enriched.gallery?.length ? enriched.gallery : [enriched.image];
  /* Extra photos below the hero. Users with a single photo get none. */
  const extraPhotos = gallery.slice(1);
  const isOnline = Boolean(enriched.isOnline);

  return (
    <main className={`flex-1 flex px-2 py-2 flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
      {/* Card container – fills remaining height */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Profile card */}

        <div
          onPointerDown={fluid ? onPointerDown : undefined}
          onPointerMove={fluid ? onPointerMove : undefined}
          onPointerUp={fluid ? endDrag : undefined}
          onPointerCancel={fluid ? endDrag : undefined}
          style={
            fluid && drag.active
              ? { transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x / 18}deg)`, transition: "none" }
              : undefined
          }
          className={`absolute ${fluid ? "inset-0" : "w-[320px] sm:w-[300px] h-[480px] sm:h-[520px]"
            } rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out ${fluid ? "touch-pan-y" : "cursor-pointer"
            } ${swipeDir === "right"
              ? "translate-x-[120%] rotate-12 opacity-0"
              : swipeDir === "left"
                ? "-translate-x-[120%] -rotate-12 opacity-0"
                : swipeDir === "up"
                  ? "-translate-y-[120%] -rotate-6 opacity-0"
                  : "translate-x-0 rotate-0 opacity-100"
            }`}
        >
          {roseOpen && (
            <ComplimentingModal
              name="Aman"
              avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=600&fit=crop"
              comments={0}
              roses={124}
              balance="₹99,460"
              onClose={() => setRoseOpen(false)}
            // onSend={(text:string, gift:GiftOption) => sendCompliment(text,gift)}
            />
          )}
          {/* Scrollable content – scroll down to view full profile */}
          <div
            ref={cardScrollRef}
            onScroll={handleCardScroll}
            className="h-full overflow-y-auto scrollbar-hide overscroll-contain"
          >
            {/* Photo – full card height */}
            <div className="relative h-full shrink-0">
              <img
                src={enriched.image}
                alt={enriched.name}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Info overlay – bottom */}
              <div className="absolute bottom-16 left-0 right-0 p-5 z-10">
                {/* Live presence / boost chips */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  {isOnline && (
                    <span className="flex items-center gap-1.5 rounded-full bg-green-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      Online
                    </span>
                  )}
                  {enriched.isBoosted && (
                    <span className="rounded-full bg-[#a78bfa]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Boosted
                    </span>
                  )}
                  {typeof enriched.trust === "number" && (
                    <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white flex items-center gap-1">
                      <span className="bg-blue-400 rounded-full w-[5px] h-[5px]" />
                      {enriched.trust}% trust
                    </span>
                  )}
                  {typeof enriched.matchScore === "number" && enriched.matchScore > 0 && (
                    <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white flex items-center gap-1">
                      <span className="bg-green-400 rounded-full w-[5px] h-[5px]" />
                      {enriched.matchScore}% match
                    </span>
                  )}
                  {typeof enriched.replyTime === "string" && enriched.replyTime && (
                    <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white flex items-center gap-1">
                      <span className="bg-yellow-400 rounded-full w-[5px] h-[5px]" />
                      {enriched.replyTime}
                    </span>
                  )}
                </div>

                <div className="flex items-end justify-between">
                  <div className="min-w-0">
                    <h2 className="text-3xl font-extrabold text-white drop-shadow-lg truncate">
                      {enriched.name}
                      <span className="ml-2 font-normal text-white/80">{enriched.age}</span>
                    </h2>
                    {enriched.bio && (
                      <p className="text-sm text-white/60 mt-1 line-clamp-2">{enriched.bio}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-white/55 text-[11px]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  Scroll down to view profile
                </div>
              </div>
            </div>

            {/* Details – white panel */}
            <div className="flex flex-col gap-2 bg-white px-5 pb-36 pt-4">
              {enriched.about && (
                <div>
                  <h3 className="text-[11px] flex gap-1 items-center font-bold tracking-[0.15em] text-amber-950"><Astroid size={12} fill="currentColor" /><span>ABOUT</span></h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#5F5A55]">{enriched.about}</p>
                </div>
              )}

              {/* BASICS */}
              {facts.length > 0 && (
                <Section title="BASICS" color="#4169E1">
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {facts.map((fact) => {
                      const Icon = fact.icon;

                      return (
                        <span
                          key={fact.label}
                          className="bg-slate-50 px-3 py-2 rounded-[12px] text-[12px] text-[#5F5A55] flex items-center gap-2"
                        >
                          <span className="bg-blue-100 rounded-full p-1 text-blue-800 shrink-0">
                            <Icon className="w-4 h-4 text-blue-800" />
                          </span>

                          <span className="min-w-0">
                            <span className="block text-black truncate">{fact.label}</span>
                            <span className="block text-[10px] truncate">{fact.value}</span>
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </Section>
              )}

              {/* GALLERY IMG 2 */}
              {extraPhotos[0] && (
                <div>
                  <img className="rounded-2xl w-full" src={extraPhotos[0]} alt={`${enriched.name} photo 2`} loading="lazy" draggable={false} />
                </div>
              )}

              {/* Deep profile: TRAITS, LOOKING FOR, PROMPTS, CAREER, LIFESTYLE,
                  INTERESTS, FAMILY, NETWORKING. Each block renders only when the
                  details payload has something for it. */}
              <ProfileDetailSections
                profile={enriched}
                state={detailsState}
                onRetry={detailsRetry}
              />
          {gallery.slice(4).map((image, index) => (
            <div key={index}>
              <img
                className="rounded-2xl w-full"
                src={image}
                alt={`${profile.name} photo ${index + 3}`}
                loading="lazy"
                draggable={false}
              />
            </div>
          ))}
            </div>
          </div>
          {/* Swipe labels */}
          {swipeDir === "right" && (
            <div className="absolute top-10 left-6 rotate-[-20deg] border-4 border-[#44ff44] rounded-lg px-4 py-1 z-20 pointer-events-none">
              <span className="text-[#44ff44] text-3xl font-black tracking-wider">LIKE</span>
            </div>
          )}
          {swipeDir === "left" && (
            <div className="absolute top-10 right-6 rotate-[20deg] border-4 border-[#ff4444] rounded-lg px-4 py-1 z-20 pointer-events-none">
              <span className="text-[#ff4444] text-3xl font-black tracking-wider">NOPE</span>
            </div>
          )}
          {swipeDir === "up" && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 rotate-[-8deg] border-4 border-[#4a9eff] rounded-lg px-4 py-1 z-20 pointer-events-none">
              <span className="text-[#4a9eff] text-3xl font-black tracking-wider">Send Rose</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Action Buttons – over the card area ── */}
      <div
        className={`${roseOpen ? "hidden" : ""} absolute left-1/2 -translate-x-1/2 flex items-center justify-between w-[200px] z-20 ${fluid ? "bottom-4 gap-3" : "bottom-[3.75rem] gap-3 sm:gap-4"
          }`}
      >
        {/* Nope */}
        <button
          type="button"
          onClick={() => goNext("left")}
          aria-label="Pass"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-transparent border border-white/30 backdrop-blur-sm flex items-center justify-center hover:scale-110 hover:border-[#ff4444]/60 hover:shadow-[0_0_20px_rgba(255,68,68,0.3)] transition-all shadow-lg cursor-pointer"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Send Rose */}
        <button
          type="button"
          onClick={() => setRoseOpen(true)}
          aria-label="Send a rose"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-transparent border border-white/30 backdrop-blur-sm flex items-center justify-center hover:scale-110 hover:border-[#4a9eff]/60 hover:shadow-[0_0_20px_rgba(74,158,255,0.3)] transition-all shadow-lg cursor-pointer"
        >
          <img className="h-12" src={ROSE_IMAGE} alt="" />
        </button>

        {/* Like */}
        <button
          type="button"
          onClick={() => goNext("right")}
          aria-label="Like"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-transparent border border-white/30 backdrop-blur-sm flex items-center justify-center hover:scale-110 hover:border-[#44ff44]/60 hover:shadow-[0_0_20px_rgba(68,255,68,0.3)] transition-all shadow-lg cursor-pointer"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#C21559" stroke="#C21559" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* ── Bottom keyboard bar – desktop only ── */}
      <div className="hidden md:flex h-12 bg-white border-t border-white/5 items-center justify-center gap-5 text-[11px] text-black shrink-0">
        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-white/50">←</kbd> Nope</span>
        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-white/50">→</kbd> Like</span>
        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-white/50">↑</kbd> Open Profile</span>
        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-white/50">↓</kbd> Close Profile</span>
        {/* <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-gray-700 text-white/50">Space</kbd> Send Rose</span> */}
      </div>
    </main>
  );
}

export default HomeMain;
