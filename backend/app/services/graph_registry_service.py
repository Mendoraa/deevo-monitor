"""Graph Registry Service — manages nodes, edges, and current state."""

from typing import Dict, List, Optional, Any
import uuid
from app.services.market_profile_service import (
    get_default_nodes, get_default_edges,
    get_regional_sensitivity,
)


class GraphRegistryService:
    """In-memory graph registry. Production: backed by PostgreSQL."""

    def __init__(self):
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: Dict[str, Dict[str, Any]] = {}
        self._initialized = False

    def initialize(self):
        """Seed the graph with default nodes and edges."""
        if self._initialized:
            return

        for n in get_default_nodes():
            node_id = f"n_{n['node_key']}"
            self.nodes[n["node_key"]] = {
                "id": node_id,
                "node_key": n["node_key"],
                "label": n["label"],
                "node_type": n["node_type"],
                "base_value": 0.0,
                "current_value": 0.0,
                "normalized_value": 0.0,
                "confidence_score": 0.7,
            }

        for e in get_default_edges():
            edge_key = f"{e['source']}→{e['target']}"
            edge_id = f"e_{uuid.uuid4().hex[:8]}"
            self.edges[edge_key] = {
                "id": edge_id,
                "edge_key": edge_key,
                "source_node_id": e["source"],
                "target_node_id": e["target"],
                "relationship_type": e["rel"],
                "base_weight": e["weight"],
                "current_weight": e["weight"],
                "min_weight": 0.05,
                "max_weight": 1.50,
                "confidence_score": 0.7,
                "time_decay_factor": 1.0,
                "volatility_factor": 1.0,
                "lag_days": 0,
                "active": True,
            }

        self._initialized = True

    def get_node(self, node_key: str) -> Optional[Dict]:
        return self.nodes.get(node_key)

    def get_edge(self, edge_key: str) -> Optional[Dict]:
        return self.edges.get(edge_key)

    def get_all_nodes(self) -> List[Dict]:
        return list(self.nodes.values())

    def get_all_edges(self) -> List[Dict]:
        return list(self.edges.values())

    def update_node_value(self, node_key: str, value: float, normalized: float = None):
        """Update a node's current value from a signal."""
        node = self.nodes.get(node_key)
        if node:
            node["current_value"] = value
            if normalized is not None:
                node["normalized_value"] = normalized

    def update_edge_weight(self, edge_key: str, new_weight: float, confidence: float = None):
        """Update an edge's current weight (from calibration)."""
        edge = self.edges.get(edge_key)
        if edge:
            edge["current_weight"] = max(edge["min_weight"], min(edge["max_weight"], new_weight))
            if confidence is not None:
                edge["confidence_score"] = min(1.0, max(0.0, confidence))

    def get_outgoing_edges(self, node_key: str) -> List[Dict]:
        """Get all edges originating from a node."""
        return [e for e in self.edges.values() if e["source_node_id"] == node_key and e["active"]]

    def get_incoming_edges(self, node_key: str) -> List[Dict]:
        """Get all edges targeting a node."""
        return [e for e in self.edges.values() if e["target_node_id"] == node_key and e["active"]]

    def compute_effective_weight(
        self,
        edge: Dict,
        market_code: str = None,
        live_adjustment: float = 1.0,
    ) -> float:
        """Compute effective weight with all factors."""
        base = edge["current_weight"]
        regional = 1.0
        if market_code:
            sensitivities = get_regional_sensitivity(market_code)
            source = edge["source_node_id"]
            regional = sensitivities.get(source, 1.0)

        confidence = edge["confidence_score"]
        time_decay = edge["time_decay_factor"]
        volatility = edge["volatility_factor"]

        effective = base * regional * confidence * time_decay * volatility * live_adjustment
        return max(edge["min_weight"], min(edge["max_weight"], effective))

    def reset_node_values(self):
        """Reset all node current values to base."""
        for node in self.nodes.values():
            node["current_value"] = node["base_value"]
            node["normalized_value"] = 0.0


# Singleton
graph_registry = GraphRegistryService()
