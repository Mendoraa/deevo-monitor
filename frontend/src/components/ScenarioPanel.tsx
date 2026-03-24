"use client";

import type { ScenarioBundle } from "@/types/economic-layer";

interface Props {
  scenarios: ScenarioBundle;
}

const SCENARIO_META = [
  {
    key: "base_case" as const,
    label: "Base Case",
    description: "Most likely outcome given current signals",
    color: "border-green-500",
    bgColor: "bg-green-500/5",
    textColor: "text-green-400",
    probability: "60-70%",
  },
  {
    key: "elevated_case" as const,
    label: "Elevated Case",
    description: "Escalation with broader economic transmission",
    color: "border-amber-500",
    bgColor: "bg-amber-500/5",
    textColor: "text-amber-400",
    probability: "20-30%",
  },
  {
    key: "severe_case" as const,
    label: "Severe Case",
    description: "Full escalation with systemic spillover",
    color: "border-red-500",
    bgColor: "bg-red-500/5",
    textColor: "text-red-400",
    probability: "5-10%",
  },
];

export default function ScenarioPanel({ scenarios }: Props) {
  return (
    <div className="panel">
      <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-1">
        Probabilistic Scenarios
      </h3>
      <p className="text-xs text-cortex-muted mb-3">
        Three-tier economic scenario estimates
      </p>
      <div className="space-y-3">
        {SCENARIO_META.map((meta) => {
          const data = scenarios[meta.key];
          return (
            <div key={meta.key} className={`p-3 rounded-lg border-l-2 ${meta.color} ${meta.bgColor}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-semibold ${meta.textColor}`}>
                  {meta.label}
                </span>
                <span className="text-xs text-cortex-muted">
                  ~{meta.probability}
                </span>
              </div>
              <p className="text-xs text-cortex-muted mb-2">{meta.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(data).map(([sector, estimate]) => (
                  <div key={sector} className="flex justify-between items-center">
                    <span className="text-xs text-cortex-muted capitalize">
                      {sector.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-cortex-text font-medium">{estimate}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
