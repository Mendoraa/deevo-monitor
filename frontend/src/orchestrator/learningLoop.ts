/**
 * Learning Loop — Sublayer 5
 *
 * Lightweight, deterministic, inspectable learning.
 * No black-box RL. No hidden autonomous behavior.
 *
 * Tracks:
 * - mode history
 * - accepted/ignored actions
 * - escalation frequency
 * - priority memory (which risks keep appearing)
 */

import type { DecisionMode, LearningFeedback } from "./orchestrator.types";

/**
 * Create initial learning state.
 */
export function createInitialLearning(): LearningFeedback {
  return {
    last_mode: "monitor",
    feedback_pending: false,
    accepted_actions: [],
    ignored_actions: [],
    escalation_count: 0,
    mode_history: [],
    priority_memory: {},
  };
}

/**
 * Update learning state after mode change.
 */
export function recordModeChange(
  state: LearningFeedback,
  newMode: DecisionMode
): LearningFeedback {
  const history = [...state.mode_history, newMode].slice(-20); // Keep last 20
  return {
    ...state,
    last_mode: newMode,
    mode_history: history,
    escalation_count:
      newMode === "escalation" ? state.escalation_count + 1 : state.escalation_count,
  };
}

/**
 * Record user accepting an action.
 */
export function recordActionAccepted(
  state: LearningFeedback,
  actionTitle: string
): LearningFeedback {
  return {
    ...state,
    accepted_actions: [...state.accepted_actions, actionTitle].slice(-10),
    feedback_pending: false,
  };
}

/**
 * Record user ignoring/dismissing an action.
 */
export function recordActionIgnored(
  state: LearningFeedback,
  actionTitle: string
): LearningFeedback {
  return {
    ...state,
    ignored_actions: [...state.ignored_actions, actionTitle].slice(-10),
    feedback_pending: false,
  };
}

/**
 * Update priority memory — track which risks keep surfacing.
 */
export function updatePriorityMemory(
  state: LearningFeedback,
  riskName: string
): LearningFeedback {
  const memory = { ...state.priority_memory };
  memory[riskName] = (memory[riskName] || 0) + 1;
  return {
    ...state,
    priority_memory: memory,
  };
}

/**
 * Get the most frequently surfaced risks (for priority boosting).
 */
export function getTopPriorities(state: LearningFeedback, n: number = 3): string[] {
  return Object.entries(state.priority_memory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}
