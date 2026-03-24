/**
 * Claims Overlay — Insurance Intelligence Layer
 *
 * Converts graph state into claims probability assessment.
 * Inputs: inflation_pressure, shipping_cost, insurance_claims, crude_oil, political_risk
 * Output: claims probability + severity multiplier + rationale
 */

import type { GraphState } from "../types";
import type { ClaimsOverlayResult } from "../types";

// ─── Claims Weights ────────────────────────────────────────────

const CLAIMS_WEIGHTS: Record<string, { nodeId: string; weight: number; rationale: string }> = {
  inflation: {
    nodeId: "inflation_pressure",
    weight: 0.35,
    rationale: "Higher inflation raises claim cost severity and repair costs",
  },
  shipping: {
    nodeId: "shipping_cost",
    weight: 0.25,
    rationale: "Logistics disruption increases parts delivery delays and service costs",
  },
  insurance_claims: {
    nodeId: "insurance_claims",
    weight: 0.40,
    rationale: "Direct claims cascade from marine, energy, and property lines",
  },
  oil: {
    nodeId: "crude_oil",
    weight: 0.20,
    rationale: "Oil price spikes increase energy-related claim severity",
  },
  political_risk: {
    nodeId: "political_risk_insurance",
    weight: 0.30,
    rationale: "Political risk elevates war/terrorism/confiscation claims",
  },
};

// ─── Severity Multiplier Tiers ─────────────────────────────────

function getSeverityMultiplier(claimsProbability: number): number {
  if (claimsProbability >= 0.7) return 2.2; // catastrophic
  if (claimsProbability >= 0.5) return 1.7; // severe
  if (claimsProbability >= 0.3) return 1.3; // elevated
  return 1.0; // normal
}

// ─── Core Function ─────────────────────────────────────────────

export function claimsOverlay(graphState: GraphState): ClaimsOverlayResult {
  let claimsProbability = 0;
  const rationale: string[] = [];

  for (const [, config] of Object.entries(CLAIMS_WEIGHTS)) {
    const nodeValue = Math.abs(graphState.nodes[config.nodeId]?.value || 0);
    if (nodeValue > 0.05) {
      const contribution = nodeValue * config.weight;
      claimsProbability += contribution;
      rationale.push(
        `${config.rationale} (${(nodeValue * 100).toFixed(0)}% node impact → ` +
        `${(contribution * 100).toFixed(1)}% claims contribution)`
      );
    }
  }

  claimsProbability = Math.min(1.0, claimsProbability);
  const severityMultiplier = getSeverityMultiplier(claimsProbability);

  return {
    claimsProbability: parseFloat(claimsProbability.toFixed(4)),
    severityMultiplier,
    rationale,
  };
}
