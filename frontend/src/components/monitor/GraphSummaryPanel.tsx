"use client";

import { GitBranch, ArrowRight } from "lucide-react";
import { MOCK_GRAPH_EDGES, MOCK_GRAPH_NODES } from "@/lib/mock-data";
import { useMonitorMode } from "@/lib/monitorMode";

// ─── Top causal chains (sorted by effective_weight) ───────────
function getTopChains(limit: number = 6) {
  const nodeMap = new Map(MOCK_GRAPH_NODES.map((n) => [n.id, n]));

  return [...MOCK_GRAPH_EDGES]
    .sort((a, b) => Math.abs(b.effective_weight) - Math.abs(a.effective_weight))
    .slice(0, limit)
    .map((edge) => ({
      ...edge,
      sourceNode: nodeMap.get(edge.source),
      targetNode: nodeMap.get(edge.target),
    }));
}

const REL_COLORS: Record<string, { text: string; bg: string }> = {
  amplifies: { text: "text-red-400", bg: "rgba(239,68,68,0.08)" },
  constrains: { text: "text-blue-400", bg: "rgba(59,130,246,0.08)" },
  correlates: { text: "text-purple-400", bg: "rgba(168,85,247,0.08)" },
  feeds: { text: "text-amber-400", bg: "rgba(245,158,11,0.08)" },
};

export default function GraphSummaryPanel() {
  const { mode } = useMonitorMode();
  const topChains = getTopChains(mode === "intelligence" ? 8 : 6);

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-purple-500 rounded-full" />
        <h3 className="text-[10px] uppercase tracking-widest text-neutral-500 font-semibold">
          Causal Graph Summary
        </h3>
        <span className="text-[9px] text-neutral-700">
          Top {topChains.length} causal chains by weight
        </span>
      </div>

      <div
        className="rounded-lg p-4"
        style={{ background: "var(--cortex-panel)", border: "1px solid var(--cortex-border)" }}
      >
        <div className="space-y-2">
          {topChains.map((chain, idx) => {
            const colors = REL_COLORS[chain.relationship] || REL_COLORS.correlates;
            const weight = Math.abs(chain.effective_weight);
            const barWidth = weight * 100;

            return (
              <div key={idx} className="flex items-center gap-2">
                {/* Source */}
                <span className="text-[10px] text-neutral-300 font-medium w-28 truncate text-right">
                  {chain.sourceNode?.label || chain.source}
                </span>

                {/* Arrow + relationship */}
                <div className="flex items-center gap-1">
                  <div
                    className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${colors.text}`}
                    style={{ background: colors.bg }}
                  >
                    {chain.relationship}
                  </div>
                  <ArrowRight className={`w-3 h-3 ${colors.text}`} />
                </div>

                {/* Target */}
                <span className="text-[10px] text-neutral-300 font-medium w-28 truncate">
                  {chain.targetNode?.label || chain.target}
                </span>

                {/* Weight bar */}
                <div className="flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500`}
                    style={{
                      width: `${barWidth}%`,
                      background: colors.bg.replace("0.08", "0.5"),
                    }}
                  />
                </div>

                {/* Weight + confidence */}
                <span className="text-[9px] text-neutral-500 tabular-nums w-10 text-right">
                  {weight.toFixed(2)}
                </span>
                <span className="text-[8px] text-neutral-700 tabular-nums w-8 text-right">
                  {(chain.confidence * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2 flex items-center justify-between"
          style={{ borderTop: "1px solid var(--cortex-border)" }}>
          <div className="flex items-center gap-1">
            <GitBranch className="w-3 h-3 text-neutral-600" />
            <span className="text-[8px] text-neutral-700">
              {MOCK_GRAPH_NODES.length} nodes · {MOCK_GRAPH_EDGES.length} edges
            </span>
          </div>
          <span className="text-[8px] text-neutral-700">
            Calibrated weights · SHA-256 traced
          </span>
        </div>
      </div>
    </section>
  );
}
