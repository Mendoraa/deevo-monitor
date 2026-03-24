"""Health, Admin & Audit API."""

from fastapi import APIRouter, Query
from datetime import datetime
from typing import Optional

from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/v1", tags=["health"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "deevo-cortex",
        "version": "3.0.0",
        "phase": "3-production",
        "engines": [
            "signal_ingestion",
            "graph_registry",
            "reasoning_engine",
            "scoring_engine",
            "calibration_engine",
            "feedback_service",
            "recommendation_engine",
            "explainability_service",
            "audit_service",
        ],
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/version")
def version():
    return {
        "version": "3.0.0",
        "api_version": "v1",
        "product": "Kuwait Motor Adaptive Risk Engine",
        "build": "phase3-mvp",
    }


@router.get("/audit")
def get_audit_events(
    entity_type: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    trace_id: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
):
    """GET /api/v1/audit — query audit trail."""
    events = audit_service.get_events(
        entity_type=entity_type,
        event_type=event_type,
        trace_id=trace_id,
        limit=limit,
    )
    return {
        "events": events,
        "count": len(events),
        "filters": {
            "entity_type": entity_type,
            "event_type": event_type,
            "trace_id": trace_id,
        },
    }


@router.get("/audit/trail/{entity_id}")
def get_audit_trail(entity_id: str):
    """GET /api/v1/audit/trail/{entity_id} — full trail for one entity."""
    trail = audit_service.get_trail(entity_id)
    return {
        "entity_id": entity_id,
        "trail": trail,
        "count": len(trail),
    }


@router.get("/metrics")
def metrics():
    """Basic metrics — counts from audit log."""
    events = audit_service.get_events(limit=10000)
    event_counts = {}
    for e in events:
        t = e["event_type"]
        event_counts[t] = event_counts.get(t, 0) + 1

    return {
        "total_audit_events": len(events),
        "event_counts": event_counts,
        "timestamp": datetime.utcnow().isoformat(),
    }
