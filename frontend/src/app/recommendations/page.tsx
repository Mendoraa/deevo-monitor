"use client";

import { MOCK_RECOMMENDATIONS, MOCK_SCORES } from "@/lib/mock-data";
import RiskBadge from "@/components/ui/RiskBadge";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  ShieldAlert,
} from "lucide-react";

const PRIORITY_ORDER = ["critical", "high", "medium", "low"] as const;

const ACTION_ICONS: Record<string, React.ReactNode> = {
  underwriting_tighten: <ShieldAlert className="w-4 h-4" />,
  executive_escalation: <AlertTriangle className="w-4 h-4" />,
  reserve_review: <Clock className="w-4 h-4" />,
  pricing_adjustment: <Filter className="w-4 h-4" />,
};

// Full rules summary (12 rules)
const ALL_RULES = [
  { id: "R01", name: "Claims + UW Combined Stress", condition: "claims_pressure > 55 AND underwriting_risk > 60", status: "triggered" },
  { id: "R02", name: "Fraud Critical Alert", condition: "fraud_exposure > 75", status: "inactive" },
  { id: "R03", name: "Executive Escalation", condition: "market_stress > 70 AND portfolio_stability < 45", status: "triggered" },
  { id: "R04", name: "Reinsurance Review", condition: "claims_pressure > 70", status: "inactive" },
  { id: "R05", name: "Reserve Adequacy Review", condition: "claims_pressure > 50 AND trend == up", status: "triggered" },
  { id: "R06", name: "Fraud Investigation Sweep", condition: "fraud_exposure > 60", status: "inactive" },
  { id: "R07", name: "Portfolio Rebalance", condition: "portfolio_stability < 35", status: "inactive" },
  { id: "R08", name: "Pricing Model Adjustment", condition: "underwriting_risk > 55", status: "triggered" },
  { id: "R09", name: "Claims Process Acceleration", condition: "claims_pressure > 65", status: "inactive" },
  { id: "R10", name: "Risk Appetite Review", condition: "market_stress > 75 AND fraud_exposure > 50", status: "inactive" },
  { id: "R11", name: "All Clear Signal", condition: "ALL scores < 40", status: "inactive" },
  { id: "R12", name: "War Room Activation", condition: "3+ scores in critical", status: "inactive" },
];

export default function Recommendations() {
  const recommendations = MOCK_RECOMMENDATIONS;
  const scores = MOCK_SCORES;

  const activeCount = recommendations.length;
  const criticalCount = recommendations.filter((r) => r.priority === "critical").length;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="panel">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">Total Rules</div>
          <div className="text-2xl font-bold text-white">12</div>
        </div>
        <div className="panel severity-high">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">Active</div>
          <div className="text-2xl font-bold text-orange-400">{activeCount}</div>
        </div>
        <div className="panel severity-critical">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
        </div>
        <div className="panel">
          <div className="text-[10px] text-cortex-muted uppercase tracking-wider mb-1">Inactive</div>
          <div className="text-2xl font-bold text-cortex-green">{12 - activeCount}</div>
        </div>
      </div>

      {/* Active Recommendations (detailed) */}
      <div className="panel">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-4">
          Active Recommendations — Sorted by Priority
        </h3>
        <div className="space-y-3">
          {[...recommendations]
            .sort(
              (a, b) =>
                PRIORITY_ORDER.indexOf(a.priority) -
                PRIORITY_ORDER.indexOf(b.priority)
            )
            .map((rec, idx) => (
              <div
                key={rec.rule_id}
                className={`panel panel-hover severity-${rec.priority}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-cortex-muted">
                    {ACTION_ICONS[rec.action_type] || (
                      <CheckCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-cortex-muted bg-cortex-bg px-1.5 py-0.5 rounded">
                        {rec.rule_id}
                      </span>
                      <RiskBadge level={rec.priority} />
                      <span className="text-[10px] text-cortex-muted">
                        {rec.action_type.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mb-1.5">
                      {rec.title}
                    </h4>
                    <p className="text-xs text-cortex-muted leading-relaxed mb-3">
                      {rec.rationale}
                    </p>

                    {/* Affected Scores */}
                    <div className="flex flex-wrap gap-2">
                      {rec.affected_scores.map((scoreKey) => {
                        const score = scores.find((s) => s.key === scoreKey);
                        return (
                          <div
                            key={scoreKey}
                            className="flex items-center gap-1.5 px-2 py-1 rounded bg-cortex-bg border border-cortex-border"
                          >
                            <span className="text-[10px] text-cortex-text">
                              {score?.label || scoreKey.replace(/_/g, " ")}
                            </span>
                            <span className="text-[10px] font-bold text-white">
                              {score?.value || "—"}
                            </span>
                            {score && <RiskBadge level={score.risk_level} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-cortex-muted">Priority</div>
                    <div className="text-lg font-bold text-white">#{idx + 1}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Full Rules Registry */}
      <div className="panel">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-4">
          Rules Registry — All 12 Rules
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-cortex-border">
                <th className="text-left py-2 px-3 text-cortex-muted font-medium">Rule ID</th>
                <th className="text-left py-2 px-3 text-cortex-muted font-medium">Name</th>
                <th className="text-left py-2 px-3 text-cortex-muted font-medium">Condition</th>
                <th className="text-center py-2 px-3 text-cortex-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ALL_RULES.map((rule) => (
                <tr
                  key={rule.id}
                  className="border-b border-cortex-border/50 hover:bg-cortex-border/10"
                >
                  <td className="py-2 px-3 font-mono text-cortex-muted">{rule.id}</td>
                  <td className="py-2 px-3 text-white">{rule.name}</td>
                  <td className="py-2 px-3 font-mono text-cortex-muted text-[10px]">
                    {rule.condition}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {rule.status === "triggered" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 pulse-dot" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-cortex-muted">Inactive</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
