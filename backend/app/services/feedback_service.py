"""Feedback Service — ingests actual outcomes and links to predictions.

Receives real-world outcomes (loss ratio, claims frequency, severity,
fraud findings, lapse rate, underwriting shift), matches them to prior
predictions, and computes error metrics that feed the calibration engine.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid


class FeedbackService:
    """Manages the feedback loop: outcomes → error metrics → calibration."""

    def __init__(self):
        # In-memory stores (production: PostgreSQL)
        self._predictions: Dict[str, Dict[str, Any]] = {}
        self._outcomes: Dict[str, Dict[str, Any]] = {}

    def store_prediction(self, prediction: Dict[str, Any]) -> str:
        """Store a prediction record for later comparison."""
        pred_id = prediction.get("assessment_id", f"pred_{uuid.uuid4().hex[:12]}")
        self._predictions[pred_id] = {
            **prediction,
            "prediction_id": pred_id,
            "stored_at": datetime.utcnow().isoformat(),
        }
        return pred_id

    def submit_outcome(
        self,
        prediction_id: str,
        actual_loss_ratio: Optional[float] = None,
        actual_claims_frequency: Optional[float] = None,
        actual_claims_severity: Optional[float] = None,
        actual_fraud_findings: Optional[int] = None,
        actual_lapse_rate: Optional[float] = None,
        actual_underwriting_shift: Optional[float] = None,
        observed_start_date: Optional[str] = None,
        observed_end_date: Optional[str] = None,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Submit actual outcomes and compute error metrics.

        Returns outcome record with error analysis ready for calibration.
        """
        outcome_id = f"out_{uuid.uuid4().hex[:12]}"

        outcome_record = {
            "id": outcome_id,
            "prediction_id": prediction_id,
            "actual_loss_ratio": actual_loss_ratio,
            "actual_claims_frequency": actual_claims_frequency,
            "actual_claims_severity": actual_claims_severity,
            "actual_fraud_findings": actual_fraud_findings,
            "actual_lapse_rate": actual_lapse_rate,
            "actual_underwriting_shift": actual_underwriting_shift,
            "observed_start_date": observed_start_date or datetime.utcnow().date().isoformat(),
            "observed_end_date": observed_end_date or datetime.utcnow().date().isoformat(),
            "metadata_json": metadata or {},
            "created_at": datetime.utcnow().isoformat(),
        }

        self._outcomes[outcome_id] = outcome_record

        # Compute error analysis if prediction exists
        prediction = self._predictions.get(prediction_id)
        error_analysis = None
        if prediction:
            error_analysis = self._compute_error_analysis(prediction, outcome_record)

        return {
            "outcome_id": outcome_id,
            "prediction_id": prediction_id,
            "prediction_found": prediction is not None,
            "error_analysis": error_analysis,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _compute_error_analysis(
        self,
        prediction: Dict[str, Any],
        outcome: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Compute detailed error analysis between prediction and outcome."""
        scores = prediction.get("scores", {})
        analysis = {
            "prediction_id": prediction.get("prediction_id"),
            "market_code": prediction.get("market_code"),
            "score_errors": {},
            "overall_accuracy": 0.0,
            "calibration_recommended": False,
        }

        error_sum = 0.0
        error_count = 0

        # Claims Pressure analysis
        if outcome.get("actual_claims_frequency") is not None or outcome.get("actual_loss_ratio") is not None:
            predicted_cp = scores.get("claims_pressure_score", 50)
            actual_cp = self._derive_actual_score(
                "claims_pressure",
                outcome.get("actual_claims_frequency"),
                outcome.get("actual_claims_severity"),
                outcome.get("actual_loss_ratio"),
            )
            cp_error = self._score_error(predicted_cp, actual_cp)
            analysis["score_errors"]["claims_pressure_score"] = cp_error
            error_sum += cp_error["magnitude_error"]
            error_count += 1

        # Fraud Exposure analysis
        if outcome.get("actual_fraud_findings") is not None:
            predicted_fe = scores.get("fraud_exposure_score", 50)
            actual_fe = min(100, (outcome["actual_fraud_findings"] or 0) * 5)
            fe_error = self._score_error(predicted_fe, actual_fe)
            analysis["score_errors"]["fraud_exposure_score"] = fe_error
            error_sum += fe_error["magnitude_error"]
            error_count += 1

        # Underwriting Risk analysis
        if outcome.get("actual_underwriting_shift") is not None:
            predicted_ur = scores.get("underwriting_risk_score", 50)
            actual_ur = min(100, abs(outcome["actual_underwriting_shift"]) * 100)
            ur_error = self._score_error(predicted_ur, actual_ur)
            analysis["score_errors"]["underwriting_risk_score"] = ur_error
            error_sum += ur_error["magnitude_error"]
            error_count += 1

        # Portfolio Stability analysis
        if outcome.get("actual_lapse_rate") is not None:
            predicted_ps = scores.get("portfolio_stability_score", 50)
            lr = outcome.get("actual_loss_ratio", 60)
            actual_ps = min(100, (outcome["actual_lapse_rate"] * 500) + max(0, lr - 60))
            ps_error = self._score_error(predicted_ps, actual_ps)
            analysis["score_errors"]["portfolio_stability_score"] = ps_error
            error_sum += ps_error["magnitude_error"]
            error_count += 1

        # Overall accuracy
        if error_count > 0:
            avg_error = error_sum / error_count
            analysis["overall_accuracy"] = round(1.0 - avg_error, 4)
            analysis["calibration_recommended"] = avg_error > 0.15

        return analysis

    def _derive_actual_score(
        self,
        score_type: str,
        frequency: Optional[float],
        severity: Optional[float],
        loss_ratio: Optional[float],
    ) -> float:
        """Convert actual metrics to a 0-100 score for comparison."""
        if score_type == "claims_pressure":
            components = []
            if frequency is not None:
                components.append(min(100, frequency * 50))
            if severity is not None:
                components.append(min(100, severity * 10))
            if loss_ratio is not None:
                components.append(min(100, max(0, (loss_ratio - 40) * 1.5)))
            return sum(components) / len(components) if components else 50.0
        return 50.0

    def _score_error(self, predicted: float, actual: float) -> Dict[str, Any]:
        """Compute error between predicted and actual score."""
        pred_norm = predicted / 100.0
        actual_norm = actual / 100.0

        direction_correct = (
            (pred_norm >= 0.5 and actual_norm >= 0.5)
            or (pred_norm < 0.5 and actual_norm < 0.5)
        )
        magnitude_error = abs(pred_norm - actual_norm)

        return {
            "predicted": predicted,
            "actual": round(actual, 2),
            "direction_correct": direction_correct,
            "magnitude_error": round(magnitude_error, 4),
            "absolute_difference": round(abs(predicted - actual), 2),
        }

    def get_prediction(self, prediction_id: str) -> Optional[Dict]:
        return self._predictions.get(prediction_id)

    def get_outcome(self, outcome_id: str) -> Optional[Dict]:
        return self._outcomes.get(outcome_id)

    def get_outcomes_for_prediction(self, prediction_id: str) -> List[Dict]:
        return [
            o for o in self._outcomes.values()
            if o.get("prediction_id") == prediction_id
        ]

    def list_predictions(
        self, market_code: Optional[str] = None, limit: int = 50
    ) -> List[Dict]:
        preds = list(self._predictions.values())
        if market_code:
            preds = [p for p in preds if p.get("market_code") == market_code]
        preds.sort(key=lambda x: x.get("stored_at", ""), reverse=True)
        return preds[:limit]


# Singleton
feedback_service = FeedbackService()
