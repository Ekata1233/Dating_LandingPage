"use client";

import React, { useCallback, useState } from "react";

import ProfileEditCard from "../ProfileEditMain";
import ProfileMain from "../ProfileMain";
import { Loader, Notice } from "../shared/Loader";
import { BRAND } from "../shared/theme";
import type { Profile } from "../shared/types";
import { useMyProfile } from "../shared/useMyProfile";

/* -------------------------------------------------------------------------- */
/*  Edit profile (mobile) — Edit / Preview.                                     */
/*                                                                            */
/*  Editing is a long scroll and seeing the result is a tall card, so on a phone */
/*  they cannot share a screen. They sit behind a two-tab bar instead:           */
/*                                                                            */
/*    ┌ [ Edit Profile | Preview ]  ← tab bar                                  */
/*    ├ ProfileEditCard fluid      (Edit tab)                                  */
/*    └ ProfileMain fluid          (Preview tab) — the live profile card       */
/*                                                                            */
/*  Both panels are the desktop components in `fluid` mode, so the mobile and  */
/*  desktop renderers cannot drift apart.                                      */
/* -------------------------------------------------------------------------- */

export type EditProfileTab = "edit" | "preview";

const TABS: ReadonlyArray<{ id: EditProfileTab; label: string }> = [
  { id: "edit", label: "Edit Profile" },
  { id: "preview", label: "Preview" },
];

/**
 * The Preview tab. Renders the real profile card once the request lands and
 * never falls back to a seeded mock, so what the user reviews is what they
 * will actually publish.
 */
const ProfilePreview: React.FC<{
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}> = ({ profile, loading, error, onRetry }) => {
  if (loading) {
    return <Loader label="Building your preview…" hint="Fetching your latest details." />;
  }

  if (error) {
    return (
      <Notice
        title="Couldn't load your profile"
        detail="Check your connection and try again."
        actionLabel="Try again"
        onAction={onRetry}
      />
    );
  }

  if (!profile) {
    return (
      <Notice
        title="Nothing to preview yet"
        detail="Save a few details on the Edit tab and they'll show up here."
      />
    );
  }

  return <ProfileMain fluid profile={profile} />;
};

export interface MobileEditProfileSectionProps {
  /** Which tab to open on. The tab bar is uncontrolled, so this is first-paint only. */
  initialTab?: EditProfileTab;
  onTabChange?: (tab: EditProfileTab) => void;
  /** Profile shown by the Preview tab. The hook fetches one when this is omitted. */
  profile?: Profile | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const MobileEditProfileSection: React.FC<MobileEditProfileSectionProps> = ({
  initialTab = "edit",
  onTabChange,
  profile: profileProp,
  loading: loadingProp,
  error: errorProp,
  onRetry,
}) => {
  const [tab, setTab] = useState<EditProfileTab>(initialTab);
  const live = useMyProfile();

  const profile = profileProp !== undefined ? profileProp : live.profile;
  const loading = loadingProp ?? live.loading;
  const error = errorProp ?? live.error;
  const retry = onRetry ?? live.retry;

  const select = useCallback(
    (next: EditProfileTab) => {
      setTab(next);
      onTabChange?.(next);
    },
    [onTabChange]
  );

  return (
    <div className="flex h-full w-full flex-col">
      {/* Tab bar — above both panes, outside the panel so it never scrolls away. */}
      <div
        role="tablist"
        aria-label="Edit or preview profile"
        className="flex shrink-0 px-3"
        style={{ borderBottom: `1px solid ${BRAND.border}` }}
      >
        {TABS.map(({ id, label }) => {
          const active = tab === id;

          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`profile-tab-${id}`}
              aria-selected={active}
              aria-controls={`profile-panel-${id}`}
              onClick={() => select(id)}
              className="flex-1 cursor-pointer border-b-2 py-3 text-center text-[14px] font-semibold transition-colors"
              style={{
                borderColor: active ? BRAND.pinkDeep : "transparent",
                color: active ? BRAND.pinkDeep : BRAND.muted,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Only the active pane is mounted: both panels are tall, scrollable
         surfaces and there is no reason to keep the hidden one alive. */}
      <div
        role="tabpanel"
        id={`profile-panel-${tab}`}
        aria-labelledby={`profile-tab-${tab}`}
        className="min-h-0 flex-1 overflow-hidden"
      >
        {tab === "edit" ? (
          <ProfileEditCard fluid />
        ) : (
          <ProfilePreview profile={profile} loading={loading} error={error} onRetry={retry} />
        )}
      </div>
    </div>
  );
};

export default MobileEditProfileSection;
