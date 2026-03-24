"use client";

import type { AccentColor } from "@/design-system/tokens/colors";

/**
 * SectionHeader — Consistent section title with color indicator.
 */
interface SectionHeaderProps {
  title: string;
  color?: "blue" | "cyan" | "amber" | "purple" | "emerald" | "orange" | "red";
  tag?: string;
  right?: React.ReactNode;
}

const COLOR_MAP: Record<string, string> = {
  blue: "bg-blue-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  purple: "bg-purple-500",
  emerald: "bg-emerald-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
};

export default function SectionHeader({
  title,
  color = "blue",
  tag,
  right,
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-4 ${COLOR_MAP[color]} rounded-full`} />
        <h2 className="section-title">{title}</h2>
        {tag && (
          <span className="text-[10px] text-neutral-600 ml-2">{tag}</span>
        )}
      </div>
      {right && <div>{right}</div>}
    </div>
  );
}
