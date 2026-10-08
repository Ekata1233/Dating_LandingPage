"use client";

import React, { memo } from "react";
import {
  Gift,
  HelpCircle,
  LogOut,
  PauseCircle,
  PlayCircle,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { useActiveSection, type ActiveSection } from "@/app/context/ActiveSectionContext";
import { useAccountSettings } from "@/app/context/AccountSettingsContext";
import { useOnBoardingData } from "@/app/context/OnBoardingDataContext";

/* -------------------------------------------------------------------------- */
/*  Account & Support — the six rows under the profile card.                    */
/*                                                                            */
/*  Extracted out of ProfileSidebar so a page can place it anywhere: the       */
/*  desktop rail still drops it inside the profile card (`variant="inset"`),   */
/*  while the mobile profile page stacks it below the wallet panel             */
/*  (`variant="standalone"`).                                                  */
/*                                                                            */
/*  The rows are a static list — nothing here calls an endpoint. Tapping one    */
/*  is navigation, and navigation is the URL: `setActiveSection` pushes        */
/*  `pathForSection(item.section)` (see ActiveSectionContext), which is why     */
/*  this component only needs the context and no data wiring at all. The       */
/*  pause / resume / delete endpoints live behind the destination pages,       */
/*  through AccountSettingsContext — they are not this list's concern.         */
/*                                                                            */
/*  Exactly one of "Pause Account" / "Resume Account" renders: paused means    */
/*  the server's `profileDetails.pausedAt` has a value. A pause/resume that    */
/*  just succeeded in this session also counts immediately (the context's      */
/*  `paused` flag), so the row flips the moment the API answers `success`      */
/*  rather than when the follow-up refetch lands.                             */
/*                                                                            */
/*  Sizing: every rule below is in `cqw`, which resolves against the nearest   */
/*  `container-type: inline-size` ancestor. In the rail that is ProfileSidebar's*/
/*  own box, so the `inset` variant adds no container of its own and renders   */
/*  exactly as when the markup lived there. As a standalone block there is no  */
/*  container around it, so the `standalone` variant brings one — otherwise    */
/*  `cqw` would fall back to the viewport — plus the horizontal frame padding  */
/*  the profile sidebar's inner used to supply.                               */
/* -------------------------------------------------------------------------- */

export interface AccountSupportItem {
  id: string;
  icon: LucideIcon | string;
  /** Icon tile background */
  iconBg: string;
  /** Icon stroke color, for <Icon color={item.color} /> */
  color: string;
  title: string;
  titleColor?: string;
  subtitle: string;
  section: ActiveSection;
}

export interface AccountSupportSectionProps {
  items?: AccountSupportItem[];

  /**
   * "inset" (default) renders the bare block, borrowing its container and
   * padding from whatever it sits inside — that is what the desktop rail's
   * profile sidebar provides. "standalone" wraps it in its own container box
   * and frame padding, for a page with no profile sidebar around it.
   */
  variant?: "inset" | "standalone";

  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Default Account Items                                                      */
/* -------------------------------------------------------------------------- */

const DEFAULT_ITEMS: AccountSupportItem[] = [
  {
    id: "refer",
    icon: Gift,
    iconBg: "#FCE7F3", // pink-100
    color: "#DB2777",  // pink-600
    title: "Refer & Earn",
    titleColor: "#DB2777",
    subtitle: "Earn ₹100 + ₹500 for every friend",
    section: "refer-earn",
  },
  {
    id: "help",
    icon: HelpCircle,
    iconBg: "#DBEAFE", // blue-100
    color: "#2563EB", // blue-600
    title: "Help & Support",
    titleColor: "#2563EB",
    subtitle: "Get answers or chat with our support team",
    section: "help",
  },
  {
    id: "pause-account",
    icon: PauseCircle,
    iconBg: "#FEF3C7", // amber-100
    color: "#D97706", // amber-600
    title: "Pause Account",
    titleColor: "#D97706",
    subtitle: "Temporarily pause your account",
    section: "pause-account",
  },
  {
    id: "resume-account",
    icon: PlayCircle,
    iconBg: "#DCFCE7", // green-100
    color: "#16A34A", // green-600
    title: "Resume Account",
    titleColor: "#16A34A",
    subtitle: "resume your paused account",
    section: "resume-account",
  },
  {
    id: "delete-account",
    icon: Trash2,
    iconBg: "#FEE2E2", // red-100
    color: "#DC2626", // red-600
    title: "Delete Account",
    titleColor: "#DC2626",
    subtitle: "Permanently delete your account",
    section: "delete-account",
  },
  {
    id: "logout",
    icon: LogOut,
    iconBg: "#F3F4F6", // gray-100
    color: "#4B5563", // gray-600
    title: "Logout",
    titleColor: "#4B5563",
    subtitle: "Sign out of your account",
    section: "logout",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const AccountSupportSection: React.FC<AccountSupportSectionProps> = ({
  items = DEFAULT_ITEMS,
  variant = "inset",
  className = "",
}) => {
  const { activeSection, setActiveSection } = useActiveSection();
  const { profileDetails } = useOnBoardingData();
  const { paused } = useAccountSettings();

  const pausedAt = profileDetails.details?.flows?.REVIEW_FINISH?.pausedAt;

  /* Paused ⇔ `pausedAt` has a value: then "Pause Account" hides and "Resume
     Account" shows; `pausedAt` null ⇔ the other way round. A pause/resume
     performed this session overrides the stale server value for the gap
     between the API answering and `profileDetails.refetch()` completing, so
     the row swaps the instant the response is `success: true`. */
  const isPaused = paused ?? Boolean(pausedAt);

  const block = (
    <section
      className={`account-section ${variant === "inset" ? className : ""}`}
    >
      <div className="account-section-label">
        ACCOUNT &amp; SUPPORT
      </div>

      <div className="account-list">
        {items
          .map((item) => (
            <button
              key={item.id}
              type="button"
              className="account-row"
              onClick={() => setActiveSection(item.section)}
            >
              <div
                className="account-icon"
                style={{
                  backgroundColor: item.iconBg,
                }}
              >
                <item.icon size={20} color={item.color} />
              </div>

              <div className="account-text">
                <div
                  className="account-title"
                  style={
                    activeSection === item.section && item.titleColor
                      ? { color: item.titleColor }
                      : { color: "black" }
                  }
                >
                  {item.title}
                </div>

                <div className="account-subtitle">
                  {item.subtitle}
                </div>
              </div>

              <svg
                className="account-chevron"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}
      </div>
    </section>
  );

  return (
    <>
      <style>{`
        .account-section {
          width: 100%;

          display: flex;
          flex-direction: column;

          gap: 2.4cqw;
        }

        .account-section-label {
          font-size: 3.4cqw;
          font-weight: 700;

          letter-spacing: 0.12em;

          color: #8a8f98;

          padding: 0 1cqw;
        }

        .account-list {
          width: 100%;
          box-sizing: border-box;

          background: #fff;

          border-radius: 6cqw;

          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);

          overflow: hidden;
        }

        .account-row {
          width: 100%;

          display: flex;
          align-items: center;

          gap: 4cqw;

          padding: 4.4cqw 4.5cqw;

          background: none;
          border: none;
          border-bottom: 1px solid var(--border);

          text-align: left;

          cursor: pointer;

          font: inherit;

          transition: background 150ms ease;
        }

        .account-row:last-child {
          border-bottom: none;
        }

        .account-row:hover {
          background: #fafafa;
        }

        .account-row:active {
          background: #f5f5f5;
        }

        .account-icon {
          width: 13cqw;
          height: 13cqw;

          min-width: 34px;
          min-height: 34px;

          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          font-size: 6cqw;
          line-height: 1;
        }

        .account-text {
          flex: 1 1 auto;
          min-width: 0;
        }

        .account-title {
          font-size: 4.6cqw;
          font-weight: 700;

          color: var(--text);

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .account-subtitle {
          margin-top: 0.8cqw;

          font-size: 3.4cqw;

          color: var(--light-muted);

          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .account-chevron {
          width: 3.6cqw;
          height: 3.6cqw;

          min-width: 12px;
          min-height: 12px;

          flex-shrink: 0;

          color: #b7bbc2;
        }

        /* ------------------------------------------------------------------ */
        /* Standalone placement.                                               */
        /* The mobile stack has no profile sidebar around this block, so it     */
        /* brings its own inline-size container (cqw would otherwise fall back   */
        /* to the viewport) and the frame padding that sidebar's inner gave it.  */
        /* ------------------------------------------------------------------ */

        .account-support {
          width: 100%;
          box-sizing: border-box;

          container-type: inline-size;

          /* The rows read these off .profile-sidebar, which is exactly what is
             missing once the block stands on its own. Same values, so the two
             placements cannot drift apart. */
          --text: #16181b;
          --muted: #7c828a;
          --light-muted: #9aa0a8;
          --border: #eef0f2;
        }

        .account-support-frame {
          box-sizing: border-box;

          padding: 2cqw 4cqw 8cqw;
        }
      `}</style>

      {variant === "standalone" ? (
        <div className={`account-support ${className}`}>
          <div className="account-support-frame">{block}</div>
        </div>
      ) : (
        block
      )}
    </>
  );
};

export default memo(AccountSupportSection);
