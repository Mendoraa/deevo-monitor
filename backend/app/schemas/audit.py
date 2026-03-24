"""Pydantic schemas for Audit / Explainability."""

from typing import Optional, List
from pydantic import BaseModel


class ExplainabilityPayload(BaseModel):
    top_drivers: List[dict]
    market_profile_notes: List[str]
    confidence_score: float
    calibration_needed: bool
    strongest_edges: Optional[List[dict]] = None
    impacted_nodes: Optional[List[dict]] = None
    calibration_status: Optional[str] = None


class AuditEntry(BaseModel):
    entity_type: str
    entity_id: str
    event_type: str
    actor_type: str
    actor_id: Optional[str] = None
    payload: Optional[dict] = None
    trace_id: Optional[str] = None
    created_at: str
