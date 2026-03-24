/** Full Cortex response types. */

import type { EconomicAnalysisResponse } from "./economic-layer";
import type { InsuranceAnalysis } from "./insurance";
import type { GraphPropagationResult } from "./graph";

export interface ExplanationBundle {
  event_id: string;
  what_happened: string;
  why_it_matters: string;
  how_it_propagates: string[];
  economic_narrative: string;
  insurance_narrative: string;
  gcc_narrative: string;
  what_to_do: string;
  confidence_assessment: string;
  systemic_risk_summary: string;
}

export interface FullCortexResponse {
  economic: EconomicAnalysisResponse;
  insurance: InsuranceAnalysis;
  graph: GraphPropagationResult;
  explanation: ExplanationBundle;
}

// ─── Phase 3: GCC Insurance Scoring ────────────────────────────

export interface ScoreFactor {
  name: string;
  contribution: number;
  weight: number;
  source: string;
  direction: "positive" | "negative" | "neutral";
}

export interface InsuranceScore {
  name: string;
  score: number;
  level: string;
  factors: ScoreFactor[];
  trend: "improving" | "stable" | "deteriorating";
  confidence: number;
}

export interface GCCScorecard {
  country: string;
  product?: string;
  timestamp: string;
  market_stress: InsuranceScore;
  claims_pressure: InsuranceScore;
  fraud_exposure: InsuranceScore;
  underwriting_risk: InsuranceScore;
  overall_risk: string;
  recommended_actions: string[];
}

export interface ScorecardResponse {
  event_id: string;
  event_class: string;
  scorecards: GCCScorecard[];
  total_countries: number;
}

export interface CalibratedEdge {
  edge: string;
  base_weight: number;
  market_adjustment: number;
  regional_sensitivity: number;
  confidence_factor: number;
  time_decay: number;
  calibrated_weight: number;
  drift_from_base_pct: number;
}

export interface CalibrationResponse {
  calibrated_edges: CalibratedEdge[];
  total_edges: number;
  drift_alerts: { edge: string; drift_pct: number; direction: string; reason: string }[];
  drift_alert_count: number;
  country?: string;
  signals_processed: number;
}

export interface FullCortexV3Response extends FullCortexResponse {
  scorecards: ScorecardResponse;
  version: string;
  phase: string;
}
