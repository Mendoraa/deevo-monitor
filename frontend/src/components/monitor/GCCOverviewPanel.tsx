"use client";

import { MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_REGIONS, type RegionData } from "@/lib/mock-data";
import { useMonitorMode } from "@/lib/monitorMode";

// ─── GCC Country Risk Data ────────────────────────────────────
interface CountryRisk {
  code: string;
  name: string;
  nameAr: string;
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  trend: "up" | "down" | "stable";
  oilDependency: number;
  motorMarketSize: string;
  keySignal: string;
}

const GCC_RISK_DATA: CountryRisk[] = [
  {
    code: "KWT",
    name: "Kuwait",
    nameAr: "الكويت",
    riskScore: 64,
    riskLevel: "high",
    trend: "up",
    oilDependency: 0.85,
    motorMarketSize: "2.1B KWD",
    keySignal: "Repair cost inflation +7.2%",
  },
  {
    code: "SAU",
    name: "Saudi Arabia",
    nameAr: "السعودية",
    riskScore: 48,
    riskLevel: "medium",
    trend: "stable",
    oilDependency: 0.65,
    motorMarketSize: "35B SAR",
    keySignal: "Vision 2030 regulatory shifts",
  },
  {
    code: "UAE",
    name: "UAE",
    nameAr: "الإمارات",
    riskScore: 38,
    riskLevel: "low",
    trend: "down",
    oilDependency: 0.30,
    motorMarketSize: "18B AED",
    keySignal: "Claims frequency declining",
  },
  {
    code: "BHR",
    name: "Bahrain",
    nameAr: "البحرين",
    riskScore: 52,
    riskLevel: "medium",
    trend: "up",
    oilDependency: 0.70,
    motorMarketSize: "280M BHD",
    keySignal: "Banking sector stress elevated",
  },
  {
    code: "QAT",
    name: "Qatar",
    nameAr: "قطر",
    riskScore: 35,
    riskLevel: "low",
    trend: "stable",
    oilDependency: 0.60,
    motorMarketSize: "4.2B QAR",
    keySignal: "LNG revenues offsetting oil",
  },
  {
    code: "OMN",
    name: "Oman",
    nameAr: "عُمان",
    riskScore: 55,
    riskLevel: "medium",
    trend: "up",
    oilDependency: 0.68,
    motorMarketSize: "620M OMR",
    keySignal: "Fiscal consolidation pressure",
  },
];

const RISK_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  critical: { bg: "rgba(239,68,68,0.06)", border: "rgba(239,68,68,0.2)", text: "text-red-400" },
  high: { bg: "rgba(239,68,68,0.04)", border: "rgba(239,68,68,0.15)", text: "text-red-400" },
  medium: { bg: "rgba(245,158,11,0.04)", border: "rgba(245,158,11,0.15)", text: "text-amber-400" },
  low: { bg: "rgba(16,185,129,0.04)", border: "rgba(16,185,129,0.15)", text: "text-emerald-400" },
};

function CountryCard({ country }: { country: CountryRisk }) {
  const colors = RISK_COLORS[country.riskLevel] || RISK_COLORS.medium;
  const TrendIcon = country.trend === "up" ? TrendingUp : country.trend === "down" ? TrendingDown : Minus;
  const { mode } = useMonitorMode();
  const isHighlighted = mode === "kuwait" && country.code === "KWT";

  return (
    <div
      className={`rounded-lg p-3 transition-all duration-200 ${isHighlighted ? "ring-1 ring-cyan-500/30" : ""}`}
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-white">{country.code}</span>
          <span className="text-[9px] text-neutral-600" dir="rtl">{country.nameAr}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
            {country.riskScore}
          </span>
          <TrendIcon className={`w-3 h-3 ${colors.text}`} />
        </div>
      </div>

      {/* Oil dependency bar */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[8px] text-neutral-600 w-14">Oil Dep.</span>
        <div className="flex-1 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500/50"
            style={{ width: `${country.oilDependency * 100}%` }}
          />
        </div>
        <span className="text-[8px] text-neutral-500 tabular-nums">
          {(country.oilDependency * 100).toFixed(0)}%
        </span>
      </div>

      <div className="text-[9px] text-neutral-500 truncate">{country.keySignal}</div>
      <div className="text-[8px] text-neutral-700 mt-1">Motor: {country.motorMarketSize}</div>
    </div>
  );
}

export default function GCCOverviewPanel() {
  const { mode } = useMonitorMode();

  // Only show in GCC or Global mode (compact in other modes)
  if (mode !== "gcc" && mode !== "global" && mode !== "kuwait") return null;

  const countries = mode === "kuwait"
    ? GCC_RISK_DATA.filter((c) => c.code === "KWT")
    : GCC_RISK_DATA;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-emerald-500 rounded-full" />
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          {mode === "kuwait" ? "Kuwait Strategic Posture" : "GCC Strategic Risk Overview"}
        </h3>
      </div>

      <div className={`grid gap-2 ${
        mode === "kuwait" ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      }`}>
        {countries.map((c) => (
          <CountryCard key={c.code} country={c} />
        ))}
      </div>
    </section>
  );
}
