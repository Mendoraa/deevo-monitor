/**
 * AI Decision Orchestrator — Type Definitions
 *
 * The orchestrator sits above ALL layers:
 *   Eli Dashboard → UI Design System → Interaction Layer →
 *   Economic Layer → Causal Reasoning → Orchestrator
 *
 * It reads system state, prioritizes risk, selects mode,
 * generates executive decisions, and learns from feedback.
 */

export type DecisionMode = "monitor" | "analysis" | "decision" | "escalation";
export type UrgencyLevel = "low" | "moderate" | "elevated" | "critical";
export type OrchestratorState = "standby" | "active" | "processing" | "escalated";

/** Recommended executive action. */
export interface RecommendedAction {
  title: string;
  priority: "critical" | "high" | "medium" | "low";
  urgency_level: UrgencyLevel;
  rationale: string[];
  affected_systems: string[];
}

/** Learning feedback state — lightweight, deterministic, inspectable. */
export interface LearningFeedback {
  last_mode: DecisionMode;
  feedback_pending: boolean;
  accepted_actions: string[];
  ignored_actions: string[];
  escalation_count: number;
  mode_history: DecisionMode[];
  priority_memory: Record<string, number>;
}

/** Full orchestrator output. */
export interface OrchestratorOutput {
  orchestrator_state: OrchestratorState;
  active_decision_mode: DecisionMode;
  primary_focus: string;
  dominant_risk: string;
  recommended_action: RecommendedAction;
  confidence_score: number;
  why_now: string;
  next_best_actions: string[];
  learning_feedback_state: LearningFeedback;
  timestamp: string;
}

/** Context snapshot consumed by the orchestrator. */
export interface SystemContext {
  // Event context
  has_active_event: boolean;
  event_title: string | null;
  event_category: string | null;
  event_severity: number | null;
  event_region: string | null;

  // Causal chain
  causal_chain_length: number;
  causal_chain_summary: string | null;

  // Scoring
  top_risk_score: number;
  top_risk_name: string;
  scores_above_threshold: number; // how many scores > 60

  // Scenario
  active_scenario_tier: "base" | "elevated" | "severe" | null;

  // Interaction
  current_interaction_mode: string;
  user_attention_zone: string | null;

  // Signals
  total_signals: number;
  signals_trending_up: number;
  dominant_signal_category: string | null;
}
