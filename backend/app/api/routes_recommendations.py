"""Recommendations API — retrieve executive action items."""

from fastapi import APIRouter, HTTPException

from app.services.feedback_service import feedback_service
from app.services.recommendation_engine import recommendation_engine

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


@router.get("/{assessment_id}")
def get_recommendations(assessment_id: str):
    """GET /api/v1/recommendations/{assessment_id} — actions for a prediction."""
    prediction = feedback_service.get_prediction(assessment_id)
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail=f"Prediction {assessment_id} not found",
        )

    # If recommendations were already stored with the prediction, return them
    stored_recs = prediction.get("recommendations", [])
    if stored_recs:
        return {
            "assessment_id": assessment_id,
            "recommendations": stored_recs,
            "total": len(stored_recs),
        }

    # Otherwise regenerate from scores
    scores = prediction.get("scores", {})
    result = recommendation_engine.generate_recommendations(
        scores=scores,
        market_code=prediction.get("market_code", "KWT"),
        portfolio_key=prediction.get("portfolio_key", "motor_retail"),
        assessment_id=assessment_id,
    )

    return {
        "assessment_id": assessment_id,
        "recommendations": result["actions"],
        "total": result["action_count"],
        "triggered_rules": result["triggered_rules"],
        "highest_priority": result["highest_priority"],
    }


@router.get("/rules/summary")
def get_rules_summary():
    """GET /api/v1/recommendations/rules/summary — list all configured rules."""
    return {
        "rules": recommendation_engine.get_rules_summary(),
        "total": len(recommendation_engine.get_rules_summary()),
    }
