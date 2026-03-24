# Data Contract — Kuwait Motor Adaptive Risk Engine

## Input: Signal Ingestion

### POST /api/v1/signals/ingest
```json
{
  "market_code": "KWT",
  "signals": [
    {
      "signal_key": "oil_price",
      "signal_value": 78.5,
      "signal_category": "macro",
      "source_name": "bloomberg",
      "source_type": "api",
      "observed_at": "2026-03-24T09:00:00Z"
    }
  ]
}
```

### Supported Signal Keys
| Signal Key | Category | Range | Unit |
|---|---|---|---|
| oil_price | macro | 30-150 | USD/barrel |
| inflation_rate | macro | 0-10 | % |
| interest_rate | macro | 0-8 | % |
| credit_growth | macro | -10 to 20 | % |
| government_spending | macro | -20 to 30 | % change |
| real_estate_index | macro | -30 to 30 | % change |
| trade_volume | macro | -20 to 20 | % change |
| fx_rate | macro | 0.8-1.2 | index |
| claims_frequency | insurance | 0.5-3.0 | multiplier |
| claims_severity | insurance | 0.5-15.0 | KWD thousands |
| repair_cost_inflation | insurance | -5 to 30 | % |
| medical_inflation | insurance | -2 to 25 | % |
| fraud_alert_rate | insurance | 0-20 | % |
| reinsurance_pressure | insurance | 0-100 | index |
| premium_adequacy | insurance | 0-100 | % (inverted) |
| loss_ratio | portfolio | 30-120 | % |
| policy_lapse_rate | portfolio | 0-15 | % |

## Output: Scoring Response

### POST /api/v1/scoring/run → Response
```json
{
  "assessment_id": "assess_abc123",
  "market_code": "KWT",
  "portfolio_key": "motor_retail",
  "scores": {
    "market_stress_score": 58,
    "claims_pressure_score": 76,
    "fraud_exposure_score": 69,
    "underwriting_risk_score": 73,
    "portfolio_stability_score": 54
  },
  "risk_level": "High",
  "top_drivers": ["repair_cost_inflation", "claims_severity", "loss_ratio"],
  "confidence_score": 0.79,
  "recommendations": [
    {
      "action_type": "underwriting_control",
      "priority": "high",
      "title": "Tighten underwriting for high-frequency segment",
      "rationale": "Claims pressure and underwriting drift exceed threshold"
    }
  ],
  "explainability": {
    "top_drivers": [...],
    "market_profile_notes": [...],
    "confidence_score": 0.79,
    "calibration_needed": true,
    "narrative_summary": "..."
  },
  "timestamp": "2026-03-24T09:00:00Z"
}
```

## Feedback: Outcome Submission

### POST /api/v1/feedback/outcomes
```json
{
  "prediction_id": "assess_abc123",
  "actual_loss_ratio": 71.2,
  "actual_claims_frequency": 1.18,
  "actual_claims_severity": 6.9,
  "actual_fraud_findings": 14,
  "actual_lapse_rate": 0.04,
  "actual_underwriting_shift": 0.15,
  "observed_start_date": "2026-03-24",
  "observed_end_date": "2026-04-24"
}
```

## Calibration Response

### POST /api/v1/calibration/run → Response
```json
{
  "calibration_id": "cal_xyz789",
  "market_code": "KWT",
  "mode": "semi_auto",
  "edges_calibrated": 24,
  "calibrations": [
    {
      "edge_key": "oil_price→repair_cost_inflation",
      "previous_weight": 0.60,
      "new_weight": 0.57,
      "previous_confidence": 0.70,
      "new_confidence": 0.68,
      "drift_pct": -5.0,
      "reason": "Direction correct, magnitude error 18%. Minor correction."
    }
  ]
}
```

## All API Endpoints
| Method | Path | Purpose |
|---|---|---|
| GET | /api/v1/health | Health check |
| POST | /api/v1/signals/ingest | Ingest signals |
| GET | /api/v1/signals/latest | Latest signals |
| GET | /api/v1/graph/nodes | List nodes |
| GET | /api/v1/graph/edges | List edges |
| GET | /api/v1/graph/impact | Strongest edges |
| PATCH | /api/v1/graph/edges/{id} | Manual override |
| POST | /api/v1/scoring/run | Run scoring |
| GET | /api/v1/predictions/{id} | Get prediction |
| GET | /api/v1/predictions/ | List predictions |
| POST | /api/v1/feedback/outcomes | Submit outcomes |
| POST | /api/v1/calibration/run | Run calibration |
| GET | /api/v1/calibration/history | Calibration audit |
| GET | /api/v1/recommendations/{id} | Get recommendations |
