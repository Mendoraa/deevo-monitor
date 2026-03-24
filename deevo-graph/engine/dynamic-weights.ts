/**
 * Dynamic Weight Engine — Phase 2
 *
 * Edge weights are no longer static. They adjust based on:
 * - Event severity
 * - Source confidence
 * - Source convergence (multiple sources confirming)
 * - Geographic relevance to GCC
 * - Time decay (signal freshness)
 * - Domain multiplier (sector-specific amplification)
 *
 * Architecture Decision: Deterministic computation only.
 * AI does NOT influence weight calculation.
 */

import type {
  WeightAdjustmentInput,
  WeightAdjustmentResult,
  GraphEdge,
  NormalizedEvent,
} from "../types";

// ─── Constants ─────────────────────────────────────────────────

/** Maximum allowed dynamic weight (prevents runaway amplification) */
const MAX_WEIGHT = 1.0;

/** Minimum weight floor (prevents zero-propagation edges) */
const MIN_WEIGHT = 0.01;

/** Severity multiplier breakpoints */
const SEVERITY_TIERS: Record<string, { threshold: number; multiplier: number }> = {
  critical: { threshold: 0.85, multiplier: 2.2 },
  high: { threshold: 0.65, multiplier: 1.5 },
  moderate: { threshold: 0.40, multiplier: 1.0 },
  low: { threshold: 0.0, multiplier: 0.5 },
};

/** Domain-specific amplification factors */
const DOMAIN_MULTIPLIERS: Record<string, number> = {
  maritime_risk: 1.3,
  oil_price: 1.2,
  insurance_premium: 1.15,
  banking_liquidity: 1.1,
  sovereign_risk: 1.05,
  inflation: 1.0,
  trade_finance: 1.1,
  shipping_cost: 1.25,
};

// ─── Core Engine ───────────────────────────────────────────────

/**
 * Compute dynamic weight from multi-factor inputs.
 *
 * Formula:
 *   final = base × (1 + severity) × (0.7 + confidence) × (0.8 + convergence)
 *           × regionalRelevance × timeDecay × domainMultiplier
 *
 * Capped to [MIN_WEIGHT, MAX_WEIGHT].
 */
export function computeDynamicWeight(input: WeightAdjustmentInput): number {
  const domain = input.domainMultiplier ?? 1.0;

  const raw =
    input.baseWeight *
    (1 + input.severity) *
    (0.7 + input.confidence) *
    (0.8 + input.convergence) *
    input.regionalRelevance *
    input.timeDecay *
    domain;

  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, raw));
}

/**
 * Compute dynamic weight with full audit trail.
 * Returns breakdown of each adjustment factor.
 */
export function computeWeightWithAudit(
  edgeLabel: string,
  input: WeightAdjustmentInput
): WeightAdjustmentResult {
  const severityAdj = input.severity * input.baseWeight;
  const confidenceAdj = (input.confidence - 0.3) * input.baseWeight * 0.5;
  const convergenceAdj = (input.convergence - 0.2) * input.baseWeight * 0.4;
  const regionalAdj = (input.regionalRelevance - 1.0) * input.baseWeight;
  const timeAdj = (input.timeDecay - 1.0) * input.baseWeight;

  const finalWeight = computeDynamicWeight(input);
  const cappedWeight = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, finalWeight));

  return {
    edge: edgeLabel,
    baseWeight: input.baseWeight,
    adjustments: {
      severity: parseFloat(severityAdj.toFixed(4)),
      confidence: parseFloat(confidenceAdj.toFixed(4)),
      convergence: parseFloat(convergenceAdj.toFixed(4)),
      regional_relevance: parseFloat(regionalAdj.toFixed(4)),
      time_decay: parseFloat(timeAdj.toFixed(4)),
    },
    finalWeight: parseFloat(finalWeight.toFixed(4)),
    cappedWeight: parseFloat(cappedWeight.toFixed(4)),
  };
}

/**
 * Get severity multiplier tier for a given severity score.
 */
export function getSeverityMultiplier(severity: number): number {
  if (severity >= SEVERITY_TIERS.critical.threshold)
    return SEVERITY_TIERS.critical.multiplier;
  if (severity >= SEVERITY_TIERS.high.threshold)
    return SEVERITY_TIERS.high.multiplier;
  if (severity >= SEVERITY_TIERS.moderate.threshold)
    return SEVERITY_TIERS.moderate.multiplier;
  return SEVERITY_TIERS.low.multiplier;
}

/**
 * Get domain multiplier for a given node ID.
 */
export function getDomainMultiplier(nodeId: string): number {
  return DOMAIN_MULTIPLIERS[nodeId] ?? 1.0;
}

/**
 * Compute time decay based on signal age in hours.
 * Uses exponential decay: e^(-λt) where λ = 0.02
 */
export function computeTimeDecay(signalAgeHours: number): number {
  const lambda = 0.02;
  return Math.exp(-lambda * signalAgeHours);
}

/**
 * Compute source convergence score.
 * More independent sources confirming the same event → higher convergence.
 */
export function computeConvergence(sourceCount: number, maxSources: number = 5): number {
  return Math.min(1.0, sourceCount / maxSources);
}

/**
 * Apply dynamic weights to all edges in the graph based on an event.
 * Returns updated edges with dynamicWeight set.
 */
export function applyDynamicWeights(
  edges: GraphEdge[],
  event: NormalizedEvent,
  signalAgeHours: number = 0
): GraphEdge[] {
  const convergence = computeConvergence(event.sources.length);
  const timeDecay = computeTimeDecay(signalAgeHours);
  const regionalRelevance = event.region === "GCC" ? 1.0 : 0.7;

  return edges.map((edge) => {
    const domainMultiplier = getDomainMultiplier(edge.to);

    const dynamicWeight = computeDynamicWeight({
      baseWeight: edge.baseWeight,
      severity: event.severity,
      confidence: event.confidence,
      convergence,
      regionalRelevance,
      timeDecay,
      domainMultiplier,
    });

    return {
      ...edge,
      dynamicWeight: parseFloat(dynamicWeight.toFixed(4)),
    };
  });
}
