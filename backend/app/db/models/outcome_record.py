"""Outcome Record model — actual results to compare against predictions."""

from sqlalchemy import Column, String, Float, DateTime, JSON, func
from app.db.base import Base


class OutcomeRecord(Base):
    __tablename__ = "outcome_records"

    id = Column(String, primary_key=True)
    prediction_id = Column(String, nullable=False, index=True)
    actual_loss_ratio = Column(Float, nullable=True)
    actual_claims_frequency = Column(Float, nullable=True)
    actual_claims_severity = Column(Float, nullable=True)
    actual_fraud_findings = Column(Float, nullable=True)
    actual_lapse_rate = Column(Float, nullable=True)
    actual_underwriting_shift = Column(Float, nullable=True)
    observed_start_date = Column(DateTime(timezone=True), nullable=False)
    observed_end_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    metadata_json = Column(JSON, nullable=True)
