"""Insurance Risk Agent — evaluates marine, property, and political risk repricing."""

from app.schemas import NormalizedEvent, AgentOutput


def insurance_risk_agent(event: NormalizedEvent) -> AgentOutput:
    high_risk_categories = {
        "geopolitical_conflict",
        "shipping_disruption",
        "infrastructure_damage",
        "climate_disaster",
    }

    if event.category.value in high_risk_categories and event.severity > 0.7:
        return AgentOutput(
            agent_name="InsuranceRiskAgent",
            impact_direction="up",
            impact_magnitude="high",
            confidence=0.81,
            rationale=[
                "Marine and political risk repricing accelerated",
                "War risk premiums likely to increase for affected corridors",
                "Claims reserves may need upward adjustment",
                "Reinsurance market sensitivity elevated",
            ],
            range_estimate="premium +10% to +25%",
        )
    elif event.category.value in high_risk_categories:
        return AgentOutput(
            agent_name="InsuranceRiskAgent",
            impact_direction="up",
            impact_magnitude="moderate",
            confidence=0.74,
            rationale=[
                "Insurance market monitoring elevated risk signals",
                "Selective repricing expected in exposed lines",
            ],
            range_estimate="premium +5% to +12%",
        )
    else:
        return AgentOutput(
            agent_name="InsuranceRiskAgent",
            impact_direction="mixed",
            impact_magnitude="low",
            confidence=0.55,
            rationale=["No direct insurance repricing trigger detected"],
            range_estimate="premium +0% to +3%",
        )
