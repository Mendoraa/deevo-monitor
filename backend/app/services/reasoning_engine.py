"""Reasoning Engine — BFS graph propagation with market-specific weights.

Runs signal propagation through the graph registry, computing effective
weights per edge using regional sensitivity, confidence, time decay,
and volatility factors. Produces graph_outputs dict keyed by target
metric nodes (the 5 score signals).
"""

from typing import Dict, List, Any, Optional, Set, Tuple
from collections import deque
import math

from app.services.graph_registry_service import GraphRegistryService, graph_registry
from app.services.market_profile_service import get_market_profile, get_regional_sensitivity


# ─── Propagation Config ────────────────────────────────────────

DEFAULT_MAX_DEPTH = 5
DEFAULT_HOP_DECAY = 0.15          # decay per hop
DEFAULT_ATTENUATION = 0.75        # multiplicative attenuation
DEFAULT_THRESHOLD = 0.03          # minimum impact to continue
DEFAULT_DAMPING = 0.85            # PageRank-style damping

# Score target nodes — these are the final output nodes
SCORE_TARGET_NODES = [
    "market_stress_signal",
    "claims_pressure_signal",
    "fraud_exposure_signal",
    "underwriting_risk_signal",
    "portfolio_stability_signal",
]


class ReasoningEngine:
    """BFS-based graph reasoning engine for GCC insurance intelligence."""

    def __init__(self, registry: GraphRegistryService = None):
        self.registry = registry or graph_registry

    def run_reasoning(
        self,
        market_code: str,
        signal_values: Dict[str, float],
        max_depth: int = DEFAULT_MAX_DEPTH,
        hop_decay: float = DEFAULT_HOP_DECAY,
        attenuation: float = DEFAULT_ATTENUATION,
        threshold: float = DEFAULT_THRESHOLD,
    ) -> Dict[str, Any]:
        """Execute full reasoning pipeline.

        Args:
            market_code: GCC market code (KWT, SAU, etc.)
            signal_values: Dict of signal_key -> normalized_value (0-100)
            max_depth: Maximum BFS depth
            hop_decay: Impact decay per hop
            attenuation: Multiplicative attenuation factor
            threshold: Minimum impact to continue propagation

        Returns:
            Dict with graph_outputs, propagation_trace, and metadata.
        """
        # Ensure registry is initialized
        self.registry.initialize()

        # Reset node values before new run
        self.registry.reset_node_values()

        # Step 1: Inject signals into graph nodes
        injected = self._inject_signals(signal_values)

        # Step 2: Run BFS propagation from all injected nodes
        propagation_trace = self._propagate_bfs(
            start_nodes=list(injected.keys()),
            market_code=market_code,
            max_depth=max_depth,
            hop_decay=hop_decay,
            attenuation=attenuation,
            threshold=threshold,
        )

        # Step 3: Collect score target outputs
        graph_outputs = self._collect_score_outputs()

        # Step 4: Identify top drivers for each score
        top_drivers = self._identify_top_drivers(propagation_trace)

        # Step 5: Build impact chain for explainability
        impact_chains = self._build_impact_chains(propagation_trace)

        return {
            "market_code": market_code,
            "graph_outputs": graph_outputs,
            "propagation_trace": propagation_trace,
            "top_drivers": top_drivers,
            "impact_chains": impact_chains,
            "injected_signals": injected,
            "nodes_affected": len(propagation_trace),
            "metadata": {
                "max_depth": max_depth,
                "hop_decay": hop_decay,
                "attenuation": attenuation,
                "threshold": threshold,
            },
        }

    def _inject_signals(self, signal_values: Dict[str, float]) -> Dict[str, float]:
        """Inject normalized signal values into corresponding graph nodes."""
        injected = {}
        for signal_key, normalized_value in signal_values.items():
            node = self.registry.get_node(signal_key)
            if node:
                self.registry.update_node_value(
                    signal_key,
                    value=normalized_value,
                    normalized=normalized_value,
                )
                injected[signal_key] = normalized_value
        return injected

    def _propagate_bfs(
        self,
        start_nodes: List[str],
        market_code: str,
        max_depth: int,
        hop_decay: float,
        attenuation: float,
        threshold: float,
    ) -> Dict[str, Dict[str, Any]]:
        """BFS propagation through the graph.

        Each node accumulates impact from all paths, with decay per hop
        and attenuation at each edge crossing.
        """
        # trace[node_key] = {impact, depth, sources, path}
        trace: Dict[str, Dict[str, Any]] = {}

        # Queue: (node_key, current_impact, current_depth, path)
        queue: deque = deque()

        # Seed the queue with injected signal nodes
        for node_key in start_nodes:
            node = self.registry.get_node(node_key)
            if not node:
                continue
            impact = node.get("normalized_value", 0.0) / 100.0  # Scale to 0-1
            if abs(impact) < threshold:
                continue
            queue.append((node_key, impact, 0, [node_key]))
            trace[node_key] = {
                "impact": impact,
                "depth": 0,
                "sources": [node_key],
                "path": [node_key],
                "is_source": True,
            }

        visited_edges: Set[str] = set()

        while queue:
            current_key, current_impact, depth, path = queue.popleft()

            if depth >= max_depth:
                continue

            # Get outgoing edges from current node
            outgoing = self.registry.get_outgoing_edges(current_key)

            for edge in outgoing:
                target_key = edge["target_node_id"]
                edge_key = edge["edge_key"]

                # Compute effective weight with market sensitivity
                effective_weight = self.registry.compute_effective_weight(
                    edge, market_code=market_code
                )

                # Apply hop decay and attenuation
                hop_factor = 1.0 - (hop_decay * (depth + 1))
                hop_factor = max(0.1, hop_factor)

                propagated_impact = (
                    current_impact
                    * effective_weight
                    * attenuation
                    * hop_factor
                )

                # Check threshold
                if abs(propagated_impact) < threshold:
                    continue

                # Handle relationship type modifiers
                rel_type = edge.get("relationship_type", "affects")
                if rel_type == "constrains":
                    propagated_impact *= -0.8  # Constraining reduces
                elif rel_type == "hedges":
                    propagated_impact *= -0.5  # Hedging partially offsets
                elif rel_type == "amplifies":
                    propagated_impact *= 1.1   # Slight amplification bonus

                new_path = path + [target_key]

                # Accumulate impact (additive from multiple paths)
                if target_key in trace:
                    existing = trace[target_key]
                    existing["impact"] += propagated_impact
                    existing["sources"].append(current_key)
                    # Keep shortest path
                    if len(new_path) < len(existing["path"]):
                        existing["path"] = new_path
                        existing["depth"] = depth + 1
                else:
                    trace[target_key] = {
                        "impact": propagated_impact,
                        "depth": depth + 1,
                        "sources": [current_key],
                        "path": new_path,
                        "is_source": False,
                    }

                # Update the node value in registry
                node = self.registry.get_node(target_key)
                if node:
                    accumulated = trace[target_key]["impact"]
                    self.registry.update_node_value(
                        target_key,
                        value=accumulated * 100,
                        normalized=max(0, min(100, accumulated * 100)),
                    )

                # Prevent infinite loops on same edge in same BFS layer
                visit_key = f"{edge_key}@{depth}"
                if visit_key not in visited_edges:
                    visited_edges.add(visit_key)
                    queue.append((target_key, propagated_impact, depth + 1, new_path))

        return trace

    def _collect_score_outputs(self) -> Dict[str, float]:
        """Collect final values from score target nodes."""
        outputs = {}
        for target_key in SCORE_TARGET_NODES:
            node = self.registry.get_node(target_key)
            if node:
                # Clamp to 0-100
                raw = node.get("current_value", 0.0)
                outputs[target_key] = max(0.0, min(100.0, raw))
            else:
                outputs[target_key] = 0.0
        return outputs

    def _identify_top_drivers(
        self, trace: Dict[str, Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """Identify top impact drivers for each score target."""
        drivers: Dict[str, List[Dict[str, Any]]] = {}

        for target_key in SCORE_TARGET_NODES:
            # Find all nodes that fed into this target
            incoming = self.registry.get_incoming_edges(target_key)
            target_drivers = []

            for edge in incoming:
                source_key = edge["source_node_id"]
                if source_key in trace:
                    t = trace[source_key]
                    target_drivers.append({
                        "node_key": source_key,
                        "impact_strength": round(abs(t["impact"]), 4),
                        "direction": "positive" if t["impact"] >= 0 else "negative",
                        "depth": t["depth"],
                        "edge_weight": edge["current_weight"],
                    })

            # Sort by impact strength descending
            target_drivers.sort(key=lambda x: x["impact_strength"], reverse=True)
            drivers[target_key] = target_drivers[:5]  # Top 5 per score

        return drivers

    def _build_impact_chains(
        self, trace: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Build human-readable impact chains from propagation trace."""
        chains = []
        for target_key in SCORE_TARGET_NODES:
            if target_key not in trace:
                continue
            t = trace[target_key]
            if t["impact"] == 0:
                continue
            chains.append({
                "target": target_key,
                "total_impact": round(t["impact"], 4),
                "path": t["path"],
                "depth": t["depth"],
                "contributing_sources": t["sources"][:5],
            })

        chains.sort(key=lambda x: abs(x["total_impact"]), reverse=True)
        return chains


# Singleton
reasoning_engine = ReasoningEngine()
