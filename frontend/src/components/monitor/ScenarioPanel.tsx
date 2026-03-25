"use client";

import { Zap, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useMonitorMode } from "@/lib/monitorMode";

// ─── Scenario Data ────────────────────────────────────────────
interface ScenarioItem {
  id: string;
  label: string;
  description: string;
  probability: number;
  timeHorizon: "24h" | "7d" | "30d" | "90d";
  impacts: {
    dimension: string;
    direction: "up" | "down" | "stable";
    magnitude: string;
  }[];
  trigger: string;
  visibleIn: string[];
}

const SCENARIOS: ScenarioItem[] = [
  {
    id: "SCN-001",
    label: "Oil Sustained Above $90",
    description: "Brent stays above $90/bbl for 30+ days, triggering cost pass-through cascade to motor repairs and claims severity.",
    probability: 0.65,
    timeHorizon: "30d",
    impacts: [
      { dimension: "Claims Severity", direction: "up", magnitude: "+12-18%" },
      { dimension: "Repair Costs", direction: "up", magnitude: "+8-14%" },
      { dimension: "Underwriting Margin", direction: "down", magnitude: "-3.5%" },
      { dimension: "Consumer Stress", direction: "up", magnitude: "Elevated" },
    ],
    trigger: "Oil > $90 sustained",
    visibleIn: ["global", "gcc", "kuwait", "economic"],
  },
  {
    id: "SCN-002",
    label: "Fraud Cluster Expansion",
    description: "Ahmadi zone fraud cluster expands to 6+ garages, staging collision volume doubles.",
    probability: 0.35,
    timeHorizon: "7d",
    impacts: [
      { dimension: "Fraud Exposure", direction: "up", magnitude: "+22%" },
      { dimension: "Claims Frequency", direction: "up", magnitude: "+6%" },
      { dimension: "Portfolio Loss Ratio", direction: "up", magnitude: "+2.8pp" },
    ],
    trigger: "2+ new garages flagged",
    visibleIn: ["global", "kuwait", "intelligence"],
  },
  {
    id: "SCN-003",
    label: "GCC Regulatory Tightening",
    description: "SAMA or CMA introduces new capital adequacy requirements affecting motor portfolio reserves.",
    probability: 0.25,
    timeHorizon: "90d",
    impacts: [
      { dimension: "Capital Requirement", direction: "up", magnitude: "+15-20%" },
      { dimension: "Premium Pricing", direction: "up", magnitude: "+5-8%" },
      { dimension: "Market Competition", direction: "down", magnitude: "Reduced" },
    ],
    trigger: "Regulatory consultation paper",
    visibleIn: ["global", "gcc", "economic"],
  },
];

const TIME_COLORS: Record<string, string> = {
  "24h": "text-red-400",
  "7d": "text-amber-400",
  "30d": "text-blue-400",
  "90d": "text-neutral-400",
};

function ScenarioCard({ scenario }: { scenario: ScenarioItem }) {
  const probColor = scenario.probability >= 0.5 ? "text-red-400" : scenario.probability >= 0.3 ? "text-amber-400" : "text-neutral-400";

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200 hover:translate-y-[-1px]"
      style={{ background: "var(--cortex-panel)", border: "1px solid var(--cortex-border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-semibold text-white">{scenario.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Clock className={`w-3 h-3 ${TIME_COLORS[scenario.timeHorizon]}`} />
            <span className={`text-[10px] font-medium ${TIME_COLORS[scenario.timeHorizon]}`}>
              {scenario.timeHorizon}
            </span>
          </div>
          <span className={`text-[10px] font-bold tabular-nums ${probColor}`}>
            {(scenario.probability * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="text-[10px] text-neutral-500 leading-relaxed mb-3">
        {scenario.description}
      </p>

      {/* Impact List */}
      <div className="space-y-1">
        {scenario.impacts.map((impact, idx) => {
          const DirIcon = impact.direction === "up" ? TrendingUp : impact.direction === "down" ? TrendingDown : AlertTriangle;
          const dirColor = impact.direction === "up" ? "text-red-400" : impact.direction === "down" ? "text-emerald-400" : "text-neutral-500";
          return (
            <div key={idx} className="flex items-center gap-2">
              <DirIcon className={`w-2.5 h-2.5 ${dirColor}`} />
              <span className="text-[9px] text-neutral-500 flex-1">{impact.dimension}</span>
              <span className={`text-[10px] font-medium tabular-nums ${dirColor}`}>
                {impact.magnitude}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-2" style={{ borderTop: "1px solid var(--cortex-border)" }}>
        <span className="text-[8px] text-neutral-700 uppercase tracking-wider">
          Trigger: {scenario.trigger}
        </span>
      </div>
    </div>
  );
}

export default function ScenarioPanel() {
  const { mode } = useMonitorMode();

  const visibleScenarios = SCENARIOS.filter((s) => s.visibleIn.includes(mode));
  if (visibleScenarios.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-amber-500 rounded-full" />
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          Scenario Intelligence
        </h3>
        <span className="text-[9px] text-neutral-700">
          What-if projections
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {visibleScenarios.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
    </section>
  );
}
