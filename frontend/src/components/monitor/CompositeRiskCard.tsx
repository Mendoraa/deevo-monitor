"use client";

import { Shield, TrendingUp, Activity } from "lucide-react";
import { MOCK_OVERALL_RISK, MOCK_SCORES } from "@/lib/mock-data";

export default function CompositeRiskCard() {
  const risk = MOCK_OVERALL_RISK;
  const scores = MOCK_SCORES;

  const riskColor =
    risk.composite_score >= 70 ? "text-red-400" :
    risk.composite_score >= 50 ? "text-amber-400" :
    "text-emerald-400";

  const riskBg =
    risk.composite_score >= 70 ? "rgba(239,68,68,0.06)" :
    risk.composite_score >= 50 ? "rgba(245,158,11,0.06)" :
    "rgba(16,185,129,0.06)";

  const riskBorder =
    risk.composite_score >= 70 ? "rgba(239,68,68,0.15)" :
    risk.composite_score >= 50 ? "rgba(245,158,11,0.15)" :
    "rgba(16,185,129,0.15)";

  return (
    <div
      className="rounded-lg p-4"
      style={{ background: riskBg, border: `1px solid ${riskBorder}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className={`w-4 h-4 ${riskColor}`} />
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
            Deevo Risk Index (DRI)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-500" />
          <span className="text-[9px] text-neutral-600">Live</span>
        </div>
      </div>

      {/* Main Score */}
      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className={`text-3xl font-bold tabular-nums ${riskColor}`}>
            {risk.composite_score}
          </div>
          <div className="text-[9px] text-neutral-600 uppercase tracking-wider mt-0.5">
            Composite
          </div>
        </div>

        <div className="w-px h-12 bg-neutral-700/30" />

        <div className="text-center">
          <div className="text-lg font-semibold text-white tabular-nums">
            {(risk.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-[9px] text-neutral-600 uppercase tracking-wider mt-0.5">
            Confidence
          </div>
        </div>

        <div className="w-px h-12 bg-neutral-700/30" />

        <div className="text-center">
          <div className="text-sm font-bold text-red-400 uppercase">
            {risk.level}
          </div>
          <div className="text-[9px] text-neutral-600 uppercase tracking-wider mt-0.5">
            Level
          </div>
        </div>
      </div>

      {/* Sub-scores mini bars */}
      <div className="space-y-1.5">
        {scores.map((s) => {
          const barColor =
            s.value >= 70 ? "bg-red-500/70" :
            s.value >= 50 ? "bg-amber-500/70" :
            "bg-emerald-500/70";

          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="text-[9px] text-neutral-500 w-24 truncate">{s.label}</span>
              <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${s.value}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400 tabular-nums w-6 text-right">
                {s.value}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-2 text-[8px] text-neutral-700 tabular-nums">
        {risk.assessment_id} · {risk.market_code}/{risk.portfolio_key}
      </div>
    </div>
  );
}
