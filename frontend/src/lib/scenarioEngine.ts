/**
 * Scenario Branching Engine — Beyond MiroFish.
 *
 * Explicit branching: Base / Elevated / Severe
 * Each branch carries probability, triggers, impact vectors,
 * and per-agent reactions.
 *
 * Architecture: Pure TypeScript, deterministic, auditable.
 */

import type { AgentReactionOutput, ScenarioBranch, AgentId } from "./agentEngine";
import { evaluateAllAgents, CURRENT_SIGNALS } from "./agentEngine";

// ─── Scenario Definition ──────────────────────────────────────
export interface ScenarioTrigger {
  signal: string;
  condition: string;
  currentValue: string;
  threshold: string;
  triggered: boolean;
}

export interface ScenarioImpact {
  dimension: string;
  direction: "up" | "down" | "stable";
  magnitude: string;
  confidence: number;
}

export interface ScenarioDef {
  id: string;
  branch: ScenarioBranch;
  label: string;
  labelAr: string;
  description: string;
  probability: number;
  timeHorizon: "24h" | "7d" | "30d" | "90d";
  triggers: ScenarioTrigger[];
  impacts: ScenarioImpact[];
  compoundRisk: number;        // 0-100 aggregate risk
}

// ─── Scenario Definitions ─────────────────────────────────────
export const SCENARIO_BRANCHES: ScenarioDef[] = [
  {
    id: "SCN-BASE",
    branch: "base",
    label: "Current Trajectory",
    labelAr: "المسار الحالي",
    description: "Oil stabilizes at $85-90. Claims trend continues at current rate. No regulatory intervention. Fraud clusters monitored but contained.",
    probability: 0.50,
    timeHorizon: "30d",
    triggers: [
      { signal: "oil_price", condition: "Oil remains $85-90", currentValue: "$89.5", threshold: "$85-90", triggered: true },
      { signal: "claims_frequency", condition: "Claims frequency stable", currentValue: "0.14", threshold: "<0.16", triggered: true },
    ],
    impacts: [
      { dimension: "Claims Severity", direction: "up", magnitude: "+5-8%", confidence: 0.75 },
      { dimension: "Portfolio Stability", direction: "down", magnitude: "-3%", confidence: 0.70 },
      { dimension: "Underwriting Margin", direction: "down", magnitude: "-1.5%", confidence: 0.68 },
      { dimension: "Fraud Exposure", direction: "stable", magnitude: "±2%", confidence: 0.72 },
    ],
    compoundRisk: 45,
  },
  {
    id: "SCN-ELEVATED",
    branch: "elevated",
    label: "Sustained Oil Shock + Claims Surge",
    labelAr: "صدمة نفطية + ارتفاع مطالبات",
    description: "Oil sustains above $90 for 30+ days. Repair costs cascade into claims severity. Consumer stress triggers maintenance deferrals and coverage downgrades. Fraud networks exploit distraction.",
    probability: 0.35,
    timeHorizon: "30d",
    triggers: [
      { signal: "oil_price", condition: "Oil sustained > $90", currentValue: "$89.5", threshold: "$90", triggered: false },
      { signal: "claims_severity", condition: "Severity breaks KWD 1500", currentValue: "1450", threshold: "1500", triggered: false },
      { signal: "pricing_adequacy_gap", condition: "Gap exceeds 0.65", currentValue: "0.62", threshold: "0.65", triggered: false },
    ],
    impacts: [
      { dimension: "Claims Severity", direction: "up", magnitude: "+12-18%", confidence: 0.82 },
      { dimension: "Repair Costs", direction: "up", magnitude: "+8-14%", confidence: 0.78 },
      { dimension: "Underwriting Margin", direction: "down", magnitude: "-4.2%", confidence: 0.75 },
      { dimension: "Consumer Coverage", direction: "down", magnitude: "-15% comprehensive", confidence: 0.70 },
      { dimension: "Fraud Volume", direction: "up", magnitude: "+22%", confidence: 0.65 },
      { dimension: "Portfolio Stability", direction: "down", magnitude: "-12%", confidence: 0.72 },
    ],
    compoundRisk: 68,
  },
  {
    id: "SCN-SEVERE",
    branch: "severe",
    label: "Compound Crisis — Multi-Trigger Cascade",
    labelAr: "أزمة مركّبة — تتابع متعدد",
    description: "Oil shock + regulatory intervention + fraud spike + consumer distress compound simultaneously. Technical result turns negative. Emergency measures required across all stakeholders.",
    probability: 0.15,
    timeHorizon: "7d",
    triggers: [
      { signal: "oil_price", condition: "Oil spike > $95", currentValue: "$89.5", threshold: "$95", triggered: false },
      { signal: "market_stress", condition: "Market stress > 80", currentValue: "72", threshold: "80", triggered: false },
      { signal: "fraud_cluster_density", condition: "Fraud clusters > 0.5", currentValue: "0.35", threshold: "0.5", triggered: false },
      { signal: "portfolio_stability", condition: "Stability < 35", currentValue: "41", threshold: "35", triggered: false },
    ],
    impacts: [
      { dimension: "Claims Severity", direction: "up", magnitude: "+25-35%", confidence: 0.85 },
      { dimension: "Portfolio Result", direction: "down", magnitude: "Negative technical", confidence: 0.78 },
      { dimension: "Capital Adequacy", direction: "down", magnitude: "-20% buffer", confidence: 0.72 },
      { dimension: "Consumer Trust", direction: "down", magnitude: "Critical", confidence: 0.80 },
      { dimension: "Regulatory Response", direction: "up", magnitude: "Emergency directives", confidence: 0.88 },
      { dimension: "Market Confidence", direction: "down", magnitude: "-30% sector PE", confidence: 0.65 },
    ],
    compoundRisk: 88,
  },
];

// ─── Full Scenario Evaluation ─────────────────────────────────
export interface ScenarioEvaluation {
  scenario: ScenarioDef;
  agentReactions: { agentId: AgentId; reaction: string; riskDelta: number; confidence: number; timeToReact: string }[];
  aggregateRisk: number;
  triggeredCount: number;
  totalTriggers: number;
  proximityScore: number;  // 0-100 how close we are to this scenario triggering
}

export function evaluateScenarios(): ScenarioEvaluation[] {
  const agents = evaluateAllAgents(CURRENT_SIGNALS);

  return SCENARIO_BRANCHES.map((scenario) => {
    const triggeredCount = scenario.triggers.filter((t) => t.triggered).length;
    const totalTriggers = scenario.triggers.length;
    const proximityScore = Math.round((triggeredCount / totalTriggers) * 100);

    // Get per-agent reactions for this branch
    const agentReactions = agents.map((agent) => {
      const reaction = agent.scenarioReactions[scenario.branch];
      return {
        agentId: agent.agentId,
        reaction: reaction.reaction,
        riskDelta: reaction.riskDelta,
        confidence: reaction.confidence,
        timeToReact: reaction.timeToReact,
      };
    });

    // Aggregate risk
    const agentRiskSum = agentReactions.reduce((sum, ar) => sum + ar.riskDelta, 0);
    const aggregateRisk = Math.min(100, scenario.compoundRisk + Math.round(agentRiskSum * 0.3));

    return {
      scenario,
      agentReactions,
      aggregateRisk,
      triggeredCount,
      totalTriggers,
      proximityScore,
    };
  });
}
