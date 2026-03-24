"""Market Profile Service — GCC country profiles and graph topology.

Provides the master data for nodes, edges, and market-specific sensitivity
profiles. This is the single source of truth for graph structure.
"""

from typing import Dict, List, Optional

# ─── GCC Market Profiles ────────────────────────────────────────

GCC_MARKETS = {
    "KWT": {
        "name": "Kuwait",
        "currency": "KWD",
        "oil_dependency": 0.85,
        "trade_openness": 0.40,
        "fiscal_buffer": 0.80,
        "inflation_sensitivity": 0.40,
        "insurance_penetration": 0.012,
        "regulatory_body": "IRU",
        "primary_lines": ["motor", "medical", "marine"],
    },
    "SAU": {
        "name": "Saudi Arabia",
        "currency": "SAR",
        "oil_dependency": 0.65,
        "trade_openness": 0.50,
        "fiscal_buffer": 0.70,
        "inflation_sensitivity": 0.50,
        "insurance_penetration": 0.019,
        "regulatory_body": "SAMA",
        "primary_lines": ["motor", "medical", "property"],
    },
    "UAE": {
        "name": "UAE",
        "currency": "AED",
        "oil_dependency": 0.30,
        "trade_openness": 0.85,
        "fiscal_buffer": 0.85,
        "inflation_sensitivity": 0.55,
        "insurance_penetration": 0.032,
        "regulatory_body": "CBUAE",
        "primary_lines": ["motor", "medical", "marine", "property"],
    },
    "QAT": {
        "name": "Qatar",
        "currency": "QAR",
        "oil_dependency": 0.55,
        "trade_openness": 0.65,
        "fiscal_buffer": 0.75,
        "inflation_sensitivity": 0.45,
        "insurance_penetration": 0.015,
        "regulatory_body": "QFCRA",
        "primary_lines": ["motor", "medical", "energy"],
    },
    "BHR": {
        "name": "Bahrain",
        "currency": "BHD",
        "oil_dependency": 0.70,
        "trade_openness": 0.55,
        "fiscal_buffer": 0.35,
        "inflation_sensitivity": 0.60,
        "insurance_penetration": 0.025,
        "regulatory_body": "CBB",
        "primary_lines": ["motor", "medical", "marine"],
    },
    "OMN": {
        "name": "Oman",
        "currency": "OMR",
        "oil_dependency": 0.72,
        "trade_openness": 0.50,
        "fiscal_buffer": 0.40,
        "inflation_sensitivity": 0.55,
        "insurance_penetration": 0.018,
        "regulatory_body": "CMA",
        "primary_lines": ["motor", "medical", "property"],
    },
}

# ─── Regional Sensitivity Profiles ──────────────────────────────

REGIONAL_SENSITIVITY: Dict[str, Dict[str, float]] = {
    "KWT": {
        "oil_price": 1.6, "repair_cost_inflation": 1.4, "claims_frequency": 1.2,
        "government_spending": 1.2, "inflation_rate": 0.8, "credit_growth": 0.9,
        "trade_volume": 0.8, "real_estate_index": 0.9,
    },
    "SAU": {
        "oil_price": 1.4, "repair_cost_inflation": 1.3, "claims_frequency": 1.1,
        "government_spending": 1.3, "inflation_rate": 0.9, "credit_growth": 1.0,
        "trade_volume": 0.9, "real_estate_index": 1.0,
    },
    "UAE": {
        "oil_price": 0.7, "repair_cost_inflation": 1.1, "claims_frequency": 1.0,
        "trade_volume": 1.4, "real_estate_index": 1.3, "inflation_rate": 1.1,
        "credit_growth": 1.1, "government_spending": 0.8,
    },
    "QAT": {
        "oil_price": 1.1, "repair_cost_inflation": 1.0, "claims_frequency": 1.0,
        "trade_volume": 1.2, "inflation_rate": 0.9, "credit_growth": 1.0,
        "government_spending": 1.0, "real_estate_index": 1.0,
    },
    "BHR": {
        "oil_price": 1.3, "repair_cost_inflation": 1.2, "claims_frequency": 1.3,
        "interest_rate": 1.3, "inflation_rate": 1.2, "credit_growth": 1.1,
        "government_spending": 0.9, "trade_volume": 0.9,
    },
    "OMN": {
        "oil_price": 1.4, "repair_cost_inflation": 1.2, "claims_frequency": 1.2,
        "interest_rate": 1.2, "inflation_rate": 1.1, "credit_growth": 1.0,
        "government_spending": 1.0, "trade_volume": 0.9,
    },
}

# ─── Default Nodes for MVP ──────────────────────────────────────

DEFAULT_NODES = [
    # Macro
    {"node_key": "oil_price", "label": "Oil Price", "node_type": "macro"},
    {"node_key": "inflation_rate", "label": "Inflation Rate", "node_type": "macro"},
    {"node_key": "interest_rate", "label": "Interest Rate", "node_type": "macro"},
    {"node_key": "credit_growth", "label": "Credit Growth", "node_type": "macro"},
    {"node_key": "government_spending", "label": "Government Spending", "node_type": "macro"},
    {"node_key": "real_estate_index", "label": "Real Estate Index", "node_type": "macro"},
    {"node_key": "trade_volume", "label": "Trade Volume", "node_type": "macro"},
    {"node_key": "fx_rate", "label": "FX Rate", "node_type": "macro"},
    # Insurance
    {"node_key": "claims_frequency", "label": "Claims Frequency", "node_type": "insurance"},
    {"node_key": "claims_severity", "label": "Claims Severity", "node_type": "insurance"},
    {"node_key": "repair_cost_inflation", "label": "Repair Cost Inflation", "node_type": "insurance"},
    {"node_key": "medical_inflation", "label": "Medical Inflation", "node_type": "insurance"},
    {"node_key": "fraud_cluster_density", "label": "Fraud Cluster Density", "node_type": "insurance"},
    {"node_key": "underwriting_drift", "label": "Underwriting Drift", "node_type": "insurance"},
    {"node_key": "reinsurance_pressure", "label": "Reinsurance Pressure", "node_type": "insurance"},
    {"node_key": "premium_adequacy", "label": "Premium Adequacy", "node_type": "insurance"},
    # Portfolio
    {"node_key": "loss_ratio", "label": "Loss Ratio", "node_type": "portfolio"},
    {"node_key": "policy_lapse_risk", "label": "Policy Lapse Risk", "node_type": "portfolio"},
    {"node_key": "suspicious_provider_concentration", "label": "Suspicious Provider Concentration", "node_type": "portfolio"},
    {"node_key": "high_risk_segment_growth", "label": "High Risk Segment Growth", "node_type": "portfolio"},
    {"node_key": "pricing_adequacy_gap", "label": "Pricing Adequacy Gap", "node_type": "portfolio"},
    {"node_key": "garage_network_risk", "label": "Garage Network Risk", "node_type": "portfolio"},
    # Output Scores (target nodes)
    {"node_key": "market_stress_signal", "label": "Market Stress Signal", "node_type": "metric"},
    {"node_key": "claims_pressure_signal", "label": "Claims Pressure Signal", "node_type": "metric"},
    {"node_key": "fraud_exposure_signal", "label": "Fraud Exposure Signal", "node_type": "metric"},
    {"node_key": "underwriting_risk_signal", "label": "Underwriting Risk Signal", "node_type": "metric"},
    {"node_key": "portfolio_stability_signal", "label": "Portfolio Stability Signal", "node_type": "metric"},
]

# ─── Default Edges for MVP ──────────────────────────────────────

DEFAULT_EDGES = [
    # Macro → Insurance
    {"source": "oil_price", "target": "repair_cost_inflation", "rel": "amplifies", "weight": 0.60},
    {"source": "oil_price", "target": "claims_severity", "rel": "amplifies", "weight": 0.45},
    {"source": "inflation_rate", "target": "repair_cost_inflation", "rel": "amplifies", "weight": 0.75},
    {"source": "inflation_rate", "target": "medical_inflation", "rel": "amplifies", "weight": 0.80},
    {"source": "inflation_rate", "target": "claims_severity", "rel": "amplifies", "weight": 0.55},
    {"source": "interest_rate", "target": "credit_growth", "rel": "constrains", "weight": 0.50},
    {"source": "credit_growth", "target": "high_risk_segment_growth", "rel": "amplifies", "weight": 0.45},
    {"source": "government_spending", "target": "real_estate_index", "rel": "amplifies", "weight": 0.55},
    {"source": "real_estate_index", "target": "claims_frequency", "rel": "amplifies", "weight": 0.30},
    {"source": "trade_volume", "target": "claims_frequency", "rel": "affects", "weight": 0.25},
    # Insurance → Insurance
    {"source": "repair_cost_inflation", "target": "claims_severity", "rel": "amplifies", "weight": 0.80},
    {"source": "claims_frequency", "target": "fraud_cluster_density", "rel": "amplifies", "weight": 0.55},
    {"source": "claims_severity", "target": "loss_ratio", "rel": "amplifies", "weight": 0.75},
    {"source": "claims_frequency", "target": "loss_ratio", "rel": "amplifies", "weight": 0.70},
    {"source": "fraud_cluster_density", "target": "loss_ratio", "rel": "amplifies", "weight": 0.40},
    {"source": "medical_inflation", "target": "claims_severity", "rel": "amplifies", "weight": 0.65},
    {"source": "reinsurance_pressure", "target": "premium_adequacy", "rel": "constrains", "weight": 0.50},
    {"source": "underwriting_drift", "target": "pricing_adequacy_gap", "rel": "amplifies", "weight": 0.65},
    # Portfolio
    {"source": "loss_ratio", "target": "underwriting_drift", "rel": "triggers", "weight": 0.60},
    {"source": "suspicious_provider_concentration", "target": "fraud_cluster_density", "rel": "amplifies", "weight": 0.70},
    {"source": "garage_network_risk", "target": "fraud_cluster_density", "rel": "amplifies", "weight": 0.55},
    {"source": "high_risk_segment_growth", "target": "claims_frequency", "rel": "amplifies", "weight": 0.50},
    {"source": "pricing_adequacy_gap", "target": "loss_ratio", "rel": "amplifies", "weight": 0.55},
    # → Score Targets
    {"source": "oil_price", "target": "market_stress_signal", "rel": "affects", "weight": 0.50},
    {"source": "inflation_rate", "target": "market_stress_signal", "rel": "affects", "weight": 0.45},
    {"source": "credit_growth", "target": "market_stress_signal", "rel": "affects", "weight": 0.35},
    {"source": "claims_frequency", "target": "claims_pressure_signal", "rel": "affects", "weight": 0.55},
    {"source": "claims_severity", "target": "claims_pressure_signal", "rel": "affects", "weight": 0.60},
    {"source": "repair_cost_inflation", "target": "claims_pressure_signal", "rel": "affects", "weight": 0.45},
    {"source": "fraud_cluster_density", "target": "fraud_exposure_signal", "rel": "affects", "weight": 0.70},
    {"source": "suspicious_provider_concentration", "target": "fraud_exposure_signal", "rel": "affects", "weight": 0.55},
    {"source": "garage_network_risk", "target": "fraud_exposure_signal", "rel": "affects", "weight": 0.40},
    {"source": "underwriting_drift", "target": "underwriting_risk_signal", "rel": "affects", "weight": 0.60},
    {"source": "pricing_adequacy_gap", "target": "underwriting_risk_signal", "rel": "affects", "weight": 0.55},
    {"source": "premium_adequacy", "target": "underwriting_risk_signal", "rel": "affects", "weight": 0.45},
    {"source": "loss_ratio", "target": "portfolio_stability_signal", "rel": "affects", "weight": 0.65},
    {"source": "policy_lapse_risk", "target": "portfolio_stability_signal", "rel": "affects", "weight": 0.40},
    {"source": "high_risk_segment_growth", "target": "portfolio_stability_signal", "rel": "affects", "weight": 0.35},
]


def get_market_profile(market_code: str) -> Optional[dict]:
    return GCC_MARKETS.get(market_code)


def get_regional_sensitivity(market_code: str) -> Dict[str, float]:
    return REGIONAL_SENSITIVITY.get(market_code, {})


def get_all_markets() -> Dict[str, dict]:
    return GCC_MARKETS


def get_default_nodes() -> List[dict]:
    return DEFAULT_NODES


def get_default_edges() -> List[dict]:
    return DEFAULT_EDGES
