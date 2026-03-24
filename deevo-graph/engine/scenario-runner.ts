/**
 * Scenario Runner — Phase 2
 *
 * Executes the full Phase 2 pipeline for a given event:
 *   Signal → Normalize → Dynamic Weights → Propagation → Insurance → Explanation → Bundle
 *
 * Also supports multi-scenario comparison (base/elevated/severe).
 */

import type {
  NormalizedEvent,
  GraphState,
  PropagationConfig,
  PropagationResult,
  InsuranceOverlay,
  GCCCountry,
  GCCCountryImpact,
  DecisionBundle,
  ExplanationBundle,
} from "../types";
import { bindSignalToEvent, type RawSignal } from "./signal-binding";
import { applyDynamicWeights } from "./dynamic-weights";
import {
  buildGCCGraph,
  runEventPropagation,
  DEFAULT_PROPAGATION_CONFIG,
} from "./propagation";
import { claimsOverlay } from "../insurance/claims-overlay";
import { underwritingOverlay } from "../insurance/underwriting-overlay";
import { fraudOverlay } from "../insurance/fraud-overlay";
import { reinsuranceOverlay } from "../insurance/reinsurance-overlay";
import {
  buildRuleBasedExplanation,
  buildReasoningPrompt,
  type HybridReasoningInput,
  type AIReasoningRequest,
} from "./hybrid-reasoning";

// ─── GCC Country Profiles ──────────────────────────────────────

const GCC_PROFILES: Record<GCCCountry, {
  oilDependency: number;
  tradeExposure: number;
  fiscalBuffer: number;
  inflationSensitivity: number;
}> = {
  saudi: { oilDependency: 0.65, tradeExposure: 0.50, fiscalBuffer: 0.70, inflationSensitivity: 0.45 },
  uae: { oilDependency: 0.30, tradeExposure: 0.85, fiscalBuffer: 0.85, inflationSensitivity: 0.55 },
  kuwait: { oilDependency: 0.85, tradeExposure: 0.40, fiscalBuffer: 0.80, inflationSensitivity: 0.35 },
  qatar: { oilDependency: 0.55, tradeExposure: 0.60, fiscalBuffer: 0.75, inflationSensitivity: 0.40 },
  bahrain: { oilDependency: 0.70, tradeExposure: 0.55, fiscalBuffer: 0.35, inflationSensitivity: 0.60 },
  oman: { oilDependency: 0.72, tradeExposure: 0.50, fiscalBuffer: 0.40, inflationSensitivity: 0.55 },
};

// ─── Scenario Tiers ────────────────────────────────────────────

export interface ScenarioTier {
  name: string;
  severityMultiplier: number;
  description: string;
}

const SCENARIO_TIERS: ScenarioTier[] = [
  { name: "base", severityMultiplier: 1.0, description: "Current assessment — most likely outcome" },
  { name: "elevated", severityMultiplier: 1.3, description: "Escalation scenario — 30% worse than base" },
  { name: "severe", severityMultiplier: 1.7, description: "Worst case — significant escalation" },
];

// ─── Full Pipeline Run ─────────────────────────────────────────

export interface ScenarioResult {
  event: NormalizedEvent;
  propagation: PropagationResult;
  insuranceOverlay: InsuranceOverlay;
  gccImpacts: Record<GCCCountry, GCCCountryImpact>;
  explanation: ExplanationBundle;
  bundle: DecisionBundle;
  aiPrompt?: AIReasoningRequest; // Available for optional LLM call
}

/**
 * Run the full Phase 2 pipeline for a normalized event.
 */
export function runScenario(
  event: NormalizedEvent,
  config: PropagationConfig = DEFAULT_PROPAGATION_CONFIG
): ScenarioResult {
  // 1. Build fresh graph
  const graph = buildGCCGraph();

  // 2. Apply dynamic weights based on event
  const signalAgeHours = computeSignalAge(event.timestamp);
  graph.edges = applyDynamicWeights(graph.edges, event, signalAgeHours);

  // 3. Run graph propagation
  const propagation = runEventPropagation(event, graph, config);

  // 4. Compute insurance overlay from graph state
  const insurance = computeInsuranceOverlay(graph);

  // 5. Compute GCC country impacts
  const gccImpacts = computeGCCImpacts(graph, event);

  // 6. Build explanation (rule-based, no AI dependency)
  const reasoningInput: HybridReasoningInput = {
    event,
    propagation,
    insuranceOverlay: insurance,
    gccImpacts,
  };
  const explanation = buildRuleBasedExplanation(reasoningInput);

  // 7. Optionally prepare AI prompt (caller can use it or not)
  const aiPrompt = buildReasoningPrompt(reasoningInput);

  // 8. Assemble decision bundle
  const bundle = assembleDecisionBundle(
    event,
    propagation,
    insurance,
    gccImpacts,
    explanation
  );

  return {
    event,
    propagation,
    insuranceOverlay: insurance,
    gccImpacts,
    explanation,
    bundle,
    aiPrompt,
  };
}

/**
 * Run from a raw signal (full pipeline including signal binding).
 */
export function runFromSignal(
  signal: RawSignal,
  config?: PropagationConfig
): ScenarioResult {
  const event = bindSignalToEvent(signal);
  return runScenario(event, config);
}

/**
 * Run three-tier scenario comparison (base/elevated/severe).
 */
export function runMultiScenario(
  event: NormalizedEvent,
  config?: PropagationConfig
): { tier: string; description: string; result: ScenarioResult }[] {
  return SCENARIO_TIERS.map((tier) => {
    const scaledEvent: NormalizedEvent = {
      ...event,
      severity: Math.min(1.0, event.severity * tier.severityMultiplier),
    };
    return {
      tier: tier.name,
      description: tier.description,
      result: runScenario(scaledEvent, config),
    };
  });
}

// ─── Insurance Overlay Computation ─────────────────────────────

function computeInsuranceOverlay(graph: GraphState): InsuranceOverlay {
  const claims = claimsOverlay(graph);
  const underwriting = underwritingOverlay(graph);
  const fraud = fraudOverlay(graph);
  const reinsurance = reinsuranceOverlay(graph);

  // Determine overall risk level
  const maxScore = Math.max(
    claims.claimsProbability,
    underwriting.tighteningScore,
    fraud.fraudPressure,
    reinsurance.treatyStress
  );

  let overallRiskLevel: InsuranceOverlay["overallRiskLevel"];
  if (maxScore >= 0.7) overallRiskLevel = "critical";
  else if (maxScore >= 0.5) overallRiskLevel = "high";
  else if (maxScore >= 0.3) overallRiskLevel = "moderate";
  else overallRiskLevel = "low";

  return {
    claims,
    underwriting,
    fraud,
    reinsurance,
    overallRiskLevel,
  };
}

// ─── GCC Impact Computation ────────────────────────────────────

function computeGCCImpacts(
  graph: GraphState,
  event: NormalizedEvent
): Record<GCCCountry, GCCCountryImpact> {
  const countries: GCCCountry[] = ["saudi", "uae", "kuwait", "qatar", "bahrain", "oman"];
  const result: Record<string, GCCCountryImpact> = {};

  for (const country of countries) {
    const profile = GCC_PROFILES[country];
    const nodeValue = Math.abs(graph.nodes[country]?.value || 0);
    const inflation = Math.abs(graph.nodes["gcc_inflation"]?.value || 0);
    const oilImpact = Math.abs(graph.nodes["crude_oil"]?.value || 0);

    // Compute severity as weighted combination
    const severity = Math.round(
      Math.min(100,
        (nodeValue * 40) +
        (inflation * profile.inflationSensitivity * 30) +
        (oilImpact * profile.oilDependency * 30)
      )
    );

    // Fiscal outlook: oil exporters may benefit from price spikes
    const isOilPositive = oilImpact > 0.3 && profile.oilDependency > 0.5;
    const fiscal = isOilPositive
      ? "positive (oil revenue)"
      : nodeValue > 0.4
      ? "stressed"
      : "stable";

    // Inflation assessment
    const inflationLevel = inflation * profile.inflationSensitivity;
    const inflationLabel = inflationLevel > 0.4
      ? "elevated"
      : inflationLevel > 0.2
      ? "moderate"
      : "contained";

    // Trade assessment
    const tradeExposure = profile.tradeExposure > 0.6 ? "high exposure" : "moderate";

    result[country] = {
      country,
      fiscal,
      trade: tradeExposure,
      inflation: inflationLabel,
      severity,
      narrative: `${country.charAt(0).toUpperCase() + country.slice(1)}: ` +
        `Severity ${severity}/100. Fiscal ${fiscal}, inflation ${inflationLabel}. ` +
        `Fiscal buffer: ${(profile.fiscalBuffer * 100).toFixed(0)}%.`,
    };
  }

  return result as Record<GCCCountry, GCCCountryImpact>;
}

// ─── Decision Bundle Assembly ──────────────────────────────────

function assembleDecisionBundle(
  event: NormalizedEvent,
  propagation: PropagationResult,
  insurance: InsuranceOverlay,
  gccImpacts: Record<GCCCountry, GCCCountryImpact>,
  explanation: ExplanationBundle
): DecisionBundle {
  // Graph summary: top node values
  const graphSummary: Record<string, number> = {};
  for (const node of propagation.impactedNodes.slice(0, 8)) {
    graphSummary[node.id] = parseFloat(node.value.toFixed(4));
  }

  const timestamp = new Date().toISOString();
  const auditHash = computeAuditHash(event, timestamp);

  return {
    eventSummary: event.title,
    graphSummary,
    gccCountryImpacts: gccImpacts,
    insuranceOverlay: insurance,
    decisionInsight: explanation.whatToDo,
    watchpoints: explanation.watchpoints,
    executiveBrief: explanation.economicNarrative,
    confidenceAssessment: explanation.confidenceAssessment,
    timestamp,
    auditHash,
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function computeSignalAge(timestamp: string): number {
  const signalTime = new Date(timestamp).getTime();
  const now = Date.now();
  return Math.max(0, (now - signalTime) / (1000 * 60 * 60)); // hours
}

function computeAuditHash(event: NormalizedEvent, timestamp: string): string {
  // Simple hash for audit trail — in production use SHA-256
  const input = `${event.eventClass}:${event.severity}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `CORTEX-${Math.abs(hash).toString(16).padStart(8, "0").toUpperCase()}`;
}
