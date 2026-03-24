"""Recommendation Record model — actionable decisions per prediction."""

from sqlalchemy import Column, String, DateTime, JSON, func
from app.db.base import Base


class RecommendationRecord(Base):
    __tablename__ = "recommendation_records"

    id = Column(String, primary_key=True)
    prediction_id = Column(String, nullable=False, index=True)
    action_type = Column(String(50), nullable=False)
    priority = Column(String(20), nullable=False)
    title = Column(String(500), nullable=False)
    rationale = Column(String(2000), nullable=False)
    action_payload_json = Column(JSON, nullable=True)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
