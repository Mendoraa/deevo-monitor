"""Calibration Engine — compares predictions vs actuals, adjusts weights.

Implements the calibration logic from the Phase 3 blueprint:
- Direction accuracy: was the prediction directionally correct?
- Magnitude error: how far off was the predicted value?
- Timing error: did the effect happen when expected?
- Confidence error: was confidence appropriately calibrated?

Weight update strategy:
- Direction wrong        → weight ×0.90, confidence ×0.85
- Direction right, magnitude > 0.20 → weight ×0.95, confidence ×0.97
- Direction right, timing late      → weight ×0.98, lag_days adjusted
- Prediction excellent   → weight ×1.01, confidence ×1.02
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import uuid
import math

from app.services.graph_registry_service import GraphRegistryService, graph_registry
from app.services.market_profile_service import get_market_profile
from app.core.enums import CalibrationMode


# ─── Calibration Thresholds ────────────────────────────────────

MAGNITUDE_ERROR_THRESHOLD = 0.20
TIMING_ERROR_THRESHOLD = 0.20
CONFIDENCE_FLOOR = 0.30
CONFIDENCE_CEILING = 0.99
WEIGHT_FLOOR = 0.05
WEIGHT_CEILING = 1.50

# EMA learning rate for smooth adjustments
EMA_ALPHA = 0.3

# Score-to-edge mapping: which edges most affect each score
SCORE_EDGE_MAP = {
    "market_stress_score": [
        "oil_price→market_stress_signal",
        "inflation_rate→market_stress_signal",
        "credit_growth→market_stress_signal",
    ],
    "claims_pressure_score": [
        "claims_frequency→claims_pressure_signal",
        "claims_severity→claims_pressure_signal",
        "repair_cost_inflation→claims_pressure_signal",
        "repair_cost_inflation→claims_severity",
        "inflation_rate→repair_cost_inflation",
        "inflation_rate→claims_severity",
    ],
    "fraud_exposure_score": [
        "fraud_cluster_density→fraud_exposure_signal",
        "suspicious_provider_concentration→fraud_exposure_signal",
        "garage_network_risk→fraud_exposure_signal",
        "claims_frequency→fraud_cluster_density",
        "suspicious_provider_concentration→fraud_cluster_density",
    ],
    "underwriting_risk_score": [
        "underwriting_drift→underwriting_risk_signal",
        "pricing_adequacy_gap→underwriting_risk_signal",
        "premium_adequacy→underwriting_risk_signal",
        "loss_ratio→underwriting_drift",
        "underwriting_drift→pricing_adequacy_gap",
    ],
    "portfolio_stability_score": [
        "loss_ratio→portfolio_stability_signal",
        "policy_lapse_risk→portfolio_stability_signal",
        "high_risk_segment_growth→portfolio_stability_signal",
        "claims_severity→loss_ratio",
        "claims_frequency→loss_ratio",
    ],
}


class CalibrationEngine:
    """Calibrates graph edge weights based on prediction vs actual outcomes."""

    def __init__(self, registry: GraphRegistryService = None):
        self.registry = registry or graph_registry

    def run_calibration(
        self,
        market_code: str,
        predicted_scores: Dict[str, int],
        actual_outcomes: Dict[str, float],
        mode: str = CalibrationMode.SEMI_AUTO.value,
    ) -> Dict[str, Any]:
        """Run a full calibration cycle.

        Args:
            market_code: GCC market code
            predicted_scores: The 5 predicted scores (0-100)
            actual_outcomes: Actual observed values
            mode: Calibration mode (manual/semi_auto/auto)

        Returns:
            Calibration results with edge changes and error metrics.
        """
        self.registry.initialize()
        calibration_id = f"cal_{uuid.uuid4().hex[:12]}"

        # Step 1: Compute error metrics per score
        error_metrics = self._compute_error_metrics(predicted_scores, actual_outcomes)

        # Step 2: Determine which edges need adjustment
        edge_adjustments = []
        for score_key, metrics in error_metrics.items():
            edges_for_score = SCORE_EDGE_MAP.get(score_key, [])
            for edge_key in edges_for_score:
                edge = self.registry.get_edge(edge_key)
                if not edge:
                    continue

                adjustment = self._calibrate_edge(
                    edge=edge,
                    error=metrics,
                    mode=mode,
                    market_code=market_code,
                )
                if adjustment:
                    edge_adjustments.append(adjustment)

        # Step 3: Apply adjustments (if auto or semi_auto)
        applied = []
        if mode in (CalibrationMode.AUTO.value, CalibrationMode.SEMI_AUTO.value):
            applied = self._apply_adjustments(edge_adjustments, mode)

        return {
            "calibration_id": calibration_id,
            "market_code": market_code,
            "mode": mode,
            "error_metrics": error_metrics,
            "edge_adjustments": edge_adjustments,
            "applied_count": len(applied),
            "applied_edges": applied,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _compute_error_metrics(
        self,
        predicted_scores: Dict[str, int],
        actual_outcomes: Dict[str, float],
    ) -> Dict[str, Dict[str, Any]]:
        """Compute error metrics comparing predictions to actuals.

        Maps actual outcome fields to score dimensions:
        - actual_loss_ratio -> claims_pressure + portfolio_stability
        - actual_claims_frequency -> claims_pressure
        - actual_claims_severity -> claims_pressure
        - actual_fraud_findings -> fraud_exposure
        - actual_lapse_rate -> portfolio_stability
        - actual_underwriting_shift -> underwriting_risk
        """
        metrics = {}

        # Claims Pressure
        predicted_cp = predicted_scores.get("claims_pressure_score", 50)
        actual_freq = actual_outcomes.get("actual_claims_frequency", None)
        actual_sev = actual_outcomes.get("actual_claims_severity", None)
        actual_lr = actual_outcomes.get("actual_loss_ratio", None)

        if actual_freq is not None or actual_sev is not None or actual_lr is not None:
            # Derive actual claims pressure from available data
            actual_cp = self._derive_claims_pressure(actual_freq, actual_sev, actual_lr)
            metrics["claims_pressure_score"] = self._compute_single_error(
                predicted_cp, actual_cp
            )

        # Fraud Exposure
        predicted_fe = predicted_scores.get("fraud_exposure_score", 50)
        actual_fraud = actual_outcomes.get("actual_fraud_findings", None)
        if actual_fraud is not None:
            actual_fe = min(100, actual_fraud * 5)  # Scale: 20 findings = 100
            metrics["fraud_exposure_score"] = self._compute_single_error(
                predicted_fe, actual_fe
            )

        # Underwriting Risk
        predicted_ur = predicted_scores.get("underwriting_risk_score", 50)
        actual_uw = actual_outcomes.get("actual_underwriting_shift", None)
        if actual_uw is not None:
            actual_ur = min(100, abs(actual_uw) * 100)  # Scale: 1.0 shift = 100
            metrics["underwriting_risk_score"] = self._compute_single_error(
                predicted_ur, actual_ur
            )

        # Portfolio Stability
        predicted_ps = predicted_scores.get("portfolio_stability_score", 50)
        actual_lapse = actual_outcomes.get("actual_lapse_rate", None)
        if actual_lapse is not None and actual_lr is not None:
            actual_ps = min(100, (actual_lapse * 500) + max(0, actual_lr - 60))
            metrics["portfolio_stability_score"] = self._compute_single_error(
                predicted_ps, actual_ps
            )

        # Market Stress (harder to derive — use loss ratio as proxy)
        predicted_ms = predicted_scores.get("market_stress_score", 50)
        if actual_lr is not None:
            actual_ms = min(100, max(0, (actual_lr - 50) * 2))
            metrics["market_stress_score"] = self._compute_single_error(
                predicted_ms, actual_ms
            )

        return metrics

    def _derive_claims_pressure(
        self,
        frequency: Optional[float],
        severity: Optional[float],
        loss_ratio: Optional[float],
    ) -> float:
        """Derive a claims pressure score (0-100) from actual metrics."""
        components = []
        if frequency is not None:
            # Normal frequency ~1.0, high ~2.0+
            components.append(min(100, frequency * 50))
        if severity is not None:
            # Normal severity ~5.0, high ~10.0+
            components.append(min(100, severity * 10))
        if loss_ratio is not None:
            # Normal LR ~60%, stressed ~80%+
            components.append(min(100, max(0, (loss_ratio - 40) * 1.5)))

        if components:
            return sum(components) / len(components)
        return 50.0

    def _compute_single_error(
        self,
        predicted: float,
        actual: float,
    ) -> Dict[str, Any]:
        """Compute error metrics for a single score dimension."""
        predicted_norm = predicted / 100.0
        actual_norm = actual / 100.0

        # Direction: both above or below 0.5 midline
        pred_direction = "up" if predicted_norm > 0.5 else "down"
        actual_direction = "up" if actual_norm > 0.5 else "down"
        direction_correct = pred_direction == actual_direction

        # Magnitude error (absolute difference, 0-1 scale)
        magnitude_error = abs(predicted_norm - actual_norm)

        # Confidence error (how much confidence should be adjusted)
        confidence_error = magnitude_error * 0.5

        return {
            "predicted": predicted,
            "actual": round(actual, 2),
            "direction_correct": direction_correct,
            "magnitude_error": round(magnitude_error, 4),
            "timing_error": 0.0,  # Set by feedback service with temporal data
            "confidence_error": round(confidence_error, 4),
            "quality": self._error_quality_label(direction_correct, magnitude_error),
        }

    def _error_quality_label(
        self, direction_correct: bool, magnitude_error: float
    ) -> str:
        """Classify prediction quality."""
        if not direction_correct:
            return "poor"
        if magnitude_error > 0.30:
            return "weak"
        if magnitude_error > 0.15:
            return "fair"
        if magnitude_error > 0.05:
            return "good"
        return "excellent"

    def _calibrate_edge(
        self,
        edge: Dict[str, Any],
        error: Dict[str, Any],
        mode: str,
        market_code: str,
    ) -> Optional[Dict[str, Any]]:
        """Compute weight adjustment for a single edge based on error metrics."""
        current_weight = edge["current_weight"]
        current_confidence = edge["confidence_score"]

        direction_correct = error["direction_correct"]
        magnitude_error = error["magnitude_error"]
        timing_error = error.get("timing_error", 0.0)

        new_weight, new_confidence = self._calibrate_weight(
            current_weight=current_weight,
            confidence_score=current_confidence,
            direction_correct=direction_correct,
            magnitude_error=magnitude_error,
            timing_error=timing_error,
        )

        # Skip if no meaningful change
        weight_delta = abs(new_weight - current_weight)
        if weight_delta < 0.001:
            return None

        return {
            "edge_key": edge["edge_key"],
            "edge_id": edge["id"],
            "market_code": market_code,
            "previous_weight": round(current_weight, 4),
            "new_weight": round(new_weight, 4),
            "previous_confidence": round(current_confidence, 4),
            "new_confidence": round(new_confidence, 4),
            "weight_delta": round(new_weight - current_weight, 4),
            "error_quality": error.get("quality", "unknown"),
            "calibration_reason": self._build_reason(error),
            "requires_approval": mode == CalibrationMode.MANUAL.value,
        }

    def _calibrate_weight(
        self,
        current_weight: float,
        confidence_score: float,
        direction_correct: bool,
        magnitude_error: float,
        timing_error: float,
    ) -> Tuple[float, float]:
        """Core calibration function per blueprint spec.

        Returns (new_weight, new_confidence).
        """
        new_weight = current_weight
        new_confidence = confidence_score

        if not direction_correct:
            # Direction wrong — strong penalty
            new_weight *= 0.90
            new_confidence *= 0.85
        elif magnitude_error > MAGNITUDE_ERROR_THRESHOLD:
            # Direction right but magnitude off
            new_weight *= 0.95
            new_confidence *= 0.97
        else:
            # Good prediction — gentle reward
            new_weight *= 1.01
            new_confidence *= 1.02

        if timing_error > TIMING_ERROR_THRESHOLD:
            new_weight *= 0.98

        # Apply EMA smoothing
        new_weight = (EMA_ALPHA * new_weight) + ((1 - EMA_ALPHA) * current_weight)

        # Clamp
        new_weight = round(max(WEIGHT_FLOOR, min(WEIGHT_CEILING, new_weight)), 4)
        new_confidence = round(
            max(CONFIDENCE_FLOOR, min(CONFIDENCE_CEILING, new_confidence)), 4
        )

        return new_weight, new_confidence

    def _apply_adjustments(
        self,
        adjustments: List[Dict[str, Any]],
        mode: str,
    ) -> List[str]:
        """Apply weight adjustments to the graph registry."""
        applied = []

        for adj in adjustments:
            if adj.get("requires_approval"):
                continue  # Skip manual-approval edges

            edge_key = adj["edge_key"]
            new_weight = adj["new_weight"]
            new_confidence = adj["new_confidence"]

            # Semi-auto: only apply small changes automatically
            if mode == CalibrationMode.SEMI_AUTO.value:
                if abs(adj["weight_delta"]) > 0.10:
                    continue  # Large changes need manual review

            self.registry.update_edge_weight(
                edge_key, new_weight, confidence=new_confidence
            )
            applied.append(edge_key)

        return applied

    def _build_reason(self, error: Dict[str, Any]) -> str:
        """Build a human-readable calibration reason."""
        quality = error.get("quality", "unknown")
        direction = "correct" if error["direction_correct"] else "incorrect"
        mag = error["magnitude_error"]

        if quality == "poor":
            return f"Direction {direction}, magnitude error {mag:.1%}. Strong correction applied."
        elif quality == "weak":
            return f"Direction {direction}, magnitude error {mag:.1%}. Moderate correction applied."
        elif quality == "fair":
            return f"Direction {direction}, magnitude error {mag:.1%}. Minor correction applied."
        elif quality == "good":
            return f"Direction {direction}, magnitude error {mag:.1%}. Weight maintained."
        else:
            return f"Direction {direction}, magnitude error {mag:.1%}. Weight rewarded."


# Singleton
calibration_engine = CalibrationEngine()
