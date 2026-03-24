"""Economic Graph — the core graph structure with nodes, edges, and propagation logic.

This implements the Economic Causality Graph from the architecture spec:
Nodes: event, oil, tanker, port, insurer, bank, GCC state, inflation, shipping_lane, refinery
Edges: affects, delays, reprices, constrains, amplifies, hedges, exports_to, exposed_to

The graph propagates impact from an event node through connected nodes,
attenuating by edge weight and tracking the full propagation trace.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from app.schemas.graph import GraphNode, GraphEdge, PropagationStep


@dataclass
class EconomicGraph:
    """In-memory economic causality graph with BFS propagation."""

    nodes: dict[str, GraphNode] = field(default_factory=dict)
    adjacency: dict[str, list[tuple[str, GraphEdge]]] = field(default_factory=dict)

    def add_node(self, node: GraphNode) -> None:
        self.nodes[node.node_id] = node
        if node.node_id not in self.adjacency:
            self.adjacency[node.node_id] = []

    def add_edge(self, edge: GraphEdge) -> None:
        if edge.source not in self.adjacency:
            self.adjacency[edge.source] = []
        self.adjacency[edge.source].append((edge.target, edge))

    def propagate(
        self,
        source_id: str,
        initial_impact: float,
        max_depth: int = 6,
        attenuation: float = 0.75,
        threshold: float = 0.05,
    ) -> list[PropagationStep]:
        """BFS propagation from source node through the graph.

        Each hop attenuates the impact by `attenuation * edge.weight`.
        Propagation stops when impact falls below `threshold` or `max_depth` is reached.
        """
        trace: list[PropagationStep] = []
        visited: set[str] = set()
        queue: list[tuple[str, float, int]] = [(source_id, initial_impact, 0)]

        # Set source node state
        if source_id in self.nodes:
            self.nodes[source_id].impact_score = min(initial_impact, 1.0)
            self.nodes[source_id].current_state = _score_to_state(initial_impact)

        step_counter = 0

        while queue:
            current_id, current_impact, depth = queue.pop(0)

            if depth >= max_depth:
                continue

            if current_id not in self.adjacency:
                continue

            for target_id, edge in self.adjacency[current_id]:
                if target_id in visited and depth > 1:
                    continue

                transmitted = current_impact * attenuation * edge.weight

                if transmitted < threshold:
                    continue

                visited.add(target_id)
                step_counter += 1

                # Update target node
                if target_id in self.nodes:
                    target_node = self.nodes[target_id]
                    target_node.impact_score = min(
                        target_node.impact_score + transmitted, 1.0
                    )
                    target_node.current_state = _score_to_state(target_node.impact_score)
                    resulting_state = target_node.current_state
                else:
                    resulting_state = _score_to_state(transmitted)

                explanation = _build_step_explanation(
                    self.nodes.get(current_id),
                    self.nodes.get(target_id),
                    edge,
                    transmitted,
                )

                trace.append(
                    PropagationStep(
                        step=step_counter,
                        source_node=current_id,
                        target_node=target_id,
                        relation=edge.relation,
                        impact_transmitted=round(transmitted, 4),
                        resulting_state=resulting_state,
                        explanation=explanation,
                    )
                )

                queue.append((target_id, transmitted, depth + 1))

        return trace

    def get_critical_path(self) -> list[str]:
        """Find the path of nodes with highest cumulative impact."""
        sorted_nodes = sorted(
            self.nodes.values(),
            key=lambda n: n.impact_score,
            reverse=True,
        )
        return [n.node_id for n in sorted_nodes if n.impact_score > 0.1]

    def get_systemic_risk_score(self) -> float:
        """Calculate overall systemic risk from node impact distribution."""
        if not self.nodes:
            return 0.0
        scores = [n.impact_score for n in self.nodes.values()]
        # Weighted average with emphasis on highest-impact nodes
        sorted_scores = sorted(scores, reverse=True)
        top_n = sorted_scores[:5] if len(sorted_scores) >= 5 else sorted_scores
        return round(sum(top_n) / len(top_n), 4) if top_n else 0.0


def _score_to_state(score: float) -> str:
    if score >= 0.75:
        return "critical"
    elif score >= 0.45:
        return "disrupted"
    elif score >= 0.2:
        return "stressed"
    return "stable"


def _build_step_explanation(
    source: GraphNode | None,
    target: GraphNode | None,
    edge: GraphEdge,
    transmitted: float,
) -> str:
    src_label = source.label if source else edge.source
    tgt_label = target.label if target else edge.target

    relation_verbs = {
        "affects": "affects",
        "delays": "delays",
        "reprices": "triggers repricing in",
        "constrains": "constrains",
        "amplifies": "amplifies impact on",
        "hedges": "provides hedging for",
        "exports_to": "has export dependency on",
        "exposed_to": "has exposure to",
    }

    verb = relation_verbs.get(edge.relation, edge.relation)
    impact_pct = round(transmitted * 100, 1)

    return f"{src_label} {verb} {tgt_label} (impact: {impact_pct}%)"
