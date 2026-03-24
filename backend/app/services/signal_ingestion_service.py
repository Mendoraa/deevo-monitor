"""Signal Ingestion Service — normalizes and stores incoming signals."""

from typing import List, Dict, Any
from datetime import datetime
import uuid
import math


class SignalIngestionService:
    """Processes raw signals into normalized, stored snapshots."""

    # Signal normalization ranges (min, max, invert)
    NORMALIZATION_RANGES = {
        "oil_price": (30, 150, False),
        "inflation_rate": (0, 10, False),
        "interest_rate": (0, 8, False),
        "credit_growth": (-10, 20, False),
        "government_spending": (-20, 30, False),
        "real_estate_index": (-30, 30, False),
        "trade_volume": (-20, 20, False),
        "fx_rate": (0.8, 1.2, False),
        "claims_frequency": (0.5, 3.0, False),
        "claims_severity": (0.5, 15.0, False),
        "repair_cost_inflation": (-5, 30, False),
        "medical_inflation": (-2, 25, False),
        "fraud_alert_rate": (0, 20, False),
        "fraud_cluster_density": (0, 1, False),
        "garage_network_risk": (0, 1, False),
        "underwriting_drift": (0, 1, False),
        "pricing_adequacy_gap": (0, 1, False),
        "consumer_liquidity_pressure": (0, 1, False),
        "reinsurance_pressure": (0, 100, False),
        "premium_adequacy": (0, 100, True),  # Inverted: higher = better
        "loss_ratio": (30, 120, False),
        "policy_lapse_rate": (0, 15, False),
        "policy_lapse_risk": (0, 1, False),
        "suspicious_provider_concentration": (0, 1, False),
        "high_risk_segment_growth": (0, 1, False),
        "underwriting_rejection_rate": (0, 30, False),
    }

    def ingest_batch(
        self,
        market_code: str,
        signals: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Ingest a batch of signals. Returns snapshot IDs."""
        snapshots = []

        for signal in signals:
            snapshot_id = f"snap_{uuid.uuid4().hex[:12]}"
            signal_key = signal.get("signal_key", "")
            raw_value = signal.get("signal_value", 0)

            normalized = self._normalize(signal_key, raw_value)

            snapshots.append({
                "id": snapshot_id,
                "market_code": market_code,
                "signal_key": signal_key,
                "signal_category": signal.get("signal_category", "macro"),
                "signal_value": raw_value,
                "normalized_value": normalized,
                "source_name": signal.get("source_name", "manual"),
                "source_type": signal.get("source_type", "manual"),
                "observed_at": signal.get("observed_at", datetime.utcnow().isoformat()),
                "ingested_at": datetime.utcnow().isoformat(),
            })

        return {
            "market_code": market_code,
            "ingested_count": len(snapshots),
            "snapshot_ids": [s["id"] for s in snapshots],
            "snapshots": snapshots,
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _normalize(self, signal_key: str, value: float) -> float:
        """Normalize signal to 0–100 scale."""
        config = self.NORMALIZATION_RANGES.get(signal_key)
        if not config:
            return min(100, max(0, value))

        min_val, max_val, invert = config
        if max_val == min_val:
            return 50.0

        normalized = ((value - min_val) / (max_val - min_val)) * 100
        normalized = max(0, min(100, normalized))

        if invert:
            normalized = 100 - normalized

        return round(normalized, 2)

    def get_latest_signals(
        self,
        market_code: str,
        signal_store: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Get most recent signal per key for a market."""
        latest: Dict[str, Dict] = {}

        for snap in signal_store:
            if snap.get("market_code") != market_code:
                continue
            key = snap["signal_key"]
            if key not in latest or snap["observed_at"] > latest[key]["observed_at"]:
                latest[key] = snap

        return {
            "market_code": market_code,
            "signals": list(latest.values()),
            "count": len(latest),
        }
