/**
 * Signal Types — Phase 3 Live Signal Ingestion
 *
 * Three signal categories feed the calibration engine:
 * 1. Macro Signals — oil, rates, inflation, credit, government spending
 * 2. Insurance Signals — claims frequency, severity, fraud, underwriting
 * 3. Portfolio Signals — loss ratio, TAT, provider concentration, segments
 */

// ─── Macro Signals ─────────────────────────────────────────────

export interface MacroSignal {
  type: "macro";
  indicator: MacroIndicator;
  value: number;
  previousValue: number;
  change: number; // percentage change
  region: string;
  country?: string;
  source: string;
  timestamp: string;
  confidence: number;
}

export type MacroIndicator =
  | "oil_price"
  | "interest_rate"
  | "inflation_rate"
  | "credit_growth"
  | "government_spending"
  | "real_estate_index"
  | "auto_market_index"
  | "trade_volume"
  | "fx_rate"
  | "sovereign_cds";

// ─── Insurance Signals ─────────────────────────────────────────

export interface InsuranceSignal {
  type: "insurance";
  indicator: InsuranceIndicator;
  value: number;
  previousValue: number;
  change: number;
  lineOfBusiness: string;
  country?: string;
  source: string;
  timestamp: string;
  confidence: number;
}

export type InsuranceIndicator =
  | "claims_frequency"
  | "claims_severity"
  | "fraud_alert_rate"
  | "underwriting_rejection_rate"
  | "policy_lapse_rate"
  | "cancellation_rate"
  | "medical_inflation"
  | "repair_cost_inflation"
  | "reinsurance_pressure"
  | "premium_adequacy";

// ─── Portfolio Signals ─────────────────────────────────────────

export interface PortfolioSignal {
  type: "portfolio";
  indicator: PortfolioIndicator;
  value: number;
  previousValue: number;
  change: number;
  product?: string;
  segment?: string;
  country?: string;
  source: string;
  timestamp: string;
  confidence: number;
}

export type PortfolioIndicator =
  | "loss_ratio"
  | "claim_turnaround_days"
  | "suspicious_provider_concentration"
  | "high_risk_segment_growth"
  | "geographic_claim_cluster"
  | "broker_channel_performance"
  | "retention_rate"
  | "new_business_volume"
  | "expense_ratio"
  | "combined_ratio";

// ─── Union Type ────────────────────────────────────────────────

export type LiveSignal = MacroSignal | InsuranceSignal | PortfolioSignal;

// ─── Signal Batch ──────────────────────────────────────────────

export interface SignalBatch {
  batchId: string;
  timestamp: string;
  signals: LiveSignal[];
  source: string;
  periodLabel: string; // e.g., "2026-W12", "2026-03-24"
}

// ─── Signal → Graph Node Mapping ───────────────────────────────

export const SIGNAL_NODE_MAP: Record<string, string[]> = {
  // Macro → Graph nodes
  oil_price: ["crude_oil", "delivered_oil_cost"],
  interest_rate: ["gcc_banking", "bank_liquidity"],
  inflation_rate: ["gcc_inflation", "inflation_pressure"],
  credit_growth: ["credit_risk", "gcc_banking"],
  government_spending: ["risk_appetite", "real_estate"],
  real_estate_index: ["real_estate"],
  trade_volume: ["trade_finance", "shipping_logistics"],
  sovereign_cds: ["sovereign_risk"],

  // Insurance → Graph nodes
  claims_frequency: ["insurance_claims"],
  claims_severity: ["insurance_claims", "insurance_premiums"],
  fraud_alert_rate: ["insurance_claims"],
  reinsurance_pressure: ["marine_insurance", "energy_insurance"],
  premium_adequacy: ["insurance_premiums"],

  // Portfolio → Graph nodes
  loss_ratio: ["insurance_claims", "insurance_premiums"],
  suspicious_provider_concentration: ["insurance_claims"],
};
