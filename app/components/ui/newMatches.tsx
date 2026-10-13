"use client"
import { useConversations } from "@/app/context/ChatContext";
import React from "react";

export interface NewMatch {
  id: string;
  name: string;
  photo: string;
  hasGift?: boolean;
}

interface NewMatchesProps {
  matches: NewMatch[];
  onSelect?: (id: string) => void;
}

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#2F9BE6" aria-hidden="true">
    <path d="M12 7V4.5C12 3.1 10.9 2 9.5 2S7 3.1 7 4.5 8.1 7 9.5 7H12zm0 0h2.5C15.9 7 17 5.9 17 4.5S15.9 2 14.5 2 12 3.1 12 4.5V7z" />
    <rect x="3" y="7" width="18" height="4" rx="1" />
    <rect x="4.5" y="12" width="15" height="9" rx="1" />
  </svg>
);

const NewMatches: React.FC<NewMatchesProps> = ({ matches, onSelect }) => {
  const { selectConversation } = useConversations();

  if (matches.length === 0) return null;

  return (
    <div className="px-4 py-2">
      <h2 className="mb-2 text-base font-bold text-gray-900">New Matches</h2>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {matches.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() =>
              onSelect ? onSelect(m.id) : selectConversation(m.id)
            }
            className="w-16 shrink-0 text-left cursor-pointer"
          >
            {/* Gradient ring */}
            <div className="relative rounded-[22px] bg-gradient-to-b from-pink-400 to-orange-400 p-[2px]">
              <div className="rounded-[20px] bg-white p-[2px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.photo}
                  alt={m.name}
                  className="h-20 w-full rounded-[18px] bg-gray-200 object-cover"
                />
              </div>

              {/* Gift badge */}
              {m.hasGift && (
                <span className="absolute -right-1 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-amber-500">
                  <GiftIcon />
                </span>
              )}
            </div>

            <p className="mt-1.5 truncate text-xs font-semibold text-gray-800">
              {m.name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewMatches;