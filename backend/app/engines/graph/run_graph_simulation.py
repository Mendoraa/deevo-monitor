"""Graph Simulation Runner — builds the economic graph and propagates event impact.

This is the concrete implementation of the Economic Graph spec:
- Builds the GCC economic topology (nodes + edges)
- Injects the event as a source node
- Propagates impact through the graph via BFS
- Returns full propagation trace for frontend visualization
"""

from app.schemas import NormalizedEvent
from app.schemas.graph import GraphNode, GraphEdge, GraphPropagationResult
from .economic_graph import EconomicGraph


def _build_gcc_economic_graph() -> EconomicGraph:
    """Build the base GCC economic topology.

    Nodes: infrastructure, commodities, sectors, countries, metrics
    Edges: causal relationships with empirically-estimated weights
    """
    g = EconomicGraph()

    # ═══════════════════════════════════════════════════════
    # INFRASTRUCTURE NODES
    # ═══════════════════════════════════════════════════════
    infra_nodes = [
        GraphNode(node_id="hormuz", node_type="infrastructure", label="Strait of Hormuz", current_state="stable"),
        GraphNode(node_id="bab_mandeb", node_type="infrastructure", label="Bab el-Mandeb", current_state="stable"),
        GraphNode(node_id="suez", node_type="infrastructure", label="Suez Canal", current_state="stable"),
        GraphNode(node_id="ras_tanura", node_type="infrastructure", label="Ras Tanura Terminal", current_state="stable"),
        GraphNode(node_id="jebel_ali", node_type="infrastructure", label="Jebel Ali Port", current_state="stable"),
        GraphNode(node_id="fujairah", node_type="infrastructure", label="Fujairah Oil Hub", current_state="stable"),
    ]

    # ═══════════════════════════════════════════════════════
    # COMMODITY NODES
    # ═══════════════════════════════════════════════════════
    commodity_nodes = [
        GraphNode(node_id="crude_oil", node_type="commodity", label="Crude Oil Price", current_state="stable"),
        GraphNode(node_id="lng", node_type="commodity", label="LNG Price", current_state="stable"),
        GraphNode(node_id="refined_products", node_type="commodity", label="Refined Products", current_state="stable"),
    ]

    # ═══════════════════════════════════════════════════════
    # SECTOR NODES
    # ═══════════════════════════════════════════════════════
    sector_nodes = [
        GraphNode(node_id="tanker_traffic", node_type="sector", label="Tanker Traffic", current_state="stable"),
        GraphNode(node_id="marine_insurance", node_type="sector", label="Marine Insurance", current_state="stable"),
        GraphNode(node_id="political_risk_insurance", node_type="sector", label="Political Risk Insurance", current_state="stable"),
        GraphNode(node_id="energy_insurance", node_type="sector", label="Energy Insurance", current_state="stable"),
        GraphNode(node_id="gcc_banking", node_type="sector", label="GCC Banking Sector", current_state="stable"),
        GraphNode(node_id="trade_finance", node_type="sector", label="Trade Finance", current_state="stable"),
        GraphNode(node_id="shipping_logistics", node_type="sector", label="Shipping & Logistics", current_state="stable"),
        GraphNode(node_id="refining", node_type="sector", label="Refining Sector", current_state="stable"),
    ]

    # ═══════════════════════════════════════════════════════
    # METRIC NODES
    # ═══════════════════════════════════════════════════════
    metric_nodes = [
        GraphNode(node_id="gcc_inflation", node_type="metric", label="GCC Inflation", current_state="stable"),
        GraphNode(node_id="delivered_oil_cost", node_type="metric", label="Delivered Oil Cost", current_state="stable"),
        GraphNode(node_id="freight_rates", node_type="metric", label="Freight Rates", current_state="stable"),
        GraphNode(node_id="insurance_premiums", node_type="metric", label="Insurance Premiums", current_state="stable"),
        GraphNode(node_id="risk_appetite", node_type="metric", label="Risk Appetite", current_state="stable"),
    ]

    # ═══════════════════════════════════════════════════════
    # COUNTRY NODES
    # ═══════════════════════════════════════════════════════
    country_nodes = [
        GraphNode(node_id="saudi", node_type="country", label="Saudi Arabia", current_state="stable",
                  metadata={"oil_dependency": 0.85, "fiscal_buffer": 0.80}),
        GraphNode(node_id="uae", node_type="country", label="UAE", current_state="stable",
                  metadata={"oil_dependency": 0.55, "trade_exposure": 0.90}),
        GraphNode(node_id="kuwait", node_type="country", label="Kuwait", current_state="stable",
                  metadata={"oil_dependency": 0.90, "fiscal_buffer": 0.75}),
        GraphNode(node_id="qatar", node_type="country", label="Qatar", current_state="stable",
                  metadata={"oil_dependency": 0.70, "lng_dependency": 0.60}),
        GraphNode(node_id="bahrain", node_type="country", label="Bahrain", current_state="stable",
                  metadata={"oil_dependency": 0.60, "fiscal_buffer": 0.45}),
        GraphNode(node_id="oman", node_type="country", label="Oman", current_state="stable",
                  metadata={"oil_dependency": 0.78, "port_dependency": 0.65}),
    ]

    # Add all nodes
    for node in infra_nodes + commodity_nodes + sector_nodes + metric_nodes + country_nodes:
        g.add_node(node)

    # ═══════════════════════════════════════════════════════
    # EDGES — Causal relationships
    # ═══════════════════════════════════════════════════════
    edges = [
        # Infrastructure → Shipping
        GraphEdge(source="hormuz", target="tanker_traffic", relation="constrains", weight=0.95, description="Hormuz handles ~20% of global oil transit"),
        GraphEdge(source="hormuz", target="shipping_logistics", relation="delays", weight=0.85),
        GraphEdge(source="bab_mandeb", target="tanker_traffic", relation="constrains", weight=0.70),
        GraphEdge(source="suez", target="shipping_logistics", relation="delays", weight=0.75),
        GraphEdge(source="jebel_ali", target="shipping_logistics", relation="affects", weight=0.80),

        # Shipping → Oil pricing
        GraphEdge(source="tanker_traffic", target="crude_oil", relation="affects", weight=0.80, description="Supply disruption → price pressure"),
        GraphEdge(source="tanker_traffic", target="freight_rates", relation="reprices", weight=0.90),
        GraphEdge(source="shipping_logistics", target="freight_rates", relation="reprices", weight=0.85),
        GraphEdge(source="tanker_traffic", target="marine_insurance", relation="reprices", weight=0.88),

        # Oil → Downstream
        GraphEdge(source="crude_oil", target="delivered_oil_cost", relation="affects", weight=0.92),
        GraphEdge(source="crude_oil", target="refining", relation="affects", weight=0.75),
        GraphEdge(source="crude_oil", target="lng", relation="amplifies", weight=0.45, description="Energy price correlation"),
        GraphEdge(source="delivered_oil_cost", target="gcc_inflation", relation="amplifies", weight=0.70),
        GraphEdge(source="freight_rates", target="delivered_oil_cost", relation="amplifies", weight=0.65),

        # Insurance chains
        GraphEdge(source="marine_insurance", target="insurance_premiums", relation="reprices", weight=0.85),
        GraphEdge(source="marine_insurance", target="political_risk_insurance", relation="amplifies", weight=0.60),
        GraphEdge(source="political_risk_insurance", target="insurance_premiums", relation="reprices", weight=0.75),
        GraphEdge(source="energy_insurance", target="insurance_premiums", relation="reprices", weight=0.70),
        GraphEdge(source="crude_oil", target="energy_insurance", relation="reprices", weight=0.65),

        # Banking
        GraphEdge(source="insurance_premiums", target="gcc_banking", relation="affects", weight=0.50),
        GraphEdge(source="gcc_inflation", target="gcc_banking", relation="constrains", weight=0.55),
        GraphEdge(source="risk_appetite", target="gcc_banking", relation="constrains", weight=0.70),
        GraphEdge(source="gcc_banking", target="trade_finance", relation="constrains", weight=0.65),
        GraphEdge(source="crude_oil", target="risk_appetite", relation="affects", weight=0.60),

        # GCC Countries
        GraphEdge(source="crude_oil", target="saudi", relation="affects", weight=0.90, description="Oil-dependent fiscal model"),
        GraphEdge(source="crude_oil", target="kuwait", relation="affects", weight=0.92),
        GraphEdge(source="crude_oil", target="oman", relation="affects", weight=0.78),
        GraphEdge(source="lng", target="qatar", relation="affects", weight=0.80),
        GraphEdge(source="shipping_logistics", target="uae", relation="affects", weight=0.85, description="Trade hub dependency"),
        GraphEdge(source="trade_finance", target="bahrain", relation="affects", weight=0.75, description="Financial hub dependency"),
        GraphEdge(source="gcc_inflation", target="saudi", relation="constrains", weight=0.55),
        GraphEdge(source="gcc_inflation", target="uae", relation="constrains", weight=0.65),
        GraphEdge(source="gcc_inflation", target="bahrain", relation="constrains", weight=0.72),
        GraphEdge(source="gcc_inflation", target="oman", relation="constrains", weight=0.65),
        GraphEdge(source="insurance_premiums", target="saudi", relation="exposed_to", weight=0.70),
        GraphEdge(source="insurance_premiums", target="uae", relation="exposed_to", weight=0.80),
        GraphEdge(source="marine_insurance", target="uae", relation="exposed_to", weight=0.75),
        GraphEdge(source="marine_insurance", target="oman", relation="exposed_to", weight=0.65),
    ]

    for edge in edges:
        g.add_edge(edge)

    return g


# Category → injection point mapping
CATEGORY_INJECTION_MAP: dict[str, tuple[str, float]] = {
    "shipping_disruption": ("hormuz", 0.85),
    "geopolitical_conflict": ("hormuz", 0.80),
    "energy_supply": ("crude_oil", 0.85),
    "sanctions": ("trade_finance", 0.75),
    "banking_stress": ("gcc_banking", 0.80),
    "infrastructure_damage": ("ras_tanura", 0.80),
    "trade_policy": ("shipping_logistics", 0.65),
    "climate_disaster": ("shipping_logistics", 0.60),
    "cyber": ("gcc_banking", 0.70),
}


def run_graph_simulation(event: NormalizedEvent) -> GraphPropagationResult:
    """Run the full economic graph simulation for an event."""

    graph = _build_gcc_economic_graph()

    # Determine injection point
    injection_id, base_impact = CATEGORY_INJECTION_MAP.get(
        event.category.value, ("crude_oil", 0.60)
    )

    # Scale by event severity
    initial_impact = base_impact * event.severity

    # Add event node
    event_node = GraphNode(
        node_id=f"event_{event.event_id[:8]}",
        node_type="event",
        label=event.title[:60],
        current_state="critical" if event.severity > 0.8 else "disrupted",
        impact_score=event.severity,
    )
    graph.add_node(event_node)

    # Connect event to injection point
    graph.add_edge(GraphEdge(
        source=event_node.node_id,
        target=injection_id,
        relation="affects",
        weight=1.0,
        description=f"Event injection: {event.category.value}",
    ))

    # Propagate
    trace = graph.propagate(
        source_id=event_node.node_id,
        initial_impact=initial_impact,
        max_depth=6,
        attenuation=0.75,
        threshold=0.04,
    )

    # Collect results
    critical_path = graph.get_critical_path()
    systemic_risk = graph.get_systemic_risk_score()

    # Get max depth from trace
    max_depth = 0
    if trace:
        # Track depth via source chains
        depths: dict[str, int] = {event_node.node_id: 0}
        for step in trace:
            src_depth = depths.get(step.source_node, 0)
            depths[step.target_node] = src_depth + 1
            max_depth = max(max_depth, src_depth + 1)

    return GraphPropagationResult(
        event_id=event.event_id,
        nodes=list(graph.nodes.values()),
        edges=[edge for targets in graph.adjacency.values() for _, edge in targets],
        propagation_trace=trace,
        total_steps=len(trace),
        max_depth_reached=max_depth,
        critical_path=critical_path,
        systemic_risk_score=systemic_risk,
    )
