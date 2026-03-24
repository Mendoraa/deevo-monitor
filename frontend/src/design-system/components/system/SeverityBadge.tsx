"use client";

/**
 * SeverityBadge — Universal severity indicator.
 * Encodes risk level with consistent color semantics.
 */
interface SeverityBadgeProps {
  level: "critical" | "high" | "medium" | "low";
  size?: "sm" | "md";
}

const CONFIG = {
  critical: { bg: "bg-red-500/12", text: "text-red-300", label: "CRITICAL" },
  high: { bg: "bg-orange-500/12", text: "text-orange-300", label: "HIGH" },
  medium: { bg: "bg-amber-500/12", text: "text-amber-300", label: "MEDIUM" },
  low: { bg: "bg-emerald-500/12", text: "text-emerald-300", label: "LOW" },
};

export default function SeverityBadge({ level, size = "sm" }: SeverityBadgeProps) {
  const c = CONFIG[level];
  const sizeClass = size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5";

  return (
    <span
      className={`${c.bg} ${c.text} ${sizeClass} rounded-full font-medium uppercase tracking-wider inline-flex items-center`}
    >
      {c.label}
    </span>
  );
}
