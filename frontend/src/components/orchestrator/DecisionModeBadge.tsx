/**
 * DecisionModeBadge — Compact orchestrator-driven mode indicator.
 *
 * Smaller than the full toggle. Shows what mode the orchestrator
 * selected and why, with a brief rationale tooltip-style line.
 */

import { Eye, Brain, Crosshair, ShieldAlert } from "lucide-react";
import type { DecisionMode } from "@/orchestrator/orchestrator.types";

interface Props {
  mode: DecisionMode;
  rationale?: string;
  isOrchestrated?: boolean;
}

const CONFIG = {
  monitor: {
    icon: Eye,
    label: "Monitor",
    color: "text-neutral-400",
    border: "border-neutral-700",
    glow: "",
  },
  analysis: {
    icon: Brain,
    label: "Analysis",
    color: "text-blue-400",
    border: "border-blue-900/40",
    glow: "shadow-[0_0_8px_rgba(59,130,246,0.08)]",
  },
  decision: {
    icon: Crosshair,
    label: "Decision",
    color: "text-amber-400",
    border: "border-amber-900/40",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.08)]",
  },
  escalation: {
    icon: ShieldAlert,
    label: "Escalation",
    color: "text-red-400",
    border: "border-red-900/40",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.12)]",
  },
};

export default function DecisionModeBadge({ mode, rationale, isOrchestrated = true }: Props) {
  const conf = CONFIG[mode];
  const Icon = conf.icon;

  return (
    <div className={`decision-mode-badge ${conf.border} ${conf.glow}`}>
      <div className="flex items-center gap-2">
        <Icon size={13} className={conf.color} />
        <span className={`text-[11px] font-semibold ${conf.color}`}>{conf.label}</span>
        {isOrchestrated && (
          <span className="text-[8px] uppercase tracking-widest text-neutral-700 ml-1">
            auto
          </span>
        )}
      </div>
      {rationale && (
        <p className="text-[10px] text-neutral-600 mt-1 leading-snug">{rationale}</p>
      )}
    </div>
  );
}
