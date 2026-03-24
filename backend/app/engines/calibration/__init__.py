"""Live Calibration Engine — Phase 3A.

Adjusts graph edge weights based on real market signals.
Version 1: Batch calibration (daily/weekly).
"""

from typing import Optional, List, Dict, Any
import math
from datetime import datetime

# ─── GCC Regional Sensitivity ───────────────────────────────────

GCC_SENSITIVITY = {
    "saudi": {"oil_price": 1.4, "government_spending": 1.3, "inflation_rate": 0.9},
    "uae": {"oil_price": 0.7, "trade_volume": 1.4, "real_estate_index": 1.3},
    "kuwait": {"oil_price": 1.6, "government_spending": 1.2, "inflation_rate": 0.8},
    "qatar": {"oil_price": 1.1, "trade_volume": 1.2, "inflation_rate": 0.9},
    "bahrain": {"oil_price": 1.3, "interest_rate": 1.3, "inflation_rate": 1.2},
    "oman": {"oil_price": 1.4, "interest_rate": 1.2, "inflation_rate": 1.1},
}

# ─── Signal → Graph Node Mapping ────────────────────────────────

SIGNAL_NODE_MAP = {
    "oil_price": ["crude_oil", "delivered_oil_cost"],
    "interest_rate": ["gcc_banking", "bank_liquidity"],
    "inflation_rate": ["gcc_inflation", "inflation_pressure"],
    "credit_growth": ["credit_risk", "gcc_banking"],
    "government_spending": ["risk_appetite", "real_estate"],
    "trade_volume": ["trade_finance", "shipping_logistics"],
    "claims_frequency": ["insurance_premiums"],
    "claims_severity": ["insurance_premiums"],
    "fraud_alert_rate": ["insurance_premiums"],
    "reinsurance_pressure": ["marine_insurance", "energy_insurance"],
    "loss_ratio": ["insurance_premiums"],
}

# ─── Default Graph Edges for Calibration ────────────────────────

DEFAULT_EDGES = {
    "hormuz→crude_oil": 0.85,
    "hormuz→tanker_traffic": 0.90,
    "crude_oil→delivered_oil_cost": 0.80,
    "crude_oil→energy_insurance": 0.50,
    "tanker_traffic→freight_rates": 0.75,
    "tanker_traffic→marine_insurance": 0.70,
    "marine_insurance→insurance_premiums": 0.65,
    "gcc_banking→bank_liquidity": 0.65,
    "gcc_banking→credit_risk": 0.50,
    "delivered_oil_cost→gcc_inflation": 0.60,
    "gcc_inflation→inflation_pressure": 0.70,
    "trade_finance→credit_risk": 0.55,
    "credit_risk→risk_appetite": 0.55,
    "shipping_logistics→gcc_inflation": 0.40,
}


def _compute_market_adjustment(signal: dict) -> float:
    change = signal.get("change", 0)
    impact = math.tanh(change / 50)
    return 1.0 + impact * 0.5


def _compute_time_decay(timestamp_str: str) -> float:
    try:
        signal_time = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
        now = datetime.now(signal_time.tzinfo) if signal_time.tzinfo else datetime.now()
        hours = max(0, (now - signal_time).total_seconds() / 3600)
    except Exception:
        hours = 0
    return math.exp(-0.01 * hours)


def run_calibration(
    signals: List[Dict[str, Any]],
    country: Optional[str] = None,
) -> dict:
    """Run batch calibration from live signals.

    Returns calibrated edges with audit trail.
    """
    edge_calibrations = {}

    # Initialize from defaults
    for edge_key, base_weight in DEFAULT_EDGES.items():
        edge_calibrations[edge_key] = {
            "edge": edge_key,
            "base_weight": base_weight,
            "market_adjustment": 1.0,
            "regional_sensitivity": 1.0,
            "confidence_factor": 1.0,
            "time_decay": 1.0,
            "calibrated_weight": base_weight,
            "drift_from_base_pct": 0.0,
        }

    drift_alerts = []

    for signal in signals:
        indicator = signal.get("indicator", "")
        affected_nodes = SIGNAL_NODE_MAP.get(indicator, [])
        if not affected_nodes:
            continue

        market_adj = _compute_market_adjustment(signal)
        regional_sens = 1.0
        if country and country in GCC_SENSITIVITY:
            regional_sens = GCC_SENSITIVITY[country].get(indicator, 1.0)

        conf_factor = 0.5 + signal.get("confidence", 0.7) * 0.5
        time_decay = _compute_time_decay(signal.get("timestamp", ""))

        # Update affected edges
        for edge_key, cal in edge_calibrations.items():
            from_node, to_node = edge_key.split("→")
            if from_node in affected_nodes or to_node in affected_nodes:
                alpha = 0.3  # Learning rate
                cal["market_adjustment"] = alpha * market_adj + (1 - alpha) * cal["market_adjustment"]
                cal["regional_sensitivity"] = alpha * regional_sens + (1 - alpha) * cal["regional_sensitivity"]
                cal["confidence_factor"] = alpha * conf_factor + (1 - alpha) * cal["confidence_factor"]
                cal["time_decay"] = time_decay

                calibrated = max(0.01, min(1.0,
                    cal["base_weight"]
                    * cal["market_adjustment"]
                    * cal["regional_sensitivity"]
                    * cal["confidence_factor"]
                    * cal["time_decay"]
                ))
                cal["calibrated_weight"] = round(calibrated, 4)
                cal["drift_from_base_pct"] = round(
                    ((calibrated - cal["base_weight"]) / cal["base_weight"]) * 100, 2
                )

                if abs(cal["drift_from_base_pct"]) > 25:
                    drift_alerts.append({
                        "edge": edge_key,
                        "drift_pct": cal["drift_from_base_pct"],
                        "direction": "amplified" if cal["drift_from_base_pct"] > 0 else "dampened",
                        "reason": f"Signal {indicator} ({signal.get('change', 0):+.1f}%) caused significant drift",
                    })

    return {
        "calibrated_edges": list(edge_calibrations.values()),
        "total_edges": len(edge_calibrations),
        "drift_alerts": drift_alerts,
        "drift_alert_count": len(drift_alerts),
        "country": country,
        "signals_processed": len(signals),
        "version": "3.0.0-calibration",
    }
