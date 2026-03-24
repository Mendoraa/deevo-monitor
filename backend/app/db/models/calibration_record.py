"""Calibration Record model — every weight adjustment is archived."""

from sqlalchemy import Column, String, Float, DateTime, JSON, func
from app.db.base import Base


class CalibrationRecord(Base):
    __tablename__ = "calibration_records"

    id = Column(String, primary_key=True)
    edge_id = Column(String, nullable=False, index=True)
    market_code = Column(String(3), nullable=False, index=True)
    previous_weight = Column(Float, nullable=False)
    new_weight = Column(Float, nullable=False)
    previous_confidence = Column(Float, nullable=False)
    new_confidence = Column(Float, nullable=False)
    error_metrics_json = Column(JSON, nullable=True)
    calibration_reason = Column(String(500), nullable=False)
    approved_by = Column(String(100), nullable=True)
    calibration_mode = Column(String(20), nullable=False, default="semi_auto")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
