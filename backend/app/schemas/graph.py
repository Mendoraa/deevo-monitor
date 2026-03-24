"""Economic Graph schemas — nodes, edges, and propagation state."""

from __future__ import annotations
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    """A node in the economic graph."""
    node_id: str
    node_type: str              # event | commodity | sector | country | infrastructure | metric
    label: str
    current_state: str          # stable | stressed | disrupted | critical
    impact_score: float = Field(ge=0.0, le=1.0, default=0.0)
    metadata: dict = Field(default_factory=dict)


class GraphEdge(BaseModel):
    """A directed edge in the economic graph."""
    source: str                 # node_id
    target: str                 # node_id
    relation: str               # affects | delays | reprices | constrains | amplifies | hedges | exports_to | exposed_to
    weight: float = Field(ge=0.0, le=1.0, default=0.5)
    propagation_delay_hours: int = 0
    description: str = ""


class PropagationStep(BaseModel):
    """A single step in the graph propagation trace."""
    step: int
    source_node: str
    target_node: str
    relation: str
    impact_transmitted: float
    resulting_state: str
    explanation: str


class GraphPropagationResult(BaseModel):
    """Full result of economic graph simulation."""
    event_id: str
    nodes: list[GraphNode]
    edges: list[GraphEdge]
    propagation_trace: list[PropagationStep]
    total_steps: int
    max_depth_reached: int
    critical_path: list[str]    # node_ids forming the highest-impact path
    systemic_risk_score: float = Field(ge=0.0, le=1.0)
