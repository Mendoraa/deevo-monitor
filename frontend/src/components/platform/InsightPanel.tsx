"use client";

import { Brain, AlertTriangle, TrendingUp, Shield, Zap, ChevronRight } from "lucide-react";
import { evaluateAllAgents, CURRENT_SIGNALS } from "@/lib/agentEngine";

const AI_INSIGHTS = [
  {
    id: "INS-001",
    severity: "critical" as const,
    title: "Hormuz Tension → Motor Claims Cascade",
    body: "Strait of Hormuz tension index at 78/100. Historical analog: 2019 tanker crisis led to 14% repair cost inflation within 60 days. Motor severity exposure: KWD 2.3M portfolio at risk.",
    confidence: 0.87,
    sectors: ["Motor", "Marine", "Logistics"],
    timestamp: "2m ago",
  },
  {
    id: "INS-002",
    severity: "high" as const,
    title: "Kuwait Fraud Cluster Expanding",
    body: "SIU network analysis: 3 workshop clusters in Hawally/Salmiya showing coordinated billing patterns. 23 claims flagged. Estimated leakage: KWD 185K.",
    confidence: 0.82,
    sectors: ["Motor", "Fraud"],
    timestamp: "8m ago",
  },
  {
    id: "INS-003",
    severity: "medium" as const,
    title: "Oil Price Transmission to Claims",
    body: "Brent at $89.5 — correlation coefficient 0.78 with motor repair costs. Expected pass-through to workshop pricing within 45 days.",
    confidence: 0.75,
    sectors: ["Motor", "Economic"],
    timestamp: "15m ago",
  },
  {
    id: "INS-004",
    severity: "low" as const,
    title: "UAE Portfolio Stability Confirmed",
    body: "UAE DRI at 38. No material triggers detected. LNG revenue buffer insulating from regional volatility. Maintain current posture.",
    confidence: 0.91,
    sectors: ["Portfolio", "Regional"],
    timestamp: "22m ago",
  },
];

const SEV_COLORS: Record<string, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#10b981",
};

const SEV_ICONS: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  high: Zap,
  medium: TrendingUp,
  low: Shield,
};

export default function InsightPanel() {
  // Run agent engine for live stress data
  const agentResults = evaluateAllAgents(CURRENT_SIGNALS);
  const panicCount = agentResults.filter((a) => a.stressState === "panic").length;
  const stressedCount = agentResults.filter((a) => a.stressState === "stressed").length;

  return (
    <div
      className="absolute right-0 top-[38px] bottom-[52px] z-30 flex flex-col"
      style={{
        width: "280px",
        background: "rgba(7, 10, 18, 0.92)",
        borderLeft: "1px solid var(--cx-border)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center gap-2"
        style={{ borderBottom: "1px solid var(--cx-border)" }}
      >
        <Brain className="w-3 h-3 text-purple-400" />
        <span className="text-[9px] font-bold text-bright tracking-[0.1em] uppercase">
          AI Intelligence
        </span>
      </div>

      {/* Agent stress summary */}
      <div
        className="px-3 py-2 flex items-center gap-3"
        style={{
          borderBottom: "1px solid var(--cx-border)",
          background: "rgba(0,0,0,0.2)",
        }}
      >
        <span className="text-[8px] text-muted">AGENTS:</span>
        {panicCount > 0 && (
          <span className="text-[8px] font-bold text-red-400">
            {panicCount} PANIC
          </span>
        )}
        {stressedCount > 0 && (
          <span className="text-[8px] font-bold text-amber-400">
            {stressedCount} STRESSED
          </span>
        )}
        {panicCount === 0 && stressedCount === 0 && (
          <span className="text-[8px] font-bold text-emerald-400">ALL NORMAL</span>
        )}
        <span className="text-[8px] text-muted ml-auto font-mono">
          {agentResults.length} active
        </span>
      </div>

      {/* Insights */}
      <div className="flex-1 overflow-y-auto">
        {AI_INSIGHTS.map((insight) => {
          const color = SEV_COLORS[insight.severity];
          const Icon = SEV_ICONS[insight.severity];
          return (
            <div
              key={insight.id}
              className="px-3 py-2.5 border-b transition-colors hover:bg-white/[0.015] cursor-pointer"
              style={{ borderColor: "var(--cx-border)" }}
            >
              <div className="flex items-start gap-2 mb-1.5">
                <Icon
                  className="w-3 h-3 flex-shrink-0 mt-0.5"
                  style={{ color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold text-bright leading-tight">
                      {insight.title}
                    </span>
                  </div>
                  <p className="text-[8px] text-muted leading-relaxed">
                    {insight.body}
                  </p>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-2 ml-5">
                {/* Confidence bar */}
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[7px] text-dim">CONF</span>
                  <div className="conf-bar flex-1" style={{ maxWidth: "60px" }}>
                    <div
                      className="conf-bar-fill"
                      style={{
                        width: `${insight.confidence * 100}%`,
                        background: color,
                      }}
                    />
                  </div>
                  <span className="text-[8px] font-bold text-mono" style={{ color }}>
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
                <span className="text-[7px] text-dim">{insight.timestamp}</span>
              </div>

              {/* Sector tags */}
              <div className="flex items-center gap-1 mt-1.5 ml-5">
                {insight.sectors.map((s) => (
                  <span
                    key={s}
                    className="text-[7px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      background: "rgba(59,130,246,0.08)",
                      color: "#60a5fa",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agent Detail Preview */}
      <div
        className="px-3 py-2"
        style={{ borderTop: "1px solid var(--cx-border)", background: "rgba(0,0,0,0.15)" }}
      >
        <span className="text-[8px] text-dim tracking-wide uppercase">
          Active Agents
        </span>
        <div className="flex items-center gap-2 mt-1">
          {agentResults.slice(0, 4).map((agent) => (
            <div key={agent.agentId} className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    agent.stressState === "panic"
                      ? "#ef4444"
                      : agent.stressState === "stressed"
                      ? "#f59e0b"
                      : "#10b981",
                }}
              />
              <span className="text-[7px] text-muted capitalize">
                {agent.agentId.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
