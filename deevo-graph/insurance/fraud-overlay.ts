/**
 * Fraud Overlay — Insurance Intelligence Layer
 *
 * Assesses fraud pressure from graph state.
 * High inflation + claims surges create opportunistic fraud conditions.
 * PDPL compliance: fraud monitoring triggers at elevated thresholds.
 */

import type { GraphState } from "../types";
import type { FraudOverlayResult } from "../types";

// ─── Fraud Factors ─────────────────────────────────────────────

const FRAUD_FACTORS: Record<string, { nodeId: string; weight: number; rationale: string }> = {
  inflation: {
    nodeId: "inflation_pressure",
    weight: 0.35,
    rationale: "Inflation stress increases opportunistic fraud pressure on claims",
  },
  claims: {
    nodeId: "insurance_claims",
    weight: 0.45,
    rationale: "Claims surges reduce manual scrutiny quality and increase fraud window",
  },
  credit_risk: {
    nodeId: "credit_risk",
    weight: 0.20,
    rationale: "Credit stress incentivizes fraudulent claims and premium evasion",
  },
  shipping: {
    nodeId: "shipping_cost",
    weight: 0.15,
    rationale: "Shipping disruption creates cargo fraud and false declaration opportunities",
  },
};

// ─── PDPL-Compliant Monitoring Levels ──────────────────────────

function getMonitoringLevel(fraudPressure: number): string {
  if (fraudPressure >= 0.6) return "CRITICAL — mandatory PDPL-compliant enhanced surveillance";
  if (fraudPressure >= 0.4) return "HIGH — automated pattern detection + manual review";
  if (fraudPressure >= 0.2) return "ELEVATED — increased sampling frequency";
  return "STANDARD — routine monitoring";
}

// ─── Core Function ─────────────────────────────────────────────

export function fraudOverlay(graphState: GraphState): FraudOverlayResult {
  let fraudPressure = 0;
  const rationale: string[] = [];

  for (const [, config] of Object.entries(FRAUD_FACTORS)) {
    const nodeValue = Math.abs(graphState.nodes[config.nodeId]?.value || 0);
    if (nodeValue > 0.05) {
      const contribution = nodeValue * config.weight;
      fraudPressure += contribution;
      rationale.push(
        `${config.rationale} (${(nodeValue * 100).toFixed(0)}% pressure → ` +
        `${(contribution * 100).toFixed(1)}% fraud risk)`
      );
    }
  }

  fraudPressure = Math.min(1.0, fraudPressure);
  const monitoringLevel = getMonitoringLevel(fraudPressure);

  return {
    fraudPressure: parseFloat(fraudPressure.toFixed(4)),
    monitoringLevel,
    rationale,
  };
}
