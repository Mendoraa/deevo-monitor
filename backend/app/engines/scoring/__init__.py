"""GCC Insurance Scoring Engine — Phase 3A.

Four scores tailored to GCC insurance markets:
1. Market Stress — Macro economic pressure
2. Claims Pressure — Probability of elevated claims
3. Fraud Exposure — Portfolio fraud vulnerability
4. Underwriting Risk — Pricing adequacy assessment
"""

from typing import Optional, List, Dict, Any
from app.schemas.event import NormalizedEvent
from app.engines.graph.run_graph_simulation import run_graph_simulation

# ─── GCC Market Profiles ────────────────────────────────────────

GCC_PROFILES = {
    "saudi": {
        "oil_sensitivity": 0.75, "gov_spending_dep": 0.70,
        "trade_openness": 0.45, "inflation_sens": 0.50,
        "regulatory_strict": 0.65, "market_maturity": 0.60,
    },
    "uae": {
        "oil_sensitivity": 0.35, "gov_spending_dep": 0.40,
        "trade_openness": 0.85, "inflation_sens": 0.55,
        "regulatory_strict": 0.55, "market_maturity": 0.75,
    },
    "kuwait": {
        "oil_sensitivity": 0.90, "gov_spending_dep": 0.80,
        "trade_openness": 0.40, "inflation_sens": 0.40,
        "regulatory_strict": 0.50, "market_maturity": 0.55,
    },
    "qatar": {
        "oil_sensitivity": 0.55, "gov_spending_dep": 0.60,
        "trade_openness": 0.65, "inflation_sens": 0.45,
        "regulatory_strict": 0.55, "market_maturity": 0.60,
    },
    "bahrain": {
        "oil_sensitivity": 0.70, "gov_spending_dep": 0.65,
        "trade_openness": 0.55, "inflation_sens": 0.60,
        "regulatory_strict": 0.60, "market_maturity": 0.65,
    },
    "oman": {
        "oil_sensitivity": 0.75, "gov_spending_dep": 0.70,
        "trade_openness": 0.50, "inflation_sens": 0.55,
        "regulatory_strict": 0.45, "market_maturity": 0.45,
    },
}


def _score_level(score: int) -> str:
    if score >= 80: return "critical"
    if score >= 65: return "high"
    if score >= 50: return "medium-high"
    if score >= 35: return "medium"
    if score >= 20: return "low-medium"
    return "low"


def _compute_market_stress(graph_result, profile: dict, signals: list) -> dict:
    """Score 1: Market Stress — macro economic pressure on insurance market."""
    nodes = {n.node_id: n for n in graph_result.nodes}
    factors = []

    oil = abs(nodes.get("crude_oil", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Oil Price Pressure",
        "contribution": round(oil * profile["oil_sensitivity"] * 100, 1),
        "weight": profile["oil_sensitivity"],
        "source": "graph:crude_oil",
        "direction": "negative" if oil > 0.3 else "neutral",
    })

    inflation = abs(nodes.get("gcc_inflation", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Inflation Pressure",
        "contribution": round(inflation * profile["inflation_sens"] * 100, 1),
        "weight": profile["inflation_sens"],
        "source": "graph:gcc_inflation",
        "direction": "negative" if inflation > 0.2 else "neutral",
    })

    liquidity = abs(nodes.get("gcc_banking", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Liquidity Stress",
        "contribution": round(liquidity * 0.40 * 100, 1),
        "weight": 0.40,
        "source": "graph:gcc_banking",
        "direction": "negative" if liquidity > 0.3 else "neutral",
    })

    raw = sum(f["contribution"] * f["weight"] for f in factors)
    score = min(100, round(raw))

    return {
        "name": "Market Stress",
        "score": score,
        "level": _score_level(score),
        "factors": factors,
        "trend": "deteriorating" if score > 50 else "stable",
        "confidence": 0.75,
    }


def _compute_claims_pressure(graph_result, profile: dict, signals: list) -> dict:
    """Score 2: Claims Pressure — probability of elevated claims."""
    nodes = {n.node_id: n for n in graph_result.nodes}
    factors = []

    claims = abs(nodes.get("insurance_premiums", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Claims Cascade",
        "contribution": round(claims * 0.50 * 100, 1),
        "weight": 0.50,
        "source": "graph:insurance_premiums",
        "direction": "negative" if claims > 0.2 else "neutral",
    })

    inflation = abs(nodes.get("gcc_inflation", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Severity Inflation",
        "contribution": round(inflation * profile["inflation_sens"] * 100, 1),
        "weight": profile["inflation_sens"],
        "source": "graph:gcc_inflation",
        "direction": "negative" if inflation > 0.15 else "neutral",
    })

    shipping = abs(nodes.get("shipping_logistics", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Repair/Parts Cost",
        "contribution": round(shipping * 0.30 * 100, 1),
        "weight": 0.30,
        "source": "graph:shipping_logistics",
        "direction": "negative" if shipping > 0.2 else "neutral",
    })

    raw = sum(f["contribution"] * f["weight"] for f in factors)
    score = min(100, round(raw))

    return {
        "name": "Claims Pressure",
        "score": score,
        "level": _score_level(score),
        "factors": factors,
        "trend": "deteriorating" if score > 50 else "stable",
        "confidence": 0.70,
    }


def _compute_fraud_exposure(graph_result, profile: dict, signals: list) -> dict:
    """Score 3: Fraud Exposure — portfolio fraud vulnerability."""
    nodes = {n.node_id: n for n in graph_result.nodes}
    factors = []

    inflation = abs(nodes.get("gcc_inflation", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Inflation-Driven Fraud",
        "contribution": round(inflation * 0.35 * 100, 1),
        "weight": 0.35,
        "source": "graph:gcc_inflation",
        "direction": "negative" if inflation > 0.2 else "neutral",
    })

    premiums = abs(nodes.get("insurance_premiums", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Scrutiny Quality",
        "contribution": round(premiums * 0.40 * 100, 1),
        "weight": 0.40,
        "source": "graph:insurance_premiums",
        "direction": "negative" if premiums > 0.2 else "neutral",
    })

    raw = sum(f["contribution"] * f["weight"] for f in factors)
    score = min(100, round(raw))

    return {
        "name": "Fraud Exposure",
        "score": score,
        "level": _score_level(score),
        "factors": factors,
        "trend": "deteriorating" if score > 40 else "stable",
        "confidence": 0.65,
    }


def _compute_underwriting_risk(graph_result, profile: dict, signals: list) -> dict:
    """Score 4: Underwriting Risk — pricing adequacy assessment."""
    nodes = {n.node_id: n for n in graph_result.nodes}
    factors = []

    risk_app = abs(nodes.get("risk_appetite", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Risk Appetite Decline",
        "contribution": round(risk_app * 0.40 * 100, 1),
        "weight": 0.40,
        "source": "graph:risk_appetite",
        "direction": "negative" if risk_app > 0.3 else "neutral",
    })

    premiums = abs(nodes.get("insurance_premiums", type("", (), {"impact_score": 0})).impact_score)
    factors.append({
        "name": "Pricing Pressure",
        "contribution": round(premiums * 0.35 * 100, 1),
        "weight": 0.35,
        "source": "graph:insurance_premiums",
        "direction": "negative" if premiums > 0.2 else "neutral",
    })

    credit = abs(nodes.get("credit_risk", type("", (), {"impact_score": 0})).impact_score) if "credit_risk" in {n.node_id for n in graph_result.nodes} else 0
    factors.append({
        "name": "Counterparty Risk",
        "contribution": round(credit * 0.30 * 100, 1),
        "weight": 0.30,
        "source": "graph:credit_risk",
        "direction": "negative" if credit > 0.2 else "neutral",
    })

    raw = sum(f["contribution"] * f["weight"] for f in factors)
    score = min(100, round(raw))

    return {
        "name": "Underwriting Risk",
        "score": score,
        "level": _score_level(score),
        "factors": factors,
        "trend": "deteriorating" if score > 50 else "stable",
        "confidence": 0.70,
    }


def _generate_actions(country: str, scores: dict, product: Optional[str] = None) -> list:
    """Generate recommended actions based on scores."""
    actions = []
    ctx = f" for {product}" if product else ""

    ms = scores["market_stress"]["score"]
    cp = scores["claims_pressure"]["score"]
    fe = scores["fraud_exposure"]["score"]
    ur = scores["underwriting_risk"]["score"]

    if ms >= 60:
        actions.append(f"Monitor macro indicators closely{ctx} — market stress at {ms}/100")
    if cp >= 50:
        actions.append(f"Review claims reserves and IBNR adjustments{ctx} — claims pressure at {cp}/100")
    if fe >= 40:
        actions.append(f"Increase fraud review threshold sensitivity{ctx} — fraud exposure at {fe}/100")
        if fe >= 60:
            actions.append(f"Launch provider anomaly investigation in {country} market")
    if ur >= 50:
        actions.append(f"Review pricing adequacy and risk band calibration{ctx} — UW risk at {ur}/100")
        if ur >= 70:
            actions.append(f"Tighten underwriting on highest-exposure segments in {country}")
    if not actions:
        actions.append(f"Standard monitoring — all scores within acceptable range for {country}")

    return actions


def compute_gcc_scorecards(
    normalized_event: NormalizedEvent,
    country: Optional[str] = None,
    product: Optional[str] = None,
    signals: List[Dict[str, Any]] = None,
) -> dict:
    """Compute GCC insurance scorecards for one or all countries."""
    signals = signals or []

    # Run graph to get current state
    graph_result = run_graph_simulation(normalized_event)

    countries = [country] if country else list(GCC_PROFILES.keys())
    scorecards = []

    for c in countries:
        if c not in GCC_PROFILES:
            continue
        profile = GCC_PROFILES[c]

        market_stress = _compute_market_stress(graph_result, profile, signals)
        claims_pressure = _compute_claims_pressure(graph_result, profile, signals)
        fraud_exposure = _compute_fraud_exposure(graph_result, profile, signals)
        underwriting_risk = _compute_underwriting_risk(graph_result, profile, signals)

        scores = {
            "market_stress": market_stress,
            "claims_pressure": claims_pressure,
            "fraud_exposure": fraud_exposure,
            "underwriting_risk": underwriting_risk,
        }

        max_score = max(s["score"] for s in scores.values())
        actions = _generate_actions(c, scores, product)

        scorecards.append({
            "country": c,
            "product": product,
            "timestamp": normalized_event.timestamp,
            "market_stress": market_stress,
            "claims_pressure": claims_pressure,
            "fraud_exposure": fraud_exposure,
            "underwriting_risk": underwriting_risk,
            "overall_risk": _score_level(max_score),
            "recommended_actions": actions,
        })

    return {
        "event_id": normalized_event.event_id,
        "event_class": normalized_event.category,
        "scorecards": scorecards,
        "total_countries": len(scorecards),
    }
