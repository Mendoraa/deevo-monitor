/**
 * Underwriting Overlay — Insurance Intelligence Layer
 *
 * Assesses underwriting tightening pressure from graph state.
 * When credit risk rises and liquidity drops, underwriters
 * tighten risk appetite and restrict new business.
 */

import type { GraphState } from "../types";
import type { UnderwritingOverlayResult } from "../types";

// ─── Underwriting Factors ──────────────────────────────────────

const UW_FACTORS: Record<string, { nodeId: string; weight: number; rationale: string }> = {
  credit: {
    nodeId: "credit_risk",
    weight: 0.40,
    rationale: "Credit stress tightens risk appetite across all lines",
  },
  liquidity: {
    nodeId: "bank_liquidity",
    weight: 0.30,
    rationale: "Liquidity pressure pushes conservative underwriting posture",
  },
  risk_appetite: {
    nodeId: "risk_appetite",
    weight: 0.35,
    rationale: "Declining risk appetite restricts capacity and raises pricing",
  },
  sovereign: {
    nodeId: "sovereign_risk",
    weight: 0.20,
    rationale: "Sovereign risk elevation triggers country-level exclusions",
  },
  insurance_premiums: {
    nodeId: "insurance_premiums",
    weight: 0.25,
    rationale: "Premium hardening indicates market-wide tightening cycle",
  },
};

// ─── Core Function ─────────────────────────────────────────────

export function underwritingOverlay(graphState: GraphState): UnderwritingOverlayResult {
  let tighteningScore = 0;
  const rationale: string[] = [];

  for (const [, config] of Object.entries(UW_FACTORS)) {
    const nodeValue = Math.abs(graphState.nodes[config.nodeId]?.value || 0);
    if (nodeValue > 0.05) {
      const contribution = nodeValue * config.weight;
      tighteningScore += contribution;
      rationale.push(
        `${config.rationale} (${(nodeValue * 100).toFixed(0)}% stress → ` +
        `${(contribution * 100).toFixed(1)}% tightening)`
      );
    }
  }

  tighteningScore = Math.min(1.0, tighteningScore);

  // Determine new business risk posture
  let newBusinessRisk: string;
  if (tighteningScore >= 0.6) {
    newBusinessRisk = "restricted — suspend new capacity deployment";
  } else if (tighteningScore >= 0.4) {
    newBusinessRisk = "cautious — enhanced due diligence required";
  } else if (tighteningScore >= 0.2) {
    newBusinessRisk = "selective — standard terms with monitoring";
  } else {
    newBusinessRisk = "normal — standard underwriting posture";
  }

  return {
    tighteningScore: parseFloat(tighteningScore.toFixed(4)),
    newBusinessRisk,
    rationale,
  };
}
