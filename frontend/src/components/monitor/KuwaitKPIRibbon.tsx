"use client";

import {
  Fuel,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldAlert,
  AlertTriangle,
  Search,
  BarChart3,
} from "lucide-react";
import { useMonitorMode } from "@/lib/monitorMode";

// ─── KPI Definitions ──────────────────────────────────────────
interface KPIItem {
  id: string;
  label: string;
  labelAr: string;
  value: string;
  unit: string;
  normalized: number;
  trend: "up" | "down" | "stable";
  severity: "low" | "medium" | "high" | "critical";
  delta: string;
  icon: typeof Fuel;
  category: "economic" | "claims" | "fraud" | "underwriting";
  visibleIn: string[]; // which modes show this KPI
}

const KPI_DATA: KPIItem[] = [
  {
    id: "oil_price",
    label: "Oil Price (Brent)",
    labelAr: "سعر النفط",
    value: "89.50",
    unit: "USD/bbl",
    normalized: 74.6,
    trend: "up",
    severity: "high",
    delta: "+4.2%",
    icon: Fuel,
    category: "economic",
    visibleIn: ["global", "gcc", "kuwait", "economic"],
  },
  {
    id: "kuwait_cpi",
    label: "Kuwait CPI",
    labelAr: "التضخم",
    value: "3.8",
    unit: "%",
    normalized: 63.3,
    trend: "up",
    severity: "medium",
    delta: "+0.6pp",
    icon: TrendingUp,
    category: "economic",
    visibleIn: ["global", "gcc", "kuwait", "economic"],
  },
  {
    id: "claims_pressure",
    label: "Claims Signal",
    labelAr: "المطالبات",
    value: "58",
    unit: "/100",
    normalized: 58,
    trend: "up",
    severity: "medium",
    delta: "+4.1",
    icon: AlertTriangle,
    category: "claims",
    visibleIn: ["global", "gcc", "kuwait", "intelligence"],
  },
  {
    id: "fraud_exposure",
    label: "Fraud Signal",
    labelAr: "الاحتيال",
    value: "45",
    unit: "/100",
    normalized: 45,
    trend: "stable",
    severity: "medium",
    delta: "-1.2",
    icon: Search,
    category: "fraud",
    visibleIn: ["global", "kuwait", "intelligence"],
  },
  {
    id: "underwriting_risk",
    label: "Underwriting",
    labelAr: "الاكتتاب",
    value: "63",
    unit: "/100",
    normalized: 63,
    trend: "up",
    severity: "high",
    delta: "+5.7",
    icon: BarChart3,
    category: "underwriting",
    visibleIn: ["global", "kuwait", "intelligence"],
  },
];

const SEVERITY_COLORS: Record<string, { bar: string; text: string; bg: string; border: string }> = {
  critical: {
    bar: "bg-red-500",
    text: "text-red-400",
    bg: "rgba(239,68,68,0.05)",
    border: "rgba(239,68,68,0.15)",
  },
  high: {
    bar: "bg-red-500/80",
    text: "text-red-400",
    bg: "rgba(239,68,68,0.04)",
    border: "rgba(239,68,68,0.12)",
  },
  medium: {
    bar: "bg-amber-500/70",
    text: "text-amber-400",
    bg: "rgba(245,158,11,0.04)",
    border: "rgba(245,158,11,0.12)",
  },
  low: {
    bar: "bg-emerald-500/70",
    text: "text-emerald-400",
    bg: "rgba(16,185,129,0.04)",
    border: "rgba(16,185,129,0.12)",
  },
};

function KPICard({ kpi }: { kpi: KPIItem }) {
  const colors = SEVERITY_COLORS[kpi.severity] || SEVERITY_COLORS.medium;
  const TrendIcon = kpi.trend === "up" ? TrendingUp : kpi.trend === "down" ? TrendingDown : Minus;
  const trendColor = kpi.trend === "up" ? "text-red-400" : kpi.trend === "down" ? "text-emerald-400" : "text-neutral-500";
  const Icon = kpi.icon;

  return (
    <div
      className="rounded-lg p-3 min-w-[140px] flex-1 transition-all duration-200 hover:translate-y-[-1px]"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon className={`w-3 h-3 ${colors.text}`} />
          <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-medium">
            {kpi.label}
          </span>
        </div>
        <TrendIcon className={`w-3 h-3 ${trendColor}`} />
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-lg font-bold text-white tabular-nums">{kpi.value}</span>
        <span className="text-[10px] text-neutral-600">{kpi.unit}</span>
        <span className={`text-[10px] font-medium tabular-nums ml-auto ${trendColor}`}>
          {kpi.delta}
        </span>
      </div>

      {/* Normalized bar */}
      <div className="w-full h-0.5 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${Math.min(kpi.normalized, 100)}%` }}
        />
      </div>

      {/* Arabic label */}
      <div className="mt-1 text-[8px] text-neutral-700 text-right" dir="rtl">
        {kpi.labelAr}
      </div>
    </div>
  );
}

export default function KuwaitKPIRibbon() {
  const { mode } = useMonitorMode();

  // Filter KPIs based on mode visibility
  const visibleKPIs = KPI_DATA.filter((kpi) => kpi.visibleIn.includes(mode));

  // Always show at least the core KPIs
  if (visibleKPIs.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          {mode === "kuwait" ? "Kuwait Intelligence KPIs" :
           mode === "economic" ? "Economic Indicators" :
           mode === "gcc" ? "GCC Key Metrics" :
           "Live Intelligence KPIs"}
        </h3>
        <span className="text-[9px] text-neutral-700 ml-auto tabular-nums">
          Last: 25 Mar 2026 08:30
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {visibleKPIs.map((kpi) => (
          <KPICard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    </section>
  );
}
