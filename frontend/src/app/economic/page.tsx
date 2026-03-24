"use client";

import { useState } from "react";
import type { EventInput } from "@/types/economic-layer";
import type { FullCortexResponse } from "@/types/cortex";
import { runFullCortex } from "@/lib/api";
import EventInputPanel from "@/components/EventInputPanel";
import EventSummaryCard from "@/components/EventSummaryCard";
import CausalChainPanel from "@/components/CausalChainPanel";
import SectorImpactPanel from "@/components/SectorImpactPanel";
import GCCImpactPanel from "@/components/GCCImpactPanel";
import ScenarioPanel from "@/components/ScenarioPanel";
import DecisionInsightCard from "@/components/DecisionInsightCard";
import AgentTracePanel from "@/components/AgentTracePanel";

export default function EconomicLayerPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FullCortexResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (event: EventInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await runFullCortex(event);
      setData(result);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <EventInputPanel onAnalyze={handleAnalyze} loading={loading} />

      {/* Error */}
      {error && (
        <div className="panel severity-critical">
          <p className="text-sm text-red-400">Analysis Error: {error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="panel text-center py-12">
          <svg
            className="animate-spin h-8 w-8 mx-auto text-cortex-accent mb-3"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-white font-medium">
            Running Full Cortex Analysis...
          </p>
          <p className="text-xs text-cortex-muted mt-1">
            Economic agents → Insurance intel → Graph simulation → Explanation
          </p>
        </div>
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <div className="panel text-center py-12">
          <div className="text-4xl mb-3">🌐</div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Economic Intelligence Layer
          </h3>
          <p className="text-sm text-cortex-muted max-w-md mx-auto">
            Select a preset scenario or enter a custom event to run a full
            economic causality analysis with GCC impact assessment.
          </p>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Row 1: Event Summary + Decision Insight */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventSummaryCard event={data.economic.normalized_event} />
            <DecisionInsightCard insight={data.economic.decision_insight} />
          </div>

          {/* Row 2: Causal Chain + Sector Impacts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CausalChainPanel chain={data.economic.causal_chain} />
            <SectorImpactPanel impacts={data.economic.sector_impacts} />
          </div>

          {/* Row 3: Scenarios + GCC Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScenarioPanel scenarios={data.economic.scenarios} />
            <GCCImpactPanel breakdown={data.economic.gcc_breakdown} />
          </div>

          {/* Row 4: Agent Trace */}
          <AgentTracePanel agents={data.economic.agent_outputs} />
        </div>
      )}
    </div>
  );
}
