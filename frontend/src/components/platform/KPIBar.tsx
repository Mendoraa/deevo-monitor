"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  trendValue: string;
  severity: "critical" | "high" | "medium" | "low";
}

const KPIS: KPI[] = [
  { label: "BRENT OIL", value: "89.5", unit: "USD", trend: "up", trendValue: "+2.3%", severity: "high" },
  { label: "DRI SCORE", value: "64", unit: "/ 100", trend: "up", trendValue: "+4", severity: "high" },
  { label: "CLAIMS SIG", value: "58", unit: "idx", trend: "up", trendValue: "+12%", severity: "medium" },
  { label: "FRAUD EXP", value: "45", unit: "idx", trend: "up", trendValue: "+8%", severity: "medium" },
  { label: "UW STRESS", value: "63", unit: "idx", trend: "up", trendValue: "+5%", severity: "high" },
  { label: "KWT CPI", value: "3.8", unit: "%", trend: "up", trendValue: "+0.3", severity: "medium" },
  { label: "RESERVES", value: "92", unit: "% adeq", trend: "down", trendValue: "-1.2%", severity: "low" },
  { label: "CONFIDENCE", value: "82", unit: "%", trend: "stable", trendValue: "±0", severity: "low" },
];

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

const TREND_COLORS: Record<string, string> = {
  up: "#fca5a5",
  down: "#6ee7b7",
  stable: "#4a5068",
};

export default function KPIBar() {
  return (
    <div
      className="absolute bottom-0 left-[54px] right-0 z-40 flex items-center"
      style={{
        height: "52px",
        background: "rgba(7, 10, 18, 0.92)",
        borderTop: "1px solid var(--cx-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* KPI cells */}
      <div className="flex items-center flex-1 h-full">
        {KPIS.map((kpi) => {
          const TrendIcon =
            kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
          return (
            <div key={kpi.label} className="kpi-cell flex-1 h-full justify-center">
              <div className="flex items-center gap-1">
                <span className="text-[7px] font-semibold tracking-[0.1em] text-muted">
                  {kpi.label}
                </span>
                <span
                  className="w-1 h-1 rounded-full ml-auto"
                  style={{ background: SEV_COLORS[kpi.severity] }}
                />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[14px] font-bold text-bright text-mono">
                  {kpi.value}
                </span>
                <span className="text-[8px] text-dim">{kpi.unit}</span>
                <div className="flex items-center gap-0.5 ml-auto">
                  <TrendIcon
                    className="w-2.5 h-2.5"
                    style={{ color: TREND_COLORS[kpi.trend] }}
                  />
                  <span
                    className="text-[8px] font-semibold text-mono"
                    style={{ color: TREND_COLORS[kpi.trend] }}
                  >
                    {kpi.trendValue}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System trust */}
      <div
        className="h-full px-4 flex flex-col justify-center"
        style={{ borderLeft: "1px solid var(--cx-border)" }}
      >
        <span className="text-[7px] text-dim tracking-wider">SYSTEM</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-live" />
          <span className="text-[9px] font-bold text-emerald-400 text-mono">
            OPERATIONAL
          </span>
        </div>
      </div>
    </div>
  );
}
