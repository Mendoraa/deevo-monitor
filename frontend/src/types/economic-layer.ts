/** Core types for the Economic Layer — mirrors backend schemas exactly. */

export type EventCategory =
  | "geopolitical_conflict"
  | "shipping_disruption"
  | "energy_supply"
  | "sanctions"
  | "banking_stress"
  | "infrastructure_damage"
  | "trade_policy"
  | "climate_disaster"
  | "cyber";

export type EventSeverity = "low" | "moderate" | "high" | "critical";
export type ImpactDirection = "up" | "down" | "mixed" | "cautious";
export type ImpactMagnitude = "low" | "moderate" | "high";

export interface EventInput {
  title: string;
  category?: EventCategory;
  severity: EventSeverity;
  region: string;
  source_confidence: number;
}

export interface NormalizedEvent {
  event_id: string;
  title: string;
  category: EventCategory;
  subtype: string;
  region: string;
  severity: number;
  source_confidence: number;
  timestamp: string;
}

export interface AgentOutput {
  agent_name: string;
  impact_direction: ImpactDirection;
  impact_magnitude: ImpactMagnitude;
  confidence: number;
  rationale: string[];
  range_estimate: string | null;
}

export interface SectorImpact {
  direction: ImpactDirection;
  magnitude: ImpactMagnitude;
  range: string | null;
  confidence: number;
}

export interface ScenarioBundle {
  base_case: Record<string, string>;
  elevated_case: Record<string, string>;
  severe_case: Record<string, string>;
}

export interface GCCBreakdown {
  saudi: string;
  uae: string;
  kuwait: string;
  qatar: string;
  bahrain: string;
  oman: string;
}

export interface EconomicAnalysisResponse {
  event_summary: string;
  normalized_event: NormalizedEvent;
  agent_outputs: AgentOutput[];
  causal_chain: string[];
  scenarios: ScenarioBundle;
  sector_impacts: Record<string, SectorImpact>;
  gcc_breakdown: GCCBreakdown;
  decision_insight: string;
}

/** Preset scenarios for quick testing */
export interface PresetScenario {
  id: string;
  label: string;
  description: string;
  event: EventInput;
}
