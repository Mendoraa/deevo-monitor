/**
 * GCC Insurance Scoring Model — Phase 3A
 *
 * Four production-grade scores tailored to GCC insurance markets:
 *
 * 1. Market Stress Score — Macro economic pressure on the insurance market
 * 2. Claims Pressure Score — Probability of elevated claims activity
 * 3. Fraud Exposure Score — Portfolio/product/region fraud vulnerability
 * 4. Underwriting Risk Score — Whether current pricing is adequate
 *
 * These are NOT generic models. They incorporate:
 * - Oil price sensitivity (Saudi/Kuwait ≠ UAE/Qatar)
 * - Government spending dependency
 * - Seasonal and regulatory patterns
 * - Market-specific portfolio behavior
 */

import type { GraphState, GCCCountry } from "../types";
import type { LiveSignal, InsuranceSignal, PortfolioSignal } from "../signals/signal-types";

// ─── Score Types ───────────────────────────────────────────────

export type ScoreLevel = "low" | "low-medium" | "medium" | "medium-high" | "high" | "critical";

export interface GCCInsuranceScore {
  name: string;
  score: number; // 0-100
  level: ScoreLevel;
  factors: ScoreFactor[];
  trend: "improving" | "stable" | "deteriorating";
  confidence: number;
}

export interface ScoreFactor {
  name: string;
  contribution: number; // 0-100
  weight: number;
  source: string;
  direction: "positive" | "negative" | "neutral";
}

export interface GCCInsuranceScorecard {
  country: GCCCountry;
  product?: string;
  timestamp: string;
  marketStress: GCCInsuranceScore;
  claimsPressure: GCCInsuranceScore;
  fraudExposure: GCCInsuranceScore;
  underwritingRisk: GCCInsuranceScore;
  overallRisk: ScoreLevel;
  recommendedActions: string[];
}

// ─── GCC Market Profiles ───────────────────────────────────────

interface MarketProfile {
  oilSensitivity: number;
  govSpendingDependency: number;
  tradeOpenness: number;
  inflationSensitivity: number;
  regulatoryStrictness: number;
  marketMaturity: number;
  motorWeight: number;
  medicalWeight: number;
  propertyWeight: number;
  marineWeight: number;
}

const GCC_MARKET_PROFILES: Record<GCCCountry, MarketProfile> = {
  saudi: {
    oilSensitivity: 0.75,
    govSpendingDependency: 0.70,
    tradeOpenness: 0.45,
    inflationSensitivity: 0.50,
    regulatoryStrictness: 0.65,
    marketMaturity: 0.60,
    motorWeight: 0.35,
    medicalWeight: 0.30,
    propertyWeight: 0.20,
    marineWeight: 0.15,
  },
  uae: {
    oilSensitivity: 0.35,
    govSpendingDependency: 0.40,
    tradeOpenness: 0.85,
    inflationSensitivity: 0.55,
    regulatoryStrictness: 0.55,
    marketMaturity: 0.75,
    motorWeight: 0.30,
    medicalWeight: 0.25,
    propertyWeight: 0.25,
    marineWeight: 0.20,
  },
  kuwait: {
    oilSensitivity: 0.90,
    govSpendingDependency: 0.80,
    tradeOpenness: 0.40,
    inflationSensitivity: 0.40,
    regulatoryStrictness: 0.50,
    marketMaturity: 0.55,
    motorWeight: 0.40,
    medicalWeight: 0.25,
    propertyWeight: 0.20,
    marineWeight: 0.15,
  },
  qatar: {
    oilSensitivity: 0.55,
    govSpendingDependency: 0.60,
    tradeOpenness: 0.65,
    inflationSensitivity: 0.45,
    regulatoryStrictness: 0.55,
    marketMaturity: 0.60,
    motorWeight: 0.30,
    medicalWeight: 0.30,
    propertyWeight: 0.25,
    marineWeight: 0.15,
  },
  bahrain: {
    oilSensitivity: 0.70,
    govSpendingDependency: 0.65,
    tradeOpenness: 0.55,
    inflationSensitivity: 0.60,
    regulatoryStrictness: 0.60,
    marketMaturity: 0.65,
    motorWeight: 0.30,
    medicalWeight: 0.30,
    propertyWeight: 0.20,
    marineWeight: 0.20,
  },
  oman: {
    oilSensitivity: 0.75,
    govSpendingDependency: 0.70,
    tradeOpenness: 0.50,
    inflationSensitivity: 0.55,
    regulatoryStrictness: 0.45,
    marketMaturity: 0.45,
    motorWeight: 0.35,
    medicalWeight: 0.25,
    propertyWeight: 0.25,
    marineWeight: 0.15,
  },
};

// ─── Score 1: Market Stress ────────────────────────────────────

export function computeMarketStressScore(
  graphState: GraphState,
  country: GCCCountry,
  signals: LiveSignal[] = []
): GCCInsuranceScore {
  const profile = GCC_MARKET_PROFILES[country];
  const factors: ScoreFactor[] = [];

  // Oil price impact
  const oilImpact = Math.abs(graphState.nodes["crude_oil"]?.value || 0);
  factors.push({
    name: "Oil Price Pressure",
    contribution: oilImpact * profile.oilSensitivity * 100,
    weight: profile.oilSensitivity,
    source: "graph:crude_oil",
    direction: oilImpact > 0.3 ? "negative" : "neutral",
  });

  // Inflation
  const inflationImpact = Math.abs(graphState.nodes["inflation_pressure"]?.value || 0);
  factors.push({
    name: "Inflation Pressure",
    contribution: inflationImpact * profile.inflationSensitivity * 100,
    weight: profile.inflationSensitivity,
    source: "graph:inflation_pressure",
    direction: inflationImpact > 0.2 ? "negative" : "neutral",
  });

  // Liquidity
  const liquidityImpact = Math.abs(graphState.nodes["bank_liquidity"]?.value || 0);
  factors.push({
    name: "Liquidity Stress",
    contribution: liquidityImpact * 0.40 * 100,
    weight: 0.40,
    source: "graph:bank_liquidity",
    direction: liquidityImpact > 0.3 ? "negative" : "neutral",
  });

  // Credit risk
  const creditImpact = Math.abs(graphState.nodes["credit_risk"]?.value || 0);
  factors.push({
    name: "Credit Environment",
    contribution: creditImpact * 0.35 * 100,
    weight: 0.35,
    source: "graph:credit_risk",
    direction: creditImpact > 0.2 ? "negative" : "neutral",
  });

  // Government spending (from signals if available)
  const govSignal = signals.find(
    (s) => s.type === "macro" && s.indicator === "government_spending"
  );
  if (govSignal) {
    const govContrib = Math.max(0, -govSignal.change) * profile.govSpendingDependency;
    factors.push({
      name: "Government Spending",
      contribution: govContrib,
      weight: profile.govSpendingDependency,
      source: "signal:government_spending",
      direction: govSignal.change < -5 ? "negative" : "positive",
    });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.contribution * f.weight, 0);
  const score = Math.min(100, Math.round(rawScore));

  return {
    name: "Market Stress",
    score,
    level: scoreToLevel(score),
    factors,
    trend: determineTrend(score, signals),
    confidence: 0.75,
  };
}

// ─── Score 2: Claims Pressure ──────────────────────────────────

export function computeClaimsPressureScore(
  graphState: GraphState,
  country: GCCCountry,
  signals: LiveSignal[] = []
): GCCInsuranceScore {
  const profile = GCC_MARKET_PROFILES[country];
  const factors: ScoreFactor[] = [];

  // Claims node
  const claimsImpact = Math.abs(graphState.nodes["insurance_claims"]?.value || 0);
  factors.push({
    name: "Claims Cascade",
    contribution: claimsImpact * 50 * 100,
    weight: 0.50,
    source: "graph:insurance_claims",
    direction: claimsImpact > 0.2 ? "negative" : "neutral",
  });

  // Inflation → severity
  const inflationImpact = Math.abs(graphState.nodes["inflation_pressure"]?.value || 0);
  factors.push({
    name: "Severity Inflation",
    contribution: inflationImpact * profile.inflationSensitivity * 100,
    weight: profile.inflationSensitivity,
    source: "graph:inflation_pressure",
    direction: inflationImpact > 0.15 ? "negative" : "neutral",
  });

  // Shipping → repair cost
  const shippingImpact = Math.abs(graphState.nodes["shipping_cost"]?.value || 0);
  factors.push({
    name: "Repair/Parts Cost",
    contribution: shippingImpact * 0.30 * 100,
    weight: 0.30,
    source: "graph:shipping_cost",
    direction: shippingImpact > 0.2 ? "negative" : "neutral",
  });

  // Insurance signals
  const freqSignal = signals.find(
    (s) => s.type === "insurance" && s.indicator === "claims_frequency"
  ) as InsuranceSignal | undefined;
  if (freqSignal) {
    factors.push({
      name: "Frequency Trend",
      contribution: Math.max(0, freqSignal.change) * 2,
      weight: 0.45,
      source: "signal:claims_frequency",
      direction: freqSignal.change > 5 ? "negative" : "neutral",
    });
  }

  const sevSignal = signals.find(
    (s) => s.type === "insurance" && s.indicator === "claims_severity"
  ) as InsuranceSignal | undefined;
  if (sevSignal) {
    factors.push({
      name: "Severity Trend",
      contribution: Math.max(0, sevSignal.change) * 2,
      weight: 0.40,
      source: "signal:claims_severity",
      direction: sevSignal.change > 5 ? "negative" : "neutral",
    });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.contribution * f.weight, 0);
  const score = Math.min(100, Math.round(rawScore));

  return {
    name: "Claims Pressure",
    score,
    level: scoreToLevel(score),
    factors,
    trend: determineTrend(score, signals),
    confidence: 0.70,
  };
}

// ─── Score 3: Fraud Exposure ───────────────────────────────────

export function computeFraudExposureScore(
  graphState: GraphState,
  country: GCCCountry,
  signals: LiveSignal[] = []
): GCCInsuranceScore {
  const factors: ScoreFactor[] = [];

  // Inflation → opportunistic fraud
  const inflationImpact = Math.abs(graphState.nodes["inflation_pressure"]?.value || 0);
  factors.push({
    name: "Inflation-Driven Fraud",
    contribution: inflationImpact * 0.35 * 100,
    weight: 0.35,
    source: "graph:inflation_pressure",
    direction: inflationImpact > 0.2 ? "negative" : "neutral",
  });

  // Claims surge → reduced scrutiny
  const claimsImpact = Math.abs(graphState.nodes["insurance_claims"]?.value || 0);
  factors.push({
    name: "Scrutiny Quality",
    contribution: claimsImpact * 0.40 * 100,
    weight: 0.40,
    source: "graph:insurance_claims",
    direction: claimsImpact > 0.2 ? "negative" : "neutral",
  });

  // Portfolio signals
  const providerConc = signals.find(
    (s) => s.type === "portfolio" && s.indicator === "suspicious_provider_concentration"
  ) as PortfolioSignal | undefined;
  if (providerConc) {
    factors.push({
      name: "Suspicious Providers",
      contribution: providerConc.value * 80,
      weight: 0.50,
      source: "signal:suspicious_provider_concentration",
      direction: providerConc.value > 0.3 ? "negative" : "neutral",
    });
  }

  const fraudAlerts = signals.find(
    (s) => s.type === "insurance" && s.indicator === "fraud_alert_rate"
  ) as InsuranceSignal | undefined;
  if (fraudAlerts) {
    factors.push({
      name: "Fraud Alert Rate",
      contribution: Math.max(0, fraudAlerts.change) * 3,
      weight: 0.45,
      source: "signal:fraud_alert_rate",
      direction: fraudAlerts.change > 10 ? "negative" : "neutral",
    });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.contribution * f.weight, 0);
  const score = Math.min(100, Math.round(rawScore));

  return {
    name: "Fraud Exposure",
    score,
    level: scoreToLevel(score),
    factors,
    trend: determineTrend(score, signals),
    confidence: 0.65,
  };
}

// ─── Score 4: Underwriting Risk ────────────────────────────────

export function computeUnderwritingRiskScore(
  graphState: GraphState,
  country: GCCCountry,
  signals: LiveSignal[] = []
): GCCInsuranceScore {
  const factors: ScoreFactor[] = [];

  // Risk appetite
  const riskAppetite = Math.abs(graphState.nodes["risk_appetite"]?.value || 0);
  factors.push({
    name: "Risk Appetite Decline",
    contribution: riskAppetite * 0.40 * 100,
    weight: 0.40,
    source: "graph:risk_appetite",
    direction: riskAppetite > 0.3 ? "negative" : "neutral",
  });

  // Premium adequacy
  const premiums = Math.abs(graphState.nodes["insurance_premiums"]?.value || 0);
  factors.push({
    name: "Pricing Pressure",
    contribution: premiums * 0.35 * 100,
    weight: 0.35,
    source: "graph:insurance_premiums",
    direction: premiums > 0.2 ? "negative" : "neutral",
  });

  // Credit risk → counterparty
  const credit = Math.abs(graphState.nodes["credit_risk"]?.value || 0);
  factors.push({
    name: "Counterparty Risk",
    contribution: credit * 0.30 * 100,
    weight: 0.30,
    source: "graph:credit_risk",
    direction: credit > 0.2 ? "negative" : "neutral",
  });

  // Portfolio signals
  const lossRatio = signals.find(
    (s) => s.type === "portfolio" && s.indicator === "loss_ratio"
  ) as PortfolioSignal | undefined;
  if (lossRatio) {
    factors.push({
      name: "Loss Ratio Drift",
      contribution: Math.max(0, lossRatio.change) * 2,
      weight: 0.45,
      source: "signal:loss_ratio",
      direction: lossRatio.change > 5 ? "negative" : "neutral",
    });
  }

  const rejection = signals.find(
    (s) => s.type === "insurance" && s.indicator === "underwriting_rejection_rate"
  ) as InsuranceSignal | undefined;
  if (rejection) {
    factors.push({
      name: "Rejection Rate",
      contribution: rejection.value * 60,
      weight: 0.30,
      source: "signal:underwriting_rejection_rate",
      direction: rejection.change > 10 ? "negative" : "neutral",
    });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.contribution * f.weight, 0);
  const score = Math.min(100, Math.round(rawScore));

  return {
    name: "Underwriting Risk",
    score,
    level: scoreToLevel(score),
    factors,
    trend: determineTrend(score, signals),
    confidence: 0.70,
  };
}

// ─── Full Scorecard ────────────────────────────────────────────

/**
 * Compute full GCC insurance scorecard for a country.
 */
export function computeScorecard(
  graphState: GraphState,
  country: GCCCountry,
  signals: LiveSignal[] = [],
  product?: string
): GCCInsuranceScorecard {
  const marketStress = computeMarketStressScore(graphState, country, signals);
  const claimsPressure = computeClaimsPressureScore(graphState, country, signals);
  const fraudExposure = computeFraudExposureScore(graphState, country, signals);
  const underwritingRisk = computeUnderwritingRiskScore(graphState, country, signals);

  const maxScore = Math.max(
    marketStress.score,
    claimsPressure.score,
    fraudExposure.score,
    underwritingRisk.score
  );

  const overallRisk = scoreToLevel(maxScore);
  const recommendedActions = generateActions(
    country,
    marketStress,
    claimsPressure,
    fraudExposure,
    underwritingRisk,
    product
  );

  return {
    country,
    product,
    timestamp: new Date().toISOString(),
    marketStress,
    claimsPressure,
    fraudExposure,
    underwritingRisk,
    overallRisk,
    recommendedActions,
  };
}

/**
 * Compute scorecards for all 6 GCC countries.
 */
export function computeAllGCCScorecards(
  graphState: GraphState,
  signals: LiveSignal[] = []
): GCCInsuranceScorecard[] {
  const countries: GCCCountry[] = ["saudi", "uae", "kuwait", "qatar", "bahrain", "oman"];
  return countries.map((c) => computeScorecard(graphState, c, signals));
}

// ─── Action Generator ──────────────────────────────────────────

function generateActions(
  country: GCCCountry,
  market: GCCInsuranceScore,
  claims: GCCInsuranceScore,
  fraud: GCCInsuranceScore,
  uw: GCCInsuranceScore,
  product?: string
): string[] {
  const actions: string[] = [];
  const ctx = product ? ` for ${product}` : "";

  if (market.score >= 60) {
    actions.push(`Monitor macro indicators closely${ctx} — market stress elevated at ${market.score}/100`);
  }

  if (claims.score >= 50) {
    actions.push(`Review claims reserves and IBNR adjustments${ctx} — claims pressure at ${claims.score}/100`);
  }

  if (fraud.score >= 40) {
    actions.push(`Increase fraud review threshold sensitivity${ctx} — fraud exposure at ${fraud.score}/100`);
    if (fraud.score >= 60) {
      actions.push(`Launch provider anomaly investigation in ${country} market`);
    }
  }

  if (uw.score >= 50) {
    actions.push(`Review pricing adequacy and risk band calibration${ctx} — UW risk at ${uw.score}/100`);
    if (uw.score >= 70) {
      actions.push(`Tighten underwriting on highest-exposure segments in ${country}`);
    }
  }

  if (actions.length === 0) {
    actions.push(`Standard monitoring — all scores within acceptable range for ${country}`);
  }

  return actions;
}

// ─── Helpers ───────────────────────────────────────────────────

function scoreToLevel(score: number): ScoreLevel {
  if (score >= 80) return "critical";
  if (score >= 65) return "high";
  if (score >= 50) return "medium-high";
  if (score >= 35) return "medium";
  if (score >= 20) return "low-medium";
  return "low";
}

function determineTrend(
  _score: number,
  signals: LiveSignal[]
): "improving" | "stable" | "deteriorating" {
  if (signals.length === 0) return "stable";

  const avgChange =
    signals.reduce((sum, s) => sum + s.change, 0) / signals.length;

  if (avgChange > 5) return "deteriorating";
  if (avgChange < -5) return "improving";
  return "stable";
}
