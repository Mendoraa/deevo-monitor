"""Score Record model — the 5 GCC insurance scores per prediction."""

from sqlalchemy import Column, String, Integer, DateTime, func
from app.db.base import Base


class ScoreRecord(Base):
    __tablename__ = "score_records"

    id = Column(String, primary_key=True)
    prediction_id = Column(String, nullable=False, index=True)
    market_stress_score = Column(Integer, nullable=False)
    claims_pressure_score = Column(Integer, nullable=False)
    fraud_exposure_score = Column(Integer, nullable=False)
    underwriting_risk_score = Column(Integer, nullable=False)
    portfolio_stability_score = Column(Integer, nullable=False)
    score_version = Column(String(20), default="3.0.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
