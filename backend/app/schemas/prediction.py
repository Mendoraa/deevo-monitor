"""Pydantic schemas for Prediction records."""

from typing import Optional, List
from pydantic import BaseModel


class PredictionDetail(BaseModel):
    assessment_id: str
    market_code: str
    portfolio_key: str
    product_key: Optional[str] = None
    run_type: str
    prediction_date: str
    overall_risk_level: str
    confidence_score: float
    top_drivers: Optional[list] = None
    graph_summary: Optional[dict] = None
    scores: Optional[dict] = None
    recommendations: Optional[List[dict]] = None
    notes: Optional[str] = None


class PredictionListResponse(BaseModel):
    predictions: List[PredictionDetail]
    total: int
    market_code: Optional[str] = None
