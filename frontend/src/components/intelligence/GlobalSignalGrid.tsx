"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_SIGNALS, type SignalData } from "@/lib/mock-data";

const CATEGORIES = [
  { key: "macro", label: "Geopolitical & Macro", color: "blue" },
  { key: "claims", label: "Claims Intelligence", color: "amber" },
  { key: "fraud", label: "Fraud Signals", color: "red" },
  { key: "underwriting", label: "Underwriting & Market", color: "purple" },
] as const;

function SignalCard({ signal }: { signal: SignalData }) {
  const TrendIcon =
    signal.trend === "up"
      ? TrendingUp
      : signal.trend === "down"
      ? TrendingDown
      : Minus;

  const trendColor =
    signal.trend === "up"
      ? "text-red-400"
      : signal.trend === "down"
      ? "text-emerald-400"
      : "text-neutral-500";

  const barWidth = Math.min(signal.normalized, 100);
  const barColor =
    signal.normalized >= 70
      ? "bg-red-500/70"
      : signal.normalized >= 50
      ? "bg-amber-500/70"
      : "bg-emerald-500/70";

  return (
    <div className="signal-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-200 truncate">
          {signal.label}
        </span>
        <TrendIcon className={`w-3.5 h-3.5 flex-shrink-0 ${trendColor}`} />
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-lg font-bold text-white tabular-nums">
          {signal.raw_value.toLocaleString()}
        </span>
        <span className="text-[10px] text-neutral-500">{signal.unit}</span>
      </div>

      {/* Normalized bar */}
      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[10px] text-neutral-600">{signal.source}</span>
        <span className="text-[10px] text-neutral-500 tabular-nums">
          {signal.normalized.toFixed(0)}/100
        </span>
      </div>
    </div>
  );
}

export default function GlobalSignalGrid() {
  const signals = MOCK_SIGNALS;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <h2 className="section-title">Global Signals</h2>
      </div>

      <div className="space-y-5">
        {CATEGORIES.map((cat) => {
          const catSignals = signals.filter((s) => s.category === cat.key);
          if (catSignals.length === 0) return null;

          return (
            <div key={cat.key}>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 block">
                {cat.label}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {catSignals.map((s) => (
                  <SignalCard key={s.indicator} signal={s} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
