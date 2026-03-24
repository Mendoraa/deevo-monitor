"""Audit Event model — immutable log of every significant action."""

from sqlalchemy import Column, String, DateTime, JSON, func
from app.db.base import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(String, nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    actor_type = Column(String(20), nullable=False)
    actor_id = Column(String, nullable=True)
    event_payload_json = Column(JSON, nullable=True)
    trace_id = Column(String, nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
