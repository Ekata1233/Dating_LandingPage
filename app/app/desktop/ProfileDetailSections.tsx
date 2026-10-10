import type { UserDetailsState } from "@/app/context/UsersContext";
import React, { useEffect } from "react";

import { FactIcon } from "../shared/factIcons";
import type { Profile, ProfileFact } from "../shared/types";
import { Astroid, CircleStar } from "lucide-react";
import { useOnBoardingData } from "@/app/context/OnBoardingDataContext";

/* -------------------------------------------------------------------------- */
/*  Deep-profile sections.                                                     */
/*                                                                            */
/*  Everything here comes from `GET /api/user/feed/details/:userId`, so each    */
/*  block is skipped when the payload has nothing for it. The parent decides    */
/*  *when* to request; this component only renders whatever has arrived.        */
/* -------------------------------------------------------------------------- */

export interface ProfileDetailSectionsProps {
  profile: Profile;
  /** Drives the "loading more" placeholder. */
  state: UserDetailsState;
  onRetry?: () => void;
}

export function Section({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="mt-5">

      <h3 className={`text-[11px] flex gap-1 items-center font-bold tracking-[0.15em]`}
        style={{ color: color || "#9C948C" }}>
        <Astroid size={12} fill="currentColor" />
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

const ProfileDetailSections: React.FC<ProfileDetailSectionsProps> = ({
  profile,
  state,
  onRetry,
}) => {
  const { detailsLoaded } = profile;

  /* Traits read well as pills, so they use the same markup as the hero chips. */
  const traits: ProfileFact[] = [
    { label: "Love language", icon: "Heart", value: profile.loveLanguage ?? "" },
    { label: "Communication", icon: "MessageSquare", value: profile.communicationStyle ?? "" },
  ].filter((trait) => Boolean(trait.value));

  const lookingFor = profile.lookingFor;
  const hasCareer = profile.career.length > 0;
  const hasLifestyle = profile.lifestyle.length > 0;
  const hasInterests = profile.interests.length > 0;
  const hasFamily = profile.family.length > 0;
  const hasNetworking = profile.networking.length > 0;
  const hasPrompts = profile.prompts.length > 0;
  const gallery = profile.gallery?.length ? profile.gallery : [profile.image];
  /* Extra photos below the hero. Users with a single photo get none. */
  const extraPhotos = gallery.slice(1);
  const isOnline = Boolean(profile.isOnline);
  const hasAnyDetail =
    traits.length > 0 ||
    Boolean(lookingFor) ||
    hasPrompts ||
    hasCareer ||
    hasLifestyle ||
    hasInterests ||
    hasFamily ||
    hasNetworking;

  /* The request failed, or came back with nothing worth showing. */
  if (state === "error") {
    return (
      <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
        <p className="text-[12px] text-[#5F5A55]">Couldn&apos;t load the rest of this profile.</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-[12px] font-semibold text-[#C21559] hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  /* Nothing to show and still in flight: reserve the space so the sections
     below do not jump when they land. */
  if (!hasAnyDetail) {
    if (state === "loading" || state === "idle") {
      return (
        <div className="mt-5 space-y-2" aria-hidden>
          <div className="h-3 w-1/3 rounded bg-gray-100 animate-pulse" />
          <div className="h-16 w-full rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-3 w-1/4 rounded bg-gray-100 animate-pulse" />
          <div className="h-24 w-full rounded-xl bg-gray-100 animate-pulse" />
        </div>
      );
    }

    return null;
  }

  return (
    <>
      {/* ------------------------------- TRAITS ------------------------------ */}
      {traits.length > 0 && (
        <Section title="Connection Preferences">
          <div className="mt-2 flex flex-wrap gap-1.5">
            {traits.map((trait) => (
              <span
                key={trait.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-medium text-[#5F5A55]"
              >
                <FactIcon name={trait.icon} className="text-[#9C948C]" />
                <span className="text-[#9C948C]">{trait.label}</span>
                {trait.value}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* ----------------------------- LOOKING FOR ---------------------------- */}
      {lookingFor && (
        <Section title="LOOKING FOR">
          <div className="mt-2 rounded-xl bg-[#FDF2F6] px-4 py-3">
            <p className="text-[14px] font-bold text-[#C21559]">{lookingFor}</p>
            {profile.lookingForSubtitle && (
              <p className="mt-1 text-[12px] leading-relaxed text-[#5F5A55]">
                {profile.lookingForSubtitle}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* ------------------------------- PROMPTS ----------------------------- */}
      {hasPrompts && (
        <Section title="IN THEIR WORDS">
          <div className="mt-2 space-y-2">
            {profile.prompts.map((prompt, index) => (
              <div key={`${prompt.label}-${index}`} className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold text-[#9C948C]">{prompt.label}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#2B2A28]">{prompt.value}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* -------------------------------- CAREER ----------------------------- */}
      {hasCareer && (
        <Section title="CAREER" color="#8D6944">
          <div className="mt-2 grid grid-cols-2 gap-2">
            {profile.career.filter((fact) => fact.label !== "Big dreams").map((fact, index) => (
              <span
                key={`${fact.label}-${index}`}
                className="bg-slate-50 px-3 py-2 rounded-[12px] text-[12px] text-[#5F5A55] flex items-center gap-2"
              >
                <span className="bg-[#F7F2EE] rounded-full px-1 py-1 text-[#8D6944] shrink-0">
                  <FactIcon name={fact.icon} className="text-[#8D6944]" />
                </span>

                <span className="min-w-0">
                  <h1 className="block text-black" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fact.label}</h1>
                  <h1 className="block text-[10px]" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fact.value}</h1>
                </span>
              </span>

            ))}
          </div>
          <div className="w-full h-[1px] mt-5 flex justify-evenly items-center">
            <div className="w-[7rem] bg-[#8D6944] h-full"></div>
            <Astroid size={10} color="#8D6944" fill="#8D6944" />
            <div className="w-[7rem] bg-[#8D6944] h-full"></div>
          </div>
          {profile.career.filter((fact) => fact.label === "Big dreams").map((fact, index) => (<span key={index} className="w-full flex flex-col justify-center pt-3 text-[12px] items-center text-black"><span>BIG DREAM</span><span className="text-[#5F5A55]">{fact.value}</span></span>))}
        </Section >
      )}
      {extraPhotos[1] && (
        <div>
          <img className="rounded-2xl w-full" src={extraPhotos[1]} alt={`${profile.name} photo 3`} loading="lazy" draggable={false} />
        </div>
      )}
      {/* ------------------------------- LIFESTYLE --------------------------- */}
      {
        hasLifestyle && (
          <Section title="LIFESTYLE" color="#276749">
            <div className="mt-2 grid grid-cols-2 gap-2">
              {profile.lifestyle.map((fact, index) => (
                <span
                  key={`${fact.label}-${index}`}
                  className="bg-slate-50 px-3 py-2 rounded-[12px] text-[12px] text-[#5F5A55] flex items-center gap-2"
                >
                  <span className="bg-green-100 rounded-full px-1 py-1 text-green-800 shrink-0">
                    <FactIcon name={fact.icon} className="text-green-800" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-black truncate">{fact.label}</span>
                    <span className="block text-[10px] truncate">{fact.value}</span>
                    {fact.description && (
                      <span className="block text-[10px] text-[#9C948C] truncate">
                        {fact.description}
                      </span>
                    )}
                  </span>
                </span>
              ))}
            </div>
          </Section>
        )
      }
      {extraPhotos[2] && (
        <div>
          <img className="rounded-2xl w-full" src={extraPhotos[2]} alt={`${profile.name} photo 3`} loading="lazy" draggable={false} />
        </div>
      )}
      {/* ------------------------------ INTERESTS ---------------------------- */}
      {
        hasInterests && (
          <Section title="INTERESTS" color="#56438E">
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.interests.map((fact, index) => (
                <span
                  key={`${fact.label}-${index}`}
                  title={fact.value}
                  className="px-3 py-1 rounded-full border  text-[12px] text-purple-800 bg-purple-100"
                >
                  <div className="flex justify-center items-center gap-1">
                    <CircleStar size={15} color="#8200db" fill="#FFFFFF"/>
                  {fact.value}
                  </div>
                </span>
              ))}
            </div>
          </Section>
        )
      }

      {/* -------------------------------- FAMILY ----------------------------- */}
      {
        hasFamily && (
          <Section title="FAMILY" color="#0369a1">
            <div className="mt-2 grid grid-cols-2 gap-2">
              {profile.family.map((fact, index) => (
                <span
                  key={`${fact.label}-${index}`}
                  className="bg-slate-50 px-3 py-2 rounded-[12px] text-[12px] text-[#5F5A55] flex items-center gap-2"
                >
                  <span className="bg-sky-100 rounded-full px-1 py-1 text-sky-800 shrink-0">
                    <FactIcon name={fact.icon} className="text-sky-800" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-black truncate">{fact.label}</span>
                    <span className="block text-[10px] truncate">{fact.value}</span>
                  </span>
                </span>
              ))}
            </div>
          </Section>
        )
      }

      {/* ------------------------------ NETWORKING --------------------------- */}
      {
        hasNetworking && (
          <Section title="NETWORKING">
            <div className="mt-2 grid gap-2">
              {profile.networking.map((fact, index) => (
                <span
                  key={`${fact.label}-${index}`}
                  className="bg-slate-50 px-3 py-2 rounded-[12px] text-[12px] text-[#5F5A55] flex items-center gap-2"
                >
                  <span className="bg-violet-100 rounded-full px-1 py-1 text-violet-800 shrink-0">
                    <FactIcon name={fact.icon} className="text-violet-800" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-black">{fact.label}</span>
                    <span className="block text-[10px]">{fact.value}</span>
                  </span>
                </span>
              ))}
            </div>
          </Section>
        )
      }
    </>
  );
};

export default ProfileDetailSections;
