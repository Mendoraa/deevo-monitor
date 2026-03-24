/**
 * Action Orchestrator — Sublayer 4
 *
 * Generates executive action outputs.
 * Dynamically selects recommendations based on priority assessment,
 * then enriches with context. Falls back to MOCK_RECOMMENDATIONS
 * only when no contextual data is available.
 */

import type { SystemContext, RecommendedAction, UrgencyLevel } from "./orchestrator.types";
import type { PriorityAssessment } from "./priorityEngine";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock-data";

/**
 * Dynamic recommendation rules — maps system conditions to actions.
 * Each rule has a condition function and an action template.
 */
const DYNAMIC_RULES: {
  id: string;
  condition: (ctx: SystemContext, priority: PriorityAssessment) => boolean;
  action: (ctx: SystemContext, priority: PriorityAssessment) => RecommendedAction;
}[] = [
  {
    id: "DR01",
    condition: (ctx) => ctx.top_risk_score >= 80,
    action: (ctx, p) => ({
      title: `Escalate ${ctx.top_risk_name} to executive risk committee — score at ${ctx.top_risk_score}`,
      priority: "critical",
      urgency_level: p.urgency,
      rationale: [
        `${ctx.top_risk_name} has breached critical threshold (${ctx.top_risk_score}/100)`,
        ...p.top_factors.slice(0, 2),
      ],
      affected_systems: ["Executive Dashboard", "Risk Committee", ctx.top_risk_name],
    }),
  },
  {
    id: "DR02",
    condition: (ctx) => ctx.has_active_event && ctx.causal_chain_length >= 3,
    action: (ctx, p) => ({
      title: `Review causal propagation from "${ctx.event_title}" — ${ctx.causal_chain_length} nodes active`,
      priority: "high",
      urgency_level: p.urgency,
      rationale: [
        `Active event with ${ctx.causal_chain_length}-step causal chain showing propagation`,
        `Event category: ${ctx.event_category}`,
        ...p.top_factors.slice(0, 1),
      ],
      affected_systems: ["Causal Reasoning", "Sector Impact", "Insurance Scoring"],
    }),
  },
  {
    id: "DR03",
    condition: (ctx) => ctx.scores_above_threshold >= 3,
    action: (ctx, p) => ({
      title: `Multi-score alert: ${ctx.scores_above_threshold} of 5 insurance scores above threshold`,
      priority: "high",
      urgency_level: p.urgency,
      rationale: [
        `${ctx.scores_above_threshold} scores simultaneously elevated — systemic pressure detected`,
        `Dominant risk: ${ctx.top_risk_name} (${ctx.top_risk_score})`,
        ...p.top_factors.slice(0, 1),
      ],
      affected_systems: ["Insurance Scoring", "Portfolio Management", "Underwriting"],
    }),
  },
  {
    id: "DR04",
    condition: (ctx) => ctx.active_scenario_tier === "severe",
    action: (ctx, p) => ({
      title: "Activate severe scenario response — review reserve adequacy and reinsurance triggers",
      priority: "critical",
      urgency_level: "critical",
      rationale: [
        "Severe scenario tier detected — worst-case economic projections active",
        ...p.top_factors.slice(0, 2),
      ],
      affected_systems: ["Scenario Engine", "Reserves", "Reinsurance", "Claims"],
    }),
  },
  {
    id: "DR05",
    condition: (ctx) => ctx.signals_trending_up >= 5,
    action: (ctx, p) => ({
      title: `Strong upward momentum: ${ctx.signals_trending_up} signals trending up — tighten monitoring`,
      priority: "medium",
      urgency_level: p.urgency,
      rationale: [
        `${ctx.signals_trending_up} of ${ctx.total_signals} signals trending upward`,
        `Dominant category: ${ctx.dominant_signal_category || "mixed"}`,
      ],
      affected_systems: ["Signal Monitor", "Alert System"],
    }),
  },
  {
    id: "DR06",
    condition: (ctx) => ctx.has_active_event && ctx.event_category === "energy_supply",
    action: (ctx, p) => ({
      title: "Monitor oil price trajectory — energy supply disruption impacts motor claims costs",
      priority: "high",
      urgency_level: p.urgency,
      rationale: [
        `Energy supply event: "${ctx.event_title}"`,
        "Oil price volatility directly affects motor insurance repair costs and claims frequency",
        ...p.top_factors.slice(0, 1),
      ],
      affected_systems: ["Motor Portfolio", "Claims Pricing", "Market Stress"],
    }),
  },
];

/**
 * Generate the primary recommended action.
 * Tries dynamic rules first, falls back to mock data.
 */
export function generatePrimaryAction(
  ctx: SystemContext,
  priority: PriorityAssessment
): RecommendedAction {
  // Try dynamic rules — first matching rule wins (ordered by severity)
  for (const rule of DYNAMIC_RULES) {
    if (rule.condition(ctx, priority)) {
      return rule.action(ctx, priority);
    }
  }

  // Fallback: use mock recommendations sorted by priority
  const recs = [...MOCK_RECOMMENDATIONS].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });

  const topRec = recs[0];

  if (!topRec) {
    return {
      title: "Continue monitoring active signals",
      priority: "low",
      urgency_level: "low",
      rationale: ["No actionable recommendations triggered by current state"],
      affected_systems: [],
    };
  }

  return {
    title: topRec.title,
    priority: topRec.priority,
    urgency_level: priority.urgency,
    rationale: [topRec.rationale, ...priority.top_factors.slice(0, 2)],
    affected_systems: topRec.affected_scores,
  };
}

/**
 * Generate "Why Now" explanation.
 * Always present — the user must know why this action is urgent NOW.
 */
export function generateWhyNow(
  ctx: SystemContext,
  priority: PriorityAssessment
): string {
  const parts: string[] = [];

  if (ctx.has_active_event) {
    parts.push(`Active event: "${ctx.event_title}"`);
  }

  if (ctx.signals_trending_up > 3) {
    parts.push(`${ctx.signals_trending_up} of ${ctx.total_signals} signals trending upward`);
  }

  if (ctx.scores_above_threshold >= 2) {
    parts.push(`${ctx.scores_above_threshold} risk scores above threshold`);
  }

  if (ctx.causal_chain_length > 0) {
    parts.push(`${ctx.causal_chain_length}-step causal chain showing active propagation`);
  }

  if (ctx.active_scenario_tier === "severe") {
    parts.push("Severe scenario tier active — worst-case projections in effect");
  } else if (ctx.active_scenario_tier === "elevated") {
    parts.push("Elevated scenario tier — above-baseline economic projections active");
  }

  if (parts.length === 0) {
    return "Continuous monitoring — no immediate trigger.";
  }

  return parts.join(". ") + ". Risk propagation is active and converging.";
}

/**
 * Generate next-best monitoring actions.
 */
export function generateNextActions(ctx: SystemContext): string[] {
  const actions: string[] = [];

  if (ctx.has_active_event) {
    actions.push(`Track "${ctx.event_title}" for severity changes`);
  }

  if (ctx.dominant_signal_category === "macro") {
    actions.push("Monitor oil price and inflation trajectory");
  }
  if (ctx.dominant_signal_category === "claims") {
    actions.push("Track claims frequency and severity movement");
  }

  actions.push("Watch for GCC spillover divergence across markets");

  if (ctx.top_risk_score > 60) {
    actions.push(`Monitor ${ctx.top_risk_name} for threshold breach`);
  }

  if (ctx.active_scenario_tier && ctx.active_scenario_tier !== "base") {
    actions.push("Review scenario assumptions against incoming data");
  }

  actions.push("Review calibration cycle for weight drift");

  return actions.slice(0, 4);
}
