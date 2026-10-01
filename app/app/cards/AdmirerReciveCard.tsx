import React, { useState } from "react";
import { CirclePoundSterling } from "lucide-react";
export interface AdmirerReciveCardProps {
  /** URL or imported path of the profile photo */
  imageUrl: string;
  /** Person's display name */
  name: string;
  /** Person's age */
  age: number;
  /** Match percentage, e.g. 75 */
  matchPercent: number;
  /** Distance label, e.g. "8 km" */
  distance: string;
  /** Called when the X (reject) button is tapped */
  revealed : boolean;
  onReject?: () => void;
  /** Called when the heart (like) button is tapped */
  onLike?: () => void;
  /** Called when the pay-to-reveal button is tapped (unrevealed cards only) */
  onReveal?: () => void;
  /** Coin cost shown on the reveal button. Defaults to 50. */
  revealCost?: number;
  /** Called when the card body is tapped */
  onOpenProfile?: () => void;
  /** Optional extra className for the outer wrapper */
  className?: string;
}
const AdmirerReciveCard: React.FC<AdmirerReciveCardProps> = ({
  imageUrl,
  name,
  age,
  matchPercent,
  distance,
  revealed,
  onReject,
  onLike,
  onReveal,
  revealCost = 50,
  onOpenProfile,
  className = "",
}) => {
  const [isRevealed, setIsRevealed] = useState(revealed)

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed(true);
    onReveal?.();
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReject?.();
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.();
  };


  return (
    <div
      className={`relative cursor-pointer w-full h-70 md:h-50 min-h-0 min-w-0 rounded-[20px] overflow-hidden shadow-xl select-none ${className}`}
      role={onOpenProfile ? "button" : undefined}
      tabIndex={onOpenProfile ? 0 : undefined}
      onClick={onOpenProfile}
      onKeyDown={
        onOpenProfile
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenProfile();
              }
            }
          : undefined
      }
    >
      {/* Photo */}
      <img
        src={imageUrl}
        alt={`${name}'s profile photo`}
        className={`absolute inset-0 w-full h-full object-cover ${isRevealed ? "" :"blur-2xl" }`}
        draggable={false}
      />

      {/* Bottom gradient for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

      {/* Reject (X) button */}
      <button
        type="button"
        onClick={handleReject}
        aria-label="Reject"
        className={`absolute top-2.5 cursor-pointer right-2.5 flex items-center justify-center w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm text-white text-xl leading-none hover:bg-black/55 active:scale-95 transition ${isRevealed ? "" :"hidden" }`}
      >
        ×
      </button>
      {/* Reaveal + lock */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 ${isRevealed ? "hidden" : ""}`}>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900/70 backdrop-blur-sm text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <rect x="4" y="11" width="16" height="9" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        <button
          type="button"
          onClick={handleReveal}
          aria-label={`Reveal for ${revealCost} coins`}
          className="flex items-center cursor-pointer gap-2 px-3 py-1 rounded-full bg-amber-400 text-amber-800 font-semibold text-sm sm:text-base shadow-md  active:scale-95 transition"
        >
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 border border-amber-700/40 shadow-inner">
            <CirclePoundSterling className="w-3 h-3 text-amber-800" />
          </span>

          <span className="text-[10px]">{revealCost}</span>
        </button>
      </div>
      {/* Name / match / distance */}
      <div className="absolute w-full left-3.5 bottom-4 right-16 text-white">
        <div className={`text-base text-[14px] font-semibold leading-tight truncate ${isRevealed ? "" :"blur-2xl" }`}>
          {name}, {age}
        </div>
        <div className="mt-1 text-[8px] text-white/90 truncate ">
          {matchPercent}% Match · {distance}
        </div>
      </div>

      {/* Like (heart) button – only once the profile has been revealed */}
      <button
        type="button"
        onClick={handleLike}
        aria-label="Like"
        className={`absolute right-3 bottom-3 cursor-pointer flex items-center justify-center w-8 h-8 md:w-6 md:h-6 rounded-full bg-pink-500 text-white shadow-lg hover:bg-pink-600 active:scale-95 transition ${isRevealed ? "" : "hidden"}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="md:w-4 md:h-4 w-5 h-5"
        >
          <path d="M12 21s-6.716-4.35-9.428-8.06C.86 10.42 1.02 6.9 3.6 5.06c2.2-1.57 4.98-1.02 6.4.98L12 8l2-1.96c1.42-2 4.2-2.55 6.4-.98 2.58 1.84 2.74 5.36 1.03 7.88C18.716 16.65 12 21 12 21z" />
        </svg>
      </button>
    </div>
  );
};

export default AdmirerReciveCard;