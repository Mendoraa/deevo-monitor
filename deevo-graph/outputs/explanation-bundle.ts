/**
 * Explanation Bundle — Human-Readable Intelligence Output
 *
 * Converts raw pipeline data into structured explanation
 * suitable for executive briefings and audit records.
 */

import type { ExplanationBundle } from "../types";

/**
 * Format explanation bundle as a structured text brief.
 */
export function formatExplanationAsText(bundle: ExplanationBundle): string {
  const lines: string[] = [
    "═══════════════════════════════════════════════════",
    "  DEEVO CORTEX — DECISION INTELLIGENCE BRIEF",
    "═══════════════════════════════════════════════════",
    "",
    `▸ SYSTEMIC RISK: ${bundle.systemicRiskSummary}`,
    "",
    "── WHAT HAPPENED ──────────────────────────────────",
    bundle.whatHappened,
    "",
    "── WHY IT MATTERS ─────────────────────────────────",
    bundle.whyItMatters,
    "",
    "── HOW IT PROPAGATES ──────────────────────────────",
    ...bundle.howItPropagates.map((s, i) => `  ${i + 1}. ${s}`),
    "",
    "── ECONOMIC ANALYSIS ──────────────────────────────",
    bundle.economicNarrative,
    "",
    "── INSURANCE ANALYSIS ─────────────────────────────",
    bundle.insuranceNarrative,
    "",
    "── GCC ANALYSIS ───────────────────────────────────",
    bundle.gccNarrative,
    "",
    "── RECOMMENDED ACTION ─────────────────────────────",
    bundle.whatToDo,
    "",
    "── WATCHPOINTS (24-72h) ───────────────────────────",
    ...bundle.watchpoints.map((w, i) => `  ${i + 1}. ${w}`),
    "",
    "── CONFIDENCE ─────────────────────────────────────",
    bundle.confidenceAssessment,
    "",
    "═══════════════════════════════════════════════════",
  ];

  return lines.join("\n");
}

/**
 * Format as JSON for API output.
 */
export function formatExplanationAsJSON(bundle: ExplanationBundle): string {
  return JSON.stringify(
    {
      what_happened: bundle.whatHappened,
      why_it_matters: bundle.whyItMatters,
      how_it_propagates: bundle.howItPropagates,
      economic_narrative: bundle.economicNarrative,
      insurance_narrative: bundle.insuranceNarrative,
      gcc_narrative: bundle.gccNarrative,
      what_to_do: bundle.whatToDo,
      watchpoints: bundle.watchpoints,
      confidence_assessment: bundle.confidenceAssessment,
      systemic_risk_summary: bundle.systemicRiskSummary,
    },
    null,
    2
  );
}

/**
 * Validate explanation bundle completeness.
 */
export function validateExplanation(bundle: ExplanationBundle): {
  valid: boolean;
  completeness: number;
  missing: string[];
} {
  const fields: (keyof ExplanationBundle)[] = [
    "whatHappened",
    "whyItMatters",
    "howItPropagates",
    "economicNarrative",
    "insuranceNarrative",
    "gccNarrative",
    "whatToDo",
    "watchpoints",
    "confidenceAssessment",
    "systemicRiskSummary",
  ];

  const missing: string[] = [];
  for (const field of fields) {
    const val = bundle[field];
    if (!val || (Array.isArray(val) && val.length === 0)) {
      missing.push(field);
    }
  }

  const completeness = ((fields.length - missing.length) / fields.length) * 100;

  return {
    valid: missing.length === 0,
    completeness: parseFloat(completeness.toFixed(1)),
    missing,
  };
}
