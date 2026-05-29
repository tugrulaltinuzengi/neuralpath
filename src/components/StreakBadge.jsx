import { Flame } from "lucide-react";

// Compact current-streak badge.
export default function StreakBadge({ current = 0, longest = 0 }) {
  return (
    <div className="np-card flex items-center gap-3 px-3 py-2">
      <Flame size={20} color={current > 0 ? "var(--accent-orange)" : "var(--text-dim)"} />
      <div className="leading-tight">
        <div className="font-display text-sm font-semibold">{current} day streak</div>
        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
          longest {longest}
        </div>
      </div>
    </div>
  );
}
