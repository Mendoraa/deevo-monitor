/**
 * Signal Binding Engine — Phase 2
 *
 * Maps live signal items (news feeds, alerts, panel items)
 * into normalized event classes for graph injection.
 *
 * Architecture Decision: Signal binding is rule-based, not AI-driven.
 * This keeps the pipeline deterministic and audit-traceable.
 */

import type { NormalizedEvent, EventClass, EventCategory } from "../types";

// ─── Signal Input Type ─────────────────────────────────────────

export interface RawSignal {
  title: string;
  description?: string;
  source?: string;
  region?: string;
  timestamp?: string;
  confidence?: number;
  tags?: string[];
  url?: string;
}

// ─── Binding Rules ─────────────────────────────────────────────

interface BindingRule {
  keywords: string[];
  eventClass: EventClass;
  category: EventCategory;
  baseSeverity: number;
  region: string;
}

const BINDING_RULES: BindingRule[] = [
  // Hormuz / maritime disruption
  {
    keywords: ["hormuz", "strait of hormuz", "tanker attack", "tanker seized", "naval blockade", "mine", "maritime incident"],
    eventClass: "hormuz_disruption",
    category: "shipping_disruption",
    baseSeverity: 0.85,
    region: "GCC",
  },
  // Bab el-Mandeb / Red Sea
  {
    keywords: ["bab el-mandeb", "bab al-mandab", "red sea", "houthi", "yemen strait", "aden gulf"],
    eventClass: "hormuz_disruption",
    category: "shipping_disruption",
    baseSeverity: 0.75,
    region: "GCC",
  },
  // Suez Canal
  {
    keywords: ["suez", "suez canal", "suez blockage", "canal disruption"],
    eventClass: "hormuz_disruption",
    category: "shipping_disruption",
    baseSeverity: 0.70,
    region: "GCC",
  },
  // Refinery / energy infrastructure
  {
    keywords: ["refinery", "oil facility", "aramco attack", "pipeline attack", "ras tanura", "abqaiq", "khurais"],
    eventClass: "refinery_attack",
    category: "energy_supply",
    baseSeverity: 0.80,
    region: "GCC",
  },
  // Oil price shock
  {
    keywords: ["oil price surge", "crude spike", "opec cut", "production cut", "supply disruption"],
    eventClass: "energy_supply_shock",
    category: "energy_supply",
    baseSeverity: 0.65,
    region: "GCC",
  },
  // Sanctions
  {
    keywords: ["sanctions", "trade ban", "asset freeze", "ofac", "export controls", "embargo"],
    eventClass: "sanctions_escalation",
    category: "sanctions",
    baseSeverity: 0.75,
    region: "GCC",
  },
  // Banking / financial stress
  {
    keywords: ["bank run", "liquidity crisis", "credit freeze", "interbank", "capital flight", "bank collapse"],
    eventClass: "banking_stress",
    category: "banking_stress",
    baseSeverity: 0.70,
    region: "GCC",
  },
  // Regional war / escalation
  {
    keywords: ["war", "military strike", "airstrike", "missile attack", "invasion", "escalation", "armed conflict"],
    eventClass: "regional_war",
    category: "geopolitical_conflict",
    baseSeverity: 0.90,
    region: "GCC",
  },
  // Cyber attack
  {
    keywords: ["cyber attack", "ransomware", "infrastructure hack", "scada", "critical infrastructure breach"],
    eventClass: "generic_geopolitical_event",
    category: "cyber_attack",
    baseSeverity: 0.60,
    region: "GCC",
  },
];

// ─── Severity Adjustments ──────────────────────────────────────

/** Keywords that amplify severity */
const SEVERITY_AMPLIFIERS: { keywords: string[]; boost: number }[] = [
  { keywords: ["confirmed", "verified", "official"], boost: 0.05 },
  { keywords: ["multiple", "widespread", "large-scale"], boost: 0.08 },
  { keywords: ["unprecedented", "worst", "catastrophic"], boost: 0.10 },
  { keywords: ["imminent", "immediate", "urgent"], boost: 0.07 },
];

/** Keywords that dampen severity */
const SEVERITY_DAMPENERS: { keywords: string[]; reduction: number }[] = [
  { keywords: ["rumor", "unconfirmed", "alleged"], reduction: 0.10 },
  { keywords: ["minor", "small-scale", "localized"], reduction: 0.08 },
  { keywords: ["resolved", "contained", "under control"], reduction: 0.15 },
];

// ─── Core Binding Function ─────────────────────────────────────

/**
 * Bind a raw signal to a normalized event.
 * Uses keyword matching against binding rules.
 */
export function bindSignalToEvent(signal: RawSignal): NormalizedEvent {
  const text = `${signal.title} ${signal.description || ""}`.toLowerCase();

  // Find matching rule
  let matchedRule: BindingRule | null = null;
  let matchScore = 0;

  for (const rule of BINDING_RULES) {
    const hits = rule.keywords.filter((kw) => text.includes(kw));
    if (hits.length > matchScore) {
      matchScore = hits.length;
      matchedRule = rule;
    }
  }

  // Default fallback
  if (!matchedRule) {
    return {
      eventClass: "generic_geopolitical_event",
      category: "geopolitical_conflict",
      region: signal.region || "Global",
      severity: 0.5,
      confidence: signal.confidence ?? 0.5,
      title: signal.title,
      description: signal.description || "",
      sources: signal.source ? [signal.source] : [],
      timestamp: signal.timestamp || new Date().toISOString(),
    };
  }

  // Compute adjusted severity
  let severity = matchedRule.baseSeverity;

  for (const amp of SEVERITY_AMPLIFIERS) {
    if (amp.keywords.some((kw) => text.includes(kw))) {
      severity += amp.boost;
    }
  }

  for (const damp of SEVERITY_DAMPENERS) {
    if (damp.keywords.some((kw) => text.includes(kw))) {
      severity -= damp.reduction;
    }
  }

  severity = Math.max(0.1, Math.min(1.0, severity));

  // Compute confidence from source quality
  const confidence = computeSourceConfidence(signal);

  return {
    eventClass: matchedRule.eventClass,
    category: matchedRule.category,
    region: signal.region || matchedRule.region,
    severity: parseFloat(severity.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
    title: signal.title,
    description: signal.description || "",
    sources: signal.source ? [signal.source] : [],
    timestamp: signal.timestamp || new Date().toISOString(),
  };
}

/**
 * Bind multiple signals, deduplicating and merging overlapping events.
 */
export function bindMultipleSignals(signals: RawSignal[]): NormalizedEvent[] {
  const events: NormalizedEvent[] = signals.map(bindSignalToEvent);

  // Group by eventClass
  const groups = new Map<string, NormalizedEvent[]>();
  for (const event of events) {
    const existing = groups.get(event.eventClass) || [];
    existing.push(event);
    groups.set(event.eventClass, existing);
  }

  // Merge each group: highest severity, combined sources, averaged confidence
  const merged: NormalizedEvent[] = [];
  for (const [, group] of groups) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }

    const best = group.reduce((a, b) => (a.severity > b.severity ? a : b));
    const allSources = [...new Set(group.flatMap((e) => e.sources))];
    const avgConfidence =
      group.reduce((sum, e) => sum + e.confidence, 0) / group.length;

    merged.push({
      ...best,
      confidence: parseFloat(avgConfidence.toFixed(2)),
      sources: allSources,
    });
  }

  return merged;
}

// ─── Helpers ───────────────────────────────────────────────────

function computeSourceConfidence(signal: RawSignal): number {
  let confidence = signal.confidence ?? 0.6;

  // Known high-confidence sources
  const highConfSources = [
    "reuters", "bloomberg", "associated press", "official statement",
    "government", "ministry", "central bank", "opec",
  ];

  if (
    signal.source &&
    highConfSources.some((s) => signal.source!.toLowerCase().includes(s))
  ) {
    confidence = Math.min(1.0, confidence + 0.15);
  }

  // Multiple tags indicate better-classified signal
  if (signal.tags && signal.tags.length >= 3) {
    confidence = Math.min(1.0, confidence + 0.05);
  }

  return confidence;
}
