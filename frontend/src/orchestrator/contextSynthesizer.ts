/**
 * Context Synthesizer — Sublayer 1
 *
 * Gathers and unifies the current system state from all layers.
 * Reads event context, API response data, reasoning outputs, and user attention.
 *
 * CRITICAL: This module reads LIVE data from FullCortexResponse when available,
 * falling back to MOCK_SCORES/MOCK_SIGNALS only when no API data exists.
 */

import type { FullCortexResponse } from "@/types/cortex";
import type { SystemContext } from "./orchestrator.types";
import { MOCK_SCORES, MOCK_SIGNALS } from "@/lib/mock-data";

/**
 * Extract score-like values from the insurance analysis in the API response.
 * Maps insurance fields to the 5-score system used by the orchestrator.
 */
function extractLiveScores(data: FullCortexResponse): { label: string; value: number; trend: string }[] {
  const ins = data.insurance;
  if (!ins) return [];

  const scores: { label: string; value: number; trend: string }[] = [];

  // Derive Market Stress from overall risk + affected lines severity
  const riskMap: Record<string, number> = { critical: 90, high: 75, medium: 55, low: 30 };
  const overallScore = riskMap[ins.overall_risk_level?.toLowerCase()] ?? 50;
  scores.push({ label: "Market Stress", value: overallScore, trend: overallScore > 60 ? "up" : "stable" });

  // Derive Claims Pressure from claims projection
  const claimsRaw = ins.claims_projection;
  let claimsScore = 50;
  if (claimsRaw) {
    if (claimsRaw.catastrophe_reserve_trigger) claimsScore += 20;
    if (claimsRaw.ibnr_adjustment_needed) claimsScore += 10;
    const timeline = claimsRaw.estimated_timeline_days || 90;
    if (timeline < 30) claimsScore += 15;
    else if (timeline < 60) claimsScore += 5;
  }
  claimsScore = Math.min(claimsScore, 100);
  scores.push({ label: "Claims Pressure", value: claimsScore, trend: claimsScore > 60 ? "up" : "stable" });

  // Derive Fraud Exposure from affected lines fraud_probability
  const lines = ins.affected_lines || [];
  const avgFraud = lines.length > 0
    ? lines.reduce((sum, l) => sum + (l.fraud_probability || 0), 0) / lines.length
    : 0;
  const fraudScore = Math.round(avgFraud * 100);
  scores.push({ label: "Fraud Exposure", value: fraudScore, trend: fraudScore > 40 ? "up" : "stable" });

  // Derive Underwriting Risk from underwriting assessment
  const uw = ins.underwriting_risk;
  let uwScore = 50;
  if (uw) {
    const riskLevels: Record<string, number> = { critical: 30, high: 20, elevated: 15, moderate: 5, low: 0 };
    uwScore += riskLevels[uw.new_business_risk?.toLowerCase()] ?? 10;
    uwScore += Math.round((uw.portfolio_exposure_pct || 0) * 0.3);
    const concRisk: Record<string, number> = { high: 15, moderate: 5, low: 0 };
    uwScore += concRisk[uw.concentration_risk?.toLowerCase()] ?? 0;
  }
  uwScore = Math.min(uwScore, 100);
  scores.push({ label: "Underwriting Risk", value: uwScore, trend: uwScore > 60 ? "up" : "stable" });

  // Derive Portfolio Stability (inverse of overall disruption)
  const avgLineImpact = lines.length > 0
    ? lines.reduce((sum, l) => sum + Math.abs(l.loss_ratio_delta || 0), 0) / lines.length
    : 0;
  const stabilityScore = Math.max(0, Math.min(100, 100 - Math.round(avgLineImpact * 10 + overallScore * 0.3)));
  scores.push({ label: "Portfolio Stability", value: stabilityScore, trend: stabilityScore < 50 ? "down" : "stable" });

  return scores;
}

/**
 * Extract signal-like values from economic analysis data.
 */
function extractLiveSignals(data: FullCortexResponse): { category: string; trend: string }[] {
  const signals: { category: string; trend: string }[] = [];
  const econ = data.economic;

  // Sector impacts as macro signals
  if (econ?.sector_impacts) {
    for (const [sector, impact] of Object.entries(econ.sector_impacts)) {
      if (typeof impact === "object" && impact !== null) {
        const val = (impact as Record<string, unknown>)["impact_score"] ?? (impact as Record<string, unknown>)["severity"] ?? 0;
        signals.push({ category: "macro", trend: Number(val) > 0.5 ? "up" : "stable" });
      } else {
        signals.push({ category: "macro", trend: "stable" });
      }
    }
  }

  // Causal chain nodes as reasoning signals
  if (econ?.causal_chain) {
    econ.causal_chain.forEach(() => {
      signals.push({ category: "claims", trend: "up" });
    });
  }

  // GCC breakdown as regional signals
  if (econ?.gcc_breakdown) {
    for (const [, breakdown] of Object.entries(econ.gcc_breakdown)) {
      if (breakdown && typeof breakdown === "object") {
        signals.push({ category: "macro", trend: "up" });
      }
    }
  }

  return signals;
}

/**
 * Synthesize the full system context from available data.
 *
 * Priority: live API data > mock fallback.
 */
export function synthesizeContext(
  data: FullCortexResponse | null,
  interactionMode: string,
  flowStep: string | null
): SystemContext {
  const event = data?.economic?.normalized_event;
  const chain = data?.economic?.causal_chain;

  // ── Scores: prefer live extraction, fall back to mock ──
  const hasLiveInsurance = !!data?.insurance;
  const scores = hasLiveInsurance ? extractLiveScores(data!) : MOCK_SCORES.map(s => ({ label: s.label, value: s.value, trend: s.trend }));

  // ── Signals: prefer live extraction, fall back to mock ──
  const hasLiveEconomic = !!data?.economic?.sector_impacts;
  const signals = hasLiveEconomic ? extractLiveSignals(data!) : MOCK_SIGNALS.map(s => ({ category: s.category, trend: s.trend }));

  // Find top risk score
  const sortedScores = [...scores].sort((a, b) => b.value - a.value);
  const topScore = sortedScores[0];
  const scoresAboveThreshold = scores.filter((s) => s.value > 60).length;

  // Signal analysis
  const upTrending = signals.filter((s) => s.trend === "up").length;
  const categoryCount: Record<string, number> = {};
  signals.forEach((s) => {
    categoryCount[s.category] = (categoryCount[s.category] || 0) + 1;
  });
  const dominantCategory = Object.entries(categoryCount).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || null;

  // Determine active scenario tier from data
  let scenarioTier: "base" | "elevated" | "severe" | null = null;
  if (data?.economic?.scenarios) {
    const severe = Object.keys(data.economic.scenarios.severe_case || {});
    const elevated = Object.keys(data.economic.scenarios.elevated_case || {});
    if (severe.length > 0) scenarioTier = "severe";
    else if (elevated.length > 0) scenarioTier = "elevated";
    else scenarioTier = "base";
  }

  return {
    has_active_event: !!event,
    event_title: event?.title || null,
    event_category: event?.category || null,
    event_severity: event?.severity ?? null,
    event_region: event?.region || null,

    causal_chain_length: chain?.length || 0,
    causal_chain_summary: chain?.[0] || null,

    top_risk_score: topScore?.value || 0,
    top_risk_name: topScore?.label || "Unknown",
    scores_above_threshold: scoresAboveThreshold,

    active_scenario_tier: scenarioTier,

    current_interaction_mode: interactionMode,
    user_attention_zone: flowStep,

    total_signals: signals.length,
    signals_trending_up: upTrending,
    dominant_signal_category: dominantCategory,
  };
}
