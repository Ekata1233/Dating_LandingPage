import React, { useMemo } from "react";

import { MOCK_BALANCES, MOCK_DATE_PLANS_SUMMARY } from "../shared/mockData";
import type { BalanceItem, DatePlansSummary } from "../shared/types";
import { UserBalances, useUserProfileData } from "@/app/context/UserProfileDataContext";

export interface BalanceItemProps {
  label: string;
  value: string;
  bg: string;
  emoji: string;
}

export interface MyBalancesProps {
  /** Coin / currency balances. Defaults to the seeded values. */
  items?: BalanceItem[];
  /** Summary row for the remaining Date Plans quota. */
  datePlan?: DatePlansSummary;
  /** Called with the tapped balance's label, e.g. "Roses". */
  onAdd?: (label: string) => void;
  /** Called when the Date Plans row is tapped. */
  onDatePlanClick?: () => void;
  className?: string;
}
export interface BalanceCard {
  label: string;
  value: string;
  bg: string;
  emoji: string;
}
export const toBalanceCards = (b: UserBalances | null): BalanceCard[] => [
  { label: "Roses",       value: String(b?.roses.balance ?? 0),       bg: "#fdeecb", emoji: "⭐" },
  { label: "Compliments", value: String(b?.compliments.balance ?? 0), bg: "#fbe1e6", emoji: "💌" },
  { label: "My Boosts",   value: String(b?.boosts.balance ?? 0),      bg: "#dcebfa", emoji: "🚀" },
  { label: "My Wallet",   value: b?.wallet.formattedBalance ?? "₹0",  bg: "#fbdce8", emoji: "👛" },
];

export default function MyBalances({
  datePlan = MOCK_DATE_PLANS_SUMMARY,
  onAdd,
  onDatePlanClick,
  className = "",
}: MyBalancesProps) {
  const { balances } = useUserProfileData();
  const cards = useMemo(() => toBalanceCards(balances), [balances]); return (
    <div
      className={className}
      style={{
        padding: "12px 14px",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          color: "#6b6b6b",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "1.5px",
          marginBottom: "10px",
        }}
      >
        MY BALANCES
      </div>

      <div
        className="cursor-pointer"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px",
        }}
      >
        {cards?.map((item) => (
          <div
            key={item.label}
            role={onAdd ? "button" : undefined}
            tabIndex={onAdd ? 0 : undefined}
            onClick={() => onAdd?.(item.label)}
            onKeyDown={
              onAdd
                ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onAdd(item.label);
                  }
                }
                : undefined
            }
            style={{
              position: "relative",
              background: "#ffffff",
              border: "1px solid #ececec",
              borderRadius: "12px",
              padding: "12px 8px 10px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              textAlign: "center",
              boxSizing: "border-box",
              cursor: onAdd ? "pointer" : "default",
            }}
          >
            {/* Plus badge */}
            <div
              style={{
                position: "absolute",
                top: "-6px",
                right: "-6px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#d94f70",
                color: "#ffffff",
                fontSize: "10px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(217,79,112,0.4)",
              }}
            >
              +
            </div>

            {/* Icon circle */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: item.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px",
                fontSize: "16px",
                lineHeight: 1,
              }}
            >
              {item.emoji}
            </div>

            {/* Value */}
            <div
              style={{
                color: "#1a1a1a",
                fontSize: "14px",
                fontWeight: 700,
                marginBottom: "2px",
              }}
            >
              {item.value}
            </div>

            {/* Label */}
            <div style={{ color: "#8a8a8a", fontSize: "9px", fontWeight: 400 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
      {/* Date Plans */}
      <div className='h-20 mt-5'>

        <div className={`dp-card${onDatePlanClick ? " cursor-pointer" : ""}`} onClick={onDatePlanClick}>
          <style>{`
        .dp-card {
          container-type: inline-size;
          width: 100%;
          height: 100%;
        }
        .dp-inner {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 3cqw;
          padding: 3cqw 4cqw;
          border-radius: 6cqw;
          background: #ffffff;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.06);
          cursor: pointer;
          font-family: inherit;
        }
        .dp-icon-wrap {
          flex-shrink: 0;
          width: 15cqw;
          height: 15cqw;
          min-width: 32px;
          min-height: 32px;
          border-radius: 50%;
          background: #fdecd2;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dp-icon {
          width: 55%;
          height: 55%;
        }
        .dp-text {
          flex: 1 1 auto;
          min-width: 0;
        }
        .dp-title {
          font-size: 5.2cqw;
          font-weight: 700;
          color: #16181b;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dp-subtitle {
          margin-top: 0.8cqw;
          font-size: 3.4cqw;
          color: #8a8f98;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dp-count-wrap {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
        }
        .dp-count {
          font-size: 7.5cqw;
          font-weight: 800;
          color: #f2a134;
          line-height: 1;
        }
        .dp-count-sub {
          margin-top: 0.6cqw;
          display: flex;
          align-items: center;
          gap: 0.8cqw;
          font-size: 3.4cqw;
          color: #9aa0a8;
        }
        .dp-chevron {
          width: 2.6cqw;
          height: 2.6cqw;
          min-width: 8px;
          min-height: 8px;
        }
      `}</style>

          <div className="dp-inner">
            {/* Icon */}
            <div className="dp-icon-wrap">
              <svg
                className="dp-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="5" y="4" width="14" height="17" rx="2" fill="#ffffff" stroke="#b5773a" strokeWidth="1.4" />
                <rect x="8.5" y="2.5" width="7" height="3.5" rx="1" fill="#4a9fd8" stroke="#b5773a" strokeWidth="1.2" />
                <line x1="7.5" y1="10" x2="16.5" y2="10" stroke="#c7cbd1" strokeWidth="1" />
                <line x1="7.5" y1="12.5" x2="16.5" y2="12.5" stroke="#c7cbd1" strokeWidth="1" />
                <line x1="7.5" y1="15" x2="16.5" y2="15" stroke="#c7cbd1" strokeWidth="1" />
                <line x1="7.5" y1="17.5" x2="13" y2="17.5" stroke="#c7cbd1" strokeWidth="1" />
              </svg>
            </div>

            {/* Title + subtitle */}
            <div className="dp-text">
              <div className="dp-title">{datePlan.title}</div>
              <div className="dp-subtitle">{datePlan.subtitle}</div>
            </div>

            {/* Count + label */}
            <div className="dp-count-wrap">
              <div className="dp-count">{balances?.datePlans.balance}</div>
              <div className="dp-count-sub">
                {datePlan.countLabel}
                <svg
                  className="dp-chevron"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 6l6 6-6 6"
                    stroke="#9aa0a8"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
