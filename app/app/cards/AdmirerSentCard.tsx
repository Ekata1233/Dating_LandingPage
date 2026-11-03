"use client";
//It is used on the Sent tab of admirer section

import { useUserProfileData } from "@/app/context/UserProfileDataContext";
import React from "react";
import { toast } from "sonner";

type Step = "sent" | "seen" | "matched";

export interface AdmirerSentCardProps {
  id: string;
  /** Matched person's photo URL */
  avatarUrl: string;
  /** Matched person's name */
  name: string;
  /** Matched person's age */
  age: number;
  /** Match percentage, e.g. 95 */
  matchPercent: number;
  /** Location label, e.g. "Mumbai" */
  location: string;
  /** Relative time since match, e.g. "3h ago" */
  matchedAgo: string;
  gender: string;
  /** Current status step. Superseded by `likeStatus` when that is given. */
  status?: Step;
  /**
   * Per-step completion straight from the API. When set, each pill colours
   * from its own flag, and the card theme/label follow the furthest
   * completed step.
   */
  likeStatus?: { sent: boolean; seen: boolean; matched: boolean };
  /** Called after a rose is sent successfully */
  onSendRose?: () => void;
  /** Called when the card body is tapped */
  onOpenProfile?: () => void;
  /** Optional extra className for the outer wrapper */
  className?: string;
}

const STEPS: Step[] = ["sent", "seen", "matched"];

const STATUS_LABEL: Record<Step, string> = {
  sent: "Sent",
  seen: "Seen",
  matched: "Matched",
};

/**
 * "her" / "him" from the admirer's gender. Female is checked first because
 * "female" contains the substring "male".
 */
function likedPronoun(gender?: string): "her" | "him" | "them" {
  const g = (gender ?? "").toLowerCase();
  if (g.includes("female") || g.includes("woman") || g === "f") return "her";
  if (g.includes("male") || g.includes("man") || g === "m") return "him";
  return "them";
}

/**
 * Summary card for an admirer you've sent a like to. Fills 100% of its
 * parent's width/height; everything inside scales with the parent's width
 * using CSS container queries (cqw units).
 */
const AdmirerSentCard: React.FC<AdmirerSentCardProps> = ({
  id,
  avatarUrl,
  name,
  age,
  matchPercent,
  location,
  matchedAgo,
  gender,
  status = "matched",
  likeStatus,
  onSendRose,
  onOpenProfile,
  className = "",
}) => {
  const { sendRose, refetchAdmirersSent } = useUserProfileData();

  // Single source of truth for theme + label. API flags win over `status`.
  const currentStatus: Step = likeStatus
    ? likeStatus.matched
      ? "matched"
      : likeStatus.seen
        ? "seen"
        : "sent"
    : status;

  const stepIndex = STEPS.indexOf(currentStatus);

  async function handleSendRose(userId: string) {
    const response = await sendRose(userId);
    if (response?.success) {
      toast.success(response.message);
      await refetchAdmirersSent();
      onSendRose?.();
    } else {
      toast.error(response?.message || "Couldn't send rose");
    }
  }

  return (
    <div
      className={`admirer-card admirer-card--${currentStatus} ${className}`}
      role={onOpenProfile ? "button" : undefined}
      tabIndex={onOpenProfile ? 0 : undefined}
      onClick={onOpenProfile}
      onKeyDown={
        onOpenProfile
          ? (e) => {
              // Ignore key presses that come from the inner "Send a rose" button
              if (e.target !== e.currentTarget) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenProfile();
              }
            }
          : undefined
      }
      style={onOpenProfile ? { cursor: "pointer" } : undefined}
    >
      <style>{`
        .admirer-card {
          container-type: inline-size;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
        }

        /* Per-status theme: only the variables change */
        .admirer-card--sent {
          --card-bg: linear-gradient(135deg, #f5e9d6 0%, #ffffff 55%);
          --status-color: #9c7a2e;
          --dot-color: #d4a73a;
        }
        .admirer-card--seen {
          --card-bg: linear-gradient(135deg, #dbeafe 0%, #ffffff 55%);
          --status-color: #2563eb;
          --dot-color: #3b82f6;
        }
        .admirer-card--matched {
          --card-bg: linear-gradient(135deg, #eafaf1 0%, #ffffff 55%, #fdeef3 100%);
          --status-color: #16532c;
          --dot-color: #22c55e;
        }

        .admirer-card .mc-inner {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          border-radius: 7cqw;
          background: var(--card-bg);
          border: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4.5cqw 5.5cqw;
          font-family: inherit;
          overflow: hidden;
        }
        .mc-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .mc-status {
          display: flex;
          align-items: center;
          gap: 1.6cqw;
          font-size: 4.2cqw;
          font-weight: 600;
          color: var(--status-color);
        }
        .mc-dot {
          width: 2cqw;
          height: 2cqw;
          min-width: 6px;
          min-height: 6px;
          border-radius: 50%;
          background: var(--dot-color);
        }
        .mc-ago {
          font-size: 3.4cqw;
          color: #8a8f98;
        }
        .mc-middle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3cqw;
        }
        .mc-person {
          display: flex;
          align-items: center;
          gap: 3.5cqw;
          min-width: 0;
        }
        .mc-avatar {
          width: 10cqw;
          height: 10cqw;
          min-width: 30px;
          min-height: 30px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          box-shadow: 0 0 0 2px #fff, 0 2px 6px rgba(0,0,0,0.12);
        }
        .mc-name {
          font-size: 5.4cqw;
          font-weight: 700;
          color: #1a1d21;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mc-sub {
          font-size: 3.6cqw;
          color: #7c828a;
          margin-top: 0.5cqw;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mc-liked {
          display: flex;
          align-items: center;
          gap: 1.2cqw;
          background: #ffe3ec;
          color: #e11d67;
          font-weight: 600;
          font-size: 2.8cqw;
          padding: 1.6cqw 3cqw;
          border-radius: 999px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mc-step-sent.active { background: #f5e9d6; color: #9c7a2e; }
        .mc-step-seen.active { background: #dbeafe; color: #2563eb; }
        .mc-step-matched.active { background: #dcfce7; color: #16a34a; }
        .mc-step-line {
          width: 3cqw;
          height: 1px;
          background: #d5d8dd;
          min-width: 6px;
        }
        .mc-rose-btn {
          display: flex;
          align-items: center;
          gap: 1.6cqw;
          background: linear-gradient(90deg, #f5487f, #ff6f8e);
          color: #fff;
          font-weight: 700;
          font-size: 3.6cqw;
          padding: 2.2cqw 4.5cqw;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .mc-rose-btn:active {
          transform: scale(0.97);
        }
      `}</style>

      <div className="mc-inner">
        {/* Top row */}
        <div className="mc-top">
          <div className="mc-status">
            <span className="mc-dot" />
            {STATUS_LABEL[currentStatus]}
          </div>
          <div className="mc-ago">{matchedAgo}</div>
        </div>

        {/* Middle row */}
        <div className="mc-middle">
          <div className="mc-person">
            <img className="mc-avatar" src={avatarUrl} alt={`${name}'s photo`} />
            <div style={{ minWidth: 0 }}>
              <div className="mc-name">
                {name}, {age}
              </div>
              <div className="mc-sub">
                {matchPercent}% Match · {location}
              </div>
            </div>
          </div>
          <div className="mc-liked">♥ You liked {likedPronoun(gender)}</div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-row justify-between w-full gap-1.5">
          <div className="flex gap-0.5 items-center text-[6px]">
            {STEPS.map((step, i) => {
              const active = likeStatus ? !!likeStatus[step] : i <= stepIndex;

              return (
                <React.Fragment key={step}>
                  {i > 0 && (
                    <span
                      className={`mc-step-line ${active ? "" : "opacity-40 grayscale"}`}
                    />
                  )}
                  <span
                    className={`rounded-full px-2 py-0.5 transition-colors ${
                      active
                        ? `mc-step-${step} active`
                        : "bg-gray-200 text-gray-400 grayscale"
                    }`}
                  >
                    {step.toUpperCase()}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          <div>
            <button
              type="button"
              className="mc-rose-btn hover:scale-105"
              onClick={(e) => {
                e.stopPropagation(); // don't trigger onOpenProfile
                handleSendRose(id);
              }}
            >
              🌹 Send a rose
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmirerSentCard;
