/**
 * OrchestratorSummaryPanel — Top-level orchestrator state display.
 *
 * Shows: state, mode, focus, dominant risk, confidence, timestamp.
 * This is the "brain readout" — one glance tells you what the system is doing.
 */

import { Activity, Brain, AlertTriangle, Eye, Crosshair, ShieldAlert } from "lucide-react";
import type { OrchestratorOutput } from "@/orchestrator/orchestrator.types";

interface Props {
  output: OrchestratorOutput | null;
}

const MODE_CONFIG = {
  monitor: { icon: Eye, label: "Monitor", color: "text-neutral-400", bg: "bg-neutral-400/8" },
  analysis: { icon: Brain, label: "Analysis", color: "text-blue-400", bg: "bg-blue-400/8" },
  decision: { icon: Crosshair, label: "Decision", color: "text-amber-400", bg: "bg-amber-400/8" },
  escalation: { icon: ShieldAlert, label: "Escalation", color: "text-red-400", bg: "bg-red-400/8" },
};

const STATE_CONFIG = {
  standby: { label: "Standby", dot: "bg-neutral-500" },
  active: { label: "Active", dot: "bg-emerald-400 pulse-dot" },
  processing: { label: "Processing", dot: "bg-blue-400 pulse-dot" },
  escalated: { label: "Escalated", dot: "bg-red-400 pulse-dot" },
};

export default function OrchestratorSummaryPanel({ output }: Props) {
  if (!output) {
    return (
      <div className="orchestrator-summary-panel">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-neutral-600" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
            Orchestrator
          </span>
        </div>
        <p className="text-[11px] text-neutral-600 mt-1">Awaiting analysis data</p>
      </div>
    );
  }

  const modeConf = MODE_CONFIG[output.active_decision_mode];
  const stateConf = STATE_CONFIG[output.orchestrator_state];
  const ModeIcon = modeConf.icon;
  const confidencePct = Math.round(output.confidence_score * 100);

  return (
    <div className="orchestrator-summary-panel">
      {/* Row 1: State + Mode + Confidence */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* State dot */}
          <div className="flex items-center gap-1.5">
            <div className={`w-[6px] h-[6px] rounded-full ${stateConf.dot}`} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
              {stateConf.label}
            </span>
          </div>

          {/* Mode badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${modeConf.bg} border border-white/[0.04]`}>
            <ModeIcon size={12} className={modeConf.color} />
            <span className={`text-[11px] font-semibold ${modeConf.color}`}>
              {modeConf.label}
            </span>
          </div>
        </div>

        {/* Confidence */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500/60 transition-all duration-700"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-500">{confidencePct}%</span>
        </div>
      </div>

      {/* Row 2: Focus + Risk */}
      <div className="mt-2.5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-0.5">Focus</p>
          <p className="text-[12px] text-neutral-300 leading-snug truncate">
            {output.primary_focus}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] uppercase tracking-wider text-neutral-600 mb-0.5">Dominant Risk</p>
          <p className="text-[12px] text-amber-400/90 font-medium">
            {output.dominant_risk}
          </p>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-2 text-[9px] text-neutral-700 text-right font-mono">
        {new Date(output.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
}
