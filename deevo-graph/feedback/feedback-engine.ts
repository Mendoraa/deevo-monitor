/**
 * Feedback Loop Engine — Phase 3A
 *
 * Closes the decision loop:
 *   Prediction → Actual Outcome → Error → Calibration Suggestion
 *
 * What we want the system to learn:
 * 1. Which signals were most explanatory?
 * 2. Which graph edges were weak or exaggerated?
 * 3. Which GCC market differs from the others?
 * 4. Which insurance line is most sensitive to shocks?
 * 5. When should we dampen certain variables?
 */

import type { GCCCountry } from "../types";

// ─── Feedback Types ────────────────────────────────────────────

export interface PredictionRecord {
  predictionId: string;
  eventClass: string;
  timestamp: string;
  predictions: {
    systemicRisk: number;
    claimsProbability: number;
    fraudPressure: number;
    underwritingTightening: number;
    gccSeverity: Record<GCCCountry, number>;
    topImpactedNodes: string[];
  };
}

export interface ActualOutcome {
  predictionId: string;
  observedAt: string;
  actuals: {
    lossRatioChange?: number;
    claimsSeverityChange?: number;
    fraudIncidentCount?: number;
    premiumAdjustment?: number;
    marketStressObserved?: number;
    gccActualImpact?: Partial<Record<GCCCountry, number>>;
  };
}

export interface FeedbackResult {
  predictionId: string;
  errors: {
    systemicRiskError: number;
    claimsProbabilityError: number;
    fraudPressureError: number;
    underwritingError: number;
    gccErrors: Partial<Record<GCCCountry, number>>;
  };
  calibrationSuggestions: CalibrationSuggestion[];
  nodeReliability: Record<string, number>;
  edgeConfidenceUpdates: Record<string, number>;
  overallAccuracy: number;
  learnings: string[];
}

export interface CalibrationSuggestion {
  targetEdge: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: string;
  confidence: number;
}

// ─── Feedback State ────────────────────────────────────────────

export interface FeedbackState {
  predictions: PredictionRecord[];
  outcomes: ActualOutcome[];
  feedbackHistory: FeedbackResult[];
  edgeErrorAccumulator: Record<string, number[]>;
  nodeReliabilityScores: Record<string, number>;
  signalExplanatoryPower: Record<string, number>;
  lastFeedbackCycle: string;
  totalCycles: number;
}

// ─── Core Feedback Engine ──────────────────────────────────────

/**
 * Initialize a fresh feedback state.
 */
export function initFeedbackState(): FeedbackState {
  return {
    predictions: [],
    outcomes: [],
    feedbackHistory: [],
    edgeErrorAccumulator: {},
    nodeReliabilityScores: {},
    signalExplanatoryPower: {},
    lastFeedbackCycle: new Date().toISOString(),
    totalCycles: 0,
  };
}

/**
 * Record a prediction for later comparison.
 */
export function recordPrediction(
  state: FeedbackState,
  prediction: PredictionRecord
): FeedbackState {
  return {
    ...state,
    predictions: [...state.predictions, prediction],
  };
}

/**
 * Record an actual outcome and compute feedback.
 */
export function recordOutcome(
  state: FeedbackState,
  outcome: ActualOutcome
): FeedbackState {
  const updated = {
    ...state,
    outcomes: [...state.outcomes, outcome],
  };

  // Find matching prediction
  const prediction = updated.predictions.find(
    (p) => p.predictionId === outcome.predictionId
  );

  if (prediction) {
    const feedback = computeFeedback(prediction, outcome, updated);
    updated.feedbackHistory = [...updated.feedbackHistory, feedback];
    updated.totalCycles++;
    updated.lastFeedbackCycle = new Date().toISOString();

    // Update node reliability scores
    for (const [nodeId, reliability] of Object.entries(feedback.nodeReliability)) {
      const prev = updated.nodeReliabilityScores[nodeId] ?? 0.7;
      updated.nodeReliabilityScores[nodeId] =
        0.7 * prev + 0.3 * reliability; // EMA
    }
  }

  return updated;
}

/**
 * Compute feedback by comparing prediction vs actual.
 */
export function computeFeedback(
  prediction: PredictionRecord,
  outcome: ActualOutcome,
  state: FeedbackState
): FeedbackResult {
  const actuals = outcome.actuals;
  const preds = prediction.predictions;

  // Compute errors
  const systemicRiskError = actuals.marketStressObserved !== undefined
    ? Math.abs(preds.systemicRisk - actuals.marketStressObserved)
    : 0;

  const claimsProbabilityError = actuals.claimsSeverityChange !== undefined
    ? Math.abs(preds.claimsProbability - normalizeActual(actuals.claimsSeverityChange))
    : 0;

  const fraudPressureError = actuals.fraudIncidentCount !== undefined
    ? Math.abs(preds.fraudPressure - normalizeActual(actuals.fraudIncidentCount / 100))
    : 0;

  const underwritingError = actuals.premiumAdjustment !== undefined
    ? Math.abs(preds.underwritingTightening - normalizeActual(actuals.premiumAdjustment / 100))
    : 0;

  // GCC errors
  const gccErrors: Partial<Record<GCCCountry, number>> = {};
  if (actuals.gccActualImpact) {
    for (const [country, actualSeverity] of Object.entries(actuals.gccActualImpact)) {
      const predicted = preds.gccSeverity[country as GCCCountry];
      if (predicted !== undefined && actualSeverity !== undefined) {
        gccErrors[country as GCCCountry] = Math.abs(predicted - actualSeverity);
      }
    }
  }

  // Overall accuracy (inverse of mean error)
  const errors = [systemicRiskError, claimsProbabilityError, fraudPressureError, underwritingError]
    .filter((e) => e > 0);
  const meanError = errors.length > 0
    ? errors.reduce((a, b) => a + b, 0) / errors.length
    : 0;
  const overallAccuracy = Math.max(0, 1 - meanError);

  // Generate calibration suggestions
  const calibrationSuggestions = generateCalibrationSuggestions(
    prediction,
    outcome,
    state
  );

  // Compute node reliability
  const nodeReliability: Record<string, number> = {};
  for (const nodeId of prediction.predictions.topImpactedNodes) {
    // Nodes that were predicted as impacted and actually were → high reliability
    // Nodes that were predicted but not observed → lower reliability
    nodeReliability[nodeId] = overallAccuracy;
  }

  // Edge confidence updates
  const edgeConfidenceUpdates: Record<string, number> = {};
  for (const suggestion of calibrationSuggestions) {
    edgeConfidenceUpdates[suggestion.targetEdge] = suggestion.confidence;
  }

  // Generate learnings
  const learnings = generateLearnings(
    systemicRiskError,
    claimsProbabilityError,
    gccErrors,
    overallAccuracy
  );

  return {
    predictionId: prediction.predictionId,
    errors: {
      systemicRiskError: parseFloat(systemicRiskError.toFixed(4)),
      claimsProbabilityError: parseFloat(claimsProbabilityError.toFixed(4)),
      fraudPressureError: parseFloat(fraudPressureError.toFixed(4)),
      underwritingError: parseFloat(underwritingError.toFixed(4)),
      gccErrors,
    },
    calibrationSuggestions,
    nodeReliability,
    edgeConfidenceUpdates,
    overallAccuracy: parseFloat(overallAccuracy.toFixed(4)),
    learnings,
  };
}

/**
 * Get feedback summary across all cycles.
 */
export function getFeedbackSummary(state: FeedbackState): {
  totalCycles: number;
  averageAccuracy: number;
  accuracyTrend: number[];
  topCalibrationTargets: string[];
  mostReliableNodes: string[];
  leastReliableNodes: string[];
} {
  const accuracies = state.feedbackHistory.map((f) => f.overallAccuracy);
  const avgAccuracy = accuracies.length > 0
    ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length
    : 0;

  // Sort nodes by reliability
  const nodeEntries = Object.entries(state.nodeReliabilityScores)
    .sort(([, a], [, b]) => b - a);

  // Collect most-suggested calibration targets
  const edgeFrequency: Record<string, number> = {};
  for (const fb of state.feedbackHistory) {
    for (const sug of fb.calibrationSuggestions) {
      edgeFrequency[sug.targetEdge] = (edgeFrequency[sug.targetEdge] || 0) + 1;
    }
  }
  const topTargets = Object.entries(edgeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([edge]) => edge);

  return {
    totalCycles: state.totalCycles,
    averageAccuracy: parseFloat(avgAccuracy.toFixed(4)),
    accuracyTrend: accuracies.slice(-10).map((a) => parseFloat(a.toFixed(4))),
    topCalibrationTargets: topTargets,
    mostReliableNodes: nodeEntries.slice(0, 5).map(([id]) => id),
    leastReliableNodes: nodeEntries.slice(-5).map(([id]) => id),
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function normalizeActual(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function generateCalibrationSuggestions(
  prediction: PredictionRecord,
  outcome: ActualOutcome,
  _state: FeedbackState
): CalibrationSuggestion[] {
  const suggestions: CalibrationSuggestion[] = [];
  const actuals = outcome.actuals;

  // If claims were over-predicted, suggest dampening claims-related edges
  if (
    actuals.claimsSeverityChange !== undefined &&
    prediction.predictions.claimsProbability >
      normalizeActual(actuals.claimsSeverityChange) + 0.15
  ) {
    suggestions.push({
      targetEdge: "insurance_claims→insurance_premiums",
      currentWeight: 0.45,
      suggestedWeight: 0.35,
      reason: "Claims probability was over-predicted — dampen claims cascade edges",
      confidence: 0.7,
    });
  }

  // If claims were under-predicted, suggest amplifying
  if (
    actuals.claimsSeverityChange !== undefined &&
    prediction.predictions.claimsProbability <
      normalizeActual(actuals.claimsSeverityChange) - 0.15
  ) {
    suggestions.push({
      targetEdge: "insurance_claims→insurance_premiums",
      currentWeight: 0.45,
      suggestedWeight: 0.55,
      reason: "Claims probability was under-predicted — amplify claims cascade edges",
      confidence: 0.7,
    });
  }

  // If systemic risk was over-estimated
  if (
    actuals.marketStressObserved !== undefined &&
    prediction.predictions.systemicRisk > actuals.marketStressObserved + 0.2
  ) {
    suggestions.push({
      targetEdge: "crude_oil→delivered_oil_cost",
      currentWeight: 0.80,
      suggestedWeight: 0.65,
      reason: "Systemic risk over-estimated — reduce oil price cascade amplification",
      confidence: 0.6,
    });
  }

  return suggestions;
}

function generateLearnings(
  systemicError: number,
  claimsError: number,
  gccErrors: Partial<Record<GCCCountry, number>>,
  accuracy: number
): string[] {
  const learnings: string[] = [];

  if (accuracy >= 0.8) {
    learnings.push("Model accuracy is strong — calibration adjustments should be minor");
  } else if (accuracy >= 0.6) {
    learnings.push("Model accuracy is moderate — review edge weights for top error sources");
  } else {
    learnings.push("Model accuracy needs improvement — consider structural graph changes");
  }

  if (systemicError > 0.3) {
    learnings.push("Systemic risk estimation has high error — review propagation depth and attenuation");
  }

  if (claimsError > 0.25) {
    learnings.push("Claims probability prediction diverges from actuals — recalibrate insurance overlay weights");
  }

  // Check GCC divergence
  const gccEntries = Object.entries(gccErrors);
  const highErrorCountries = gccEntries.filter(([, err]) => (err ?? 0) > 0.3);
  if (highErrorCountries.length > 0) {
    learnings.push(
      `GCC divergence detected: ${highErrorCountries.map(([c]) => c).join(", ")} ` +
      `have high prediction errors — consider country-specific sensitivity recalibration`
    );
  }

  return learnings;
}
