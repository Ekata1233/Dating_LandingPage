import React from "react";

export interface AdmirerSentCardProps {
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
    /** Current status step */
    status?: "sent" | "seen" | "matched";
    /** Called when "Send a rose" is tapped */
    onSendRose?: () => void;
    /** Optional extra className for the outer wrapper */
    className?: string;
}

/**
 * A "Matched" summary card. Fills 100% of its parent's width/height,
 * and every internal element (text, avatar, pills, button) scales
 * fluidly with the parent's size using CSS container queries —
 * just resize the parent, no props needed to control scale.
 */
const AdmirerSentCard: React.FC<AdmirerSentCardProps> = ({
    avatarUrl,
    name,
    age,
    matchPercent,
    location,
    matchedAgo,
    status = "matched",
    onSendRose,
    className = "",
}) => {
    const steps: Array<"sent" | "seen" | "matched"> = ["sent", "seen", "matched"];
    const stepIndex = steps.indexOf(status);

    return (
        <div className={` matched-card ${className}`}>
            <style>{`
        .matched-card {
          container-type: inline-size;
          width: 100%;
          height: 100%;
          min-width: 0;
          min-height: 0;
        }
        .matched-card .mc-inner {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          border-radius: 7cqw;
          background: linear-gradient(135deg, #eafaf1 0%, #ffffff 55%, #fdeef3 100%);
          border: 1px solid rgba(0,0,0,0.06);
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
          color: #16532c;
        }
        .mc-dot {
          width: 2cqw;
          height: 2cqw;
          min-width: 6px;
          min-height: 6px;
          border-radius: 50%;
          background: #22c55e;
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
          width: 16cqw;
          height: 16cqw;
          min-width: 40px;
          min-height: 40px;
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
        .mc-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 3cqw;
        }
        .mc-steps {
          display: flex;
          align-items: center;
          gap: 1.6cqw;
        }
        .mc-step {
          font-size: 3cqw;
          font-weight: 700;
          letter-spacing: 0.03em;
          padding: 1.8cqw 3cqw;
          border-radius: 999px;
          white-space: nowrap;
          opacity: 0.45;
        }
        .mc-step.active {
          opacity: 1;
        }
        .mc-step-sent { background: #f5e9d6; color: #9c7a2e; }
        .mc-step-seen { background: #dbeafe; color: #2563eb; }
        .mc-step-matched { background: #dcfce7; color: #16a34a; }
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
                        Matched
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
                    <div className="mc-liked">♥ You liked her</div>
                </div>

                {/* Bottom row */}
                <div className="flex flex-row justify-between  w-full">
                    <div className=" w-1/2 flex gap-0.5 items-center text-[7px]">
                        {steps.map((step, i) => (
                            <React.Fragment key={step}>
                                {i > 0 && <span className="mc-step-line" />}
                                <span
                                    className={` rounded-full px-2 py-0.5 mc-step-${step} ${i <= stepIndex ? "active" : ""}`}
                                >
                                    {step.toUpperCase()}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="">
                        <button type="button" className="mc-rose-btn " onClick={onSendRose}>
                            🌹 Send a rose
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdmirerSentCard;

/*
Usage example:

<div style={{ width: 480, height: 220 }}>
  <AdmirerSentCard
    avatarUrl="/path/to/photo.jpg"
    name="Elena"
    age={23}
    matchPercent={95}
    location="Mumbai"
    matchedAgo="3h ago"
    status="matched"
    onSendRose={() => console.log("rose sent")}
  />
</div>

The outer wrapper fills 100% of its parent's width and height. All
internal text, avatar, pills and the button scale fluidly with the
parent's width using CSS container queries (cqw units) — so the same
component looks right whether it's 200px or 1000px wide, with no
extra props needed. Requires a browser with container query support
(all modern evergreen browsers).
*/
