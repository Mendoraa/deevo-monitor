/**
 * Mock data for UI Shell (Milestone 2).
 * NO real API calls — static data only.
 * Will be replaced by live API in Milestone 3.
 */

// ─── 5 Insurance Scores ───────────────────────────────────────
export interface ScoreData {
  key: string;
  label: string;
  value: number;
  risk_level: "low" | "medium" | "high" | "critical";
  trend: "up" | "down" | "stable";
  delta: number;
  description: string;
}

export const MOCK_SCORES: ScoreData[] = [
  {
    key: "market_stress",
    label: "Market Stress",
    value: 72,
    risk_level: "high",
    trend: "up",
    delta: 8.3,
    description: "Oil price volatility driving regional financial pressure",
  },
  {
    key: "claims_pressure",
    label: "Claims Pressure",
    value: 58,
    risk_level: "medium",
    trend: "up",
    delta: 4.1,
    description: "Rising repair costs and frequency in motor portfolio",
  },
  {
    key: "fraud_exposure",
    label: "Fraud Exposure",
    value: 45,
    risk_level: "medium",
    trend: "stable",
    delta: -1.2,
    description: "Moderate fraud cluster activity in select garages",
  },
  {
    key: "underwriting_risk",
    label: "Underwriting Risk",
    value: 63,
    risk_level: "high",
    trend: "up",
    delta: 5.7,
    description: "Pricing adequacy gap widening with market drift",
  },
  {
    key: "portfolio_stability",
    label: "Portfolio Stability",
    value: 41,
    risk_level: "medium",
    trend: "down",
    delta: -6.9,
    description: "Portfolio volatility increasing from combined pressures",
  },
];

// ─── Overall Risk ─────────────────────────────────────────────
export const MOCK_OVERALL_RISK = {
  level: "high" as const,
  composite_score: 64,
  confidence: 0.82,
  assessment_id: "ASM-KWT-20260325-001",
  timestamp: "2026-03-25T08:30:00Z",
  market_code: "KWT",
  portfolio_key: "motor_retail",
};

// ─── Recommendations ──────────────────────────────────────────
export interface RecommendationData {
  rule_id: string;
  action_type: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  rationale: string;
  affected_scores: string[];
}

export const MOCK_RECOMMENDATIONS: RecommendationData[] = [
  {
    rule_id: "R01",
    action_type: "underwriting_tighten",
    priority: "high",
    title: "Tighten Motor Underwriting Guidelines",
    rationale:
      "Claims pressure (58) combined with underwriting risk (63) indicates portfolio is under-reserved. Recommend immediate pricing review for new business.",
    affected_scores: ["claims_pressure", "underwriting_risk"],
  },
  {
    rule_id: "R03",
    action_type: "executive_escalation",
    priority: "critical",
    title: "Executive Risk Escalation Required",
    rationale:
      "Market stress (72) exceeds threshold while portfolio stability (41) is deteriorating. Combined risk warrants C-suite visibility and strategic response.",
    affected_scores: ["market_stress", "portfolio_stability"],
  },
  {
    rule_id: "R05",
    action_type: "reserve_review",
    priority: "high",
    title: "Initiate Reserve Adequacy Review",
    rationale:
      "Rising claims severity and frequency signals suggest current IBNR reserves may be insufficient. Recommend actuarial deep-dive within 14 days.",
    affected_scores: ["claims_pressure"],
  },
  {
    rule_id: "R08",
    action_type: "pricing_adjustment",
    priority: "medium",
    title: "Adjust Motor Pricing Model",
    rationale:
      "Pricing adequacy gap (normalized 62) indicates current tariff structure is not capturing emerging risk adequately.",
    affected_scores: ["underwriting_risk", "market_stress"],
  },
];

// ─── Signals (World Monitor) ─────────────────────────────────
export interface SignalData {
  indicator: string;
  label: string;
  raw_value: number;
  normalized: number;
  unit: string;
  category: "macro" | "claims" | "fraud" | "underwriting" | "portfolio";
  trend: "up" | "down" | "stable";
  source: string;
  last_updated: string;
}

export const MOCK_SIGNALS: SignalData[] = [
  {
    indicator: "oil_price",
    label: "Oil Price (Brent)",
    raw_value: 89.5,
    normalized: 74.6,
    unit: "USD/bbl",
    category: "macro",
    trend: "up",
    source: "Bloomberg",
    last_updated: "2026-03-25T06:00:00Z",
  },
  {
    indicator: "inflation_rate",
    label: "Kuwait CPI Inflation",
    raw_value: 3.8,
    normalized: 63.3,
    unit: "%",
    category: "macro",
    trend: "up",
    source: "CSB Kuwait",
    last_updated: "2026-03-01T00:00:00Z",
  },
  {
    indicator: "repair_cost_inflation",
    label: "Repair Cost Index",
    raw_value: 7.2,
    normalized: 72.0,
    unit: "% YoY",
    category: "claims",
    trend: "up",
    source: "Garage Network Survey",
    last_updated: "2026-03-15T00:00:00Z",
  },
  {
    indicator: "motor_claims_frequency",
    label: "Claims Frequency",
    raw_value: 0.14,
    normalized: 56.0,
    unit: "per policy",
    category: "claims",
    trend: "up",
    source: "Internal TPA",
    last_updated: "2026-03-20T00:00:00Z",
  },
  {
    indicator: "motor_claims_severity",
    label: "Claims Severity",
    raw_value: 1450,
    normalized: 58.0,
    unit: "KWD avg",
    category: "claims",
    trend: "up",
    source: "Internal TPA",
    last_updated: "2026-03-20T00:00:00Z",
  },
  {
    indicator: "fraud_cluster_density",
    label: "Fraud Cluster Density",
    raw_value: 0.35,
    normalized: 35.0,
    unit: "index",
    category: "fraud",
    trend: "stable",
    source: "FRIN Analytics",
    last_updated: "2026-03-22T00:00:00Z",
  },
  {
    indicator: "garage_network_risk",
    label: "Garage Network Risk",
    raw_value: 0.42,
    normalized: 42.0,
    unit: "index",
    category: "fraud",
    trend: "up",
    source: "FRIN Analytics",
    last_updated: "2026-03-22T00:00:00Z",
  },
  {
    indicator: "underwriting_drift",
    label: "Underwriting Drift",
    raw_value: 0.28,
    normalized: 28.0,
    unit: "index",
    category: "underwriting",
    trend: "up",
    source: "Portfolio Analytics",
    last_updated: "2026-03-24T00:00:00Z",
  },
  {
    indicator: "pricing_adequacy_gap",
    label: "Pricing Adequacy Gap",
    raw_value: 0.62,
    normalized: 62.0,
    unit: "index",
    category: "underwriting",
    trend: "up",
    source: "Actuarial Team",
    last_updated: "2026-03-24T00:00:00Z",
  },
];

// ─── Graph Nodes (Economic Layer) ─────────────────────────────
export interface GraphNodeData {
  id: string;
  label: string;
  node_type: "macro" | "insurance" | "portfolio" | "metric";
  value: number;
  x: number;
  y: number;
}

export interface GraphEdgeData {
  source: string;
  target: string;
  relationship: "amplifies" | "constrains" | "correlates" | "feeds";
  effective_weight: number;
  confidence: number;
}

export const MOCK_GRAPH_NODES: GraphNodeData[] = [
  { id: "oil_price", label: "Oil Price", node_type: "macro", value: 74.6, x: 80, y: 60 },
  { id: "inflation_rate", label: "Inflation", node_type: "macro", value: 63.3, x: 200, y: 40 },
  { id: "repair_cost_inflation", label: "Repair Costs", node_type: "macro", value: 72.0, x: 320, y: 80 },
  { id: "consumer_liquidity", label: "Consumer Liquidity", node_type: "macro", value: 45.0, x: 140, y: 140 },
  { id: "motor_claims_frequency", label: "Claims Freq.", node_type: "insurance", value: 56.0, x: 440, y: 120 },
  { id: "motor_claims_severity", label: "Claims Severity", node_type: "insurance", value: 58.0, x: 440, y: 220 },
  { id: "fraud_cluster_density", label: "Fraud Clusters", node_type: "insurance", value: 35.0, x: 200, y: 260 },
  { id: "garage_network_risk", label: "Garage Risk", node_type: "insurance", value: 42.0, x: 320, y: 300 },
  { id: "underwriting_drift", label: "UW Drift", node_type: "insurance", value: 28.0, x: 560, y: 60 },
  { id: "pricing_adequacy_gap", label: "Pricing Gap", node_type: "insurance", value: 62.0, x: 560, y: 180 },
  { id: "market_stress", label: "Market Stress", node_type: "metric", value: 72.0, x: 680, y: 40 },
  { id: "claims_pressure", label: "Claims Pressure", node_type: "metric", value: 58.0, x: 680, y: 140 },
  { id: "fraud_exposure", label: "Fraud Exposure", node_type: "metric", value: 45.0, x: 680, y: 240 },
  { id: "underwriting_risk", label: "UW Risk", node_type: "metric", value: 63.0, x: 680, y: 320 },
  { id: "portfolio_stability", label: "Portfolio Stability", node_type: "portfolio", value: 41.0, x: 800, y: 180 },
];

export const MOCK_GRAPH_EDGES: GraphEdgeData[] = [
  { source: "oil_price", target: "inflation_rate", relationship: "amplifies", effective_weight: 0.82, confidence: 0.90 },
  { source: "oil_price", target: "market_stress", relationship: "amplifies", effective_weight: 0.95, confidence: 0.92 },
  { source: "inflation_rate", target: "repair_cost_inflation", relationship: "amplifies", effective_weight: 0.75, confidence: 0.85 },
  { source: "repair_cost_inflation", target: "motor_claims_severity", relationship: "amplifies", effective_weight: 0.88, confidence: 0.88 },
  { source: "motor_claims_frequency", target: "claims_pressure", relationship: "amplifies", effective_weight: 0.90, confidence: 0.91 },
  { source: "motor_claims_severity", target: "claims_pressure", relationship: "amplifies", effective_weight: 0.85, confidence: 0.89 },
  { source: "fraud_cluster_density", target: "fraud_exposure", relationship: "amplifies", effective_weight: 0.78, confidence: 0.80 },
  { source: "garage_network_risk", target: "fraud_exposure", relationship: "amplifies", effective_weight: 0.72, confidence: 0.78 },
  { source: "underwriting_drift", target: "underwriting_risk", relationship: "amplifies", effective_weight: 0.80, confidence: 0.85 },
  { source: "pricing_adequacy_gap", target: "underwriting_risk", relationship: "amplifies", effective_weight: 0.85, confidence: 0.87 },
  { source: "market_stress", target: "portfolio_stability", relationship: "constrains", effective_weight: -0.70, confidence: 0.88 },
  { source: "claims_pressure", target: "portfolio_stability", relationship: "constrains", effective_weight: -0.65, confidence: 0.86 },
  { source: "fraud_exposure", target: "portfolio_stability", relationship: "constrains", effective_weight: -0.45, confidence: 0.80 },
  { source: "underwriting_risk", target: "portfolio_stability", relationship: "constrains", effective_weight: -0.60, confidence: 0.84 },
  { source: "consumer_liquidity", target: "motor_claims_frequency", relationship: "correlates", effective_weight: 0.55, confidence: 0.72 },
];

// ─── Calibration History ──────────────────────────────────────
export interface CalibrationEntry {
  id: string;
  edge_key: string;
  source_label: string;
  target_label: string;
  old_weight: number;
  new_weight: number;
  old_confidence: number;
  new_confidence: number;
  direction: "correct" | "wrong";
  magnitude_error: number;
  timestamp: string;
}

export const MOCK_CALIBRATION: CalibrationEntry[] = [
  {
    id: "CAL-001",
    edge_key: "oil_price→market_stress",
    source_label: "Oil Price",
    target_label: "Market Stress",
    old_weight: 0.90,
    new_weight: 0.95,
    old_confidence: 0.88,
    new_confidence: 0.92,
    direction: "correct",
    magnitude_error: 0.08,
    timestamp: "2026-03-24T14:00:00Z",
  },
  {
    id: "CAL-002",
    edge_key: "repair_cost→claims_severity",
    source_label: "Repair Costs",
    target_label: "Claims Severity",
    old_weight: 0.85,
    new_weight: 0.88,
    old_confidence: 0.85,
    new_confidence: 0.88,
    direction: "correct",
    magnitude_error: 0.12,
    timestamp: "2026-03-24T14:00:00Z",
  },
  {
    id: "CAL-003",
    edge_key: "fraud_clusters→fraud_exposure",
    source_label: "Fraud Clusters",
    target_label: "Fraud Exposure",
    old_weight: 0.82,
    new_weight: 0.74,
    old_confidence: 0.84,
    new_confidence: 0.71,
    direction: "wrong",
    magnitude_error: 0.25,
    timestamp: "2026-03-24T14:00:00Z",
  },
  {
    id: "CAL-004",
    edge_key: "uw_drift→uw_risk",
    source_label: "UW Drift",
    target_label: "UW Risk",
    old_weight: 0.78,
    new_weight: 0.80,
    old_confidence: 0.82,
    new_confidence: 0.84,
    direction: "correct",
    magnitude_error: 0.06,
    timestamp: "2026-03-24T14:00:00Z",
  },
];

// ─── GCC Regions (World Monitor) ──────────────────────────────
export interface RegionData {
  code: string;
  name: string;
  name_ar: string;
  active: boolean;
  oil_dependency: number;
}

export const MOCK_REGIONS: RegionData[] = [
  { code: "KWT", name: "Kuwait", name_ar: "الكويت", active: true, oil_dependency: 0.85 },
  { code: "SAU", name: "Saudi Arabia", name_ar: "السعودية", active: false, oil_dependency: 0.65 },
  { code: "UAE", name: "UAE", name_ar: "الإمارات", active: false, oil_dependency: 0.30 },
  { code: "BHR", name: "Bahrain", name_ar: "البحرين", active: false, oil_dependency: 0.70 },
  { code: "QAT", name: "Qatar", name_ar: "قطر", active: false, oil_dependency: 0.60 },
  { code: "OMN", name: "Oman", name_ar: "عُمان", active: false, oil_dependency: 0.68 },
];
