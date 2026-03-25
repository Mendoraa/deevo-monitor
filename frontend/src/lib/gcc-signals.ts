/**
 * GCC-extended signal data for multi-layer monitoring.
 * Extends the base MOCK_SIGNALS with region tags, GCC country signals,
 * and intelligence/economic metadata.
 */

import type { SignalData } from "./mock-data";

// ─── Extended Signal with Region + Layer Tags ─────────────────
export interface ExtendedSignal extends SignalData {
  region: string[];              // country codes: KWT, SAU, UAE, BHR, QAT, OMN, GLOBAL
  layer: ("monitor" | "intelligence" | "economic")[];
  severity: "low" | "medium" | "high" | "critical";
  ai_insight?: string;           // AI-generated insight for Intelligence mode
}

// ─── GCC Country Signals ──────────────────────────────────────
export const GCC_SIGNALS: ExtendedSignal[] = [
  // ── GLOBAL / MACRO ──────────────────────────────────────────
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
    region: ["GLOBAL", "KWT", "SAU", "UAE", "BHR", "QAT", "OMN"],
    layer: ["monitor", "economic"],
    severity: "high",
    ai_insight: "Oil at $89.5 is 12% above 6-month average. Correlation with motor claims severity at 0.78 — direct cost pass-through to repair shops expected within 45 days.",
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
    region: ["KWT"],
    layer: ["monitor", "economic"],
    severity: "medium",
    ai_insight: "Kuwait CPI acceleration driven by import costs. Insurance cost pressure typically lags CPI by 2 quarters.",
  },
  {
    indicator: "gcc_gdp_growth",
    label: "GCC GDP Growth",
    raw_value: 3.2,
    normalized: 55.0,
    unit: "% YoY",
    category: "macro",
    trend: "stable",
    source: "IMF / GCC-Stat",
    last_updated: "2026-03-01T00:00:00Z",
    region: ["KWT", "SAU", "UAE", "BHR", "QAT", "OMN"],
    layer: ["economic"],
    severity: "low",
    ai_insight: "GCC GDP growth stable at 3.2%. Non-oil diversification reducing volatility in UAE and Saudi markets.",
  },
  {
    indicator: "usd_kwd_rate",
    label: "USD/KWD Exchange",
    raw_value: 0.307,
    normalized: 42.0,
    unit: "rate",
    category: "macro",
    trend: "stable",
    source: "CBK",
    last_updated: "2026-03-25T06:00:00Z",
    region: ["KWT"],
    layer: ["economic"],
    severity: "low",
  },
  {
    indicator: "saudi_inflation",
    label: "Saudi CPI Inflation",
    raw_value: 2.1,
    normalized: 45.0,
    unit: "%",
    category: "macro",
    trend: "up",
    source: "GASTAT",
    last_updated: "2026-03-01T00:00:00Z",
    region: ["SAU"],
    layer: ["monitor", "economic"],
    severity: "low",
  },
  {
    indicator: "uae_pmi",
    label: "UAE PMI",
    raw_value: 56.2,
    normalized: 65.0,
    unit: "index",
    category: "macro",
    trend: "up",
    source: "S&P Global",
    last_updated: "2026-03-20T00:00:00Z",
    region: ["UAE"],
    layer: ["economic"],
    severity: "low",
  },

  // ── CLAIMS ──────────────────────────────────────────────────
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "high",
    ai_insight: "Repair costs rising 7.2% YoY — fastest rate in 3 years. Spare parts import bottleneck identified in 12 garages.",
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "medium",
    ai_insight: "Frequency trending above seasonal norm. Signal clustering suggests concentration in Ahmadi and Hawally governorates.",
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "medium",
    ai_insight: "Average severity at KWD 1,450 — up 11% from Q4 2025. Correlated with luxury vehicle segment growth.",
  },
  {
    indicator: "saudi_motor_claims",
    label: "Saudi Motor Claims Rate",
    raw_value: 0.11,
    normalized: 48.0,
    unit: "per policy",
    category: "claims",
    trend: "stable",
    source: "SAMA Reports",
    last_updated: "2026-03-15T00:00:00Z",
    region: ["SAU"],
    layer: ["monitor"],
    severity: "low",
  },
  {
    indicator: "uae_motor_claims",
    label: "UAE Motor Claims Rate",
    raw_value: 0.09,
    normalized: 42.0,
    unit: "per policy",
    category: "claims",
    trend: "down",
    source: "IA UAE",
    last_updated: "2026-03-15T00:00:00Z",
    region: ["UAE"],
    layer: ["monitor"],
    severity: "low",
  },

  // ── FRAUD ───────────────────────────────────────────────────
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "medium",
    ai_insight: "3 active fraud clusters detected. Pattern: staged collisions near industrial zones with consistent garage routing.",
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "medium",
    ai_insight: "Garage risk index rising — 4 garages flagged for anomalous billing patterns. Cross-referencing with claims frequency.",
  },

  // ── UNDERWRITING ────────────────────────────────────────────
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "low",
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
    region: ["KWT"],
    layer: ["monitor", "intelligence"],
    severity: "high",
    ai_insight: "Pricing gap at 62 — widest in 18 months. Combined with repair cost inflation, underwriting margin erosion projected at -4.2% by Q3.",
  },
];

// ─── Intelligence Insights (for Intelligence overlay) ─────────
export interface IntelligenceInsight {
  id: string;
  title: string;
  severity: "info" | "warning" | "critical";
  category: string;
  description: string;
  affected_signals: string[];
  confidence: number;
  timestamp: string;
}

export const INTELLIGENCE_INSIGHTS: IntelligenceInsight[] = [
  {
    id: "INS-001",
    title: "Oil-Claims Cascade Risk",
    severity: "critical",
    category: "Causal Chain",
    description: "Oil price surge is propagating through repair costs to motor claims severity. Estimated 45-day lag before full portfolio impact materializes.",
    affected_signals: ["oil_price", "repair_cost_inflation", "motor_claims_severity"],
    confidence: 0.88,
    timestamp: "2026-03-25T08:00:00Z",
  },
  {
    id: "INS-002",
    title: "Fraud Cluster Emerging — Ahmadi Zone",
    severity: "warning",
    category: "Pattern Detection",
    description: "FRIN detected 3 interconnected fraud rings near Ahmadi industrial area. Common pattern: staged collisions routed to 4 specific garages with inflated repair invoices.",
    affected_signals: ["fraud_cluster_density", "garage_network_risk"],
    confidence: 0.82,
    timestamp: "2026-03-24T16:00:00Z",
  },
  {
    id: "INS-003",
    title: "Underwriting Margin Erosion Signal",
    severity: "warning",
    category: "Portfolio Risk",
    description: "Combined pricing gap (62) and claims pressure (58) indicate underwriting margin compression. Current trajectory projects negative technical result by Q3 2026.",
    affected_signals: ["pricing_adequacy_gap", "motor_claims_frequency", "motor_claims_severity"],
    confidence: 0.85,
    timestamp: "2026-03-25T07:30:00Z",
  },
  {
    id: "INS-004",
    title: "GCC Market Divergence",
    severity: "info",
    category: "Regional Intelligence",
    description: "UAE motor claims declining while Kuwait and Saudi trending up. Divergence suggests Kuwait-specific factors (repair cost inflation, fraud) are dominant drivers.",
    affected_signals: ["uae_motor_claims", "motor_claims_frequency", "saudi_motor_claims"],
    confidence: 0.79,
    timestamp: "2026-03-25T06:00:00Z",
  },
];

// ─── Economic Highlights (for Economic overlay) ───────────────
export interface EconomicHighlight {
  id: string;
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "stable";
  impact: "positive" | "negative" | "neutral";
  description: string;
}

export const ECONOMIC_HIGHLIGHTS: EconomicHighlight[] = [
  {
    id: "ECO-001",
    title: "Brent Crude",
    value: "$89.50",
    change: "+4.2%",
    direction: "up",
    impact: "negative",
    description: "Above $85 threshold — elevated cost pass-through risk to motor portfolio",
  },
  {
    id: "ECO-002",
    title: "Kuwait CPI",
    value: "3.8%",
    change: "+0.6pp",
    direction: "up",
    impact: "negative",
    description: "Import-driven inflation accelerating — lagged insurance cost impact expected",
  },
  {
    id: "ECO-003",
    title: "GCC GDP Growth",
    value: "3.2%",
    change: "-0.1pp",
    direction: "stable",
    impact: "neutral",
    description: "Stable growth supports premium volume — non-oil diversification reducing volatility",
  },
  {
    id: "ECO-004",
    title: "KWD/USD",
    value: "0.307",
    change: "0.0%",
    direction: "stable",
    impact: "neutral",
    description: "Peg stable — no FX impact on claims reserves or reinsurance costs",
  },
];
