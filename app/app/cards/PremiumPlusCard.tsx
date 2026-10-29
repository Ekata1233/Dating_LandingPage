import React from "react";
//used on Home sidebar
import type { Plan } from "@/app/context/AccountSettingsContext";
import {
  featureLabel,
  formatPlanName,
  formatPrice,
  pickTopFeatures,
} from "@/lib/planUtils";
import { useActiveSection } from "@/app/context/ActiveSectionContext";
import { useRouter } from "next/navigation";
import { rw, rh } from "../shared/railScale";
export interface PlanCardProps {
  /** Plan from the API. */
  plan: Plan;
  /** Card width. Pass "100%" to stack the card in a mobile sheet. */
  width?: string;
  /** Called with the plan slug when the CTA is pressed. */
  onSelect?: (planSlug: Plan["slug"]) => void;
  /** Shows a busy state and disables the CTA. */
  busy?: boolean;
  className?: string;
}

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

const FlameIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" style={{ width: rw(22), height: rw(22) }}>
    <defs>
      <linearGradient id="flameGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffcc33" />
        <stop offset="55%" stopColor="#ff7a1a" />
        <stop offset="100%" stopColor="#e8401f" />
      </linearGradient>
    </defs>
    <path
      d="M24 6C24 6 15 14 15 24.5C15 31.5 19.5 36 24 36C28.5 36 33 31.5 33 24.5C33 21 31.5 18 30 16C30 20 28 22 26.5 22C28 18 27 12 24 6Z"
      fill="url(#flameGrad)"
    />
    <path
      d="M22.5 22C21 25 21 28 23 30.5C24.5 32.3 27 32 27.5 29.5C28 27 26.5 25.5 25.5 24C25 26 23.5 23 22.5 22Z"
      fill="#ffe08a"
    />
  </svg>
);


export default function PremiumPlusCard({
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
        border: "1px solid #f7d6de",
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
            background: "#fce4ea",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FlameIcon />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: rw(6) }}>
            <span style={{ color: "#1a1a1a", fontSize: rw(14), fontWeight: 700 }}>
              {name}
            </span>
            {plan.badgeLabel && (
              <span
                style={{
                  background: "#d94f70",
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
                background: "#d94f70",
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
          background: "#d94f70",
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