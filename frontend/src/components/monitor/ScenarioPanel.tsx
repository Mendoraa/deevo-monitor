"use client";

import { useMemo } from "react";
import {
  Zap, Clock, TrendingUp, TrendingDown, Minus,
  AlertTriangle, Shield, ChevronRight, Activity,
} from "lucide-react";
import { useMonitorMode } from "@/lib/monitorMode";
import { evaluateScenarios, type ScenarioEvaluation } from "@/lib/scenarioEngine";

const BRANCH_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  base: {
    bg: "rgba(16,185,129,0.04)",
    border: "rgba(16,185,129,0.15)",
    text: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-300",
  },
  elevated: {
    bg: "rgba(245,158,11,0.04)",
    border: "rgba(245,158,11,0.15)",
    text: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-300",
  },
  severe: {
    bg: "rgba(239,68,68,0.04)",
    border: "rgba(239,68,68,0.15)",
    text: "text-red-400",
    badge: "bg-red-500/20 text-red-300",
  },
};

const TIME_COLORS: Record<string, string> = {
  "24h": "text-red-400",
  "7d": "text-amber-400",
  "30d": "text-blue-400",
  "90d": "text-neutral-400",
};

function ScenarioCard({ evaluation }: { evaluation: ScenarioEvaluation }) {
  const { scenario, agentReactions, aggregateRisk, proximityScore, triggeredCount, totalTriggers } = evaluation;
  const colors = BRANCH_COLORS[scenario.branch] || BRANCH_COLORS.base;

  return (
    <div
      className="rounded-lg p-4 transition-all duration-200 hover:translate-y-[-1px]"
      style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${colors.badge}`}>
            {scenario.branch}
          </span>
          <span className="text-xs font-semibold text-white">{scenario.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Clock className={`w-3 h-3 ${TIME_COLORS[scenario.timeHorizon]}`} />
            <span className={`text-[10px] font-medium ${TIME_COLORS[scenario.timeHorizon]}`}>
              {scenario.timeHorizon}
            </span>
          </div>
          <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
            {(scenario.probability * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <p className="text-[10px] text-neutral-500 leading-relaxed mb-3">
        {scenario.description}
      </p>

      {/* Proximity / Triggers */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[8px] text-neutral-600 uppercase tracking-wider">Proximity</span>
        <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              proximityScore >= 80 ? "bg-red-500" :
              proximityScore >= 50 ? "bg-amber-500" :
              "bg-emerald-500"
            }`}
            style={{ width: `${proximityScore}%` }}
          />
        </div>
        <span className="text-[9px] text-neutral-500 tabular-nums">
          {triggeredCount}/{totalTriggers} triggers
        </span>
      </div>

      {/* Triggers */}
      <div className="space-y-1 mb-3">
        {scenario.triggers.map((trigger, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${trigger.triggered ? "bg-red-500" : "bg-neutral-700"}`} />
            <span className={`text-[9px] ${trigger.triggered ? "text-neutral-300" : "text-neutral-600"}`}>
              {trigger.condition}
            </span>
            <span className="text-[8px] text-neutral-700 ml-auto tabular-nums">
              {trigger.currentValue} / {trigger.threshold}
            </span>
          </div>
        ))}
      </div>

      {/* Impacts */}
      <div className="space-y-1 mb-3">
        <span className="text-[8px] text-neutral-600 uppercase tracking-wider">Impact Vector</span>
        {scenario.impacts.slice(0, 4).map((impact, idx) => {
          const DirIcon = impact.direction === "up" ? TrendingUp : impact.direction === "down" ? TrendingDown : Minus;
          const dirColor = impact.direction === "up" ? "text-red-400" : impact.direction === "down" ? "text-emerald-400" : "text-neutral-500";
          return (
            <div key={idx} className="flex items-center gap-2">
              <DirIcon className={`w-2.5 h-2.5 ${dirColor}`} />
              <span className="text-[9px] text-neutral-500 flex-1">{impact.dimension}</span>
              <span className={`text-[9px] font-medium tabular-nums ${dirColor}`}>{impact.magnitude}</span>
            </div>
          );
        })}
      </div>

      {/* Agent Reactions Summary */}
      <div className="pt-2" style={{ borderTop: `1px solid ${colors.border}` }}>
        <span className="text-[8px] text-neutral-600 uppercase tracking-wider">Agent Reactions</span>
        <div className="mt-1 space-y-0.5">
          {agentReactions.slice(0, 3).map((ar) => {
            const arColor = ar.riskDelta > 10 ? "text-red-400" : ar.riskDelta > 0 ? "text-amber-400" : "text-emerald-400";
            return (
              <div key={ar.agentId} className="flex items-center gap-1.5">
                <span className="text-[8px] text-neutral-500 w-16 capitalize truncate">{ar.agentId.replace("_", " ")}</span>
                <ChevronRight className="w-2 h-2 text-neutral-700" />
                <span className="text-[8px] text-neutral-500 flex-1 truncate">{ar.reaction.slice(0, 60)}...</span>
                <span className={`text-[8px] font-medium tabular-nums ${arColor}`}>
                  +{ar.riskDelta}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Risk */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Shield className={`w-3 h-3 ${colors.text}`} />
          <span className="text-[8px] text-neutral-600">Aggregate Risk</span>
        </div>
        <span className={`text-sm font-bold tabular-nums ${colors.text}`}>
          {aggregateRisk}/100
        </span>
      </div>
    </div>
  );
}

export default function ScenarioPanel() {
  const { mode } = useMonitorMode();
  const evaluations = useMemo(() => evaluateScenarios(), []);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-amber-500 rounded-full" />
          <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
            Scenario Intelligence Engine
          </h3>
          <span className="text-[9px] text-neutral-700">
            Base / Elevated / Severe branching
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.12)" }}>
          <Activity className="w-3 h-3 text-amber-400" />
          <span className="text-[9px] text-amber-300 font-medium">
            {evaluations.filter((e) => e.proximityScore > 0).length} active branches
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {evaluations.map((evaluation) => (
          <ScenarioCard key={evaluation.scenario.id} evaluation={evaluation} />
        ))}
      </div>
    </section>
  );
}
