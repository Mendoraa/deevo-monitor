/** Insurance Intelligence Layer types. */

export interface InsuranceLineImpact {
  line: string;
  claims_increase_pct: number;
  loss_ratio_delta: number;
  premium_adjustment_pct: number;
  fraud_probability: number;
  reinsurance_trigger: boolean;
  severity_label: string;
  rationale: string;
}

export interface UnderwritingRisk {
  new_business_risk: string;
  portfolio_exposure_pct: number;
  concentration_risk: string;
  recommended_action: string;
}

export interface ClaimsProjection {
  estimated_claim_count_increase: string;
  average_claim_severity_change: string;
  catastrophe_reserve_trigger: boolean;
  ibnr_adjustment_needed: boolean;
  estimated_timeline_days: number;
}

export interface InsuranceAnalysis {
  event_id: string;
  overall_risk_level: string;
  confidence: number;
  affected_lines: InsuranceLineImpact[];
  underwriting_risk: UnderwritingRisk;
  claims_projection: ClaimsProjection;
  regulatory_flags: string[];
  gcc_insurance_exposure: Record<string, string>;
  decision_recommendation: string;
}
