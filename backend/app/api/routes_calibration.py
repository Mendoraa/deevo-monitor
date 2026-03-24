"""Calibration API — run calibration and view history."""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.calibration import CalibrationRunRequest, CalibrationRunResponse, EdgeCalibrationDetail
from app.services.calibration_engine import calibration_engine
from app.services.feedback_service import feedback_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/v1/calibration", tags=["calibration"])

# In-memory calibration history (production: PostgreSQL)
_calibration_history: list = []


@router.post("/run", response_model=CalibrationRunResponse)
def run_calibration(request: CalibrationRunRequest):
    """POST /api/v1/calibration/run — execute calibration cycle."""
    # Look up the prediction
    prediction = feedback_service.get_prediction(request.prediction_id)
    if not prediction:
        raise HTTPException(
            status_code=404,
            detail=f"Prediction {request.prediction_id} not found",
        )

    # Look up outcomes for this prediction
    outcomes = feedback_service.get_outcomes_for_prediction(request.prediction_id)
    if not outcomes:
        raise HTTPException(
            status_code=400,
            detail=f"No outcomes found for prediction {request.prediction_id}. Submit outcomes first.",
        )

    # Use latest outcome
    latest_outcome = outcomes[-1]

    # Build actual outcomes dict
    actual_outcomes = {
        k: v for k, v in latest_outcome.items()
        if k.startswith("actual_") and v is not None
    }

    # Run calibration
    result = calibration_engine.run_calibration(
        market_code=request.market_code,
        predicted_scores=prediction.get("scores", {}),
        actual_outcomes=actual_outcomes,
        mode=request.mode,
    )

    # Store history
    _calibration_history.append(result)

    # Format edge calibrations
    calibrations = []
    drift_alerts = []
    for adj in result.get("edge_adjustments", []):
        cal = EdgeCalibrationDetail(
            edge_key=adj["edge_key"],
            previous_weight=adj["previous_weight"],
            new_weight=adj["new_weight"],
            previous_confidence=adj["previous_confidence"],
            new_confidence=adj["new_confidence"],
            drift_pct=round(adj["weight_delta"] / max(adj["previous_weight"], 0.01) * 100, 2),
            reason=adj.get("calibration_reason", ""),
        )
        calibrations.append(cal)

        if abs(adj["weight_delta"]) > 0.05:
            drift_alerts.append({
                "edge_key": adj["edge_key"],
                "drift": round(adj["weight_delta"], 4),
                "quality": adj.get("error_quality", "unknown"),
            })

    # Audit log
    audit_service.log_calibration_applied(
        calibration_id=result["calibration_id"],
        market_code=request.market_code,
        edges_updated=result["applied_count"],
    )

    return CalibrationRunResponse(
        calibration_id=result["calibration_id"],
        market_code=request.market_code,
        prediction_id=request.prediction_id,
        mode=request.mode,
        edges_calibrated=result["applied_count"],
        calibrations=calibrations,
        drift_alerts=drift_alerts,
        message=f"Calibration complete. {result['applied_count']} edges updated, {len(drift_alerts)} drift alerts.",
    )


@router.get("/history")
def calibration_history(
    edge_id: Optional[str] = Query(None),
    market_code: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
):
    """GET /api/v1/calibration/history — calibration audit trail."""
    history = _calibration_history

    if market_code:
        history = [h for h in history if h.get("market_code") == market_code]

    if edge_id:
        filtered = []
        for h in history:
            matching = [
                a for a in h.get("edge_adjustments", [])
                if a.get("edge_id") == edge_id or a.get("edge_key", "").startswith(edge_id)
            ]
            if matching:
                filtered.append({**h, "edge_adjustments": matching})
        history = filtered

    return {
        "history": history[-limit:],
        "total": len(history),
        "edge_id": edge_id,
    }
