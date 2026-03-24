"""Scoring Engine — converts graph outputs to 5 GCC insurance scores.

Takes the graph_outputs dict from ReasoningEngine and computes bounded
0-100 scores for: Market Stress, Claims Pressure, Fraud Exposure,
Underwriting Risk, and Portfolio Stability.

Each score uses a weighted combination of contributing node impacts
with market-specific adjustments.
"""

from typing import Dict, List, Any, Optional, Tuple
import uuid
from datetime import datetime

from app.services.market_profile_service import get_market_profile
from app.core.enums import RiskLevel


# ─── Score Contribution Weights ────────────────────────────────
# Maps score_key -> list of (node_key, weight) for weighted average

SCORE_WEIGHTS = {
    "market_stress_score": [
        ("oil_price", 0.30),
        ("inflation_rate", 0.25),
        ("credit_growth", 0.15),
        ("interest_rate", 0.10),
        ("fx_rate", 0.10),
        ("trade_volume", 0.10),
    ],
    "claims_pressure_score": [
        ("claims_frequency", 0.25),
        ("claims_severity", 0.25),
        ("repair_cost_inflation", 0.20),
        ("medical_inflation", 0.15),
        ("real_estate_index", 0.10),
        ("high_risk_segment_growth", 0.05),
    ],
    "fraud_exposure_score": [
        ("fraud_cluster_density", 0.35),
        ("suspicious_provider_concentration", 0.25),
        ("garage_network_risk", 0.20),
        ("claims_frequency", 0.10),
        ("underwriting_drift", 0.10),
    ],
    "underwriting_risk_score": [
        ("underwriting_drift", 0.25),
        ("pricing_adequacy_gap", 0.25),
        ("premium_adequacy", 0.20),
        ("loss_ratio", 0.15),
        ("reinsurance_pressure", 0.15),
    ],
    "portfolio_stability_score": [
        ("loss_ratio", 0.30),
        ("policy_lapse_risk", 0.20),
        ("high_risk_segment_growth", 0.20),
        ("pricing_adequacy_gap", 0.15),
        ("underwriting_drift", 0.15),
    ],
}

# Market-level score adjustments (stress amplifiers)
MARKET_SCORE_MODIFIERS = {
    "KWT": {"market_stress_score": 1.15, "fraud_exposure_score": 1.10},
    "SAU": {"market_stress_score": 1.10, "claims_pressure_score": 1.05},
    "UAE": {"claims_pressure_score": 1.10, "fraud_exposure_score": 1.05},
    "QAT": {"market_stress_score": 1.05},
    "BHR": {"market_stress_score": 1.20, "portfolio_stability_score": 1.10},
    "OMN": {"market_stress_score": 1.15, "claims_pressure_score": 1.05},
}


class ScoringEngine:
    """Compute 5 GCC insurance scores from graph reasoning outputs."""

    def calculate_scores(
        self,
        graph_outputs: Dict[str, float],
        node_values: Dict[str, float],
        market_code: str,
        portfolio_key: str = "motor_retail",
    ) -> Dict[str, Any]:
        """Calculate all 5 scores with drivers and risk level.

        Args:
            graph_outputs: Score target node values from reasoning engine
            node_values: All node current values (normalized 0-100)
            market_code: GCC market code
            portfolio_key: Portfolio identifier

        Returns:
            Full scoring result with scores, risk level, drivers, and metadata.
        """
        assessment_id = f"assess_{uuid.uuid4().hex[:12]}"
        scores = {}
        all_drivers = []

        for score_key, contributions in SCORE_WEIGHTS.items():
            raw_score, drivers = self._compute_weighted_score(
                score_key, contributions, graph_outputs, node_values
            )

            # Apply market modifier
            modifier = MARKET_SCORE_MODIFIERS.get(market_code, {}).get(score_key, 1.0)
            adjusted = raw_score * modifier

            # Bound to 0-100
            final = self._bounded_score(adjusted)
            scores[score_key] = final

            # Collect top drivers
            for d in drivers[:3]:
                if d not in all_drivers:
                    all_drivers.append(d)

        # Determine overall risk level
        risk_level = self._determine_risk_level(scores)

        # Compute confidence (average of individual score confidences)
        confidence = self._compute_confidence(scores, node_values)

        # Sort drivers by contribution
        top_drivers = sorted(
            all_drivers,
            key=lambda x: x.get("contribution", 0),
            reverse=True,
        )[:10]

        return {
            "assessment_id": assessment_id,
            "market_code": market_code,
            "portfolio_key": portfolio_key,
            "scores": scores,
            "risk_level": risk_level,
            "top_drivers": [d["node_key"] for d in top_drivers],
            "driver_details": top_drivers,
            "confidence_score": round(confidence, 4),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _compute_weighted_score(
        self,
        score_key: str,
        contributions: List[Tuple[str, float]],
        graph_outputs: Dict[str, float],
        node_values: Dict[str, float],
    ) -> Tuple[float, List[Dict]]:
        """Compute a single score as weighted average of contributing nodes."""
        total_weight = 0.0
        weighted_sum = 0.0
        drivers = []

        for node_key, weight in contributions:
            # Try graph outputs first (score target signals), then node values
            signal_key = f"{node_key}_signal" if node_key in [
                "market_stress", "claims_pressure", "fraud_exposure",
                "underwriting_risk", "portfolio_stability"
            ] else node_key

            value = graph_outputs.get(signal_key, node_values.get(node_key, 0.0))

            contribution = value * weight
            weighted_sum += contribution
            total_weight += weight

            if value > 0:
                drivers.append({
                    "node_key": node_key,
                    "value": round(value, 2),
                    "weight": weight,
                    "contribution": round(contribution, 2),
                    "direction": "positive" if value > 50 else "negative",
                })

        if total_weight > 0:
            score = weighted_sum / total_weight
        else:
            score = 0.0

        drivers.sort(key=lambda x: x["contribution"], reverse=True)
        return score, drivers

    def _bounded_score(self, value: float) -> int:
        """Clamp score to 0-100 integer."""
        return int(round(max(0, min(100, value))))

    def _determine_risk_level(self, scores: Dict[str, int]) -> str:
        """Determine overall risk level from score aggregate."""
        max_score = max(scores.values()) if scores else 0
        avg_score = sum(scores.values()) / len(scores) if scores else 0

        # Use weighted combination of max and average
        composite = (max_score * 0.6) + (avg_score * 0.4)

        if composite >= 80:
            return RiskLevel.CRITICAL.value
        elif composite >= 65:
            return RiskLevel.HIGH.value
        elif composite >= 45:
            return RiskLevel.MEDIUM.value
        else:
            return RiskLevel.LOW.value

    def _compute_confidence(
        self,
        scores: Dict[str, int],
        node_values: Dict[str, float],
    ) -> float:
        """Compute confidence score based on data completeness and consistency."""
        # Base confidence from data completeness
        total_nodes = len(SCORE_WEIGHTS)
        nodes_with_data = sum(
            1 for contributions in SCORE_WEIGHTS.values()
            for node_key, _ in contributions
            if node_values.get(node_key, 0) > 0
        )
        total_expected = sum(len(c) for c in SCORE_WEIGHTS.values())
        completeness = nodes_with_data / total_expected if total_expected > 0 else 0

        # Consistency penalty — high variance across scores reduces confidence
        if scores:
            values = list(scores.values())
            mean = sum(values) / len(values)
            variance = sum((v - mean) ** 2 for v in values) / len(values)
            std_dev = variance ** 0.5
            consistency = max(0.5, 1.0 - (std_dev / 100))
        else:
            consistency = 0.5

        confidence = (completeness * 0.6) + (consistency * 0.4)
        return max(0.3, min(1.0, confidence))


# Singleton
scoring_engine = ScoringEngine()
