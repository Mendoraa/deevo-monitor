"""Pydantic schemas for Scoring Engine."""

from typing import Optional, List
from pydantic import BaseModel, Field


class ScoringRunRequest(BaseModel):
    market_code: str = Field(..., min_length=3, max_length=3)
    portfolio_key: str = Field(..., min_length=1)
    product_key: Optional[str] = None
    run_type: str = "on_demand"


class ScoreDriver(BaseModel):
    node_key: str
    impact_strength: float
    direction: str  # positive / negative / neutral


class Scores(BaseModel):
    market_stress_score: int = Field(..., ge=0, le=100)
    claims_pressure_score: int = Field(..., ge=0, le=100)
    fraud_exposure_score: int = Field(..., ge=0, le=100)
    underwriting_risk_score: int = Field(..., ge=0, le=100)
    portfolio_stability_score: int = Field(..., ge=0, le=100)


class ScoringRunResponse(BaseModel):
    assessment_id: str
    market_code: str
    portfolio_key: str
    product_key: Optional[str] = None
    scores: Scores
    risk_level: str
    top_drivers: List[str]
    confidence_score: float
    explainability: Optional[dict] = None
    recommendations: Optional[List[dict]] = None
    timestamp: str
