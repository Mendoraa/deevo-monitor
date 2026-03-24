/**
 * WhyNowPanel — Explains WHY the system is recommending action NOW.
 *
 * Always visible when orchestrator is active. The user must never
 * wonder "why is this urgent?" — this panel answers that.
 */

import { Clock, Zap } from "lucide-react";
import type { OrchestratorOutput } from "@/orchestrator/orchestrator.types";

interface Props {
  output: OrchestratorOutput | null;
}

const URGENCY_STYLE = {
  low: { border: "border-neutral-800", text: "text-neutral-400", label: "Low Urgency" },
  moderate: { border: "border-blue-900/50", text: "text-blue-400", label: "Moderate" },
  elevated: { border: "border-amber-900/50", text: "text-amber-400", label: "Elevated" },
  critical: { border: "border-red-900/50", text: "text-red-400", label: "Critical" },
};

export default function WhyNowPanel({ output }: Props) {
  if (!output) return null;

  const action = output.recommended_action;
  const style = URGENCY_STYLE[action.urgency_level];

  return (
    <div className={`why-now-panel ${style.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Zap size={12} className={style.text} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            Why Now
          </span>
        </div>
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.text}`}>
          {style.label}
        </span>
      </div>

      {/* Action title */}
      <p className="text-[13px] font-medium text-neutral-200 leading-snug mb-2">
        {action.title}
      </p>

      {/* Why now explanation */}
      <p className="text-[11px] text-neutral-400 leading-relaxed mb-3">
        {output.why_now}
      </p>

      {/* Rationale bullets */}
      {action.rationale.length > 0 && (
        <div className="space-y-1">
          {action.rationale.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full bg-neutral-600 mt-1.5 flex-shrink-0" />
              <span className="text-[10px] text-neutral-500 leading-relaxed">{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Affected systems */}
      {action.affected_systems.length > 0 && (
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Clock size={10} className="text-neutral-600" />
          {action.affected_systems.map((sys) => (
            <span
              key={sys}
              className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.04] text-neutral-500"
            >
              {sys}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
