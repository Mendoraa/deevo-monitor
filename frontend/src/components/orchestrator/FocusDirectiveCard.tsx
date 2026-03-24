/**
 * FocusDirectiveCard — The single most important thing the system
 * wants the user to focus on right now.
 *
 * One card. One directive. One action.
 * This is the "if you only read one thing" component.
 */

import { Target, ArrowRight } from "lucide-react";
import type { OrchestratorOutput } from "@/orchestrator/orchestrator.types";

interface Props {
  output: OrchestratorOutput | null;
  onAccept?: () => void;
  onDismiss?: () => void;
}

const URGENCY_ACCENT = {
  low: { border: "border-l-neutral-600", bg: "bg-neutral-500/4" },
  moderate: { border: "border-l-blue-500", bg: "bg-blue-500/4" },
  elevated: { border: "border-l-amber-500", bg: "bg-amber-500/4" },
  critical: { border: "border-l-red-500", bg: "bg-red-500/6" },
};

export default function FocusDirectiveCard({ output, onAccept, onDismiss }: Props) {
  if (!output) return null;
  if (output.orchestrator_state === "standby") return null;

  const action = output.recommended_action;
  const accent = URGENCY_ACCENT[action.urgency_level];

  return (
    <div className={`focus-directive-card border-l-[3px] ${accent.border} ${accent.bg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Target size={12} className="text-neutral-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Focus Directive
          </span>
        </div>
        <span className={`text-[10px] font-mono ${
          action.priority === "critical" ? "text-red-400" :
          action.priority === "high" ? "text-amber-400" :
          "text-neutral-500"
        }`}>
          {action.priority.toUpperCase()}
        </span>
      </div>

      {/* Primary action */}
      <p className="text-[13px] font-medium text-neutral-200 leading-snug">
        {action.title}
      </p>

      {/* Why now — one line */}
      <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">
        {output.why_now}
      </p>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-3">
        {onAccept && (
          <button
            onClick={onAccept}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md text-[10px] font-medium
                       bg-blue-500/10 border border-blue-500/20 text-blue-400
                       hover:bg-blue-500/15 transition-colors"
          >
            Accept <ArrowRight size={10} />
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 rounded-md text-[10px] font-medium
                       text-neutral-600 hover:text-neutral-400 hover:bg-white/[0.02] transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
