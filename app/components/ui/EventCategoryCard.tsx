import { useState } from "react";
import {
  Sparkles,
  UserPlus,
  PartyPopper,
  Palette,
  Volleyball,
  TreePine,
} from "lucide-react";

// Single source of truth: add/remove/reorder entries here and the
// tab list updates automatically. Each entry only needs an icon + label.
const FILTERS = [
  { key: "all", label: "All events", icon: Sparkles },
  { key: "new-groups", label: "New Groups", icon: UserPlus },
  { key: "social", label: "Social Activities", icon: PartyPopper },
  { key: "hobbies", label: "Hobbies & Passions", icon: Palette },
  { key: "sports", label: "Sports & Fitness", icon: Volleyball },
  { key: "travel", label: "Travel & Outdoor", icon: TreePine },
];

/**
 * FilterCard - a single reusable tab.
 * Purely presentational: takes an icon component, label text, active
 * state, and a click handler. Reuse this anywhere you need one tab.
 */
function FilterCard({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-2 pb-3 px-1 border-b-2 transition-colors ${
        active
          ? "border-gray-900 text-gray-900"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }`}
    >
      <Icon
        size={22}
        strokeWidth={1.75}
        className={active ? "text-gray-900" : "text-gray-500"}
      />
      <span className={`text-sm ${active ? "font-semibold" : "font-normal"}`}>
        {label}
      </span>
    </button>
  );
}

/**
 * EventFilterTabs - renders the full row by mapping over FILTERS.
 * To reuse elsewhere: pass a different `filters` array with the
 * same { key, label, icon } shape.
 */
export default function EventCategoryCard({ filters = FILTERS }) {
  const [activeKey, setActiveKey] = useState(filters[0]?.key);

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="flex items-start gap-10 px-6 pt-4 overflow-x-auto">
        {filters.map(({ key, label, icon }) => (
          <FilterCard
            key={key}
            icon={icon}
            label={label}
            active={key === activeKey}
            onClick={() => setActiveKey(key)}
          />
        ))}
      </div>
    </nav>
  );
}