"use client";

interface RiskBadgeProps {
  level: "low" | "medium" | "high" | "critical";
  size?: "sm" | "md";
}

export default function RiskBadge({ level, size = "sm" }: RiskBadgeProps) {
  const labels = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };
  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`inline-flex items-center rounded-full font-medium uppercase tracking-wider risk-${level} ${sizeClass}`}>
      {labels[level]}
    </span>
  );
}
