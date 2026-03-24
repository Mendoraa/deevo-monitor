"use client";

import type { AgentOutput } from "@/types/economic-layer";

interface Props {
  agents: AgentOutput[];
}

const AGENT_ICONS: Record<string, string> = {
  OilMarketAgent: "⛽",
  ShippingLogisticsAgent: "🚢",
  InsuranceRiskAgent: "🛡️",
  BankingLiquidityAgent: "🏦",
  GCCFiscalAgent: "🏛️",
};

export default function AgentTracePanel({ agents }: Props) {
  return (
    <div className="panel">
      <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider mb-1">
        Agent Trace
      </h3>
      <p className="text-xs text-cortex-muted mb-3">
        Individual agent assessments — audit trail
      </p>
      <div className="space-y-2">
        {agents.map((agent) => (
          <details key={agent.agent_name} className="group">
            <summary className="flex items-center justify-between p-2 bg-cortex-bg rounded-lg cursor-pointer hover:bg-cortex-border/30 transition-colors">
              <div className="flex items-center gap-2">
                <span>{AGENT_ICONS[agent.agent_name] || "🤖"}</span>
                <span className="text-sm text-white">{agent.agent_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 text-xs rounded font-medium
                  badge-${agent.impact_direction}`}>
                  {agent.impact_direction.toUpperCase()}
                </span>
                <span className="text-xs text-cortex-muted">
                  {(agent.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </summary>
            <div className="mt-1 ml-8 p-2 space-y-1">
              {agent.rationale.map((r, i) => (
                <p key={i} className="text-xs text-cortex-text">• {r}</p>
              ))}
              {agent.range_estimate && (
                <p className="text-xs text-cortex-muted mt-1">
                  Range: <span className="text-cortex-text">{agent.range_estimate}</span>
                </p>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
