"""Prediction Record model — stores every scoring run result."""

from sqlalchemy import Column, String, Float, DateTime, JSON, func
from app.db.base import Base


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(String, primary_key=True)
    assessment_id = Column(String, unique=True, nullable=False, index=True)
    market_code = Column(String(3), nullable=False, index=True)
    portfolio_key = Column(String(100), nullable=False, index=True)
    product_key = Column(String(100), nullable=True)
    run_type = Column(String(50), nullable=False)
    prediction_date = Column(DateTime(timezone=True), nullable=False, index=True)
    overall_risk_level = Column(String(20), nullable=False)
    confidence_score = Column(Float, nullable=False)
    top_drivers_json = Column(JSON, nullable=True)
    graph_summary_json = Column(JSON, nullable=True)
    notes = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
