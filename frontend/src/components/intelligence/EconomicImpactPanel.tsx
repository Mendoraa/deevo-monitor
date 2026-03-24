"use client";

import { MOCK_SCORES, MOCK_REGIONS, type ScoreData } from "@/lib/mock-data";
import type { GCCBreakdown, SectorImpact } from "@/types/economic-layer";
import type { ScenarioBundle } from "@/types/economic-layer";

/* ─── Score Ring (Mini Gauge) ─────────────────────────── */
function MiniRing({ value, label, level }: { value: number; label: string; level: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color =
    level === "critical"
      ? "#ef4444"
      : level === "high"
      ? "#f97316"
      : level === "medium"
      ? "#f59e0b"
      : "#10b981";

  return (
    <div className="flex flex-col items-center">
      <svg width="68" height="68" viewBox="0 0 68 68" className="transform -rotate-90">
        <circle cx="34" cy="34" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
        <circle
          cx="34"
          cy="34"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="gauge-ring"
        />
      </svg>
      <span className="text-lg font-bold text-white -mt-11 mb-3 tabular-nums">{value}</span>
      <span className="text-[10px] text-neutral-500 mt-1 text-center leading-tight">
        {label}
      </span>
    </div>
  );
}

/* ─── Scenario Score Card ─────────────────────────────── */
function ScenarioCard({
  tier,
  data,
  color,
}: {
  tier: string;
  data: Record<string, string>;
  color: string;
}) {
  const entries = Object.entries(data);
  return (
    <div className={`scenario-card scenario-${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full bg-${color}-500`} />
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          {tier}
        </span>
      </div>
      <div className="space-y-1.5">
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-start gap-2">
            <span className="text-[10px] text-neutral-500 w-20 flex-shrink-0 capitalize">
              {key.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] text-neutral-300">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── GCC Impact Row ──────────────────────────────────── */
function GCCRow({
  code,
  name,
  impact,
  oilDep,
  isActive,
}: {
  code: string;
  name: string;
  impact?: string;
  oilDep: number;
  isActive: boolean;
}) {
  return (
    <div className={`gcc-row ${isActive ? "gcc-row-active" : ""}`}>
      <div className="flex items-center gap-2 min-w-[100px]">
        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-dot" />}
        <span className={`text-xs font-mono ${isActive ? "text-white font-bold" : "text-neutral-400"}`}>
          {code}
        </span>
        <span className="text-[11px] text-neutral-500">{name}</span>
      </div>
      <div className="flex-1 mx-3">
        {impact ? (
          <p className="text-[11px] text-neutral-300 leading-relaxed">{impact}</p>
        ) : (
          <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500/30 rounded-full"
              style={{ width: `${oilDep * 100}%` }}
            />
          </div>
        )}
      </div>
      <span className="text-[10px] text-neutral-600 tabular-nums">
        Oil: {(oilDep * 100).toFixed(0)}%
      </span>
    </div>
  );
}

/* ─── Main Panel ──────────────────────────────────────── */
interface EconomicImpactPanelProps {
  sectorImpacts?: Record<string, SectorImpact>;
  scenarios?: ScenarioBundle;
  gccBreakdown?: GCCBreakdown;
}

export default function EconomicImpactPanel({
  sectorImpacts,
  scenarios,
  gccBreakdown,
}: EconomicImpactPanelProps) {
  const scores = MOCK_SCORES;
  const regions = MOCK_REGIONS;

  const gccData: Record<string, string> = gccBreakdown
    ? {
        KWT: gccBreakdown.kuwait,
        SAU: gccBreakdown.saudi,
        UAE: gccBreakdown.uae,
        QAT: gccBreakdown.qatar,
        BHR: gccBreakdown.bahrain,
        OMN: gccBreakdown.oman,
      }
    : {};

  return (
    <section className="space-y-6">
      {/* Insurance Scores */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-amber-500 rounded-full" />
          <h2 className="section-title">Insurance Risk Scores</h2>
          <span className="text-[10px] text-neutral-600 ml-2">KWT / motor_retail</span>
        </div>
        <div className="intel-panel p-5">
          <div className="flex items-center justify-around">
            {scores.map((s: ScoreData) => (
              <MiniRing
                key={s.key}
                value={s.value}
                label={s.label}
                level={s.risk_level}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scenarios — show when live data */}
      {scenarios && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-purple-500 rounded-full" />
            <h2 className="section-title">Scenario Scoring</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <ScenarioCard tier="Base Case" data={scenarios.base_case} color="emerald" />
            <ScenarioCard tier="Elevated" data={scenarios.elevated_case} color="amber" />
            <ScenarioCard tier="Severe" data={scenarios.severe_case} color="red" />
          </div>
        </div>
      )}

      {/* GCC Impact */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-emerald-500 rounded-full" />
          <h2 className="section-title">GCC Regional Impact</h2>
        </div>
        <div className="intel-panel divide-y divide-neutral-800/50">
          {regions.map((r) => (
            <GCCRow
              key={r.code}
              code={r.code}
              name={r.name}
              impact={gccData[r.code]}
              oilDep={r.oil_dependency}
              isActive={r.active}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
