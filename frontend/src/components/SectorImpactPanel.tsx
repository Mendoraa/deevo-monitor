"use client";

import type { SectorImpact } from "@/types/economic-layer";

interface Props {
  impacts: Record<string, SectorImpact>;
}

const DIRECTION_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  up: { bg: "bg-red-500/10", text: "text-red-400", label: "UP" },
  down: { bg: "bg-green-500/10", text: "text-green-400", label: "DOWN" },
  mixed: { bg: "bg-amber-500/10", text: "text-amber-400", label: "MIXED" },
  cautious: { bg: "bg-blue-500/10", text: "text-blue-400", label: "CAUTIOUS" },
};

const SECTOR_LABELS: Record<string, string> = {
  oilmarket: "Oil Market",
  shippinglogistics: "Shipping & Logistics",
  insurancerisk: "Insurance Risk",
  bankingliquidity: "Banking & Liquidity",
  gccfiscal: "GCC Fiscal",
};

function confidenceBar(confidence: number) {
  const pct = Math.round(confidence * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-cortex-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-cortex-accent rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-cortex-muted w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function SectorImpactPanel({ impacts }: Props) {
  const entries = Object.entries(impacts);

  return (
    <div className="panel">
      <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-3">
        Sector Impacts
      </h3>
      <div className="space-y-3">
        {entries.map(([key, impact]) => {
          const style = DIRECTION_STYLES[impact.direction] || DIRECTION_STYLES.mixed;
          const label = SECTOR_LABELS[key] || key.replace(/_/g, " ");

          return (
            <div key={key} className="p-3 bg-cortex-bg rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium capitalize">{label}</span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${style.bg} ${style.text}`}>
                  {style.label}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-cortex-muted">
                  Magnitude: <span className="text-cortex-text capitalize">{impact.magnitude}</span>
                </span>
                {impact.range && (
                  <span className="text-xs text-cortex-muted">
                    Range: <span className="text-cortex-text">{impact.range}</span>
                  </span>
                )}
              </div>
              {confidenceBar(impact.confidence)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
