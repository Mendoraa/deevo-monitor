"""Feedback API — submit actual outcomes and link to predictions."""

from fastapi import APIRouter, HTTPException

from app.schemas.outcome import OutcomeSubmitRequest, OutcomeSubmitResponse
from app.services.feedback_service import feedback_service
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])


@router.post("/outcomes", response_model=OutcomeSubmitResponse)
def submit_outcome(request: OutcomeSubmitRequest):
    """POST /api/v1/feedback/outcomes — submit actual outcomes."""
    result = feedback_service.submit_outcome(
        prediction_id=request.prediction_id,
        actual_loss_ratio=request.actual_loss_ratio,
        actual_claims_frequency=request.actual_claims_frequency,
        actual_claims_severity=request.actual_claims_severity,
        actual_fraud_findings=request.actual_fraud_findings,
        actual_lapse_rate=request.actual_lapse_rate,
        actual_underwriting_shift=request.actual_underwriting_shift,
        observed_start_date=request.observed_start_date,
        observed_end_date=request.observed_end_date,
        metadata=request.metadata,
    )

    error_analysis = result.get("error_analysis") or {}
    score_errors = error_analysis.get("score_errors", {})
    accuracy = error_analysis.get("overall_accuracy", 0.0)

    # Build calibration suggestions from error analysis
    calibration_suggestions = []
    for score_key, error in score_errors.items():
        if not error.get("direction_correct"):
            calibration_suggestions.append({
                "score": score_key,
                "action": "reduce_weight",
                "severity": "high",
                "reason": f"Direction incorrect for {score_key}",
            })
        elif error.get("magnitude_error", 0) > 0.20:
            calibration_suggestions.append({
                "score": score_key,
                "action": "adjust_weight",
                "severity": "medium",
                "reason": f"Magnitude error {error['magnitude_error']:.1%} for {score_key}",
            })

    # Audit log
    audit_service.log_outcome_recorded(
        outcome_id=result["outcome_id"],
        prediction_id=request.prediction_id,
    )

    return OutcomeSubmitResponse(
        outcome_id=result["outcome_id"],
        prediction_id=result["prediction_id"],
        errors_computed=score_errors,
        calibration_suggestions=calibration_suggestions,
        overall_accuracy=accuracy,
        message=(
            f"Outcome recorded. Accuracy: {accuracy:.1%}. "
            f"{'Calibration recommended.' if error_analysis.get('calibration_recommended') else 'Within tolerance.'}"
        ),
    )
