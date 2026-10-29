import React from "react";
//used on Home sidebar

import {
  featureLabel,
  formatPlanName,
  formatPrice,
  pickTopFeatures,
} from "@/lib/planUtils";
import { useRouter } from "next/navigation";
import { Plan } from "@/app/context/AccountSettingsContext";
import { PlanCardProps } from "./PremiumPlusCard";
import { rw, rh } from "../shared/railScale";

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" style={{ width: rw(10), height: rw(10) }}>
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
  <svg viewBox="0 0 48 48" fill="none" style={{ width: rw(24), height: rw(24) }}>
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

export default function VipExclusiveCard({
  plan,
  width = "84.459cqw",
  onSelect,
  busy = false,
  className = "",
}: PlanCardProps) {
  const features = pickTopFeatures(plan, 5);
  const name = formatPlanName(plan.name);
  const hasDiscount = plan.originalPrice > plan.price;
  const router = useRouter()
function handlePlanCardClick(plan: Plan) {
  router.push(`/app/home/plans/${plan.id}`)
}
  return (
    <div
      className={className}
      style={{
        minWidth: width,
        maxWidth: width,
        background: "#ffffff",
        borderRadius: rw(16),
        padding: `${rh(16)} ${rw(16)}`,
        boxSizing: "border-box",
        border: "1px solid #f2e2c0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
        flexShrink: 0,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: rw(10) }}>
        <div
          style={{
            width: rw(40),
            height: rw(40),
            borderRadius: rw(10),
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
          <div style={{ display: "flex", alignItems: "center", gap: rw(6) }}>
            <span style={{ color: "#1a1a1a", fontSize: rw(14), fontWeight: 700 }}>
              {name}
            </span>
            {plan.badgeLabel && (
              <span
                style={{
                  background: "#c1892f",
                  color: "#ffffff",
                  fontSize: rw(8),
                  fontWeight: 700,
                  padding: `${rh(2)} ${rw(6)}`,
                  borderRadius: rw(4),
                }}
              >
                {plan.badgeLabel}
              </span>
            )}
          </div>
          <div style={{ marginTop: rh(2) }}>
            <span style={{ color: "#1a1a1a", fontSize: rw(14), fontWeight: 700 }}>
              {formatPrice(plan.price)}
            </span>
            {hasDiscount && (
              <span
                style={{
                  color: "#9a9a9a",
                  fontSize: rw(10),
                  marginLeft: rw(4),
                  textDecoration: "line-through",
                }}
              >
                {formatPrice(plan.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ marginTop: rh(14), display: "flex", flexDirection: "column", gap: rw(8) }}>
        {features.map((feature) => (
          <div key={feature.title} style={{ display: "flex", alignItems: "center", gap: rw(8) }}>
            <div
              style={{
                width: rw(18),
                height: rw(18),
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
            <span style={{ color: "#1a1a1a", fontSize: rw(11), fontWeight: 400, lineHeight: 1.3 }}>
              {featureLabel(feature)}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        type="button"
        onClick={() => handlePlanCardClick(plan)}
        disabled={busy}
        style={{
          width: "100%",
          marginTop: rh(14),
          padding: `${rh(10)} ${rw(10)}`,
          background: "#c1892f",
          border: "none",
          borderRadius: rw(10),
          color: "#ffffff",
          fontSize: rw(12),
          fontWeight: 700,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        Get {name} →
      </button>
    </div>
  );
}