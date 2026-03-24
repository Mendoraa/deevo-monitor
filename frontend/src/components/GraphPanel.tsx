"use client";

import type { GraphPropagationResult } from "@/types/graph";

interface Props {
  data: GraphPropagationResult;
}

const STATE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  critical: { bg: "bg-red-500/15", text: "text-red-400", dot: "bg-red-500" },
  disrupted: { bg: "bg-amber-500/15", text: "text-amber-400", dot: "bg-amber-500" },
  stressed: { bg: "bg-blue-500/15", text: "text-blue-400", dot: "bg-blue-500" },
  stable: { bg: "bg-green-500/10", text: "text-green-400", dot: "bg-green-500" },
};

const NODE_ICONS: Record<string, string> = {
  event: "⚡",
  infrastructure: "🏗️",
  commodity: "🛢️",
  sector: "🏢",
  metric: "📊",
  country: "🌍",
};

const RELATION_COLORS: Record<string, string> = {
  affects: "text-blue-400",
  delays: "text-amber-400",
  reprices: "text-red-400",
  constrains: "text-orange-400",
  amplifies: "text-red-500",
  hedges: "text-green-400",
  exports_to: "text-cyan-400",
  exposed_to: "text-purple-400",
};

export default function GraphPanel({ data }: Props) {
  const impactedNodes = data.nodes
    .filter((n) => n.impact_score > 0.05)
    .sort((a, b) => b.impact_score - a.impact_score);

  const riskColor = data.systemic_risk_score > 0.6
    ? "text-red-400"
    : data.systemic_risk_score > 0.3
      ? "text-amber-400"
      : "text-green-400";

  return (
    <div className="panel space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
          Economic Graph
        </h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-cortex-muted">
            Systemic Risk:
          </span>
          <span className={`font-bold ${riskColor}`}>
            {(data.systemic_risk_score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Graph Stats */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Nodes Hit", value: impactedNodes.length, color: "text-blue-400" },
          { label: "Prop Steps", value: data.total_steps, color: "text-amber-400" },
          { label: "Max Depth", value: data.max_depth_reached, color: "text-purple-400" },
          { label: "Critical", value: impactedNodes.filter(n => n.current_state === "critical").length, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="p-2 bg-cortex-bg rounded-lg text-center">
            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-cortex-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Critical Path */}
      {data.critical_path.length > 0 && (
        <div className="p-3 bg-cortex-bg rounded-lg">
          <p className="text-xs text-cortex-muted mb-2 font-semibold">Critical Path</p>
          <div className="flex flex-wrap items-center gap-1">
            {data.critical_path.slice(0, 8).map((nodeId, i) => {
              const node = data.nodes.find((n) => n.node_id === nodeId);
              const state = STATE_COLORS[node?.current_state || "stable"];
              return (
                <span key={nodeId} className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 text-xs rounded ${state.bg} ${state.text}`}>
                    {node?.label || nodeId}
                  </span>
                  {i < Math.min(data.critical_path.length, 8) - 1 && (
                    <span className="text-cortex-muted text-xs">→</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Propagation Trace */}
      <div>
        <p className="text-xs text-cortex-muted mb-2">Propagation Trace</p>
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {data.propagation_trace.slice(0, 12).map((step) => {
            const relColor = RELATION_COLORS[step.relation] || "text-cortex-muted";
            const stateStyle = STATE_COLORS[step.resulting_state] || STATE_COLORS.stable;
            return (
              <div key={step.step} className="flex items-start gap-2 text-xs p-2 bg-cortex-bg rounded">
                <span className="text-cortex-muted font-mono w-5 shrink-0 text-right">
                  {step.step}.
                </span>
                <div className="flex-1">
                  <span className="text-cortex-text">{step.explanation}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={relColor}>{step.relation}</span>
                    <span className={`px-1.5 py-0 rounded ${stateStyle.bg} ${stateStyle.text}`}>
                      {step.resulting_state}
                    </span>
                    <span className="text-cortex-muted">
                      impact: {(step.impact_transmitted * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Impacted Nodes */}
      <div>
        <p className="text-xs text-cortex-muted mb-2">Impacted Nodes</p>
        <div className="grid grid-cols-2 gap-1.5">
          {impactedNodes.slice(0, 10).map((node) => {
            const style = STATE_COLORS[node.current_state] || STATE_COLORS.stable;
            const icon = NODE_ICONS[node.node_type] || "🔵";
            return (
              <div key={node.node_id} className={`flex items-center gap-2 p-2 rounded ${style.bg}`}>
                <span className="text-sm">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate">{node.label}</div>
                  <div className="text-xs text-cortex-muted">
                    {(node.impact_score * 100).toFixed(0)}%
                  </div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
