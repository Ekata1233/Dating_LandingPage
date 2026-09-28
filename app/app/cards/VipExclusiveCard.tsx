import React from "react";

import { MOCK_PLANS } from "./main/shared/mockData";
import type { PlanCardProps } from "./PremiumPlusCard";

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17L4 12"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrownIcon = () => (
  <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="crownGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffd15c" />
        <stop offset="100%" stopColor="#d99a1e" />
      </linearGradient>
    </defs>
    <path
      d="M9 20L14 34H34L39 20L30 26L24 15L18 26L9 20Z"
      fill="url(#crownGrad)"
      stroke="#b9780f"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <rect x="13" y="34" width="22" height="5" rx="1.5" fill="url(#crownGrad)" stroke="#b9780f" strokeWidth="1" />
    <circle cx="24" cy="21" r="2.4" fill="#3fae5c" />
    <circle cx="15.5" cy="24" r="2" fill="#d9445c" />
    <circle cx="32.5" cy="24" r="2" fill="#d9445c" />
  </svg>
);

const DEFAULT_PLAN = MOCK_PLANS.find((p) => p.id === "vip")!;

export default function VipExclusiveCard({
  plan = DEFAULT_PLAN,
  width = "250px",
  onSelect,
  busy = false,
  className = "",
}: PlanCardProps) {
  return (
    <div
      className={className}
      style={{
        minWidth: width,
        maxWidth: width,
        background: "#ffffff",
        borderRadius: "16px",
        padding: "16px",
        boxSizing: "border-box",
        border: "1px solid #f2e2c0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        flexShrink: 0,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#fdf0dc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CrownIcon />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                color: "#1a1a1a",
                fontSize: "14px",
                fontWeight: 700,
              }}
                >
                  {plan.name}
                </span>
                {plan.badge && (
                <span
                  style={{
                    background: "#c1892f",
                    color: "#ffffff",
                    fontSize: "8px",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {plan.badge}
                </span>
                )}
              </div>
              <div style={{ marginTop: "2px" }}>
                <span style={{ color: "#1a1a1a", fontSize: "14px", fontWeight: 700 }}>
                  {plan.price}
                </span>
                <span style={{ color: "#9a9a9a", fontSize: "10px", marginLeft: "3px" }}>
                  {plan.period}
                </span>
              </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {plan.features.map((feature) => (
          <div key={feature} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#c1892f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon />
            </div>
            <span style={{ color: "#1a1a1a", fontSize: "11px", fontWeight: 400, lineHeight: 1.3 }}>
              {feature}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => onSelect?.(plan.id)}
        disabled={busy}
        style={{
          width: "100%",
          marginTop: "14px",
          padding: "10px",
          background: "#c1892f",
          border: "none",
          borderRadius: "10px",
          color: "#ffffff",
          fontSize: "12px",
          fontWeight: 700,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {plan.cta} →
      </button>
    </div>
  );
}
