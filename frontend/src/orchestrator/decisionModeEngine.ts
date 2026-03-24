/**
 * Decision Mode Engine — Sublayer 3
 *
 * Selects the correct operational mode based on system state.
 * Deterministic rules, no hidden behavior.
 */

import type { SystemContext, DecisionMode, UrgencyLevel } from "./orchestrator.types";

/**
 * Determine which decision mode the system should enter.
 * Rules are explicit and inspectable.
 */
export function selectDecisionMode(
  ctx: SystemContext,
  urgency: UrgencyLevel
): DecisionMode {
  // Rule 1: Critical urgency → Escalation
  if (urgency === "critical") {
    return "escalation";
  }

  // Rule 2: Active event with elevated urgency → Decision
  if (ctx.has_active_event && urgency === "elevated") {
    return "decision";
  }

  // Rule 3: Active event with causal chain → Analysis
  if (ctx.has_active_event && ctx.causal_chain_length > 0) {
    return "analysis";
  }

  // Rule 4: Scores above threshold but no event → Analysis
  if (ctx.scores_above_threshold >= 3 && !ctx.has_active_event) {
    return "analysis";
  }

  // Rule 5: Moderate urgency → Analysis
  if (urgency === "moderate") {
    return "analysis";
  }

  // Default: Monitor
  return "monitor";
}

/**
 * Get human-readable description of why this mode was selected.
 */
export function getModeRationale(mode: DecisionMode, ctx: SystemContext): string {
  switch (mode) {
    case "escalation":
      return `Critical risk level detected — ${ctx.top_risk_name} at ${ctx.top_risk_score}. Immediate executive attention required.`;
    case "decision":
      return `Active event with elevated urgency. System recommends action-first view with top recommendations visible.`;
    case "analysis":
      return ctx.has_active_event
        ? `Active event detected with ${ctx.causal_chain_length}-step causal chain. Reasoning layer active for inspection.`
        : `${ctx.scores_above_threshold} risk scores above threshold. Analysis mode for deeper investigation.`;
    case "monitor":
      return "System operating within normal parameters. Passive signal monitoring active.";
  }
}
