import { useState } from "react";

export interface EventCardProps {
  /** Banner image url */
  image?: string;
  /** e.g. "Sat, 26 Sep" */
  date?: string;
  /** e.g. "07:00 PM" */
  startTime?: string;
  endTime?: string;
  /** e.g. 1 -> "+ 1 More" */
  title?: string;
  venue?: string;
  interested?: number;
  /** shown instead of "Free" when isFree is false */
  price?: string;
  onClick?: () => void;
  /** initial saved/star state */
  saved?: boolean;
}

export default function EventCard({
  image = "https://placehold.co/400x220?text=Event+Banner",
  date = "Sat, 26 Sep",
  startTime = "07:00 PM",
  endTime = "07:00 PM",
  title = "Event Title Goes Here",
  venue = "Venue name, City",
  interested = 0,
  price = "",
  onClick,
  saved = false,
}: EventCardProps) {
  const [isSaved, setIsSaved] = useState<boolean>(saved);

  return (
    <div
    className="cursor-pointer hover:scale-[1.02] transition-all duration-300 "
      onClick={onClick}
      style={{
        width: 240,
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        userSelect: "none",
      }}
    >
      {/* ---- Banner image with save/star button ---- */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 10",
          borderRadius: 16,
          overflow: "hidden",
          background: "#eee",
        }}
      >
        <img
          src={image}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }} className="rounded-md"
        />


      </div>

      {/* ---- Date / time row ---- */}
      <div
        style={{
          marginTop: 14,
          fontSize: 13.5,
          fontWeight: 600,
          color: "#3a3a3a",
        }}
      >
        {date} &bull; {startTime} {"-"} {endTime}
      </div>

      {/* ---- Title ---- */}
      <div
        style={{
          marginTop: 4,
          fontSize: 19,
          fontWeight: 700,
          color: "#161616",
          lineHeight: 1.3,
        //   whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </div>

      {/* ---- Venue ---- */}
      <div
        style={{
          marginTop: 2,
          fontSize: 14,
          color: "#7a7a7a",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {venue}
      </div>

      {/* ---- Interested + price row ---- */}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13.5,
          color: "#3a3a3a",
        }}
      >
        {/* <span style={{ fontWeight: 600 }}>{interested}+ Interested</span>
        <span style={{ color: "#c8c8c8" }}>|</span> */}
        {/* <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3a3a3a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z" />
            <path d="M13 5v14" strokeDasharray="2 2" />
          </svg>
          <span style={{ fontWeight: 600 }}>{Number(price) < 0 ? "Free" : price}</span>
        </span> */}
      </div>
    </div>
  );
}
