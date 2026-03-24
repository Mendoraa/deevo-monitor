"use client";

import type { GCCBreakdown } from "@/types/economic-layer";

interface Props {
  breakdown: GCCBreakdown;
}

const COUNTRY_FLAGS: Record<string, string> = {
  saudi: "🇸🇦",
  uae: "🇦🇪",
  kuwait: "🇰🇼",
  qatar: "🇶🇦",
  bahrain: "🇧🇭",
  oman: "🇴🇲",
};

const COUNTRY_NAMES: Record<string, string> = {
  saudi: "Saudi Arabia",
  uae: "UAE",
  kuwait: "Kuwait",
  qatar: "Qatar",
  bahrain: "Bahrain",
  oman: "Oman",
};

function sentimentColor(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("positive") || lower.includes("resilient") || lower.includes("supportive"))
    return "border-l-green-500";
  if (lower.includes("negative") || lower.includes("vulnerable"))
    return "border-l-red-500";
  return "border-l-amber-500";
}

export default function GCCImpactPanel({ breakdown }: Props) {
  return (
    <div className="panel">
      <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-1">
        GCC Impact Breakdown
      </h3>
      <p className="text-xs text-cortex-muted mb-3">
        Country-specific economic spillover assessment
      </p>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(breakdown).map(([country, assessment]) => (
          <div
            key={country}
            className={`p-3 bg-cortex-bg rounded-lg border-l-2 ${sentimentColor(assessment)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{COUNTRY_FLAGS[country]}</span>
              <span className="text-sm font-medium text-white">
                {COUNTRY_NAMES[country] || country}
              </span>
            </div>
            <p className="text-xs text-cortex-text leading-relaxed">{assessment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
