"use client";

import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { ECONOMIC_HIGHLIGHTS, type EconomicHighlight } from "@/lib/gcc-signals";

const DIRECTION_ICON: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  stable: Minus,
};

const IMPACT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  positive: { text: "text-emerald-400", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)" },
  negative: { text: "text-red-400", bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)" },
  neutral: { text: "text-neutral-400", bg: "rgba(115,115,115,0.06)", border: "rgba(115,115,115,0.2)" },
};

function EconomicCard({ item }: { item: EconomicHighlight }) {
  const Icon = DIRECTION_ICON[item.direction] || Minus;
  const colors = IMPACT_COLORS[item.impact] || IMPACT_COLORS.neutral;

  return (
    <div
      className="rounded-lg p-4 transition-all duration-300 hover:translate-y-[-1px]"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">
          {item.title}
        </span>
        <Icon className={`w-3.5 h-3.5 ${colors.text}`} />
      </div>

      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-xl font-bold text-white tabular-nums">{item.value}</span>
        <span className={`text-xs font-medium tabular-nums ${colors.text}`}>
          {item.change}
        </span>
      </div>

      <p className="text-[10px] text-neutral-500 leading-relaxed">
        {item.description}
      </p>
    </div>
  );
}

export default function EconomicOverlay() {
  const highlights = ECONOMIC_HIGHLIGHTS;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Economic Monitor</h3>
            <p className="text-[9px] text-neutral-600">
              Macro indicators · Oil · FX · Inflation
            </p>
          </div>
        </div>
        <span className="text-[9px] text-neutral-600 uppercase tracking-wider">
          Last updated: 25 Mar 2026
        </span>
      </div>

      {/* Economic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {highlights.map((item) => (
          <EconomicCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
