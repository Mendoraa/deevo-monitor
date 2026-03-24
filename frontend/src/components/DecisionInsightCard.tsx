"use client";

interface Props {
  insight: string;
}

export default function DecisionInsightCard({ insight }: Props) {
  const isElevated = insight.startsWith("ELEVATED ALERT");

  return (
    <div className={`panel ${isElevated ? "severity-high" : "severity-moderate"}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${isElevated ? "bg-cortex-red pulse-dot" : "bg-cortex-amber"}`} />
        <h3 className="text-xs font-semibold text-cortex-muted uppercase tracking-wider">
          Decision Insight
        </h3>
      </div>
      <p className="text-sm text-white leading-relaxed">{insight}</p>
      <div className="mt-3 pt-3 border-t border-cortex-border">
        <p className="text-xs text-cortex-muted">
          Actionable intelligence — monitor indicators within the specified window.
          This analysis is deterministic and audit-traceable.
        </p>
      </div>
    </div>
  );
}
