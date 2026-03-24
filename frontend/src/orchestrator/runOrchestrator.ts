/**
 * runOrchestrator — Main entry point.
 *
 * Reads system state → synthesizes context → prioritizes →
 * selects mode → generates action → updates learning.
 *
 * Single deterministic pass. No side effects. No hidden behavior.
 */

import type { FullCortexResponse } from "@/types/cortex";
import type {
  OrchestratorOutput,
  LearningFeedback,
} from "./orchestrator.types";
import { synthesizeContext } from "./contextSynthesizer";
import { assessPriority } from "./priorityEngine";
import { selectDecisionMode, getModeRationale } from "./decisionModeEngine";
import {
  generatePrimaryAction,
  generateWhyNow,
  generateNextActions,
} from "./actionOrchestrator";
import { recordModeChange, updatePriorityMemory } from "./learningLoop";

/**
 * Run the full orchestrator pipeline.
 *
 * @param data - Current Cortex analysis response (null if no analysis run)
 * @param interactionMode - Current UI interaction mode
 * @param flowStep - Current guided flow step
 * @param learning - Current learning state
 * @returns OrchestratorOutput + updated learning state
 */
export function runOrchestrator(
  data: FullCortexResponse | null,
  interactionMode: string,
  flowStep: string | null,
  learning: LearningFeedback
): { output: OrchestratorOutput; learning: LearningFeedback } {
  // Sublayer 1: Context Synthesis
  const ctx = synthesizeContext(data, interactionMode, flowStep);

  // Sublayer 2: Priority Assessment
  const priority = assessPriority(ctx);

  // Sublayer 3: Decision Mode Selection
  const selectedMode = selectDecisionMode(ctx, priority.urgency);

  // Sublayer 4: Action Orchestration
  const action = generatePrimaryAction(ctx, priority);
  const whyNow = generateWhyNow(ctx, priority);
  const nextActions = generateNextActions(ctx);

  // Sublayer 5: Learning Update
  let updatedLearning = recordModeChange(learning, selectedMode);
  updatedLearning = updatePriorityMemory(updatedLearning, ctx.top_risk_name);

  const output: OrchestratorOutput = {
    orchestrator_state: ctx.has_active_event ? "active" : "standby",
    active_decision_mode: selectedMode,
    primary_focus: priority.primary_focus,
    dominant_risk: priority.dominant_risk,
    recommended_action: action,
    confidence_score: priority.confidence,
    why_now: whyNow,
    next_best_actions: nextActions,
    learning_feedback_state: updatedLearning,
    timestamp: new Date().toISOString(),
  };

  return { output, learning: updatedLearning };
}
