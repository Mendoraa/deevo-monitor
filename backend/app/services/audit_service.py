"""Audit Service — immutable event log for every system action.

Every significant action is logged: signal ingestion, scoring runs,
predictions, recommendations, outcomes, calibrations, manual overrides.
Each event has a trace_id for full request tracing.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid


class AuditService:
    """In-memory audit log. Production: PostgreSQL audit_events table."""

    def __init__(self):
        self._events: List[Dict[str, Any]] = []

    def log(
        self,
        entity_type: str,
        entity_id: str,
        event_type: str,
        payload: Optional[Dict[str, Any]] = None,
        actor_type: str = "system",
        actor_id: Optional[str] = None,
        trace_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Log an audit event. Returns the event record."""
        event = {
            "id": f"aud_{uuid.uuid4().hex[:12]}",
            "entity_type": entity_type,
            "entity_id": entity_id,
            "event_type": event_type,
            "event_payload_json": payload or {},
            "actor_type": actor_type,
            "actor_id": actor_id or "system",
            "trace_id": trace_id or f"trace_{uuid.uuid4().hex[:8]}",
            "created_at": datetime.utcnow().isoformat(),
        }
        self._events.append(event)
        return event

    def log_signal_ingestion(
        self, market_code: str, count: int, snapshot_ids: List[str], trace_id: str = None
    ):
        return self.log(
            entity_type="signal_snapshot",
            entity_id=market_code,
            event_type="signal_ingested",
            payload={"count": count, "snapshot_ids": snapshot_ids[:5]},
            trace_id=trace_id,
        )

    def log_scoring_run(
        self, assessment_id: str, market_code: str, scores: Dict, risk_level: str, trace_id: str = None
    ):
        return self.log(
            entity_type="prediction",
            entity_id=assessment_id,
            event_type="scoring_run",
            payload={"market_code": market_code, "scores": scores, "risk_level": risk_level},
            trace_id=trace_id,
        )

    def log_prediction_created(
        self, assessment_id: str, market_code: str, trace_id: str = None
    ):
        return self.log(
            entity_type="prediction",
            entity_id=assessment_id,
            event_type="prediction_created",
            payload={"market_code": market_code},
            trace_id=trace_id,
        )

    def log_recommendation_generated(
        self, assessment_id: str, action_count: int, highest_priority: str, trace_id: str = None
    ):
        return self.log(
            entity_type="recommendation",
            entity_id=assessment_id,
            event_type="recommendation_issued",
            payload={"action_count": action_count, "highest_priority": highest_priority},
            trace_id=trace_id,
        )

    def log_outcome_recorded(
        self, outcome_id: str, prediction_id: str, trace_id: str = None
    ):
        return self.log(
            entity_type="outcome",
            entity_id=outcome_id,
            event_type="outcome_recorded",
            payload={"prediction_id": prediction_id},
            trace_id=trace_id,
        )

    def log_calibration_applied(
        self, calibration_id: str, market_code: str, edges_updated: int, trace_id: str = None
    ):
        return self.log(
            entity_type="calibration",
            entity_id=calibration_id,
            event_type="calibration_applied",
            payload={"market_code": market_code, "edges_updated": edges_updated},
            trace_id=trace_id,
        )

    def log_manual_override(
        self, edge_key: str, changes: Dict, actor_id: str = "admin", trace_id: str = None
    ):
        return self.log(
            entity_type="edge",
            entity_id=edge_key,
            event_type="manual_override",
            payload={"changes": changes},
            actor_type="user",
            actor_id=actor_id,
            trace_id=trace_id,
        )

    def get_events(
        self,
        entity_type: Optional[str] = None,
        event_type: Optional[str] = None,
        trace_id: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """Query audit events with optional filters."""
        events = self._events

        if entity_type:
            events = [e for e in events if e["entity_type"] == entity_type]
        if event_type:
            events = [e for e in events if e["event_type"] == event_type]
        if trace_id:
            events = [e for e in events if e["trace_id"] == trace_id]

        return sorted(events, key=lambda e: e["created_at"], reverse=True)[:limit]

    def get_trail(self, entity_id: str) -> List[Dict[str, Any]]:
        """Get full audit trail for a specific entity."""
        return sorted(
            [e for e in self._events if e["entity_id"] == entity_id],
            key=lambda e: e["created_at"],
        )


# Singleton
audit_service = AuditService()
