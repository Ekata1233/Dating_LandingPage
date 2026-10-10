import React, { useEffect, useMemo, useRef } from "react";
import {
  Astroid,
  Briefcase,
  Calendar,
  Church,
  GraduationCap,
  Heart,
  Languages,
  LucideIcon,
  MapPin,
  Moon,
  Ruler,
  User,
  Users,
} from "lucide-react";

import { Loader, Notice } from "../shared/Loader";
import ProfileDetailSections, { Section } from "./ProfileDetailSections";
import type { Profile } from "../shared/types";
import { mergeUserDetails } from "../shared/mapUser";
import { useMyProfile } from "../shared/useMyProfile";
import { useUserDetails } from "@/app/context/UsersContext";

/* -------------------------------------------------------------------------- */
/*  My profile (desktop + mobile preview).                                    */
/*                                                                            */
/*  Same card as `HomeMain` (hero photo, chips, name/age, ABOUT / BASICS /    */
/*  deep sections, gallery), but pointed at the signed-in user instead of a   */
/*  swipe deck. Deep details are loaded the same way as HomeMain:             */
/*  `useUserDetails` + `mergeUserDetails` + `ProfileDetailSections`.          */
/* -------------------------------------------------------------------------- */

/** Card scroll depth (px) that counts as "the user opened the profile". */
const DETAILS_SCROLL_TRIGGER_PX = 40;

export interface ProfileMainProps {
  /** Pre-resolved profile. The hook fetches one when this is omitted. */
  profile?: Profile | null;
  /** Fill the parent edge to edge instead of rendering the 300px desktop frame. */
  fluid?: boolean;
  /** Called when the "scroll down" hint is tapped. */
  onExpand?: (profileId: string) => void;
}

type Fact = {
  label: string;
  value: string | undefined | null;
  icon: LucideIcon;
};

function ProfileMain({ profile: profileProp, fluid = false, onExpand }: ProfileMainProps) {
  const live = useMyProfile();

  const profile = profileProp !== undefined ? profileProp : live.profile;
  const loading = profileProp !== undefined ? false : live.loading;
  const error = profileProp !== undefined ? null : live.error;
  const retry = live.refetch;

  const cardScrollRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------------ */
  /*  Deep profile (same flow as HomeMain)                              */
  /*                                                                    */
  /*  `useUserDetails` only reads the cache; `ensure()` is a no-op once  */
  /*  the user is cached or in flight, so it is safe to call freely.     */
  /*  There is no swipe burst here, so we request as soon as the         */
  /*  profile is known instead of waiting for an idle delay.             */
  /* ------------------------------------------------------------------ */
  const { details, state: detailsState, ensure: requestDetails, refresh: detailsRetry } =
    useUserDetails(profile?.id);

  const requestDetailsRef = useRef(requestDetails);
  useEffect(() => {
    requestDetailsRef.current = requestDetails;
  }, [requestDetails]);

  useEffect(() => {
    if (!profile?.id) return;
    requestDetailsRef.current?.();
  }, [profile?.id]);

  /* The profile enriched with whatever the details endpoint returned. */
  const enriched = useMemo(
    () => (profile && details ? mergeUserDetails(profile, details) : profile),
    [profile, details]
  );

  const handleCardScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > DETAILS_SCROLL_TRIGGER_PX) requestDetails();
  };

  const openProfile = () => {
    if (!enriched) return;
    /* Explicit intent: don't wait for anything. */
    requestDetails();
    onExpand?.(enriched.id);
    const el = cardScrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const gallery = useMemo(
    () =>
      enriched?.gallery?.length ? enriched.gallery : enriched ? [enriched.image] : [],
    [enriched]
  );
  /* Extra photos below the hero. Users with a single photo get none. */
  const extraPhotos = gallery.slice(1);

  const frameClass = `flex-1 flex flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`;

  if (loading) {
    return (
      <main className={frameClass}>
        <Loader label="Loading your profile…" hint="Just a moment." />
      </main>
    );
  }

  if (error) {
    return (
      <main className={frameClass}>
        <Notice
          title="Couldn't load your profile"
          detail="Check your connection and try again."
          actionLabel="Try again"
          onAction={retry}
        />
      </main>
    );
  }

  if (!enriched) {
    return (
      <main className={frameClass}>
        <Notice
          title="No profile found"
          detail="Finish setting up your account and it'll show up here."
          actionLabel="Refresh"
          onAction={retry}
        />
      </main>
    );
  }

  /* Rows without a real value are dropped instead of rendering a dash. */
  const facts = ([
    { label: "Birth Date", value: enriched.birth_date, icon: Calendar },
    { label: "Height", value: enriched.height, icon: Ruler },
    { label: "Location", value: enriched.location, icon: MapPin },
    { label: "Occupation", value: enriched.occupation, icon: Briefcase },
    { label: "Looking for", value: enriched.lookingFor, icon: Heart },
    { label: "Education", value: enriched.education, icon: GraduationCap },
    { label: "Religion", value: enriched.religion, icon: Church },
    { label: "Community", value: enriched.community, icon: Users },
    { label: "Mother tongue", value: enriched.motherTongue, icon: Languages },
    { label: "Zodiac", value: enriched.zodiac, icon: Moon },
    { label: "Gender", value: enriched.gender, icon: User },
  ] as Fact[]).filter((fact) => Boolean(fact.value));

  const isOnline = Boolean(enriched.isOnline);

  return (
    <main className={`flex-1 flex px-2 py-2 flex-col relative ${fluid ? "h-full w-full" : "h-screen"}`}>
      {/* Card container – fills remaining height */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Profile card */}
        <div
          className={`absolute ${
            fluid ? "inset-0" : "w-[320px] sm:w-[300px] h-[480px] sm:h-[520px]"
          } rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 ease-out`}
        >
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
              <div className="absolute bottom-8 left-0 right-0 p-5 z-10">
                {/* Presence / boost / stats chips */}
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
                  {enriched.interestedIn && (
                    <span className="rounded-full bg-white/15 backdrop-blur-md px-2.5 py-1 text-[8px] font-bold uppercase tracking-wide text-white flex items-center gap-1">
                      <span className="bg-pink-400 rounded-full w-[5px] h-[5px]" />
                      Interested in {enriched.interestedIn}
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
                      {enriched.age > 0 && (
                        <span className="ml-2 font-normal text-white/80">{enriched.age}</span>
                      )}
                    </h2>
                    {enriched.bio && (
                      <p className="text-sm text-white/60 mt-1 line-clamp-2">{enriched.bio}</p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openProfile}
                  className="mt-3 flex items-center gap-1.5 text-white/55 text-[11px]"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  Scroll down to view profile
                </button>
              </div>
            </div>

            {/* Details – white panel */}
            <div className="flex flex-col gap-2 bg-white px-5 pb-10 pt-4">
              <div>
                <h3 className="text-[11px] flex gap-1 items-center font-bold tracking-[0.15em] text-amber-950">
                  <Astroid size={12} fill="currentColor" />
                  <span>ABOUT</span>
                </h3>
                {enriched.about ? (
                  <p className="mt-2 text-[13px] leading-relaxed text-[#5F5A55]">{enriched.about}</p>
                ) : (
                  <p className="mt-2 text-[12px] text-[#9C948C]">No bio yet.</p>
                )}
              </div>

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
                  <img
                    className="rounded-2xl w-full"
                    src={extraPhotos[0]}
                    alt={`${enriched.name} photo 2`}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              )}

              {/* Deep profile: TRAITS, LOOKING FOR, PROMPTS, CAREER, LIFESTYLE,
                  INTERESTS, FAMILY, NETWORKING. Same wiring as HomeMain. */}
              <ProfileDetailSections
                profile={enriched}
                state={detailsState}
                onRetry={detailsRetry}
              />

              {/* Remaining photos */}
              {gallery.slice(4).map((image, index) => (
                <div key={index}>
                  <img
                    className="rounded-2xl w-full"
                    src={image}
                    alt={`${enriched.name} photo ${index + 4}`}
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProfileMain;