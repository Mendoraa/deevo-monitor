/**
 * NextActionsList — Ranked list of next-best monitoring/response actions.
 *
 * Maximum 4 items. Not recommendations — these are system-generated
 * follow-up actions based on the current orchestrator assessment.
 */

import { ChevronRight, ListChecks } from "lucide-react";
import type { OrchestratorOutput } from "@/orchestrator/orchestrator.types";

interface Props {
  output: OrchestratorOutput | null;
}

export default function NextActionsList({ output }: Props) {
  if (!output || output.next_best_actions.length === 0) return null;

  return (
    <div className="next-actions-panel">
      <div className="flex items-center gap-1.5 mb-2.5">
        <ListChecks size={12} className="text-neutral-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
          Next Actions
        </span>
      </div>

      <div className="space-y-1">
        {output.next_best_actions.map((action, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2.5 py-2 rounded-md hover:bg-white/[0.02] transition-colors group cursor-default"
          >
            <span className="text-[10px] font-mono text-neutral-700 w-4 text-right flex-shrink-0">
              {i + 1}
            </span>
            <ChevronRight
              size={10}
              className="text-neutral-700 group-hover:text-neutral-500 transition-colors flex-shrink-0"
            />
            <span className="text-[11px] text-neutral-400 group-hover:text-neutral-300 transition-colors leading-snug">
              {action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
