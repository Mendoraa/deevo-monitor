"use client";

import type { InsuranceAnalysis } from "@/types/insurance";

interface Props {
  data: InsuranceAnalysis;
}

const RISK_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500",
  high: "bg-red-500/10 text-red-300 border-red-400",
  moderate: "bg-amber-500/10 text-amber-300 border-amber-400",
  low: "bg-green-500/10 text-green-300 border-green-400",
};

export default function InsurancePanel({ data }: Props) {
  const riskStyle = RISK_COLORS[data.overall_risk_level] || RISK_COLORS.moderate;

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
          Insurance Intelligence
        </h3>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${riskStyle}`}>
          {data.overall_risk_level.toUpperCase()} RISK
        </span>
      </div>

      {/* Affected Lines */}
      <div>
        <p className="text-xs text-cortex-muted mb-2">
          Affected Lines ({data.affected_lines.length})
        </p>
        <div className="space-y-2">
          {data.affected_lines.slice(0, 5).map((line) => (
            <div key={line.line} className="p-2.5 bg-cortex-bg rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-white font-medium capitalize">
                  {line.line.replace(/_/g, " ")}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded ${
                  RISK_COLORS[line.severity_label] || ""
                }`}>
                  {line.severity_label.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-cortex-muted">Claims </span>
                  <span className="text-red-400 font-medium">+{line.claims_increase_pct}%</span>
                </div>
                <div>
                  <span className="text-cortex-muted">Loss Ratio </span>
                  <span className="text-amber-400 font-medium">+{line.loss_ratio_delta}pp</span>
                </div>
                <div>
                  <span className="text-cortex-muted">Premium </span>
                  <span className="text-blue-400 font-medium">+{line.premium_adjustment_pct}%</span>
                </div>
              </div>
              {line.reinsurance_trigger && (
                <div className="mt-1.5 text-xs text-red-400 font-medium">
                  ⚠ Reinsurance treaty trigger
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Claims Projection */}
      <div className="p-3 bg-cortex-bg rounded-lg">
        <p className="text-xs text-cortex-muted mb-2 font-semibold">Claims Projection</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-cortex-muted">Count Increase: </span>
            <span className="text-white">{data.claims_projection.estimated_claim_count_increase}</span>
          </div>
          <div>
            <span className="text-cortex-muted">Severity Change: </span>
            <span className="text-white">{data.claims_projection.average_claim_severity_change}</span>
          </div>
          <div>
            <span className="text-cortex-muted">Timeline: </span>
            <span className="text-white">{data.claims_projection.estimated_timeline_days} days</span>
          </div>
          <div>
            <span className="text-cortex-muted">Cat Reserve: </span>
            <span className={data.claims_projection.catastrophe_reserve_trigger ? "text-red-400 font-bold" : "text-green-400"}>
              {data.claims_projection.catastrophe_reserve_trigger ? "TRIGGERED" : "No"}
            </span>
          </div>
        </div>
      </div>

      {/* Regulatory Flags */}
      {data.regulatory_flags.length > 0 && (
        <div>
          <p className="text-xs text-cortex-muted mb-2">Regulatory Flags</p>
          <div className="space-y-1">
            {data.regulatory_flags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="text-amber-400 mt-0.5">⚑</span>
                <span className="text-cortex-text">{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Underwriting */}
      <div className="p-3 bg-cortex-bg rounded-lg">
        <p className="text-xs text-cortex-muted mb-1 font-semibold">Underwriting Posture</p>
        <p className="text-sm text-white capitalize mb-1">{data.underwriting_risk.new_business_risk}</p>
        <p className="text-xs text-cortex-text">{data.underwriting_risk.recommended_action}</p>
      </div>
    </div>
  );
}
