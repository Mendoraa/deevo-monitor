"""Scenario Scoring — produces base / elevated / severe probabilistic estimates."""

from app.schemas import NormalizedEvent, ScenarioBundle

# Pre-computed scenario templates by event category
SCENARIO_TEMPLATES: dict[str, dict] = {
    "shipping_disruption": {
        "base_case": {
            "oil": "+3% to +5%",
            "shipping": "delay +8% to +15%",
            "insurance": "premium +5% to +10%",
            "banking": "exposure stable",
        },
        "elevated_case": {
            "oil": "+6% to +10%",
            "shipping": "delay +16% to +25%",
            "insurance": "premium +10% to +18%",
            "banking": "selective tightening",
        },
        "severe_case": {
            "oil": "+12% to +18%",
            "shipping": "delay +26% to +40%",
            "insurance": "premium +20% to +35%",
            "banking": "broad tightening",
        },
    },
    "geopolitical_conflict": {
        "base_case": {
            "oil": "+2% to +5%",
            "shipping": "delay +5% to +10%",
            "insurance": "premium +3% to +8%",
            "banking": "watchful",
        },
        "elevated_case": {
            "oil": "+5% to +12%",
            "shipping": "delay +10% to +20%",
            "insurance": "premium +8% to +15%",
            "banking": "cautious",
        },
        "severe_case": {
            "oil": "+15% to +25%",
            "shipping": "delay +20% to +35%",
            "insurance": "premium +15% to +30%",
            "banking": "significant tightening",
        },
    },
    "energy_supply": {
        "base_case": {
            "oil": "+4% to +7%",
            "shipping": "delay +3% to +8%",
            "insurance": "premium +4% to +9%",
            "banking": "stable",
        },
        "elevated_case": {
            "oil": "+8% to +14%",
            "shipping": "delay +8% to +15%",
            "insurance": "premium +9% to +16%",
            "banking": "selective tightening",
        },
        "severe_case": {
            "oil": "+15% to +22%",
            "shipping": "delay +15% to +25%",
            "insurance": "premium +16% to +28%",
            "banking": "broad stress",
        },
    },
    "sanctions": {
        "base_case": {
            "oil": "+1% to +3%",
            "shipping": "rerouting +5% to +12%",
            "insurance": "premium +2% to +6%",
            "banking": "compliance tightening",
        },
        "elevated_case": {
            "oil": "+3% to +8%",
            "shipping": "rerouting +12% to +20%",
            "insurance": "premium +6% to +12%",
            "banking": "counterparty review",
        },
        "severe_case": {
            "oil": "+8% to +15%",
            "shipping": "rerouting +20% to +35%",
            "insurance": "premium +12% to +22%",
            "banking": "broad de-risking",
        },
    },
}

DEFAULT_SCENARIO = {
    "base_case": {"impact": "limited", "confidence": "low-to-moderate"},
    "elevated_case": {"impact": "moderate", "confidence": "moderate"},
    "severe_case": {"impact": "significant", "confidence": "moderate-to-high"},
}


def score_scenarios(event: NormalizedEvent) -> ScenarioBundle:
    """Generate probabilistic scenario estimates for the event."""
    template = SCENARIO_TEMPLATES.get(event.category.value, DEFAULT_SCENARIO)
    return ScenarioBundle(
        base_case=template["base_case"],
        elevated_case=template["elevated_case"],
        severe_case=template["severe_case"],
    )
