"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_SCORES, type ScoreData } from "@/lib/mock-data";

/**
 * TopDriversCard — Shows top 3 risk drivers only.
 * Progressive disclosure: summary first, expand for details.
 * Reduces cognitive load by default.
 */
interface TopDriversCardProps {
  maxDrivers?: number;
}

export default function TopDriversCard({ maxDrivers = 3 }: TopDriversCardProps) {
  const drivers = [...MOCK_SCORES]
    .sort((a, b) => b.value - a.value)
    .slice(0, maxDrivers);

  return (
    <div className="top-drivers-card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[9px] uppercase tracking-widest text-neutral-600 font-semibold">
          Top Risk Drivers
        </span>
      </div>

      <div className="space-y-2">
        {drivers.map((d, i) => {
          const TrendIcon =
            d.trend === "up" ? TrendingUp : d.trend === "down" ? TrendingDown : Minus;
          const trendColor =
            d.trend === "up" ? "text-red-400" : d.trend === "down" ? "text-emerald-400" : "text-neutral-500";
          const barColor =
            d.risk_level === "critical" ? "bg-red-500" :
            d.risk_level === "high" ? "bg-orange-500" :
            d.risk_level === "medium" ? "bg-amber-500" : "bg-emerald-500";

          return (
            <div key={d.key} className="flex items-center gap-3">
              <span className="text-[10px] text-neutral-700 w-4 tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-neutral-300">{d.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white tabular-nums">{d.value}</span>
                    <TrendIcon className={`w-3 h-3 ${trendColor}`} />
                  </div>
                </div>
                <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-700`}
                    style={{ width: `${d.value}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
