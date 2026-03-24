"""Predictions API — retrieve stored prediction records."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.services.feedback_service import feedback_service

router = APIRouter(prefix="/api/v1/predictions", tags=["predictions"])


@router.get("/{assessment_id}")
def get_prediction(assessment_id: str):
    """GET /api/v1/predictions/{assessment_id} — full prediction detail."""
    prediction = feedback_service.get_prediction(assessment_id)
    if not prediction:
        raise HTTPException(status_code=404, detail=f"Prediction {assessment_id} not found")
    return prediction


@router.get("/")
def list_predictions(
    market_code: Optional[str] = Query(None, min_length=3, max_length=3),
    portfolio_key: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
):
    """GET /api/v1/predictions?market_code=KWT — prediction history."""
    predictions = feedback_service.list_predictions(
        market_code=market_code, limit=limit
    )

    if portfolio_key:
        predictions = [
            p for p in predictions if p.get("portfolio_key") == portfolio_key
        ]

    return {
        "predictions": predictions,
        "total": len(predictions),
        "market_code": market_code,
    }
