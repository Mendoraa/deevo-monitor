"""Pydantic schemas for Outcome / Feedback."""

from typing import Optional
from pydantic import BaseModel


class OutcomeSubmitRequest(BaseModel):
    prediction_id: str
    actual_loss_ratio: Optional[float] = None
    actual_claims_frequency: Optional[float] = None
    actual_claims_severity: Optional[float] = None
    actual_fraud_findings: Optional[float] = None
    actual_lapse_rate: Optional[float] = None
    actual_underwriting_shift: Optional[float] = None
    observed_start_date: Optional[str] = None
    observed_end_date: Optional[str] = None
    metadata: Optional[dict] = None


class OutcomeSubmitResponse(BaseModel):
    outcome_id: str
    prediction_id: str
    errors_computed: dict
    calibration_suggestions: list
    overall_accuracy: float
    message: str
