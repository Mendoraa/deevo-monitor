"""Graph API — nodes, edges, impact analysis, manual overrides."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.graph_registry_service import graph_registry
from app.services.market_profile_service import get_market_profile
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/v1/graph", tags=["graph"])


@router.get("/nodes")
def get_nodes(node_type: Optional[str] = None):
    """GET /api/v1/graph/nodes — list all graph nodes."""
    graph_registry.initialize()
    nodes = graph_registry.get_all_nodes()

    if node_type:
        nodes = [n for n in nodes if n.get("node_type") == node_type]

    return {
        "nodes": nodes,
        "count": len(nodes),
    }


@router.get("/edges")
def get_edges(active_only: bool = True):
    """GET /api/v1/graph/edges — list all graph edges."""
    graph_registry.initialize()
    edges = graph_registry.get_all_edges()

    if active_only:
        edges = [e for e in edges if e.get("active", True)]

    return {
        "edges": edges,
        "count": len(edges),
    }


@router.get("/impact")
def get_impact(
    market_code: str = Query(..., min_length=3, max_length=3),
    portfolio_key: str = Query("motor_retail"),
):
    """GET /api/v1/graph/impact — strongest edges for a market/portfolio."""
    graph_registry.initialize()
    profile = get_market_profile(market_code)
    if not profile:
        raise HTTPException(status_code=404, detail=f"Market {market_code} not found")

    edges = graph_registry.get_all_edges()
    impacts = []

    for edge in edges:
        if not edge.get("active"):
            continue
        effective = graph_registry.compute_effective_weight(
            edge, market_code=market_code
        )
        impacts.append({
            "edge_key": edge["edge_key"],
            "source": edge["source_node_id"],
            "target": edge["target_node_id"],
            "relationship_type": edge["relationship_type"],
            "effective_weight": round(effective, 4),
            "base_weight": edge["base_weight"],
            "confidence": edge["confidence_score"],
        })

    # Sort by effective weight descending
    impacts.sort(key=lambda x: x["effective_weight"], reverse=True)

    return {
        "market_code": market_code,
        "portfolio_key": portfolio_key,
        "market_name": profile.get("name", market_code),
        "impacts": impacts[:20],
        "total_edges": len(impacts),
    }


@router.patch("/edges/{edge_key}")
def update_edge(
    edge_key: str,
    weight: Optional[float] = None,
    confidence: Optional[float] = None,
    active: Optional[bool] = None,
):
    """PATCH /api/v1/graph/edges/{edge_key} — manual edge override."""
    graph_registry.initialize()
    edge = graph_registry.get_edge(edge_key)
    if not edge:
        raise HTTPException(status_code=404, detail=f"Edge {edge_key} not found")

    changes = {}
    if weight is not None:
        graph_registry.update_edge_weight(edge_key, weight, confidence=confidence)
        changes["weight"] = weight
    if confidence is not None and weight is None:
        edge["confidence_score"] = max(0.0, min(1.0, confidence))
        changes["confidence"] = confidence
    if active is not None:
        edge["active"] = active
        changes["active"] = active

    # Audit log for manual override
    if changes:
        audit_service.log_manual_override(edge_key=edge_key, changes=changes)

    return {
        "edge_key": edge_key,
        "changes_applied": changes,
        "current_state": graph_registry.get_edge(edge_key),
    }
