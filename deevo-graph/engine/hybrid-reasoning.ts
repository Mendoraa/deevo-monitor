/**
 * Hybrid Reasoning Engine — Phase 2
 *
 * CRITICAL ARCHITECTURE DECISION:
 * AI is NOT the source of computational truth.
 * AI is an interpretation and refinement layer ONLY.
 *
 * The graph + rules produce the numbers.
 * AI explains the numbers and generates executive-ready narratives.
 *
 * Flow:
 *   Graph Output → Insurance Overlay → GCC Breakdown
 *   → AI Prompt Assembly → LLM Call → Structured JSON Response
 */

import type {
  NormalizedEvent,
  PropagationResult,
  InsuranceOverlay,
  GCCCountryImpact,
  ExplanationBundle,
  GCCCountry,
  GraphNode,
} from "../types";

// ─── Prompt Template ───────────────────────────────────────────

const SYSTEM_PROMPT = `You are an executive economic intelligence analyst specializing in GCC markets.

You will receive:
1. A normalized geopolitical event
2. Graph propagation output (node impacts, critical path, systemic risk)
3. GCC country exposure data
4. Insurance and banking overlays

Your task:
- Explain the causal chain in 2-3 sentences
- Identify first-order and second-order effects
- Produce a GCC-specific executive brief (4-6 sentences)
- Produce insurance implications (3-4 sentences)
- Produce 3 watchpoints for the next 24-72 hours
- Produce a recommended action statement

Rules:
- Do NOT invent unsupported facts
- Stay aligned with provided graph outputs and numbers
- Be concise, analytical, and executive-ready
- Return strict JSON only
- Use specific numbers from the graph output
- Reference specific GCC countries where relevant`;

// ─── Types ─────────────────────────────────────────────────────

export interface HybridReasoningInput {
  event: NormalizedEvent;
  propagation: PropagationResult;
  insuranceOverlay: InsuranceOverlay;
  gccImpacts: Record<GCCCountry, GCCCountryImpact>;
}

export interface AIReasoningRequest {
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
}

// ─── Prompt Builder ────────────────────────────────────────────

/**
 * Build the prompt for AI reasoning.
 * Structures all computed data into a clear prompt.
 */
export function buildReasoningPrompt(input: HybridReasoningInput): AIReasoningRequest {
  const topNodes = input.propagation.impactedNodes
    .slice(0, 10)
    .map((n) => ({
      id: n.id,
      label: n.label,
      impact: (Math.abs(n.value) * 100).toFixed(1) + "%",
      state: n.state,
    }));

  const userPrompt = `
EVENT:
- Title: ${input.event.title}
- Class: ${input.event.eventClass}
- Category: ${input.event.category}
- Severity: ${(input.event.severity * 100).toFixed(0)}%
- Region: ${input.event.region}
- Confidence: ${(input.event.confidence * 100).toFixed(0)}%

GRAPH PROPAGATION:
- Systemic Risk Score: ${(input.propagation.systemicRiskScore * 100).toFixed(1)}%
- Total Propagation Steps: ${input.propagation.totalSteps}
- Max Depth Reached: ${input.propagation.maxDepthReached}
- Critical Path: ${input.propagation.criticalPath.join(" → ")}

TOP IMPACTED NODES:
${topNodes.map((n) => `  - ${n.label}: ${n.impact} (${n.state})`).join("\n")}

INSURANCE OVERLAY:
- Claims Probability: ${(input.insuranceOverlay.claims.claimsProbability * 100).toFixed(1)}%
- Fraud Pressure: ${(input.insuranceOverlay.fraud.fraudPressure * 100).toFixed(1)}%
- Underwriting Tightening: ${(input.insuranceOverlay.underwriting.tighteningScore * 100).toFixed(1)}%
- Reinsurance Stress: ${(input.insuranceOverlay.reinsurance.treatyStress * 100).toFixed(1)}%
- Overall Risk: ${input.insuranceOverlay.overallRiskLevel}

GCC COUNTRY IMPACTS:
${Object.entries(input.gccImpacts)
  .map(([country, impact]) =>
    `  - ${country}: severity=${impact.severity}, fiscal=${impact.fiscal}, inflation=${impact.inflation}`
  )
  .join("\n")}

Return a JSON object with exactly these fields:
{
  "what_happened": "...",
  "why_it_matters": "...",
  "how_it_propagates": ["step1", "step2", "step3"],
  "economic_narrative": "...",
  "insurance_narrative": "...",
  "gcc_narrative": "...",
  "what_to_do": "...",
  "watchpoints": ["point1", "point2", "point3"],
  "confidence_assessment": "...",
  "systemic_risk_summary": "..."
}`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    temperature: 0.3,
    maxTokens: 1500,
  };
}

// ─── Fallback: Rule-Based Explanation ──────────────────────────

/**
 * Generate explanation without AI, using pure rule-based logic.
 * This is the default path — AI is optional enhancement only.
 */
export function buildRuleBasedExplanation(
  input: HybridReasoningInput
): ExplanationBundle {
  const { event, propagation, insuranceOverlay, gccImpacts } = input;

  const topNodes = propagation.impactedNodes.slice(0, 5);
  const isElevated = propagation.systemicRiskScore > 0.5;
  const isCritical = propagation.systemicRiskScore > 0.7;

  // What happened
  const whatHappened = `${event.title} (${event.eventClass.replace(/_/g, " ")}) ` +
    `with severity ${(event.severity * 100).toFixed(0)}% ` +
    `has triggered a ${propagation.totalSteps}-step propagation across the GCC economic graph, ` +
    `reaching ${propagation.impactedNodes.length} nodes with a systemic risk score of ` +
    `${(propagation.systemicRiskScore * 100).toFixed(1)}%.`;

  // Why it matters
  const criticalCount = topNodes.filter((n) => n.state === "critical").length;
  const disruptedCount = topNodes.filter((n) => n.state === "disrupted").length;
  const whyItMatters = `${criticalCount} nodes are in critical state and ${disruptedCount} are disrupted. ` +
    `The critical path runs through ${propagation.criticalPath.slice(0, 4).join(" → ")}. ` +
    `Insurance overlay shows ${insuranceOverlay.overallRiskLevel} risk with ` +
    `${(insuranceOverlay.claims.claimsProbability * 100).toFixed(0)}% claims probability.`;

  // How it propagates
  const howItPropagates = propagation.steps.slice(0, 6).map((s) => s.explanation);

  // Economic narrative
  const economicNarrative = buildEconomicNarrative(topNodes, propagation);

  // Insurance narrative
  const insuranceNarrative = buildInsuranceNarrative(insuranceOverlay);

  // GCC narrative
  const gccNarrative = buildGCCNarrative(gccImpacts);

  // What to do
  const whatToDo = isCritical
    ? `IMMEDIATE ACTION REQUIRED: Activate crisis monitoring protocols. ` +
      `Review all exposed positions across ${propagation.criticalPath.slice(0, 3).join(", ")}. ` +
      `Escalate to board-level risk committee within 24 hours.`
    : isElevated
    ? `ELEVATED MONITORING: Increase monitoring frequency on ${propagation.criticalPath[0] || "key nodes"}. ` +
      `Review insurance portfolio exposure within 48 hours. ` +
      `Prepare contingency pricing adjustments.`
    : `STANDARD MONITORING: Track developments on ${event.eventClass.replace(/_/g, " ")}. ` +
      `No immediate portfolio action required. Review at next scheduled risk meeting.`;

  // Watchpoints
  const watchpoints = buildWatchpoints(event, propagation, insuranceOverlay);

  // Confidence
  const confidenceAssessment =
    `Analysis confidence: ${(event.confidence * 100).toFixed(0)}%. ` +
    `Based on ${event.sources.length} source(s). ` +
    `Graph propagation is deterministic with ${propagation.totalSteps} computed steps.`;

  // Systemic risk summary
  const riskLabel = isCritical ? "CRITICAL" : isElevated ? "ELEVATED" : "MODERATE";
  const systemicRiskSummary =
    `${riskLabel}: Systemic risk at ${(propagation.systemicRiskScore * 100).toFixed(1)}%. ` +
    `${propagation.impactedNodes.length} economic nodes impacted across ` +
    `${propagation.maxDepthReached} propagation layers.`;

  return {
    whatHappened,
    whyItMatters,
    howItPropagates,
    economicNarrative,
    insuranceNarrative,
    gccNarrative,
    whatToDo,
    watchpoints,
    confidenceAssessment,
    systemicRiskSummary,
  };
}

// ─── Narrative Builders ────────────────────────────────────────

function buildEconomicNarrative(
  topNodes: GraphNode[],
  propagation: PropagationResult
): string {
  const nodeDescriptions = topNodes
    .slice(0, 3)
    .map((n) => `${n.label} (${n.state}, ${(Math.abs(n.value) * 100).toFixed(0)}%)`)
    .join(", ");

  return (
    `The economic impact concentrates on ${nodeDescriptions}. ` +
    `Propagation reached depth ${propagation.maxDepthReached} with ` +
    `${propagation.totalSteps} transmission steps. ` +
    `Systemic risk stands at ${(propagation.systemicRiskScore * 100).toFixed(1)}%, ` +
    `indicating ${propagation.systemicRiskScore > 0.5 ? "significant" : "manageable"} ` +
    `cross-sector contagion.`
  );
}

function buildInsuranceNarrative(overlay: InsuranceOverlay): string {
  const parts: string[] = [];

  if (overlay.claims.claimsProbability > 0.4) {
    parts.push(
      `Claims probability elevated at ${(overlay.claims.claimsProbability * 100).toFixed(0)}%`
    );
  }
  if (overlay.fraud.fraudPressure > 0.3) {
    parts.push(
      `fraud monitoring at ${overlay.fraud.monitoringLevel} level`
    );
  }
  if (overlay.underwriting.tighteningScore > 0.4) {
    parts.push(
      `underwriting tightening at ${(overlay.underwriting.tighteningScore * 100).toFixed(0)}%`
    );
  }
  if (overlay.reinsurance.catastropheReserveTrigger) {
    parts.push("catastrophe reserve trigger activated");
  }

  return parts.length > 0
    ? `Insurance sector under ${overlay.overallRiskLevel} pressure: ${parts.join("; ")}. ` +
      `${overlay.underwriting.rationale[0] || ""}`
    : `Insurance sector impact is within normal parameters at ${overlay.overallRiskLevel} risk level.`;
}

function buildGCCNarrative(
  impacts: Record<GCCCountry, GCCCountryImpact>
): string {
  const sorted = Object.entries(impacts).sort(
    ([, a], [, b]) => b.severity - a.severity
  );
  const top3 = sorted.slice(0, 3);

  return top3
    .map(
      ([country, impact]) =>
        `${country.charAt(0).toUpperCase() + country.slice(1)}: severity ${impact.severity}, ` +
        `fiscal outlook ${impact.fiscal}, inflation ${impact.inflation}`
    )
    .join(". ") + ".";
}

function buildWatchpoints(
  event: NormalizedEvent,
  propagation: PropagationResult,
  overlay: InsuranceOverlay
): string[] {
  const points: string[] = [];

  // Always add event-specific watchpoint
  points.push(
    `Monitor ${event.eventClass.replace(/_/g, " ")} developments — ` +
    `any escalation beyond current ${(event.severity * 100).toFixed(0)}% severity ` +
    `will amplify graph propagation significantly.`
  );

  // Add insurance watchpoint if elevated
  if (overlay.overallRiskLevel === "high" || overlay.overallRiskLevel === "critical") {
    points.push(
      `Insurance market repricing expected within 24-48 hours. ` +
      `Watch marine and energy lines for premium adjustment signals.`
    );
  }

  // Add critical path watchpoint
  if (propagation.criticalPath.length > 1) {
    points.push(
      `Critical transmission path: ${propagation.criticalPath.slice(0, 3).join(" → ")}. ` +
      `Disruption at any point amplifies downstream impact.`
    );
  }

  // Add GCC-specific watchpoint
  points.push(
    `GCC central bank and sovereign fund responses within 48-72 hours ` +
    `will determine whether second-order effects materialize or are absorbed.`
  );

  return points.slice(0, 3);
}
