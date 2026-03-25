/**
 * Agent Intelligence Engine — MiroFish-inspired agent abstraction.
 *
 * Each agent has:
 * - Identity: who they are in the GCC insurance ecosystem
 * - Decision Model: how they evaluate situations
 * - Memory: what they track and remember
 * - Stress Response: how behavior changes under pressure
 * - Scenario Reactions: per-branch behavioral projections
 *
 * Architecture Decision: Pure TypeScript, no LLM dependency.
 * Agents use rule-based + weighted scoring, not generative AI.
 * This keeps the system deterministic, auditable, and offline-capable.
 */

// ─── Agent Identity ───────────────────────────────────────────
export type AgentId = "investor" | "regulator" | "risk_manager" | "consumer" | "fraud_actor";

export interface AgentIdentity {
  id: AgentId;
  label: string;
  labelAr: string;
  role: string;
  description: string;
  primaryConcern: string;
  decisionStyle: "quantitative" | "regulatory" | "actuarial" | "behavioral" | "opportunistic";
}

// ─── Agent Memory ─────────────────────────────────────────────
export interface AgentMemory {
  watchedSignals: string[];          // signal IDs this agent tracks
  triggerThresholds: Record<string, number>; // signal → threshold
  recentEvents: string[];            // last N events processed
  stressLevel: number;               // 0-100 current stress
  confidenceInMarket: number;        // 0-100 market confidence
  lastActionTimestamp: string;
}

// ─── Decision Model ───────────────────────────────────────────
export interface DecisionRule {
  condition: string;                 // human-readable condition
  signal: string;                    // signal ID
  operator: ">" | "<" | ">=" | "<=" | "==";
  threshold: number;
  action: string;                    // what the agent does
  urgency: "immediate" | "short_term" | "medium_term" | "long_term";
  riskImpact: number;               // -100 to +100 impact on portfolio risk
}

// ─── Stress Response ──────────────────────────────────────────
export interface StressResponse {
  stressThreshold: number;           // stress level that triggers behavior change
  normalBehavior: string;
  stressedBehavior: string;
  panicBehavior: string;             // stress > 80
  stressDecayRate: number;           // how fast stress reduces per period (0-1)
}

// ─── Scenario Reaction ────────────────────────────────────────
export type ScenarioBranch = "base" | "elevated" | "severe";

export interface ScenarioReaction {
  branch: ScenarioBranch;
  reaction: string;
  riskDelta: number;                 // change in portfolio risk (-100 to +100)
  behaviorShift: string;
  confidence: number;                // 0-1
  timeToReact: string;               // "24h" | "7d" | "30d"
}

// ─── Full Agent Definition ────────────────────────────────────
export interface AgentDefinition {
  identity: AgentIdentity;
  memory: AgentMemory;
  decisionRules: DecisionRule[];
  stressResponse: StressResponse;
  scenarioReactions: Record<ScenarioBranch, ScenarioReaction>;
}

// ─── Signal State (input to agent engine) ─────────────────────
export interface SignalState {
  oil_price: number;
  inflation_rate: number;
  claims_frequency: number;
  claims_severity: number;
  fraud_cluster_density: number;
  garage_network_risk: number;
  underwriting_drift: number;
  pricing_adequacy_gap: number;
  market_stress: number;
  portfolio_stability: number;
}

// ═══════════════════════════════════════════════════════════════
// AGENT DEFINITIONS
// ═══════════════════════════════════════════════════════════════

export const AGENT_DEFINITIONS: Record<AgentId, AgentDefinition> = {
  investor: {
    identity: {
      id: "investor",
      label: "Institutional Investor",
      labelAr: "مستثمر مؤسسي",
      role: "GCC Insurance Sector Fund Manager",
      description: "Manages $2.4B GCC insurance portfolio. Tracks oil-insurance correlation, sector PE ratios, and regulatory risk.",
      primaryConcern: "Portfolio return vs. sector risk exposure",
      decisionStyle: "quantitative",
    },
    memory: {
      watchedSignals: ["oil_price", "market_stress", "portfolio_stability", "underwriting_drift"],
      triggerThresholds: { oil_price: 85, market_stress: 65, portfolio_stability: 45 },
      recentEvents: [],
      stressLevel: 45,
      confidenceInMarket: 62,
      lastActionTimestamp: "2026-03-25T06:00:00Z",
    },
    decisionRules: [
      { condition: "Oil above $85 sustained", signal: "oil_price", operator: ">", threshold: 85, action: "Rotate into energy, reduce insurance exposure", urgency: "short_term", riskImpact: 8 },
      { condition: "Market stress above 65", signal: "market_stress", operator: ">", threshold: 65, action: "Activate hedging positions on GCC insurance basket", urgency: "immediate", riskImpact: 12 },
      { condition: "Portfolio stability below 45", signal: "portfolio_stability", operator: "<", threshold: 45, action: "Reduce position size, raise cash allocation", urgency: "immediate", riskImpact: 15 },
    ],
    stressResponse: {
      stressThreshold: 60,
      normalBehavior: "Maintain positions, monitor weekly. Rebalance quarterly.",
      stressedBehavior: "Daily monitoring. Tighten stop-losses. Reduce new commitments.",
      panicBehavior: "Liquidate 30% of sector exposure. Flight to quality.",
      stressDecayRate: 0.15,
    },
    scenarioReactions: {
      base: { branch: "base", reaction: "Hold positions. Oil normalizes. Claims trend manageable. Monitor quarterly.", riskDelta: 3, behaviorShift: "No change — steady state", confidence: 0.75, timeToReact: "30d" },
      elevated: { branch: "elevated", reaction: "Oil above $90 sustained. Reduce insurance sector weight by 15%. Shift to energy and banking.", riskDelta: 12, behaviorShift: "Active rebalancing, weekly monitoring", confidence: 0.68, timeToReact: "7d" },
      severe: { branch: "severe", reaction: "Oil shock + claims surge + regulatory action. Liquidate 40% of GCC insurance holdings. Flight to UAE real estate and gold.", riskDelta: 28, behaviorShift: "Crisis mode — daily action, emergency committee", confidence: 0.55, timeToReact: "24h" },
    },
  },

  regulator: {
    identity: {
      id: "regulator",
      label: "Government Regulator",
      labelAr: "الجهة الرقابية",
      role: "Insurance Regulatory Authority (CMA Kuwait / SAMA equivalent)",
      description: "Oversees solvency, consumer protection, and market stability. Monitors systemic risk indicators.",
      primaryConcern: "Market stability and consumer protection",
      decisionStyle: "regulatory",
    },
    memory: {
      watchedSignals: ["market_stress", "claims_frequency", "fraud_cluster_density", "pricing_adequacy_gap"],
      triggerThresholds: { market_stress: 70, claims_frequency: 0.15, fraud_cluster_density: 0.4 },
      recentEvents: [],
      stressLevel: 35,
      confidenceInMarket: 58,
      lastActionTimestamp: "2026-03-20T00:00:00Z",
    },
    decisionRules: [
      { condition: "Market stress above 70", signal: "market_stress", operator: ">", threshold: 70, action: "Issue market advisory, convene stability committee", urgency: "short_term", riskImpact: 5 },
      { condition: "Fraud clusters expanding", signal: "fraud_cluster_density", operator: ">", threshold: 0.4, action: "Launch targeted audit of flagged garages", urgency: "short_term", riskImpact: 8 },
      { condition: "Pricing gap widening", signal: "pricing_adequacy_gap", operator: ">", threshold: 0.6, action: "Review tariff adequacy, consider floor pricing", urgency: "medium_term", riskImpact: 10 },
    ],
    stressResponse: {
      stressThreshold: 55,
      normalBehavior: "Quarterly market reviews. Standard reporting requirements.",
      stressedBehavior: "Monthly reviews. Enhanced reporting. Informal guidance to insurers.",
      panicBehavior: "Emergency directives. Capital adequacy stress testing. Consumer protection measures.",
      stressDecayRate: 0.08,
    },
    scenarioReactions: {
      base: { branch: "base", reaction: "Continue standard supervision. No intervention needed. Publish quarterly market report.", riskDelta: 2, behaviorShift: "Steady state supervision", confidence: 0.80, timeToReact: "30d" },
      elevated: { branch: "elevated", reaction: "Issue informal guidance on pricing. Request enhanced solvency reporting from top 5 insurers. Monitor fraud signals.", riskDelta: 6, behaviorShift: "Enhanced monitoring, informal intervention", confidence: 0.72, timeToReact: "7d" },
      severe: { branch: "severe", reaction: "Emergency capital adequacy review. Consumer protection directive. Freeze new product approvals pending assessment.", riskDelta: 15, behaviorShift: "Active intervention, emergency protocols", confidence: 0.60, timeToReact: "24h" },
    },
  },

  risk_manager: {
    identity: {
      id: "risk_manager",
      label: "Insurance Risk Manager",
      labelAr: "مدير المخاطر",
      role: "Chief Risk Officer — Kuwait Motor Insurance Portfolio",
      description: "Manages $450M motor portfolio. Oversees claims, reserves, pricing, and reinsurance. Reports to board quarterly.",
      primaryConcern: "Portfolio solvency and technical profitability",
      decisionStyle: "actuarial",
    },
    memory: {
      watchedSignals: ["claims_frequency", "claims_severity", "fraud_cluster_density", "pricing_adequacy_gap", "underwriting_drift", "market_stress"],
      triggerThresholds: { claims_frequency: 0.13, claims_severity: 1400, pricing_adequacy_gap: 0.55, fraud_cluster_density: 0.3 },
      recentEvents: [],
      stressLevel: 62,
      confidenceInMarket: 45,
      lastActionTimestamp: "2026-03-25T08:00:00Z",
    },
    decisionRules: [
      { condition: "Claims severity above KWD 1400", signal: "claims_severity", operator: ">", threshold: 1400, action: "Trigger reserve adequacy review — IBNR likely understated", urgency: "immediate", riskImpact: 15 },
      { condition: "Pricing gap above 0.55", signal: "pricing_adequacy_gap", operator: ">", threshold: 0.55, action: "Emergency pricing committee — rate adjustment needed", urgency: "immediate", riskImpact: 12 },
      { condition: "Fraud clusters above 0.3", signal: "fraud_cluster_density", operator: ">", threshold: 0.3, action: "Deploy FRIN deep scan on flagged garages", urgency: "short_term", riskImpact: 8 },
      { condition: "Market stress above 65", signal: "market_stress", operator: ">", threshold: 65, action: "Escalate to C-suite — board visibility required", urgency: "immediate", riskImpact: 18 },
    ],
    stressResponse: {
      stressThreshold: 50,
      normalBehavior: "Monthly portfolio review. Quarterly board reporting. Standard IFRS 17 cycle.",
      stressedBehavior: "Weekly portfolio monitoring. Tighten underwriting guidelines. Accelerate reinsurance renewal.",
      panicBehavior: "Daily crisis meetings. Emergency reserve strengthening. Stop writing new business in stressed segments.",
      stressDecayRate: 0.10,
    },
    scenarioReactions: {
      base: { branch: "base", reaction: "Claims trend stabilizes. Continue current pricing. Monitor repair cost inflation. Standard IFRS cycle.", riskDelta: 4, behaviorShift: "Business as usual with heightened awareness", confidence: 0.70, timeToReact: "30d" },
      elevated: { branch: "elevated", reaction: "Claims severity +15%. Emergency pricing review. Tighten UW guidelines. Request additional reserves. Board escalation.", riskDelta: 18, behaviorShift: "Active risk management, weekly monitoring, board engagement", confidence: 0.82, timeToReact: "7d" },
      severe: { branch: "severe", reaction: "Portfolio technical result turns negative. Stop writing new motor in high-risk segments. Emergency reinsurance purchase. Regulator notification.", riskDelta: 35, behaviorShift: "Crisis mode — protect solvency at all costs", confidence: 0.88, timeToReact: "24h" },
    },
  },

  consumer: {
    identity: {
      id: "consumer",
      label: "Retail Consumer",
      labelAr: "المستهلك",
      role: "Kuwait Motor Insurance Policyholder",
      description: "Average Kuwaiti driver. KWD 800/month income. 2 vehicles. Price-sensitive on renewals. Defers maintenance when stressed.",
      primaryConcern: "Cost of insurance and vehicle maintenance",
      decisionStyle: "behavioral",
    },
    memory: {
      watchedSignals: ["oil_price", "inflation_rate", "claims_frequency"],
      triggerThresholds: { oil_price: 88, inflation_rate: 3.5 },
      recentEvents: [],
      stressLevel: 52,
      confidenceInMarket: 55,
      lastActionTimestamp: "2026-03-25T00:00:00Z",
    },
    decisionRules: [
      { condition: "Oil price above KWD88 equivalent", signal: "oil_price", operator: ">", threshold: 88, action: "Reduce discretionary driving. Defer maintenance. Shop for cheaper insurance.", urgency: "short_term", riskImpact: 6 },
      { condition: "Inflation above 3.5%", signal: "inflation_rate", operator: ">", threshold: 3.5, action: "Switch to third-party only. Reduce coverage. Increase deductibles.", urgency: "medium_term", riskImpact: 4 },
    ],
    stressResponse: {
      stressThreshold: 45,
      normalBehavior: "Auto-renew insurance. Regular maintenance. Low claims propensity.",
      stressedBehavior: "Price-shop at renewal. Defer maintenance. Higher accident probability. Dispute claims more.",
      panicBehavior: "Drop comprehensive coverage. Drive uninsured risk rises. Maintenance collapse → severity spike.",
      stressDecayRate: 0.20,
    },
    scenarioReactions: {
      base: { branch: "base", reaction: "Normal renewal cycle. Maintain current coverage. Regular maintenance schedule. Claims steady.", riskDelta: 2, behaviorShift: "No change — steady consumer behavior", confidence: 0.78, timeToReact: "30d" },
      elevated: { branch: "elevated", reaction: "Price shopping intensifies. 20% shift to third-party only. Maintenance deferrals rise. Accident frequency +5%.", riskDelta: 8, behaviorShift: "Cost-cutting behavior, coverage downgrades", confidence: 0.72, timeToReact: "7d" },
      severe: { branch: "severe", reaction: "Coverage dropout risk at 8%. Uninsured driving rises. Maintenance collapse causes 25% severity spike. Complaints flood regulator.", riskDelta: 18, behaviorShift: "Distressed consumer, regulatory pressure, claims surge", confidence: 0.65, timeToReact: "24h" },
    },
  },

  fraud_actor: {
    identity: {
      id: "fraud_actor",
      label: "Fraud Network",
      labelAr: "شبكة احتيال",
      role: "Organized Fraud Ring — Ahmadi Industrial Zone",
      description: "3-garage network staging collisions. Targets comprehensive policies. Inflates repair invoices 40-60% above market.",
      primaryConcern: "Maximize fraud yield while avoiding detection",
      decisionStyle: "opportunistic",
    },
    memory: {
      watchedSignals: ["fraud_cluster_density", "garage_network_risk", "claims_severity", "market_stress"],
      triggerThresholds: { market_stress: 60, claims_severity: 1300 },
      recentEvents: [],
      stressLevel: 25,
      confidenceInMarket: 70,
      lastActionTimestamp: "2026-03-22T00:00:00Z",
    },
    decisionRules: [
      { condition: "Market stress creates distraction", signal: "market_stress", operator: ">", threshold: 60, action: "Increase staging volume — insurer attention diverted to macro risk", urgency: "immediate", riskImpact: 18 },
      { condition: "Claims severity rising (cover)", signal: "claims_severity", operator: ">", threshold: 1300, action: "Inflate invoices higher — blends with genuine cost increases", urgency: "short_term", riskImpact: 12 },
      { condition: "Detection risk rising", signal: "fraud_cluster_density", operator: ">", threshold: 0.4, action: "Rotate to new garages. Reduce volume temporarily. Change patterns.", urgency: "immediate", riskImpact: -5 },
    ],
    stressResponse: {
      stressThreshold: 40,
      normalBehavior: "Steady staging volume. 2-3 claims/week through trusted garages. Low profile.",
      stressedBehavior: "Reduce volume. Rotate garages. Change staging patterns. New recruits for claims.",
      panicBehavior: "Go dormant. Close compromised garages. Rebuild network in new location.",
      stressDecayRate: 0.25,
    },
    scenarioReactions: {
      base: { branch: "base", reaction: "Continue current operation. Steady 2-3 staged claims/week. FRIN detection probability stable at 35%.", riskDelta: 5, behaviorShift: "Business as usual for the fraud network", confidence: 0.75, timeToReact: "30d" },
      elevated: { branch: "elevated", reaction: "Economic stress creates opportunity. Increase staging to 4-5/week. Exploit insurer focus on macro risk. Recruit 2 new garages.", riskDelta: 22, behaviorShift: "Aggressive expansion, exploiting market distraction", confidence: 0.68, timeToReact: "7d" },
      severe: { branch: "severe", reaction: "Regulator crackdown. FRIN deep scan activated. Go dormant immediately. Close 2 garages. Network rebuilds in 90 days.", riskDelta: -8, behaviorShift: "Retreat and regroup — regulatory heat too high", confidence: 0.60, timeToReact: "24h" },
    },
  },
};

// ═══════════════════════════════════════════════════════════════
// AGENT ENGINE — Evaluate current state and produce reactions
// ═══════════════════════════════════════════════════════════════

export interface AgentReactionOutput {
  agentId: AgentId;
  identity: AgentIdentity;
  triggeredRules: DecisionRule[];
  currentStressLevel: number;
  stressState: "normal" | "stressed" | "panic";
  activeReaction: string;
  scenarioReactions: Record<ScenarioBranch, ScenarioReaction>;
  riskContribution: number;        // net risk impact from this agent
  confidence: number;
}

export function evaluateAgent(
  agentId: AgentId,
  signals: Partial<SignalState>
): AgentReactionOutput {
  const agent = AGENT_DEFINITIONS[agentId];
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);

  // Evaluate decision rules against current signals
  const triggeredRules = agent.decisionRules.filter((rule) => {
    const value = signals[rule.signal as keyof SignalState];
    if (value === undefined) return false;
    switch (rule.operator) {
      case ">": return value > rule.threshold;
      case "<": return value < rule.threshold;
      case ">=": return value >= rule.threshold;
      case "<=": return value <= rule.threshold;
      case "==": return value === rule.threshold;
      default: return false;
    }
  });

  // Calculate stress level from triggered rules
  const ruleStress = triggeredRules.length * 15;
  const currentStress = Math.min(100, agent.memory.stressLevel + ruleStress);

  // Determine stress state
  const stressState: "normal" | "stressed" | "panic" =
    currentStress >= 80 ? "panic" :
    currentStress >= agent.stressResponse.stressThreshold ? "stressed" :
    "normal";

  // Get active behavior description
  const activeReaction =
    stressState === "panic" ? agent.stressResponse.panicBehavior :
    stressState === "stressed" ? agent.stressResponse.stressedBehavior :
    agent.stressResponse.normalBehavior;

  // Calculate net risk contribution
  const riskContribution = triggeredRules.reduce((sum, r) => sum + r.riskImpact, 0);

  // Aggregate confidence from scenario reactions
  const avgConfidence = Object.values(agent.scenarioReactions)
    .reduce((sum, sr) => sum + sr.confidence, 0) / 3;

  return {
    agentId,
    identity: agent.identity,
    triggeredRules,
    currentStressLevel: currentStress,
    stressState,
    activeReaction,
    scenarioReactions: agent.scenarioReactions,
    riskContribution,
    confidence: avgConfidence,
  };
}

export function evaluateAllAgents(signals: Partial<SignalState>): AgentReactionOutput[] {
  const agentIds: AgentId[] = ["investor", "regulator", "risk_manager", "consumer", "fraud_actor"];
  return agentIds.map((id) => evaluateAgent(id, signals));
}

// ─── Current Signal State (from mock data) ────────────────────
export const CURRENT_SIGNALS: SignalState = {
  oil_price: 89.5,
  inflation_rate: 3.8,
  claims_frequency: 0.14,
  claims_severity: 1450,
  fraud_cluster_density: 0.35,
  garage_network_risk: 0.42,
  underwriting_drift: 0.28,
  pricing_adequacy_gap: 0.62,
  market_stress: 72,
  portfolio_stability: 41,
};
