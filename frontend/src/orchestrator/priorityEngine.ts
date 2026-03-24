/**
 * Priority Engine — Sublayer 2
 *
 * Ranks what matters now. Detects dominant signal,
 * highest-impact chain, and suppresses low-priority noise.
 */

import type { SystemContext, UrgencyLevel } from "./orchestrator.types";

export interface PriorityAssessment {
  dominant_risk: string;
  primary_focus: string;
  urgency: UrgencyLevel;
  confidence: number;
  top_factors: string[];
}

/**
 * Assess priority based on system context.
 * Deterministic, rule-based, no black-box.
 */
export function assessPriority(ctx: SystemContext): PriorityAssessment {
  const factors: string[] = [];
  let urgencyScore = 0;

  // Factor 1: Top risk score level
  if (ctx.top_risk_score >= 80) {
    urgencyScore += 4;
    factors.push(`${ctx.top_risk_name} at critical level (${ctx.top_risk_score})`);
  } else if (ctx.top_risk_score >= 60) {
    urgencyScore += 2;
    factors.push(`${ctx.top_risk_name} elevated (${ctx.top_risk_score})`);
  } else {
    urgencyScore += 1;
    factors.push(`${ctx.top_risk_name} moderate (${ctx.top_risk_score})`);
  }

  // Factor 2: Number of scores above threshold
  if (ctx.scores_above_threshold >= 3) {
    urgencyScore += 2;
    factors.push(`${ctx.scores_above_threshold} of 5 scores above threshold`);
  } else if (ctx.scores_above_threshold >= 2) {
    urgencyScore += 1;
    factors.push(`${ctx.scores_above_threshold} scores above threshold`);
  }

  // Factor 3: Signal momentum
  if (ctx.signals_trending_up >= 5) {
    urgencyScore += 2;
    factors.push(`${ctx.signals_trending_up} signals trending up — strong momentum`);
  } else if (ctx.signals_trending_up >= 3) {
    urgencyScore += 1;
    factors.push(`${ctx.signals_trending_up} signals trending up`);
  }

  // Factor 4: Active event severity
  if (ctx.event_severity !== null && ctx.event_severity >= 0.8) {
    urgencyScore += 3;
    factors.push("Active event at high severity");
  } else if (ctx.has_active_event) {
    urgencyScore += 1;
    factors.push("Active event detected");
  }

  // Factor 5: Scenario tier
  if (ctx.active_scenario_tier === "severe") {
    urgencyScore += 3;
    factors.push("Severe scenario tier active");
  } else if (ctx.active_scenario_tier === "elevated") {
    urgencyScore += 1;
    factors.push("Elevated scenario tier");
  }

  // Map urgency score to level
  let urgency: UrgencyLevel;
  if (urgencyScore >= 10) urgency = "critical";
  else if (urgencyScore >= 6) urgency = "elevated";
  else if (urgencyScore >= 3) urgency = "moderate";
  else urgency = "low";

  // Confidence based on data availability
  let confidence = 0.5;
  if (ctx.has_active_event) confidence += 0.15;
  if (ctx.causal_chain_length > 3) confidence += 0.1;
  if (ctx.total_signals >= 5) confidence += 0.1;
  if (ctx.scores_above_threshold >= 2) confidence += 0.1;
  confidence = Math.min(confidence, 0.95);

  // Build primary focus
  const primaryFocus = ctx.has_active_event
    ? `${ctx.event_title} — impact on ${ctx.dominant_signal_category || "GCC"} sector`
    : `${ctx.top_risk_name} monitoring — ${ctx.signals_trending_up} signals trending up`;

  return {
    dominant_risk: `${ctx.top_risk_name} (${ctx.top_risk_score}/100)`,
    primary_focus: primaryFocus,
    urgency,
    confidence,
    top_factors: factors.slice(0, 5),
  };
}
