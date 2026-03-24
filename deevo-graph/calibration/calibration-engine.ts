/**
 * Live Calibration Engine — Phase 3A
 *
 * Adjusts graph edge weights based on real market feedback.
 * Replaces static weights with adaptive weights that learn
 * from predicted vs actual outcomes.
 *
 * Formula:
 *   Final Weight = Base Weight × Market Adjustment × Regional Sensitivity
 *                  × Confidence Factor × Time Decay Modifier
 *
 * Architecture Decision:
 * - Version 1: Daily/weekly batch calibration (current)
 * - Version 2: Event-triggered recalibration
 * - Version 3: Closed-loop continuous learning
 */

import type { GraphEdge, GraphState, GCCCountry } from "../types";
import type { LiveSignal, MacroSignal, InsuranceSignal, PortfolioSignal } from "../signals/signal-types";
import { SIGNAL_NODE_MAP } from "../signals/signal-types";

// ─── Calibration State ─────────────────────────────────────────

export interface CalibrationState {
  edgeAdjustments: Record<string, EdgeCalibration>;
  nodeConfidence: Record<string, number>;
  lastCalibrated: string;
  calibrationVersion: number;
  driftAlerts: DriftAlert[];
}

export interface EdgeCalibration {
  edgeKey: string; // "from→to"
  baseWeight: number;
  marketAdjustment: number;
  regionalSensitivity: number;
  confidenceFactor: number;
  timeDecayModifier: number;
  calibratedWeight: number;
  lastUpdated: string;
  updateCount: number;
  driftFromBase: number;
}

export interface DriftAlert {
  edgeKey: string;
  driftPercentage: number;
  direction: "amplified" | "dampened";
  reason: string;
  timestamp: string;
}

// ─── GCC Regional Sensitivity Profiles ─────────────────────────

const GCC_SENSITIVITY: Record<GCCCountry, Record<string, number>> = {
  saudi: {
    oil_price: 1.4, // High oil dependency → amplify oil edges
    government_spending: 1.3,
    inflation_rate: 0.9,
    credit_growth: 1.0,
    claims_severity: 1.1,
  },
  uae: {
    oil_price: 0.7, // Diversified → dampen oil edges
    trade_volume: 1.4, // Trade hub → amplify trade edges
    real_estate_index: 1.3,
    inflation_rate: 1.1,
    claims_severity: 1.0,
  },
  kuwait: {
    oil_price: 1.6, // Highest oil dependency
    government_spending: 1.2,
    inflation_rate: 0.8,
    credit_growth: 0.9,
    claims_severity: 1.2,
  },
  qatar: {
    oil_price: 1.1, // LNG-heavy
    trade_volume: 1.2,
    inflation_rate: 0.9,
    credit_growth: 1.0,
    claims_severity: 1.0,
  },
  bahrain: {
    oil_price: 1.3,
    interest_rate: 1.3, // Low fiscal buffer → rate sensitive
    inflation_rate: 1.2,
    credit_growth: 1.1,
    claims_severity: 1.3,
  },
  oman: {
    oil_price: 1.4,
    interest_rate: 1.2,
    inflation_rate: 1.1,
    credit_growth: 1.0,
    claims_severity: 1.2,
  },
};

// ─── Core Calibration Engine ───────────────────────────────────

/**
 * Initialize a fresh calibration state from a graph.
 */
export function initCalibration(graph: GraphState): CalibrationState {
  const edgeAdjustments: Record<string, EdgeCalibration> = {};

  for (const edge of graph.edges) {
    const key = `${edge.from}→${edge.to}`;
    edgeAdjustments[key] = {
      edgeKey: key,
      baseWeight: edge.baseWeight,
      marketAdjustment: 1.0,
      regionalSensitivity: 1.0,
      confidenceFactor: 1.0,
      timeDecayModifier: 1.0,
      calibratedWeight: edge.baseWeight,
      lastUpdated: new Date().toISOString(),
      updateCount: 0,
      driftFromBase: 0,
    };
  }

  const nodeConfidence: Record<string, number> = {};
  for (const nodeId of Object.keys(graph.nodes)) {
    nodeConfidence[nodeId] = 0.7; // Initial confidence
  }

  return {
    edgeAdjustments,
    nodeConfidence,
    lastCalibrated: new Date().toISOString(),
    calibrationVersion: 1,
    driftAlerts: [],
  };
}

/**
 * Calibrate graph weights using a batch of live signals.
 *
 * This is the Version 1 approach: batch calibration.
 * Signals are processed, adjustments computed, and edges updated.
 */
export function calibrateFromSignals(
  state: CalibrationState,
  signals: LiveSignal[],
  country?: GCCCountry
): CalibrationState {
  const updated = { ...state };
  updated.driftAlerts = [];

  for (const signal of signals) {
    // Find affected graph nodes
    const affectedNodes = SIGNAL_NODE_MAP[signal.indicator] || [];
    if (affectedNodes.length === 0) continue;

    // Compute market adjustment from signal change
    const marketAdj = computeMarketAdjustment(signal);

    // Compute regional sensitivity
    const regionalSens = country
      ? (GCC_SENSITIVITY[country]?.[signal.indicator] ?? 1.0)
      : 1.0;

    // Compute confidence factor
    const confFactor = 0.5 + signal.confidence * 0.5;

    // Compute time decay
    const signalAge = computeSignalAgeHours(signal.timestamp);
    const timeDecay = Math.exp(-0.01 * signalAge);

    // Update all edges connected to affected nodes
    for (const nodeId of affectedNodes) {
      for (const [edgeKey, cal] of Object.entries(updated.edgeAdjustments)) {
        if (edgeKey.startsWith(nodeId + "→") || edgeKey.endsWith("→" + nodeId)) {
          const newCal = { ...cal };

          // Exponential moving average for smooth calibration
          const alpha = 0.3; // Learning rate
          newCal.marketAdjustment =
            alpha * marketAdj + (1 - alpha) * newCal.marketAdjustment;
          newCal.regionalSensitivity =
            alpha * regionalSens + (1 - alpha) * newCal.regionalSensitivity;
          newCal.confidenceFactor =
            alpha * confFactor + (1 - alpha) * newCal.confidenceFactor;
          newCal.timeDecayModifier = timeDecay;

          // Compute calibrated weight
          newCal.calibratedWeight = clampWeight(
            newCal.baseWeight *
              newCal.marketAdjustment *
              newCal.regionalSensitivity *
              newCal.confidenceFactor *
              newCal.timeDecayModifier
          );

          // Track drift
          newCal.driftFromBase =
            ((newCal.calibratedWeight - newCal.baseWeight) / newCal.baseWeight) * 100;

          newCal.updateCount++;
          newCal.lastUpdated = new Date().toISOString();

          updated.edgeAdjustments[edgeKey] = newCal;

          // Generate drift alert if significant
          if (Math.abs(newCal.driftFromBase) > 25) {
            updated.driftAlerts.push({
              edgeKey,
              driftPercentage: parseFloat(newCal.driftFromBase.toFixed(1)),
              direction: newCal.driftFromBase > 0 ? "amplified" : "dampened",
              reason: `Signal ${signal.indicator} (${signal.change > 0 ? "+" : ""}${signal.change.toFixed(1)}%) ` +
                `caused ${Math.abs(newCal.driftFromBase).toFixed(1)}% drift from base weight`,
              timestamp: new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  updated.lastCalibrated = new Date().toISOString();
  updated.calibrationVersion++;

  return updated;
}

/**
 * Apply calibrated weights back to a graph.
 */
export function applyCalibratedWeights(
  graph: GraphState,
  state: CalibrationState
): GraphState {
  const updatedEdges = graph.edges.map((edge) => {
    const key = `${edge.from}→${edge.to}`;
    const cal = state.edgeAdjustments[key];
    if (cal) {
      return { ...edge, dynamicWeight: cal.calibratedWeight };
    }
    return edge;
  });

  return { ...graph, edges: updatedEdges };
}

/**
 * Get calibration summary for dashboard display.
 */
export function getCalibrationSummary(state: CalibrationState): {
  totalEdges: number;
  calibratedEdges: number;
  avgDrift: number;
  maxDrift: { edge: string; drift: number };
  driftAlertCount: number;
  version: number;
} {
  const calibrations = Object.values(state.edgeAdjustments);
  const updated = calibrations.filter((c) => c.updateCount > 0);

  const drifts = calibrations.map((c) => Math.abs(c.driftFromBase));
  const avgDrift = drifts.reduce((a, b) => a + b, 0) / Math.max(drifts.length, 1);

  const maxDriftCal = calibrations.reduce((max, c) =>
    Math.abs(c.driftFromBase) > Math.abs(max.driftFromBase) ? c : max
  );

  return {
    totalEdges: calibrations.length,
    calibratedEdges: updated.length,
    avgDrift: parseFloat(avgDrift.toFixed(2)),
    maxDrift: {
      edge: maxDriftCal.edgeKey,
      drift: parseFloat(maxDriftCal.driftFromBase.toFixed(2)),
    },
    driftAlertCount: state.driftAlerts.length,
    version: state.calibrationVersion,
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function computeMarketAdjustment(signal: LiveSignal): number {
  // Positive change → amplify related edges
  // Negative change → dampen related edges
  // Scale: ±50% change → ±0.5 adjustment
  const changeImpact = Math.tanh(signal.change / 50); // Bounded [-1, 1]
  return 1.0 + changeImpact * 0.5;
}

function computeSignalAgeHours(timestamp: string): number {
  const signalTime = new Date(timestamp).getTime();
  const now = Date.now();
  return Math.max(0, (now - signalTime) / (1000 * 60 * 60));
}

function clampWeight(weight: number): number {
  return Math.max(0.01, Math.min(1.0, weight));
}
