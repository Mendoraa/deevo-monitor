/**
 * Graph Propagation Engine — Phase 2
 *
 * BFS-based shock propagation through the GCC economic graph.
 * Uses dynamic weights (not static), hop-based decay, and threshold cutoffs.
 *
 * Architecture Decision: Deterministic. No AI in the propagation loop.
 * Graph output feeds into the AI explanation layer downstream.
 */

import type {
  GraphState,
  GraphNode,
  GraphEdge,
  PropagationConfig,
  PropagationStep,
  PropagationResult,
  NodeState,
  NodeType,
  RelationType,
} from "../types";

// ─── Default Config ────────────────────────────────────────────

export const DEFAULT_PROPAGATION_CONFIG: PropagationConfig = {
  maxDepth: 5,
  decayPerHop: 0.15,
  thresholdCutoff: 0.03,
  attenuationFactor: 0.75,
};

// ─── GCC Economic Graph Topology ───────────────────────────────

/** Build the full GCC economic graph with 30+ nodes and 40+ edges. */
export function buildGCCGraph(): GraphState {
  const nodes: Record<string, GraphNode> = {};
  const edges: GraphEdge[] = [];

  const addNode = (
    id: string,
    label: string,
    type: NodeType,
    meta?: Record<string, unknown>
  ) => {
    nodes[id] = { id, label, type, value: 0, baseValue: 0, state: "stable", metadata: meta };
  };

  const addEdge = (
    from: string,
    to: string,
    relation: RelationType,
    weight: number
  ) => {
    edges.push({ from, to, relation, baseWeight: weight, dynamicWeight: weight });
  };

  // ── Infrastructure nodes ──
  addNode("hormuz", "Strait of Hormuz", "infrastructure");
  addNode("bab_mandeb", "Bab el-Mandeb", "infrastructure");
  addNode("suez", "Suez Canal", "infrastructure");
  addNode("ras_tanura", "Ras Tanura Terminal", "infrastructure");
  addNode("jebel_ali", "Jebel Ali Port", "infrastructure");
  addNode("fujairah", "Fujairah Terminal", "infrastructure");
  addNode("ruwais", "Ruwais Refinery", "infrastructure");

  // ── Commodity nodes ──
  addNode("crude_oil", "Crude Oil", "commodity");
  addNode("lng", "LNG", "commodity");
  addNode("refined_products", "Refined Products", "commodity");

  // ── Sector nodes ──
  addNode("tanker_traffic", "Tanker Traffic", "sector");
  addNode("marine_insurance", "Marine Insurance", "sector");
  addNode("political_risk_insurance", "Political Risk Insurance", "sector");
  addNode("energy_insurance", "Energy Insurance", "sector");
  addNode("gcc_banking", "GCC Banking Sector", "sector");
  addNode("trade_finance", "Trade Finance", "sector");
  addNode("shipping_logistics", "Shipping & Logistics", "sector");
  addNode("refining", "Refining Sector", "sector");
  addNode("aviation", "Aviation Sector", "sector");
  addNode("real_estate", "Real Estate Sector", "sector");
  addNode("insurance_claims", "Insurance Claims", "sector");

  // ── Metric nodes ──
  addNode("gcc_inflation", "GCC Inflation", "metric");
  addNode("delivered_oil_cost", "Delivered Oil Cost", "metric");
  addNode("freight_rates", "Freight Rates", "metric");
  addNode("insurance_premiums", "Insurance Premiums", "metric");
  addNode("risk_appetite", "Risk Appetite", "metric");
  addNode("credit_risk", "Credit Risk", "metric");
  addNode("bank_liquidity", "Bank Liquidity", "metric");
  addNode("shipping_cost", "Shipping Cost", "metric");
  addNode("inflation_pressure", "Inflation Pressure", "metric");
  addNode("sovereign_risk", "Sovereign Risk", "metric");

  // ── Country nodes ──
  addNode("saudi", "Saudi Arabia", "country", { oilDep: 0.65, fiscalBuffer: 0.7 });
  addNode("uae", "UAE", "country", { oilDep: 0.30, fiscalBuffer: 0.85 });
  addNode("kuwait", "Kuwait", "country", { oilDep: 0.85, fiscalBuffer: 0.80 });
  addNode("qatar", "Qatar", "country", { oilDep: 0.55, fiscalBuffer: 0.75 });
  addNode("bahrain", "Bahrain", "country", { oilDep: 0.70, fiscalBuffer: 0.35 });
  addNode("oman", "Oman", "country", { oilDep: 0.72, fiscalBuffer: 0.40 });

  // ── Edges: Infrastructure → Commodities ──
  addEdge("hormuz", "crude_oil", "constrains", 0.85);
  addEdge("hormuz", "lng", "constrains", 0.60);
  addEdge("hormuz", "tanker_traffic", "disrupts", 0.90);
  addEdge("bab_mandeb", "crude_oil", "constrains", 0.55);
  addEdge("bab_mandeb", "tanker_traffic", "disrupts", 0.65);
  addEdge("suez", "refined_products", "delays", 0.50);
  addEdge("suez", "shipping_logistics", "delays", 0.60);
  addEdge("ras_tanura", "crude_oil", "constrains", 0.75);
  addEdge("fujairah", "refined_products", "constrains", 0.55);
  addEdge("ruwais", "refined_products", "constrains", 0.45);

  // ── Edges: Commodities → Sectors ──
  addEdge("crude_oil", "delivered_oil_cost", "increases", 0.80);
  addEdge("crude_oil", "refining", "affects", 0.55);
  addEdge("crude_oil", "energy_insurance", "reprices", 0.50);
  addEdge("lng", "delivered_oil_cost", "affects", 0.35);

  // ── Edges: Sectors → Metrics ──
  addEdge("tanker_traffic", "freight_rates", "increases", 0.75);
  addEdge("tanker_traffic", "shipping_cost", "increases", 0.80);
  addEdge("tanker_traffic", "marine_insurance", "reprices", 0.70);
  addEdge("marine_insurance", "insurance_premiums", "increases", 0.65);
  addEdge("political_risk_insurance", "insurance_premiums", "increases", 0.55);
  addEdge("energy_insurance", "insurance_premiums", "increases", 0.50);
  addEdge("shipping_logistics", "shipping_cost", "increases", 0.60);
  addEdge("shipping_logistics", "gcc_inflation", "affects", 0.40);
  addEdge("trade_finance", "credit_risk", "amplifies", 0.55);
  addEdge("gcc_banking", "bank_liquidity", "constrains", 0.65);
  addEdge("gcc_banking", "credit_risk", "amplifies", 0.50);

  // ── Edges: Metrics → Metrics (second-order) ──
  addEdge("delivered_oil_cost", "gcc_inflation", "increases", 0.60);
  addEdge("freight_rates", "gcc_inflation", "increases", 0.35);
  addEdge("shipping_cost", "gcc_inflation", "increases", 0.40);
  addEdge("insurance_premiums", "gcc_inflation", "affects", 0.20);
  addEdge("credit_risk", "risk_appetite", "constrains", 0.55);
  addEdge("bank_liquidity", "risk_appetite", "constrains", 0.45);
  addEdge("risk_appetite", "real_estate", "affects", 0.40);
  addEdge("gcc_inflation", "inflation_pressure", "amplifies", 0.70);

  // ── Edges: Insurance cascade ──
  addEdge("insurance_premiums", "insurance_claims", "triggers", 0.45);
  addEdge("marine_insurance", "insurance_claims", "triggers", 0.50);
  addEdge("energy_insurance", "insurance_claims", "triggers", 0.40);

  // ── Edges: Metrics → Countries ──
  addEdge("gcc_inflation", "saudi", "exposed_to", 0.45);
  addEdge("gcc_inflation", "uae", "exposed_to", 0.50);
  addEdge("gcc_inflation", "kuwait", "exposed_to", 0.35);
  addEdge("gcc_inflation", "qatar", "exposed_to", 0.40);
  addEdge("gcc_inflation", "bahrain", "exposed_to", 0.55);
  addEdge("gcc_inflation", "oman", "exposed_to", 0.50);
  addEdge("delivered_oil_cost", "saudi", "affects", 0.65);
  addEdge("delivered_oil_cost", "uae", "affects", 0.30);
  addEdge("delivered_oil_cost", "kuwait", "affects", 0.80);
  addEdge("credit_risk", "bahrain", "exposed_to", 0.50);
  addEdge("credit_risk", "oman", "exposed_to", 0.45);
  addEdge("sovereign_risk", "bahrain", "exposed_to", 0.60);
  addEdge("sovereign_risk", "oman", "exposed_to", 0.55);
  addEdge("risk_appetite", "uae", "affects", 0.45);
  addEdge("bank_liquidity", "gcc_banking", "constrains", 0.50);

  return { nodes, edges };
}

// ─── Event → Graph Injection Map ───────────────────────────────

const INJECTION_MAP: Record<string, { nodeId: string; baseImpact: number }[]> = {
  hormuz_disruption: [
    { nodeId: "hormuz", baseImpact: 0.90 },
    { nodeId: "tanker_traffic", baseImpact: 0.75 },
  ],
  refinery_attack: [
    { nodeId: "ras_tanura", baseImpact: 0.80 },
    { nodeId: "crude_oil", baseImpact: 0.70 },
  ],
  energy_supply_shock: [
    { nodeId: "crude_oil", baseImpact: 0.85 },
    { nodeId: "lng", baseImpact: 0.50 },
  ],
  sanctions_escalation: [
    { nodeId: "trade_finance", baseImpact: 0.75 },
    { nodeId: "gcc_banking", baseImpact: 0.60 },
  ],
  regional_war: [
    { nodeId: "hormuz", baseImpact: 0.85 },
    { nodeId: "crude_oil", baseImpact: 0.80 },
    { nodeId: "aviation", baseImpact: 0.70 },
    { nodeId: "political_risk_insurance", baseImpact: 0.90 },
  ],
  banking_stress: [
    { nodeId: "gcc_banking", baseImpact: 0.80 },
    { nodeId: "bank_liquidity", baseImpact: -0.70 },
  ],
  generic_geopolitical_event: [
    { nodeId: "risk_appetite", baseImpact: -0.40 },
    { nodeId: "sovereign_risk", baseImpact: 0.30 },
  ],
};

// ─── Core Propagation ──────────────────────────────────────────

/**
 * Propagate a shock through the graph using BFS.
 *
 * @param graph - Current graph state (nodes + edges with dynamic weights)
 * @param startNodeId - Node ID to inject the shock
 * @param shockValue - Initial shock magnitude (0.0 – 1.0)
 * @param config - Propagation parameters
 */
export function propagateShock(
  graph: GraphState,
  startNodeId: string,
  shockValue: number,
  config: PropagationConfig = DEFAULT_PROPAGATION_CONFIG
): PropagationResult {
  const steps: PropagationStep[] = [];
  const visited = new Set<string>();
  let stepCount = 0;
  let maxDepthReached = 0;

  interface QueueItem {
    nodeId: string;
    value: number;
    depth: number;
    fromNode: string;
    relation: RelationType;
  }

  const queue: QueueItem[] = [
    {
      nodeId: startNodeId,
      value: shockValue,
      depth: 0,
      fromNode: "event_source",
      relation: "triggers",
    },
  ];

  // Apply initial shock to start node
  if (graph.nodes[startNodeId]) {
    graph.nodes[startNodeId].value += shockValue;
    graph.nodes[startNodeId].state = scoreToState(
      Math.abs(graph.nodes[startNodeId].value)
    );
  }

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.depth > config.maxDepth) continue;
    const visitKey = `${current.nodeId}:${current.depth}`;
    if (visited.has(visitKey)) continue;
    visited.add(visitKey);

    if (current.depth > maxDepthReached) {
      maxDepthReached = current.depth;
    }

    // Find outgoing edges
    const outgoing = graph.edges.filter((e) => e.from === current.nodeId);

    for (const edge of outgoing) {
      const decayFactor = 1 - current.depth * config.decayPerHop;
      const propagated =
        current.value * edge.dynamicWeight * decayFactor * config.attenuationFactor;

      if (Math.abs(propagated) < config.thresholdCutoff) continue;

      // Update target node
      const targetNode = graph.nodes[edge.to];
      if (!targetNode) continue;

      targetNode.value += propagated;
      targetNode.state = scoreToState(Math.abs(targetNode.value));

      stepCount++;
      steps.push({
        step: stepCount,
        fromNode: current.nodeId,
        toNode: edge.to,
        relation: edge.relation,
        impactTransmitted: parseFloat(propagated.toFixed(4)),
        resultingState: targetNode.state,
        depth: current.depth + 1,
        explanation: buildStepExplanation(
          graph.nodes[current.nodeId]?.label || current.nodeId,
          targetNode.label,
          edge.relation,
          propagated
        ),
      });

      queue.push({
        nodeId: edge.to,
        value: propagated,
        depth: current.depth + 1,
        fromNode: current.nodeId,
        relation: edge.relation,
      });
    }
  }

  // Build results
  const impactedNodes = Object.values(graph.nodes)
    .filter((n) => Math.abs(n.value) > config.thresholdCutoff)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const criticalPath = impactedNodes
    .filter((n) => n.state === "critical" || n.state === "disrupted")
    .map((n) => n.id);

  const systemicRiskScore = computeSystemicRisk(impactedNodes);

  return {
    steps,
    impactedNodes,
    criticalPath,
    systemicRiskScore: parseFloat(systemicRiskScore.toFixed(4)),
    totalSteps: stepCount,
    maxDepthReached,
  };
}

/**
 * Run full event-driven propagation.
 * Injects the event into the graph at the appropriate node(s)
 * and runs BFS propagation from each injection point.
 */
export function runEventPropagation(
  event: { eventClass: string; severity: number },
  graph: GraphState,
  config: PropagationConfig = DEFAULT_PROPAGATION_CONFIG
): PropagationResult {
  const injections = INJECTION_MAP[event.eventClass] || INJECTION_MAP.generic_geopolitical_event;

  const allSteps: PropagationStep[] = [];
  let globalStepCount = 0;
  let maxDepth = 0;

  for (const injection of injections) {
    if (!graph.nodes[injection.nodeId]) continue;

    const shockValue = injection.baseImpact * event.severity;
    const result = propagateShock(graph, injection.nodeId, shockValue, config);

    // Offset step numbers
    for (const step of result.steps) {
      step.step = ++globalStepCount;
    }

    allSteps.push(...result.steps);
    if (result.maxDepthReached > maxDepth) {
      maxDepth = result.maxDepthReached;
    }
  }

  const impactedNodes = Object.values(graph.nodes)
    .filter((n) => Math.abs(n.value) > config.thresholdCutoff)
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const criticalPath = impactedNodes
    .filter((n) => n.state === "critical" || n.state === "disrupted")
    .map((n) => n.id);

  return {
    steps: allSteps,
    impactedNodes,
    criticalPath,
    systemicRiskScore: parseFloat(computeSystemicRisk(impactedNodes).toFixed(4)),
    totalSteps: globalStepCount,
    maxDepthReached: maxDepth,
  };
}

// ─── Helpers ───────────────────────────────────────────────────

function scoreToState(score: number): NodeState {
  if (score >= 0.75) return "critical";
  if (score >= 0.45) return "disrupted";
  if (score >= 0.20) return "stressed";
  return "stable";
}

function computeSystemicRisk(nodes: GraphNode[]): number {
  const topN = nodes.slice(0, 7);
  if (topN.length === 0) return 0;

  const weights = [0.25, 0.20, 0.15, 0.12, 0.10, 0.10, 0.08];
  let score = 0;
  for (let i = 0; i < topN.length; i++) {
    score += Math.abs(topN[i].value) * (weights[i] || 0.05);
  }
  return Math.min(1.0, score);
}

const RELATION_VERBS: Record<string, string> = {
  affects: "affects",
  delays: "delays operations at",
  reprices: "triggers repricing of",
  constrains: "constrains supply to",
  amplifies: "amplifies pressure on",
  hedges: "provides hedging for",
  exports_to: "impacts exports to",
  exposed_to: "exposes vulnerability in",
  disrupts: "disrupts",
  increases: "increases costs for",
  triggers: "triggers activity in",
};

function buildStepExplanation(
  fromLabel: string,
  toLabel: string,
  relation: RelationType,
  impact: number
): string {
  const verb = RELATION_VERBS[relation] || "impacts";
  const direction = impact > 0 ? "upward" : "downward";
  const pct = (Math.abs(impact) * 100).toFixed(1);
  return `${fromLabel} ${verb} ${toLabel} (${direction} ${pct}% impact)`;
}
