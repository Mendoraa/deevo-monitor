"use client";

import { Brain, AlertTriangle, Info, ShieldAlert, TrendingUp } from "lucide-react";
import { INTELLIGENCE_INSIGHTS, type IntelligenceInsight } from "@/lib/gcc-signals";

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: typeof AlertTriangle; iconColor: string }> = {
  critical: {
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.2)",
    icon: ShieldAlert,
    iconColor: "text-red-400",
  },
  warning: {
    bg: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.2)",
    icon: AlertTriangle,
    iconColor: "text-amber-400",
  },
  info: {
    bg: "rgba(59,130,246,0.06)",
    border: "rgba(59,130,246,0.2)",
    icon: Info,
    iconColor: "text-blue-400",
  },
};

function InsightCard({ insight }: { insight: IntelligenceInsight }) {
  const style = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;
  const Icon = style.icon;

  return (
    <div
      className="rounded-lg p-4 transition-all duration-300 hover:translate-y-[-1px]"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className={`w-4 h-4 ${style.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-xs font-semibold text-white truncate">{insight.title}</h4>
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider ml-2 flex-shrink-0">
              {insight.category}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed mb-2">
            {insight.description}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-neutral-600">Confidence</span>
              <span className="text-[10px] font-medium text-neutral-300 tabular-nums">
                {(insight.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-neutral-600">Signals</span>
              <span className="text-[10px] font-medium text-neutral-300">
                {insight.affected_signals.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntelligenceOverlay() {
  const insights = INTELLIGENCE_INSIGHTS;
  const criticalCount = insights.filter((i) => i.severity === "critical").length;

  return (
    <section className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)" }}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">AI Intelligence Overlay</h3>
            <p className="text-[9px] text-neutral-600">
              {insights.length} insights · {criticalCount} critical
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md"
          style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
          <TrendingUp className="w-3 h-3 text-purple-400" />
          <span className="text-[10px] text-purple-300 font-medium">Live Analysis</span>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  );
}
