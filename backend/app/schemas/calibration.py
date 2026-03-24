"""Pydantic schemas for Calibration Engine."""

from typing import Optional, List
from pydantic import BaseModel


class CalibrationRunRequest(BaseModel):
    market_code: str
    prediction_id: str
    mode: str = "semi_auto"  # manual, semi_auto, auto


class EdgeCalibrationDetail(BaseModel):
    edge_key: str
    previous_weight: float
    new_weight: float
    previous_confidence: float
    new_confidence: float
    drift_pct: float
    reason: str


class CalibrationRunResponse(BaseModel):
    calibration_id: str
    market_code: str
    prediction_id: str
    mode: str
    edges_calibrated: int
    calibrations: List[EdgeCalibrationDetail]
    drift_alerts: List[dict]
    message: str


class CalibrationHistoryResponse(BaseModel):
    edge_id: str
    history: List[dict]
    total: int
