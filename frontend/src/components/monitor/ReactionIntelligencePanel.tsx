"use client";

import { useMemo } from "react";
import {
  TrendingUp, TrendingDown, Minus, Brain, ShieldAlert,
  Building, User, Search, AlertTriangle, ChevronRight, Zap,
} from "lucide-react";
import { useMonitorMode } from "@/lib/monitorMode";
import {
  evaluateAllAgents,
  CURRENT_SIGNALS,
  type AgentReactionOutput,
  type AgentId,
} from "@/lib/agentEngine";

// ─── Icon + Style Maps ────────────────────────────────────────
const AGENT_ICONS: Record<AgentId, typeof TrendingUp> = {
  investor: TrendingUp,
  regulator: Building,
  risk_manager: ShieldAlert,
  consumer: User,
  fraud_actor: Search,
};

const AGENT_ACCENTS: Record<AgentId, { bg: string; border: string; text: string }> = {
  investor: { bg: "rgba(16,185,129,0.05)", border: "rgba(16,185,129,0.15)", text: "text-emerald-400" },
  regulator: { bg: "rgba(59,130,246,0.05)", border: "rgba(59,130,246,0.15)", text: "text-blue-400" },
  risk_manager: { bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.15)", text: "text-red-400" },
  consumer: { bg: "rgba(6,182,212,0.05)", border: "rgba(6,182,212,0.15)", text: "text-cyan-400" },
  fraud_actor: { bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.15)", text: "text-amber-400" },
};

const STRESS_COLORS: Record<string, string> = {
  normal: "text-emerald-400",
  stressed: "text-amber-400",
  panic: "text-red-400",
};

function AgentCard({ agent }: { agent: AgentReactionOutput }) {
  const Icon = AGENT_ICONS[agent.agentId] || AlertTriangle;
  const accent = AGENT_ACCENTS[agent.agentId];
  const impactColor = agent.riskContribution > 0 ? "text-red-400" : agent.riskContribution < 0 ? "text-emerald-400" : "text-neutral-500";
  const ImpactIcon = agent.riskContribution > 0 ? TrendingUp : agent.riskContribution < 0 ? TrendingDown : Minus;

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200 hover:translate-y-[-1px]"
      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${accent.text}`} />
          <div>
            <span className="text-xs font-semibold text-white">{agent.identity.label}</span>
            <span className="text-[9px] text-neutral-600 ml-1.5" dir="rtl">{agent.identity.labelAr}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-medium uppercase ${STRESS_COLORS[agent.stressState]}`}>
            {agent.stressState}
          </span>
          <div className="flex items-center gap-0.5">
            <ImpactIcon className={`w-3 h-3 ${impactColor}`} />
            <span className={`text-[10px] font-bold tabular-nums ${impactColor}`}>
              {agent.riskContribution > 0 ? "+" : ""}{agent.riskContribution}%
            </span>
          </div>
        </div>
      </div>

      {/* Stress meter */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[8px] text-neutral-600 w-10">Stress</span>
        <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              agent.currentStressLevel >= 80 ? "bg-red-500" :
              agent.currentStressLevel >= 50 ? "bg-amber-500" :
              "bg-emerald-500"
            }`}
            style={{ width: `${agent.currentStressLevel}%` }}
          />
        </div>
        <span className="text-[9px] text-neutral-500 tabular-nums w-6 text-right">
          {agent.currentStressLevel}
        </span>
      </div>

      {/* Active reaction */}
      <p className="text-[10px] text-neutral-400 leading-relaxed mb-2">
        {agent.activeReaction}
      </p>

      {/* Triggered rules */}
      {agent.triggeredRules.length > 0 && (
        <div className="space-y-1 mb-2">
          {agent.triggeredRules.slice(0, 3).map((rule, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[9px] text-amber-300/70">{rule.action}</span>
            </div>
          ))}
        </div>
      )}

      {/* Scenario preview */}
      <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${accent.border}` }}>
        <span className="text-[8px] text-neutral-600 uppercase tracking-wider">Scenario Reactions</span>
        <div className="flex gap-2 mt-1">
          {(["base", "elevated", "severe"] as const).map((branch) => {
            const sr = agent.scenarioReactions[branch];
            const branchColor = branch === "severe" ? "text-red-400" : branch === "elevated" ? "text-amber-400" : "text-emerald-400";
            return (
              <div key={branch} className="flex items-center gap-0.5">
                <span className={`text-[8px] font-medium ${branchColor}`}>{branch}</span>
                <span className={`text-[8px] tabular-nums ${branchColor}`}>
                  {sr.riskDelta > 0 ? "+" : ""}{sr.riskDelta}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-1 mt-1.5">
        <span className="text-[8px] text-neutral-700">Confidence</span>
        <div className="flex-1 h-0.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-neutral-500/50"
            style={{ width: `${agent.confidence * 100}%` }}
          />
        </div>
        <span className="text-[8px] text-neutral-600 tabular-nums">
          {(agent.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

export default function ReactionIntelligencePanel() {
  const { mode } = useMonitorMode();

  // Evaluate all agents against current signals
  const agentResults = useMemo(() => evaluateAllAgents(CURRENT_SIGNALS), []);

  if (mode === "economic") return null;

  const visibleAgents = mode === "global"
    ? agentResults.slice(0, 3)
    : agentResults;

  const totalRiskContribution = agentResults.reduce((sum, a) => sum + a.riskContribution, 0);
  const panicAgents = agentResults.filter((a) => a.stressState === "panic").length;
  const stressedAgents = agentResults.filter((a) => a.stressState === "stressed").length;

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-red-500 rounded-full" />
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
            Reaction Intelligence Layer
          </h3>
          <span className="text-[9px] text-neutral-700">
            {agentResults.length} agents · {agentResults.reduce((s, a) => s + a.triggeredRules.length, 0)} rules triggered
          </span>
        </div>
        <div className="flex items-center gap-3">
          {panicAgents > 0 && (
            <span className="text-[9px] text-red-400 font-medium">{panicAgents} panic</span>
          )}
          {stressedAgents > 0 && (
            <span className="text-[9px] text-amber-400 font-medium">{stressedAgents} stressed</span>
          )}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md"
            style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}>
            <Brain className="w-3 h-3 text-purple-400" />
            <span className="text-[9px] text-purple-300 font-medium">
              Net Impact: {totalRiskContribution > 0 ? "+" : ""}{totalRiskContribution}%
            </span>
          </div>
        </div>
      </div>

      <div className={`grid gap-3 ${
        visibleAgents.length <= 3 ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
      }`}>
        {visibleAgents.map((agent) => (
          <AgentCard key={agent.agentId} agent={agent} />
        ))}
      </div>
    </section>
  );
}
