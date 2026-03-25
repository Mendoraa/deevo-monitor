"use client";

import { TrendingUp, TrendingDown, Minus, Brain } from "lucide-react";
import { GCC_SIGNALS, type ExtendedSignal } from "@/lib/gcc-signals";
import { filterSignalsByMode } from "@/lib/signalFilter";
import { useMonitorMode } from "@/lib/monitorMode";

const CATEGORIES = [
  { key: "macro", label: "Geopolitical & Macro", color: "blue" },
  { key: "claims", label: "Claims Intelligence", color: "amber" },
  { key: "fraud", label: "Fraud Signals", color: "red" },
  { key: "underwriting", label: "Underwriting & Market", color: "purple" },
] as const;

function SignalCard({ signal }: { signal: ExtendedSignal }) {
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

  const { mode } = useMonitorMode();
  const showInsight = mode === "intelligence" && signal.ai_insight;

  return (
    <div className="signal-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-neutral-200 truncate">
          {signal.label}
        </span>
        <div className="flex items-center gap-1.5">
          {signal.ai_insight && mode === "intelligence" && (
            <Brain className="w-3 h-3 text-purple-400" />
          )}
          <TrendIcon className={`w-3.5 h-3.5 flex-shrink-0 ${trendColor}`} />
        </div>
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
        <div className="flex items-center gap-2">
          {/* Region tags */}
          {signal.region.filter((r) => r !== "GLOBAL").length > 0 && (
            <span className="text-[9px] text-neutral-600">
              {signal.region.filter((r) => r !== "GLOBAL").slice(0, 3).join(" · ")}
            </span>
          )}
          <span className="text-[10px] text-neutral-500 tabular-nums">
            {signal.normalized.toFixed(0)}/100
          </span>
        </div>
      </div>

      {/* AI Insight (Intelligence mode only) */}
      {showInsight && (
        <div
          className="mt-2.5 p-2 rounded-md text-[10px] text-purple-300/80 leading-relaxed"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}
        >
          <div className="flex items-center gap-1 mb-1">
            <Brain className="w-2.5 h-2.5 text-purple-400" />
            <span className="text-[8px] uppercase tracking-wider text-purple-500 font-medium">AI Insight</span>
          </div>
          {signal.ai_insight}
        </div>
      )}
    </div>
  );
}

export default function GlobalSignalGrid() {
  const { mode, config } = useMonitorMode();
  const signals = filterSignalsByMode(GCC_SIGNALS, mode);

  // Dynamic section title based on mode
  const sectionTitle =
    mode === "gcc" ? "GCC Signals" :
    mode === "kuwait" ? "Kuwait Signals" :
    mode === "economic" ? "Economic Indicators" :
    mode === "intelligence" ? "Monitored Signals" :
    "Global Signals";

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <h2 className="section-title">{sectionTitle}</h2>
        {mode !== "global" && (
          <span className="text-[9px] text-neutral-600 ml-1">
            ({signals.length} signals · {config.labelAr})
          </span>
        )}
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
