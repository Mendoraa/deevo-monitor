"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Minus, Radio, ChevronDown } from "lucide-react";
import { GCC_SIGNALS, type ExtendedSignal } from "@/lib/gcc-signals";

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

function SignalRow({ signal }: { signal: ExtendedSignal }) {
  const color = SEV_COLORS[signal.severity];
  const TrendIcon = signal.trend === "up" ? TrendingUp : signal.trend === "down" ? TrendingDown : Minus;

  return (
    <div
      className="px-3 py-2 border-b transition-colors hover:bg-white/[0.015]"
      style={{ borderColor: "var(--cx-border)", borderLeft: `2px solid ${color}` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: color }}
        />
        <span className="text-[10px] font-semibold text-bright truncate flex-1">
          {signal.label}
        </span>
        <span className="text-[8px] font-bold text-mono" style={{ color }}>
          {signal.severity.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-bright text-mono">
          {signal.raw_value}
        </span>
        <span className="text-[8px] text-muted">{signal.unit}</span>
        <TrendIcon
          className="w-3 h-3 ml-auto"
          style={{
            color:
              signal.trend === "up"
                ? "#fca5a5"
                : signal.trend === "down"
                ? "#6ee7b7"
                : "#4a5068",
          }}
        />
      </div>
      {signal.ai_insight && (
        <p className="text-[8px] text-muted mt-1 leading-relaxed line-clamp-2">
          {signal.ai_insight}
        </p>
      )}
    </div>
  );
}

export default function SignalFeed() {
  const sorted = [...GCC_SIGNALS].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[a.severity] - order[b.severity];
  });

  const criticalCount = sorted.filter((s) => s.severity === "critical").length;
  const highCount = sorted.filter((s) => s.severity === "high").length;

  return (
    <div
      className="absolute left-[54px] top-[38px] bottom-[52px] z-30 flex flex-col"
      style={{
        width: "260px",
        background: "rgba(7, 10, 18, 0.92)",
        borderRight: "1px solid var(--cx-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--cx-border)" }}
      >
        <Radio className="w-3 h-3 text-red-400 pulse-live" />
        <span className="text-[9px] font-bold text-bright tracking-[0.1em] uppercase">
          Live Signals
        </span>
        <span className="text-[8px] text-muted ml-auto font-mono">
          {sorted.length}
        </span>
      </div>

      {/* Severity summary */}
      <div
        className="px-3 py-1.5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--cx-border)", background: "rgba(0,0,0,0.2)" }}
      >
        {criticalCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full sev-dot-critical pulse-live" />
            <span className="text-[8px] font-bold" style={{ color: "#ef4444" }}>
              {criticalCount} CRIT
            </span>
          </div>
        )}
        {highCount > 0 && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full sev-dot-high" />
            <span className="text-[8px] font-bold" style={{ color: "#f97316" }}>
              {highCount} HIGH
            </span>
          </div>
        )}
      </div>

      {/* Signal list */}
      <div className="flex-1 overflow-y-auto">
        {sorted.map((signal) => (
          <SignalRow key={signal.indicator} signal={signal} />
        ))}
      </div>
    </div>
  );
}
