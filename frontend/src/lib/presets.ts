/** Preset scenarios for quick analysis. */

import type { PresetScenario } from "@/types/economic-layer";

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: "hormuz",
    label: "Hormuz Disruption",
    description: "Oil tanker hit near Strait of Hormuz — shipping lane partially blocked",
    event: {
      title: "Oil tanker hit near Strait of Hormuz — shipping lane partially blocked",
      category: "shipping_disruption",
      severity: "high",
      region: "Middle East",
      source_confidence: 0.88,
    },
  },
  {
    id: "refinery",
    label: "Refinery Attack",
    description: "Drone attack on major Saudi refinery disrupts 2M bpd capacity",
    event: {
      title: "Drone attack on major Saudi refinery disrupts 2M barrels per day capacity",
      category: "energy_supply",
      severity: "critical",
      region: "Middle East",
      source_confidence: 0.92,
    },
  },
  {
    id: "sanctions",
    label: "Sanctions Escalation",
    description: "US announces new sanctions targeting Iranian oil exports and banking",
    event: {
      title: "US announces new sanctions targeting Iranian oil exports and banking sector",
      category: "sanctions",
      severity: "high",
      region: "Middle East",
      source_confidence: 0.85,
    },
  },
  {
    id: "banking",
    label: "GCC Banking Stress",
    description: "Major GCC bank reports unexpected liquidity shortfall",
    event: {
      title: "Major GCC bank reports unexpected liquidity shortfall amid regional uncertainty",
      category: "banking_stress",
      severity: "high",
      region: "Middle East",
      source_confidence: 0.78,
    },
  },
  {
    id: "war",
    label: "Regional War Escalation",
    description: "Military escalation in Persian Gulf — multiple naval assets deployed",
    event: {
      title: "Military escalation in Persian Gulf — multiple naval assets deployed",
      category: "geopolitical_conflict",
      severity: "critical",
      region: "Middle East",
      source_confidence: 0.82,
    },
  },
];
