"""Seed script — Kuwait Motor Adaptive Risk Engine initial data.

Seeds realistic Kuwait motor insurance signals to demonstrate
the full pipeline: ingest → reasoning → scoring → recommendations.

Usage:
    python -m scripts.seed_kwt_motor
    # or from backend/:
    python scripts/seed_kwt_motor.py
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

# ─── Kuwait Motor Signals ──────────────────────────────────────

KUWAIT_SIGNALS = {
    "market_code": "KWT",
    "signals": [
        # Macro signals
        {
            "signal_key": "oil_price",
            "signal_value": 78.5,
            "signal_category": "macro",
            "source_name": "bloomberg",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "inflation_rate",
            "signal_value": 3.8,
            "signal_category": "macro",
            "source_name": "cbk_report",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "interest_rate",
            "signal_value": 4.25,
            "signal_category": "macro",
            "source_name": "cbk_policy",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "credit_growth",
            "signal_value": 5.2,
            "signal_category": "macro",
            "source_name": "cbk_report",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "government_spending",
            "signal_value": 8.5,
            "signal_category": "macro",
            "source_name": "mof_budget",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "real_estate_index",
            "signal_value": 4.2,
            "signal_category": "macro",
            "source_name": "nbk_report",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "trade_volume",
            "signal_value": 3.5,
            "signal_category": "macro",
            "source_name": "customs",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
        # Insurance signals
        {
            "signal_key": "repair_cost_inflation",
            "signal_value": 12.5,
            "signal_category": "insurance",
            "source_name": "garage_network",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "claims_frequency",
            "signal_value": 1.45,
            "signal_category": "insurance",
            "source_name": "claims_system",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "claims_severity",
            "signal_value": 7.8,
            "signal_category": "insurance",
            "source_name": "claims_system",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "fraud_alert_rate",
            "signal_value": 8.5,
            "signal_category": "insurance",
            "source_name": "fraud_system",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "reinsurance_pressure",
            "signal_value": 42.0,
            "signal_category": "insurance",
            "source_name": "reinsurer",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "premium_adequacy",
            "signal_value": 65.0,
            "signal_category": "insurance",
            "source_name": "actuarial",
            "source_type": "manual",
            "observed_at": datetime.utcnow().isoformat(),
        },
        # Portfolio signals
        {
            "signal_key": "loss_ratio",
            "signal_value": 72.5,
            "signal_category": "portfolio",
            "source_name": "finance_system",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
        {
            "signal_key": "policy_lapse_rate",
            "signal_value": 4.2,
            "signal_category": "portfolio",
            "source_name": "policy_system",
            "source_type": "api",
            "observed_at": datetime.utcnow().isoformat(),
        },
    ],
}


def seed():
    print("=" * 60)
    print("Deevo Cortex — Kuwait Motor Seed Script")
    print("=" * 60)

    # Step 1: Health check
    print("\n[1/4] Health check...")
    r = requests.get(f"{BASE_URL}/api/v1/health")
    print(f"  Status: {r.status_code}")
    print(f"  Response: {json.dumps(r.json(), indent=2)[:200]}")

    # Step 2: Ingest signals
    print("\n[2/4] Ingesting Kuwait motor signals...")
    r = requests.post(f"{BASE_URL}/api/v1/signals/ingest", json=KUWAIT_SIGNALS)
    print(f"  Status: {r.status_code}")
    data = r.json()
    print(f"  Ingested: {data.get('ingested_count', 0)} signals")

    # Step 3: Run scoring
    print("\n[3/4] Running scoring pipeline...")
    scoring_req = {
        "market_code": "KWT",
        "portfolio_key": "motor_retail",
        "run_type": "on_demand",
    }
    r = requests.post(f"{BASE_URL}/api/v1/scoring/run", json=scoring_req)
    print(f"  Status: {r.status_code}")
    data = r.json()
    print(f"  Assessment ID: {data.get('assessment_id', 'N/A')}")
    print(f"  Risk Level: {data.get('risk_level', 'N/A')}")
    scores = data.get("scores", {})
    for k, v in scores.items():
        print(f"    {k}: {v}")
    print(f"  Top Drivers: {data.get('top_drivers', [])[:5]}")
    print(f"  Confidence: {data.get('confidence_score', 'N/A')}")

    assessment_id = data.get("assessment_id")

    # Step 4: Get recommendations
    if assessment_id:
        print(f"\n[4/4] Getting recommendations for {assessment_id}...")
        r = requests.get(f"{BASE_URL}/api/v1/recommendations/{assessment_id}")
        print(f"  Status: {r.status_code}")
        recs = r.json()
        for rec in recs.get("recommendations", [])[:5]:
            print(f"  [{rec.get('priority', '?')}] {rec.get('title', 'N/A')}")

    print("\n" + "=" * 60)
    print("Seed complete.")
    print("=" * 60)


if __name__ == "__main__":
    seed()
