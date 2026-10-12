import React from "react";

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
      stroke="#1a1a1a"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StarBadge = () => (
  <svg viewBox="0 0 48 48" fill="none" style={{ width: rw(22), height: rw(22) }}>
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

export default function VipEliteCard({
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
        background: "#1c1c1c",
        borderRadius: rw(16),
        padding: `${rh(16)} ${rw(16)}`,
        boxSizing: "border-box",
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
          <div style={{ display: "flex", alignItems: "center", gap: rw(6) }}>
            <span style={{ color: "#ffffff", fontSize: rw(14), fontWeight: 700 }}>
              {name}
            </span>
            {plan.badgeLabel && (
              <span
                style={{
                  background: "#e0b168",
                  color: "#1a1a1a",
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
            <span style={{ color: "#e0b168", fontSize: rw(14), fontWeight: 700 }}>
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
                background: "#e0b168",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckIcon />
            </div>
            <span style={{ color: "#f0f0f0", fontSize: rw(11), fontWeight: 400, lineHeight: 1.3 }}>
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
          background: "#e0b168",
          border: "none",
          borderRadius: rw(10),
          color: "#1a1a1a",
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