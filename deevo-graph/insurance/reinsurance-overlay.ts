/**
 * Reinsurance Overlay — Insurance Intelligence Layer
 *
 * Assesses reinsurance treaty stress from graph state.
 * Triggers catastrophe reserve evaluation per IFRS 17.
 * Monitors treaty thresholds for notification requirements.
 */

import type { GraphState } from "../types";
import type { ReinsuranceOverlayResult } from "../types";

// ─── Reinsurance Factors ───────────────────────────────────────

const REINSURANCE_FACTORS: Record<string, { nodeId: string; weight: number; rationale: string }> = {
  marine_insurance: {
    nodeId: "marine_insurance",
    weight: 0.40,
    rationale: "Marine line stress directly impacts reinsurance treaty utilization",
  },
  energy_insurance: {
    nodeId: "energy_insurance",
    weight: 0.35,
    rationale: "Energy line claims accumulation triggers excess-of-loss layers",
  },
  political_risk: {
    nodeId: "political_risk_insurance",
    weight: 0.30,
    rationale: "Political risk accumulation can breach aggregate treaty limits",
  },
  insurance_premiums: {
    nodeId: "insurance_premiums",
    weight: 0.20,
    rationale: "Hard market premium increases signal reinsurance capacity constraints",
  },
  insurance_claims: {
    nodeId: "insurance_claims",
    weight: 0.45,
    rationale: "Claims accumulation directly erodes reinsurance retention levels",
  },
};

// ─── IFRS 17 Catastrophe Reserve Threshold ─────────────────────

/** Trigger catastrophe reserve review if treaty stress exceeds this */
const CATASTROPHE_RESERVE_THRESHOLD = 0.55;

// ─── Core Function ─────────────────────────────────────────────

export function reinsuranceOverlay(graphState: GraphState): ReinsuranceOverlayResult {
  let treatyStress = 0;
  const rationale: string[] = [];

  for (const [, config] of Object.entries(REINSURANCE_FACTORS)) {
    const nodeValue = Math.abs(graphState.nodes[config.nodeId]?.value || 0);
    if (nodeValue > 0.05) {
      const contribution = nodeValue * config.weight;
      treatyStress += contribution;
      rationale.push(
        `${config.rationale} (${(nodeValue * 100).toFixed(0)}% line stress → ` +
        `${(contribution * 100).toFixed(1)}% treaty impact)`
      );
    }
  }

  treatyStress = Math.min(1.0, treatyStress);
  const catastropheReserveTrigger = treatyStress >= CATASTROPHE_RESERVE_THRESHOLD;

  if (catastropheReserveTrigger) {
    rationale.push(
      `IFRS 17 ALERT: Treaty stress (${(treatyStress * 100).toFixed(0)}%) exceeds ` +
      `catastrophe reserve threshold (${(CATASTROPHE_RESERVE_THRESHOLD * 100).toFixed(0)}%). ` +
      `Immediate actuarial review and reinsurance broker notification required.`
    );
  }

  return {
    treatyStress: parseFloat(treatyStress.toFixed(4)),
    catastropheReserveTrigger,
    rationale,
  };
}
