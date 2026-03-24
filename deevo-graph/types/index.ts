/**
 * Deevo Graph — Phase 2 Type Definitions
 * GCC Hybrid Economic Decision Engine
 */

// ─── Event Types ───────────────────────────────────────────────
export type EventClass =
  | "hormuz_disruption"
  | "refinery_attack"
  | "sanctions_escalation"
  | "regional_war"
  | "banking_stress"
  | "energy_supply_shock"
  | "generic_geopolitical_event";

export type EventCategory =
  | "shipping_disruption"
  | "energy_supply"
  | "geopolitical_conflict"
  | "sanctions"
  | "banking_stress"
  | "infrastructure_damage"
  | "climate_event"
  | "cyber_attack"
  | "political_instability";

export interface NormalizedEvent {
  eventClass: EventClass;
  category: EventCategory;
  region: string;
  severity: number; // 0.0 – 1.0
  confidence: number; // 0.0 – 1.0
  title: string;
  description: string;
  sources: string[];
  timestamp: string;
}

// ─── Graph Types ───────────────────────────────────────────────
export type NodeType =
  | "event"
  | "infrastructure"
  | "commodity"
  | "sector"
  | "metric"
  | "country";

export type NodeState = "stable" | "stressed" | "disrupted" | "critical";

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  value: number;
  baseValue: number;
  state: NodeState;
  metadata?: Record<string, unknown>;
}

export type RelationType =
  | "affects"
  | "delays"
  | "reprices"
  | "constrains"
  | "amplifies"
  | "hedges"
  | "exports_to"
  | "exposed_to"
  | "disrupts"
  | "increases"
  | "triggers";

export interface GraphEdge {
  from: string;
  to: string;
  relation: RelationType;
  baseWeight: number;
  dynamicWeight: number;
  metadata?: Record<string, unknown>;
}

export interface GraphState {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}

// ─── Dynamic Weight Types ──────────────────────────────────────
export interface WeightAdjustmentInput {
  baseWeight: number;
  severity: number;
  confidence: number;
  convergence: number;
  regionalRelevance: number;
  timeDecay: number;
  domainMultiplier?: number;
}

export interface WeightAdjustmentResult {
  edge: string;
  baseWeight: number;
  adjustments: Record<string, number>;
  finalWeight: number;
  cappedWeight: number;
}

// ─── Propagation Types ─────────────────────────────────────────
export interface PropagationConfig {
  maxDepth: number;
  decayPerHop: number;
  thresholdCutoff: number;
  attenuationFactor: number;
}

export interface PropagationStep {
  step: number;
  fromNode: string;
  toNode: string;
  relation: RelationType;
  impactTransmitted: number;
  resultingState: NodeState;
  depth: number;
  explanation: string;
}

export interface PropagationResult {
  steps: PropagationStep[];
  impactedNodes: GraphNode[];
  criticalPath: string[];
  systemicRiskScore: number;
  totalSteps: number;
  maxDepthReached: number;
}

// ─── Insurance Overlay Types ───────────────────────────────────
export interface ClaimsOverlayResult {
  claimsProbability: number;
  severityMultiplier: number;
  rationale: string[];
}

export interface UnderwritingOverlayResult {
  tighteningScore: number;
  newBusinessRisk: string;
  rationale: string[];
}

export interface FraudOverlayResult {
  fraudPressure: number;
  monitoringLevel: string;
  rationale: string[];
}

export interface ReinsuranceOverlayResult {
  treatyStress: number;
  catastropheReserveTrigger: boolean;
  rationale: string[];
}

export interface InsuranceOverlay {
  claims: ClaimsOverlayResult;
  underwriting: UnderwritingOverlayResult;
  fraud: FraudOverlayResult;
  reinsurance: ReinsuranceOverlayResult;
  overallRiskLevel: "low" | "moderate" | "high" | "critical";
}

// ─── GCC Types ─────────────────────────────────────────────────
export type GCCCountry =
  | "saudi"
  | "uae"
  | "kuwait"
  | "qatar"
  | "bahrain"
  | "oman";

export interface GCCCountryImpact {
  country: GCCCountry;
  fiscal: string;
  trade: string;
  inflation: string;
  severity: number;
  narrative: string;
}

// ─── Decision Bundle ───────────────────────────────────────────
export interface DecisionBundle {
  eventSummary: string;
  graphSummary: Record<string, number>;
  gccCountryImpacts: Record<GCCCountry, GCCCountryImpact>;
  insuranceOverlay: InsuranceOverlay;
  decisionInsight: string;
  watchpoints: string[];
  executiveBrief: string;
  confidenceAssessment: string;
  timestamp: string;
  auditHash: string;
}

// ─── Explanation Bundle ────────────────────────────────────────
export interface ExplanationBundle {
  whatHappened: string;
  whyItMatters: string;
  howItPropagates: string[];
  economicNarrative: string;
  insuranceNarrative: string;
  gccNarrative: string;
  whatToDo: string;
  watchpoints: string[];
  confidenceAssessment: string;
  systemicRiskSummary: string;
}
