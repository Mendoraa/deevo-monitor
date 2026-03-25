"use client";

import { useState, useCallback } from "react";
import type { FullCortexResponse } from "@/types/cortex";

// Intelligence Layer
import HeroSection from "@/components/intelligence/HeroSection";
import GlobalSignalGrid from "@/components/intelligence/GlobalSignalGrid";
import CausalFlowPanel from "@/components/intelligence/CausalFlowPanel";
import EconomicImpactPanel from "@/components/intelligence/EconomicImpactPanel";
import DecisionPanel from "@/components/intelligence/DecisionPanel";
import RecommendationPanel from "@/components/intelligence/RecommendationPanel";
import SystemStatusPanel from "@/components/intelligence/SystemStatusPanel";

// Interaction Intelligence Layer
import ContextBar from "@/components/interaction/ContextBar";
import GuidedFlowBar, { type FlowStep } from "@/components/interaction/GuidedFlowBar";
import DecisionModeToggle, { type InteractionMode } from "@/components/interaction/DecisionModeToggle";
import ActionDock from "@/components/interaction/ActionDock";
import InsightPromptCard from "@/components/interaction/InsightPromptCard";
import TopDriversCard from "@/components/interaction/TopDriversCard";

// AI Decision Orchestrator Layer
import { runOrchestrator } from "@/orchestrator/runOrchestrator";
import { createInitialLearning, recordActionAccepted, recordActionIgnored } from "@/orchestrator/learningLoop";
import type { LearningFeedback, OrchestratorOutput } from "@/orchestrator/orchestrator.types";

// Orchestrator UI Components
import OrchestratorSummaryPanel from "@/components/orchestrator/OrchestratorSummaryPanel";
import WhyNowPanel from "@/components/orchestrator/WhyNowPanel";
import NextActionsList from "@/components/orchestrator/NextActionsList";
import FocusDirectiveCard from "@/components/orchestrator/FocusDirectiveCard";

// ═══ MONITOR INTELLIGENCE LAYER SYSTEM ═══
import ModeSwitchBar from "@/components/monitor/ModeSwitchBar";
import GCCRegionBar from "@/components/monitor/GCCRegionBar";
import KuwaitKPIRibbon from "@/components/monitor/KuwaitKPIRibbon";
import CompositeRiskCard from "@/components/monitor/CompositeRiskCard";
import GCCOverviewPanel from "@/components/monitor/GCCOverviewPanel";
import IntelligenceOverlay from "@/components/monitor/IntelligenceOverlay";
import EconomicOverlay from "@/components/monitor/EconomicOverlay";
import ScenarioPanel from "@/components/monitor/ScenarioPanel";
import GraphSummaryPanel from "@/components/monitor/GraphSummaryPanel";
import AuditTracePanel from "@/components/monitor/AuditTracePanel";
import ReactionIntelligencePanel from "@/components/monitor/ReactionIntelligencePanel";
import { useMonitorMode } from "@/lib/monitorMode";

export default function IntelligenceDashboard() {
  // ─── Monitor mode ───────────────────────────────────────────
  const { mode } = useMonitorMode();

  // ─── Intelligence state ────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FullCortexResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ─── Interaction state ─────────────────────────────────────
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("monitor");
  const [flowStep, setFlowStep] = useState<FlowStep>("event");
  const [completedSteps, setCompletedSteps] = useState<FlowStep[]>([]);

  // ─── Orchestrator state ────────────────────────────────────
  const [learning, setLearning] = useState<LearningFeedback>(createInitialLearning);
  const [orchestratorOutput, setOrchestratorOutput] = useState<OrchestratorOutput | null>(null);

  // ─── Run orchestrator whenever dependencies change ─────
  const executeOrchestrator = useCallback(
    (cortexData: FullCortexResponse | null, iMode: string, fStep: string | null, learn: LearningFeedback) => {
      const { output, learning: updatedLearning } = runOrchestrator(cortexData, iMode, fStep, learn);
      setOrchestratorOutput(output);
      setLearning(updatedLearning);
      const modeMap: Record<string, InteractionMode> = {
        monitor: "monitor",
        analysis: "analysis",
        decision: "decision",
        escalation: "decision",
      };
      const newMode = modeMap[output.active_decision_mode] || "monitor";
      setInteractionMode(newMode);
      return output;
    },
    []
  );

  // ─── Analysis lifecycle ────────────────────────────────────
  const handleAnalysisComplete = useCallback(
    (result: FullCortexResponse) => {
      setData(result);
      setError(null);
      setLoading(false);
      setCompletedSteps(["event", "economic", "gcc", "insurance", "decision"]);
      setFlowStep("decision");
      executeOrchestrator(result, interactionMode, "decision", learning);
    },
    [executeOrchestrator, interactionMode, learning]
  );

  const handleAnalysisStart = useCallback(() => {
    setLoading(true);
    setError(null);
    setFlowStep("event");
    setCompletedSteps([]);
    setOrchestratorOutput(null);
  }, []);

  const handleAnalysisError = useCallback((msg: string) => {
    setError(msg);
    setLoading(false);
  }, []);

  const handleFlowStepClick = useCallback(
    (step: FlowStep) => {
      setFlowStep(step);
      if (data) {
        executeOrchestrator(data, interactionMode, step, learning);
      }
    },
    [data, interactionMode, learning, executeOrchestrator]
  );

  const handleManualModeChange = useCallback(
    (newMode: InteractionMode) => {
      setInteractionMode(newMode);
      if (data) {
        executeOrchestrator(data, newMode, flowStep, learning);
      }
    },
    [data, flowStep, learning, executeOrchestrator]
  );

  const handleAcceptAction = useCallback(() => {
    if (!orchestratorOutput) return;
    const updated = recordActionAccepted(learning, orchestratorOutput.recommended_action.title);
    setLearning(updated);
  }, [learning, orchestratorOutput]);

  const handleDismissAction = useCallback(() => {
    if (!orchestratorOutput) return;
    const updated = recordActionIgnored(learning, orchestratorOutput.recommended_action.title);
    setLearning(updated);
  }, [learning, orchestratorOutput]);

  // ─── Visibility rules ──────────────────────────────────────
  const isEscalation = orchestratorOutput?.active_decision_mode === "escalation";
  const showSignals = interactionMode !== "decision";
  const showCausalFlow = interactionMode !== "monitor" || !!data;
  const showDecision = interactionMode === "decision" || !!data;
  const showActionDock = interactionMode === "decision";
  const showRecommendations = interactionMode !== "monitor";

  const urgencyGlow = orchestratorOutput?.recommended_action?.urgency_level === "critical"
    ? "focus-glow-critical"
    : orchestratorOutput?.recommended_action?.urgency_level === "elevated"
    ? "focus-glow-warning"
    : "";

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">

      {/* ═══ LAYER 0: Mode Switch Bar ═══ */}
      <ModeSwitchBar />

      {/* ═══ LAYER 0: GCC Region Focus (GCC/Kuwait modes) ═══ */}
      <GCCRegionBar />

      {/* ═══ LAYER 1: KPI Ribbon — always visible, mode-filtered ═══ */}
      <KuwaitKPIRibbon />

      {/* ═══ LAYER 1: Composite Risk / DRI — always visible ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <CompositeRiskCard />
        </div>
        <div className="lg:col-span-2">
          {/* ═══ ORCHESTRATOR LAYER: Summary Panel ═══ */}
          <OrchestratorSummaryPanel output={orchestratorOutput} />

          {/* ═══ INTERACTION LAYER: Context Memory ═══ */}
          <div className="mt-3">
            <ContextBar data={data} isProcessing={loading} />
          </div>
        </div>
      </div>

      {/* ═══ LAYER 2: GCC Strategic Overview (GCC/Global modes) ═══ */}
      <GCCOverviewPanel />

      {/* ═══ INTERACTION LAYER: Mode Toggle + Guided Flow ═══ */}
      <div className="flex items-center gap-3 flex-wrap">
        <DecisionModeToggle mode={interactionMode} onChange={handleManualModeChange} />
        <GuidedFlowBar
          currentStep={flowStep}
          completedSteps={completedSteps}
          onStepClick={handleFlowStepClick}
        />
      </div>

      {/* ═══ ORCHESTRATOR LAYER: Focus Directive ═══ */}
      <div className={isEscalation ? "escalation-active" : ""}>
        <FocusDirectiveCard
          output={orchestratorOutput}
          onAccept={handleAcceptAction}
          onDismiss={handleDismissAction}
        />
      </div>

      {/* ═══ INTELLIGENCE LAYER: Hero Command Center ═══ */}
      <HeroSection
        onAnalysisComplete={handleAnalysisComplete}
        onAnalysisStart={handleAnalysisStart}
        onAnalysisError={handleAnalysisError}
        isLoading={loading}
        isCompact={!!data}
      />

      {/* Processing */}
      {loading && (
        <div className="intel-panel p-8 flex flex-col items-center justify-center">
          <div className="cortex-spinner mb-3" />
          <p className="text-sm text-neutral-300 font-medium">Running Full Cortex Analysis</p>
          <p className="text-[11px] text-neutral-600 mt-1">
            Event → Economic → Causal Chain → Insurance Scoring → Agent Simulation → Decision
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <InsightPromptCard title="Analysis Error" description={error} type="critical" action="Ensure backend is running" />
      )}

      {/* Empty state */}
      {!data && !loading && !error && (
        <InsightPromptCard
          title="Ready to analyze"
          description="Configure an event above and click 'Run Analysis' to process through the full Cortex pipeline — causal chains, agent reactions, sector impacts, and decision intelligence."
          type="info"
        />
      )}

      {/* ═══ LAYER 3: Intelligence Overlay (Intelligence mode) ═══ */}
      {mode === "intelligence" && <IntelligenceOverlay />}

      {/* ═══ LAYER 4: Economic Overlay (Economic mode) ═══ */}
      {mode === "economic" && <EconomicOverlay />}

      {/* ═══ LAYER 5: Reaction Intelligence — Agent Simulation ═══ */}
      <ReactionIntelligencePanel />

      {/* ═══ ORCHESTRATOR: Why Now + Next Actions ═══ */}
      {orchestratorOutput && orchestratorOutput.orchestrator_state !== "standby" && (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${urgencyGlow}`}>
          <WhyNowPanel output={orchestratorOutput} />
          <NextActionsList output={orchestratorOutput} />
        </div>
      )}

      {/* Decision mode: Top Drivers + Action Dock */}
      {showActionDock && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TopDriversCard maxDrivers={3} />
          <ActionDock visible={true} />
        </div>
      )}

      {/* ═══ LAYER 6: Scenario Intelligence ═══ */}
      <ScenarioPanel />

      {/* ═══ LAYER 7: Mode-filtered Signals ═══ */}
      <div className={showSignals ? "" : "de-emphasis"}>
        <GlobalSignalGrid />
      </div>

      {/* ═══ LAYER 8: Graph / Causal Summary ═══ */}
      <GraphSummaryPanel />

      {/* ═══ INTELLIGENCE LAYER: Causal Reasoning (from analysis) ═══ */}
      {showCausalFlow && (
        <div className={flowStep === "economic" || data ? "focus-glow" : ""}>
          <CausalFlowPanel chain={data?.economic?.causal_chain} />
        </div>
      )}

      {/* ═══ INTELLIGENCE LAYER: Economic + GCC + Insurance ═══ */}
      <EconomicImpactPanel
        sectorImpacts={data?.economic?.sector_impacts}
        scenarios={data?.economic?.scenarios}
        gccBreakdown={data?.economic?.gcc_breakdown}
      />

      {/* ═══ INTELLIGENCE LAYER: Decision Intelligence ═══ */}
      {showDecision && (
        <div className={interactionMode === "decision" ? urgencyGlow || "focus-glow-warning" : ""}>
          <DecisionPanel insight={data?.economic?.decision_insight} explanation={data?.explanation} />
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <div className="de-emphasis">
          <RecommendationPanel />
        </div>
      )}

      {/* ═══ LAYER 9: Audit Trail & Data Provenance ═══ */}
      <AuditTracePanel />

      {/* ═══ System Trust ═══ */}
      <div className={interactionMode === "monitor" ? "" : "de-emphasis"}>
        <SystemStatusPanel />
      </div>
    </div>
  );
}
