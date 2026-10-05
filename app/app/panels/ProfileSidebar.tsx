"use client";

import React, { memo, useCallback, useMemo } from "react";
import { ActiveSection, useActiveSection } from "@/app/context/ActiveSectionContext";

import { FALLBACK_AVATAR } from "../shared/mockData";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface AccountSupportItem {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  titleColor?: string;
  subtitle: string;
  section: ActiveSection;
}

export interface ProfileSidebarProps {
  /** Primary photo. Falls back to the neutral avatar while it is unknown. */
  avatarUrl?: string;
  name?: string;
  age?: number;
  verified?: boolean;
  location?: string;
  isPlatinumMember?: boolean;
  /** 0 hides the trust badge — the onboarding payload carries no score yet. */
  trustScore?: number;
  completionPercent?: number;
  className?: string;
  accountItems?: AccountSupportItem[];

  /**
   * "fill" (default) makes the sidebar own the full height of its slot and
   * scrolls internally, which is what the desktop rail wants. "auto" lets it
   * grow to its content height and hands scrolling to an ancestor, so it can be
   * stacked above other content on a single mobile page.
   */
  flow?: "fill" | "auto";

  /**
   * Optional callback for the Edit Profile button.
   * If omitted, no action is performed.
   */
  onEditProfile?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Default Account Items                                                      */
/* -------------------------------------------------------------------------- */

const DEFAULT_ITEMS: AccountSupportItem[] = [
  {
    id: "refer",
    icon: "🎁",
    iconBg: "#dcf3e3",
    title: "Refer & Earn",
    titleColor: "#e14b3f",
    subtitle: "Get ₹100 + ₹500 per friend",
    section: "refer-earn",
  },
  {
    id: "help",
    icon: "❓",
    iconBg: "#fbdde1",
    title: "Help & Support",
    titleColor: "#e14b3f",
    subtitle: "FAQ, Chat with Support",
    section: "help",
  },
  {
    id: "logout",
    icon: "🚪",
    iconBg: "#fdecc8",
    title: "Logout",
    titleColor: "#e14b3f",
    subtitle: "Sign out of your account",
    section: "logout",
  },
];

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  avatarUrl = FALLBACK_AVATAR,
  name,
  age,
  verified = false,
  location,
  isPlatinumMember = false,
  trustScore = 0,
  completionPercent = 0,
  className = "",
  accountItems = DEFAULT_ITEMS,
  flow = "fill",
  onEditProfile,
}) => {
  const {activeSection, setActiveSection } = useActiveSection();

  /* Clamp progress so invalid API values cannot break the UI */
  const safeCompletion = useMemo(
    () => Math.min(100, Math.max(0, completionPercent)),
    [completionPercent]
  );

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const dashOffset =
    circumference * (1 - safeCompletion / 100);

  /* ---------------------------------------------------------------------- */
  /* Navigation                                                             */
  /* ---------------------------------------------------------------------- */

  const handleSectionChange = useCallback(
    (section: ActiveSection) => {
      setActiveSection(section);
    },
    [setActiveSection]
  );

  const handleEditProfile = useCallback(() => {
    /* Prefer the host's handler: on mobile the sidebar lives inside a bottom
       sheet that has to be dismissed before the editor can be seen. */
    if (onEditProfile) {
      onEditProfile();
      return;
    }
    setActiveSection("edit-profile");
  }, [onEditProfile, setActiveSection]);

  return (
    <aside
      className={`profile-sidebar ${flow === "auto" ? "profile-sidebar--auto" : ""} ${className}`}
    >
      <style>{`
        .profile-sidebar {
          --primary: #e6317c;
          --primary-orange: #f4795a;
          --text: #16181b;
          --muted: #7c828a;
          --light-muted: #9aa0a8;
          --border: #eef0f2;

          width: 100%;
          height: 100%;
          min-height: 0;
          flex: 1 1 auto;

          container-type: inline-size;
        }

        .profile-sidebar-inner {
          width: 100%;
          height: 100%;
          box-sizing: border-box;

          overflow-y: auto;
          overflow-x: hidden;

          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;

          scrollbar-width: none;
          -ms-overflow-style: none;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 3cqw;
          padding: 5cqw 4cqw;

          background: linear-gradient(
            180deg,
            #fdece0 0%,
            #ffffff 45%
          );

          font-family: inherit;
        }

        .profile-sidebar-inner::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        /* ------------------------------------------------------------------ */
        /* Flow mode — stacked above other content on a scrolling page.        */
        /* Declared after the base rules so it wins on equal specificity.      */
        /* ------------------------------------------------------------------ */

        .profile-sidebar--auto {
          height: auto;
          flex: 0 0 auto;
        }

        .profile-sidebar--auto .profile-sidebar-inner {
          height: auto;
          overflow: visible;
        }

        /* ---------------------------------------------------------------- */
        /* Profile                                                           */
        /* ---------------------------------------------------------------- */

        .profile-ring {
          position: relative;

          width: 32cqw;
          height: 32cqw;

          min-width: 80px;
          min-height: 80px;

          flex-shrink: 0;
        }

        .profile-ring-glow {
          position: absolute;
          inset: -10%;

          border-radius: 50%;

          background: radial-gradient(
            circle,
            rgba(236, 64, 122, 0.25) 0%,
            rgba(236, 64, 122, 0) 70%
          );
        }

        .profile-ring-svg {
          position: absolute;
          inset: 0;

          width: 100%;
          height: 100%;

          transform: rotate(-90deg);
        }

        .profile-avatar {
          position: absolute;
          inset: 8%;

          width: 84%;
          height: 84%;

          border-radius: 50%;
          object-fit: cover;
        }

        .profile-percent {
          position: absolute;
          bottom: -6%;
          left: 50%;

          transform: translateX(-50%);

          background: var(--primary);
          color: #fff;

          font-size: 3.4cqw;
          font-weight: 700;

          padding: 1cqw 3.2cqw;

          border-radius: 999px;
          border: 2px solid #fff;

          white-space: nowrap;

          box-shadow: 0 2px 6px rgba(230, 49, 124, 0.4);
        }

        .profile-name-row {
          margin-top: 2cqw;

          display: flex;
          align-items: baseline;
          justify-content: center;

          gap: 1.6cqw;

          flex-wrap: wrap;
          text-align: center;
        }

        .profile-name {
          font-size: 6.4cqw;
          font-weight: 800;

          color: var(--text);
          line-height: 1.15;
        }

        .profile-age {
          font-size: 6.4cqw;
          font-weight: 700;

          color: var(--light-muted);
        }

        .profile-verified {
          width: 5cqw;
          height: 5cqw;

          min-width: 14px;
          min-height: 14px;

          flex-shrink: 0;
        }

        .profile-location {
          display: flex;
          align-items: center;

          gap: 1cqw;

          font-size: 4cqw;
          color: var(--muted);
        }

        .profile-location-icon {
          width: 4cqw;
          height: 4cqw;

          min-width: 12px;
          min-height: 12px;

          flex-shrink: 0;
        }

        /* ---------------------------------------------------------------- */
        /* Badges                                                            */
        /* ---------------------------------------------------------------- */

        .profile-badges {
          margin-top: 1cqw;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 2.4cqw;

          flex-wrap: wrap;
        }

        .profile-badge {
          display: flex;
          align-items: center;

          gap: 1.4cqw;

          font-size: 3.4cqw;
          font-weight: 700;

          padding: 2cqw 4cqw;

          border-radius: 999px;

          white-space: nowrap;
        }

        .profile-badge-platinum {
          background: linear-gradient(
            90deg,
            var(--primary-orange),
            var(--primary)
          );

          color: #fff;

          box-shadow: 0 4px 10px rgba(230, 49, 124, 0.3);
        }

        .profile-badge-trust {
          background: #d7f4e3;
          color: #1c9c52;
        }

        .profile-badge-icon {
          width: 3.6cqw;
          height: 3.6cqw;

          min-width: 10px;
          min-height: 10px;

          flex-shrink: 0;
        }

        .profile-trust-dot {
          width: 2cqw;
          height: 2cqw;

          min-width: 6px;
          min-height: 6px;

          border-radius: 50%;
          background: #1c9c52;

          flex-shrink: 0;
        }

        /* ---------------------------------------------------------------- */
        /* Completion                                                        */
        /* ---------------------------------------------------------------- */

        .completion-box {
          margin-top: 2cqw;

          width: 100%;
          box-sizing: border-box;

          background: #fff;

          border: 1px solid rgba(0, 0, 0, 0.06);
          border-radius: 6cqw;

          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);

          padding: 5cqw;

          display: flex;
          flex-direction: column;

          gap: 3cqw;
        }

        .completion-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .completion-label {
          font-size: 4.6cqw;
          font-weight: 700;

          color: var(--text);
        }

        .completion-value {
          font-size: 5.6cqw;
          font-weight: 800;

          color: var(--primary);
        }

        .progress-track {
          width: 100%;
          height: 2.4cqw;

          min-height: 6px;

          border-radius: 999px;
          background: #ececec;

          overflow: hidden;
        }

        .progress-fill {
          height: 100%;

          border-radius: 999px;

          background: linear-gradient(
            90deg,
            #f9a84a,
            var(--primary)
          );

          transition: width 300ms ease;
        }

        .edit-profile-btn {
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          gap: 2cqw;

          background: #17181a;
          color: #fff;

          font-size: 4.4cqw;
          font-weight: 700;

          padding: 3.4cqw 0;

          border: none;
          border-radius: 999px;

          cursor: pointer;

          transition:
            transform 150ms ease,
            opacity 150ms ease;
        }

        .edit-profile-btn:hover {
          opacity: 0.92;
        }

        .edit-profile-btn:active {
          transform: scale(0.98);
        }

        .edit-profile-icon {
          width: 4cqw;
          height: 4cqw;

          min-width: 12px;
          min-height: 12px;
        }

        /* ---------------------------------------------------------------- */
        /* Account & Support                                                 */
        /* ---------------------------------------------------------------- */

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
      `}</style>

      <div className="profile-sidebar-inner">

        {/* ================================================================ */}
        {/* Profile                                                          */}
        {/* ================================================================ */}

        <div className="profile-ring">
          <div className="profile-ring-glow" />

          <svg
            className="profile-ring-svg"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e9e9ea"
              strokeWidth="6"
            />

            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="#e6317c"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <img
            className="profile-avatar"
            src={avatarUrl}
            alt={name ? `${name}'s photo` : "Profile photo"}
            loading="lazy"
            decoding="async"
          />

          <div className="profile-percent">
            {safeCompletion}%
          </div>
        </div>

        {/* Name */}
        <div className="profile-name-row">
          {name && <span className="profile-name">{name}</span>}

          {age ? <span className="profile-age">{age}</span> : null}

          {verified && (
            <svg
              className="profile-verified"
              viewBox="0 0 24 24"
              fill="none"
              aria-label="Verified profile"
            >
              <path
                d="M12 2l2.4 1.3 2.7-.4 1.3 2.4 2.4 1.3-.4 2.7 1.3 2.4-1.3 2.4.4 2.7-2.4 1.3-1.3 2.4-2.7-.4L12 22l-2.4-1.3-2.7.4-1.3-2.4-2.4-1.3.4-2.7L2.3 12l1.3-2.4-.4-2.7 2.4-1.3L6.9 2.9l2.7.4L12 2z"
                fill="#e6317c"
              />

              <path
                d="M8.5 12.2l2.3 2.3 4.2-4.7"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {/* Location */}
        {location ? (
          <div className="profile-location">
            <svg
              className="profile-location-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 21s-7-6.2-7-11.4A7 7 0 0 1 19 9.6C19 14.8 12 21 12 21z"
                stroke="#7c828a"
                strokeWidth="1.6"
              />

              <circle
                cx="12"
                cy="9.5"
                r="2.2"
                stroke="#7c828a"
                strokeWidth="1.6"
              />
            </svg>

            <span>{location}</span>
          </div>
        ) : null}

        {/* Badges */}
        {(isPlatinumMember || trustScore > 0) && (
          <div className="profile-badges">
            {isPlatinumMember && (
              <div className="profile-badge profile-badge-platinum">
                <svg
                  className="profile-badge-icon"
                  viewBox="0 0 24 24"
                  fill="#fff"
                  aria-hidden="true"
                >
                  <path d="M12 2l1.6 4.8L18 8l-4.4 1.2L12 14l-1.6-4.8L6 8l4.4-1.2L12 2z" />
                  <path d="M19 13l.9 2.6L22 16l-2.1.4L19 19l-.9-2.6L16 16l2.1-.4L19 13z" />
                </svg>

                PLATINUM MEMBER
              </div>
            )}

            {trustScore > 0 && (
              <div className="profile-badge profile-badge-trust">
                <span className="profile-trust-dot" />

                {trustScore}% Trust Score
              </div>
            )}
          </div>
        )}

        {/* ================================================================ */}
        {/* Profile Completion                                               */}
        {/* ================================================================ */}

        <div className="completion-box">
          <div className="completion-top">
            <span className="completion-label">
              Profile Completion
            </span>

            <span className="completion-value">
              {safeCompletion}%
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${safeCompletion}%`,
              }}
            />
          </div>

          <button
            type="button"
            className="edit-profile-btn"
            onClick={handleEditProfile}
          >
            <svg
              className="edit-profile-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 20l4-1 11-11-3-3L5 16l-1 4z"
                stroke="#fff"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>

            Edit Profile
          </button>
        </div>

        {/* ================================================================ */}
        {/* Account & Support                                                */}
        {/* ================================================================ */}

        <section className="account-section">
          <div className="account-section-label">
            ACCOUNT & SUPPORT
          </div>

          <div className="account-list">
            {accountItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className="account-row"
                onClick={() =>
                  handleSectionChange(item.section)
                }
              >
                <div
                  className="account-icon"
                  style={{
                    backgroundColor: item.iconBg,
                  }}
                >
                  {item.icon}
                </div>

                <div className="account-text">
                  <div
                    className="account-title"
                    style={

                      activeSection==item.section && item.titleColor
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
      </div>
    </aside>
  );
};

export default memo(ProfileSidebar);
