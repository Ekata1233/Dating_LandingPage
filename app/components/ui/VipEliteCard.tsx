import React from "react";

import { MOCK_PLANS } from "./main/shared/mockData";
import type { PlanCardProps } from "./PremiumPlusCard";

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17L4 12"
      stroke="#1a1a1a"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarBadge = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5d590" />
        <stop offset="100%" stopColor="#c88a1e" />
      </linearGradient>
      <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffd15c" />
        <stop offset="100%" stopColor="#e8a317" />
      </linearGradient>
    </defs>
    <ellipse
      cx="24"
      cy="24"
      rx="19"
      ry="7"
      stroke="url(#ringGrad)"
      strokeWidth="2.5"
      fill="none"
      transform="rotate(-20 24 24)"
    />
    <path
      d="M22 10 L25 18 L33.5 18.5 L27 24 L29 32.5 L22 27.5 L15 32.5 L17 24 L10.5 18.5 L19 18 Z"
      fill="url(#starGrad)"
    />
  </svg>
);

const DEFAULT_PLAN = MOCK_PLANS.find((p) => p.id === "vip-elite")!;

export default function VipEliteCard({
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
        background: "#1c1c1c",
        borderRadius: "16px",
        padding: "16px",
        boxSizing: "border-box",
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
            background: "#2b2b2b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <StarBadge />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 700,
              }}
                >
                  {plan.name}
                </span>
                {plan.badge && (
                <span
                  style={{
                    background: "#e0b168",
                    color: "#1a1a1a",
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
                <span style={{ color: "#e0b168", fontSize: "14px", fontWeight: 700 }}>
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
                background: "#e0b168",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon />
            </div>
            <span style={{ color: "#f0f0f0", fontSize: "11px", fontWeight: 400, lineHeight: 1.3 }}>
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
          background: "#e0b168",
          border: "none",
          borderRadius: "10px",
          color: "#1a1a1a",
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
