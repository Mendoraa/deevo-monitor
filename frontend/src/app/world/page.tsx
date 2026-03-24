"use client";

import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
} from "lucide-react";
import { MOCK_SIGNALS, MOCK_REGIONS } from "@/lib/mock-data";

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  macro: { label: "Macroeconomic", color: "text-blue-400" },
  claims: { label: "Claims", color: "text-amber-400" },
  fraud: { label: "Fraud", color: "text-red-400" },
  underwriting: { label: "Underwriting", color: "text-purple-400" },
  portfolio: { label: "Portfolio", color: "text-green-400" },
};

export default function WorldMonitor() {
  const signals = MOCK_SIGNALS;
  const regions = MOCK_REGIONS;

  // Group signals by category
  const grouped = signals.reduce(
    (acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    },
    {} as Record<string, typeof signals>
  );

  return (
    <div className="space-y-6">
      {/* GCC Region Map */}
      <div className="panel">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-4">
          GCC Markets
        </h3>
        <div className="grid grid-cols-6 gap-3">
          {regions.map((r) => (
            <div
              key={r.code}
              className={`p-3 rounded-lg border transition-all ${
                r.active
                  ? "border-cortex-accent bg-cortex-accent/5"
                  : "border-cortex-border bg-cortex-bg opacity-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <MapPin className={`w-3.5 h-3.5 ${r.active ? "text-cortex-accent" : "text-cortex-muted"}`} />
                <span className={`text-xs font-semibold ${r.active ? "text-white" : "text-cortex-muted"}`}>
                  {r.code}
                </span>
              </div>
              <div className="text-[11px] text-cortex-muted">{r.name}</div>
              <div className="text-[10px] text-cortex-muted mt-1">
                Oil dep: {(r.oil_dependency * 100).toFixed(0)}%
              </div>
              {r.active && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cortex-green pulse-dot" />
                  <span className="text-[9px] text-cortex-green">Active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Signal Cards by Category */}
      {Object.entries(grouped).map(([category, categorySignals]) => {
        const cat = CATEGORY_LABELS[category] || {
          label: category,
          color: "text-cortex-muted",
        };
        return (
          <div key={category} className="panel">
            <div className="flex items-center gap-2 mb-4">
              <Activity className={`w-4 h-4 ${cat.color}`} />
              <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
                {cat.label} Signals
              </h3>
              <span className="text-[10px] text-cortex-muted ml-auto">
                {categorySignals.length} signal{categorySignals.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {categorySignals.map((sig) => (
                <div
                  key={sig.indicator}
                  className="p-3 rounded-lg bg-cortex-bg border border-cortex-border hover:border-cortex-accent/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-white">
                      {sig.label}
                    </span>
                    <span className={`trend-${sig.trend}`}>
                      {sig.trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
                      {sig.trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
                      {sig.trend === "stable" && <Minus className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-xl font-bold text-white">
                      {sig.raw_value}
                    </span>
                    <span className="text-[10px] text-cortex-muted mb-1">
                      {sig.unit}
                    </span>
                  </div>
                  {/* Normalized bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[9px] text-cortex-muted mb-0.5">
                      <span>Normalized</span>
                      <span>{sig.normalized.toFixed(1)}/100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-cortex-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${sig.normalized}%`,
                          backgroundColor:
                            sig.normalized > 70
                              ? "#ef4444"
                              : sig.normalized > 50
                                ? "#f59e0b"
                                : "#10b981",
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-[9px] text-cortex-muted">
                    <span>{sig.source}</span>
                    <span>{new Date(sig.last_updated).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
