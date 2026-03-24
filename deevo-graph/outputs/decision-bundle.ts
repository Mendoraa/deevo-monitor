/**
 * Decision Bundle — Final Output Assembly
 *
 * This is the most important output in the entire system.
 * It assembles all pipeline outputs into a single, executive-ready
 * decision intelligence package.
 */

import type {
  DecisionBundle,
  NormalizedEvent,
  PropagationResult,
  InsuranceOverlay,
  GCCCountry,
  GCCCountryImpact,
  ExplanationBundle,
} from "../types";

/**
 * Assemble the complete decision bundle from all pipeline outputs.
 */
export function assembleDecisionBundle(
  event: NormalizedEvent,
  propagation: PropagationResult,
  insurance: InsuranceOverlay,
  gccImpacts: Record<GCCCountry, GCCCountryImpact>,
  explanation: ExplanationBundle
): DecisionBundle {
  // Build graph summary from top impacted nodes
  const graphSummary: Record<string, number> = {};
  for (const node of propagation.impactedNodes.slice(0, 10)) {
    graphSummary[node.id] = parseFloat(node.value.toFixed(4));
  }

  const timestamp = new Date().toISOString();

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
    auditHash: generateAuditHash(event, propagation, timestamp),
  };
}

/**
 * Serialize bundle for API response / audit storage.
 */
export function serializeBundle(bundle: DecisionBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Validate bundle completeness before output.
 */
export function validateBundle(bundle: DecisionBundle): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!bundle.eventSummary) errors.push("Missing event summary");
  if (Object.keys(bundle.graphSummary).length === 0) errors.push("Empty graph summary");
  if (Object.keys(bundle.gccCountryImpacts).length < 6) errors.push("Incomplete GCC coverage");
  if (!bundle.insuranceOverlay) errors.push("Missing insurance overlay");
  if (!bundle.decisionInsight) errors.push("Missing decision insight");
  if (bundle.watchpoints.length === 0) errors.push("No watchpoints generated");
  if (!bundle.auditHash) errors.push("Missing audit hash");

  return { valid: errors.length === 0, errors };
}

// ─── Audit Hash ────────────────────────────────────────────────

function generateAuditHash(
  event: NormalizedEvent,
  propagation: PropagationResult,
  timestamp: string
): string {
  const payload = [
    event.eventClass,
    event.severity.toFixed(4),
    event.confidence.toFixed(4),
    propagation.systemicRiskScore.toFixed(4),
    propagation.totalSteps.toString(),
    timestamp,
  ].join("|");

  // DJB2 hash — in production, use SHA-256
  let hash = 5381;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) + hash + payload.charCodeAt(i);
    hash |= 0;
  }

  return `CORTEX-P2-${Math.abs(hash).toString(16).padStart(8, "0").toUpperCase()}`;
}
