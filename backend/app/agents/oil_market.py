"""Oil Market Agent — evaluates energy supply/demand impact."""

from app.schemas import NormalizedEvent, AgentOutput


def oil_market_agent(event: NormalizedEvent) -> AgentOutput:
    shock_categories = {
        "shipping_disruption",
        "energy_supply",
        "geopolitical_conflict",
        "infrastructure_damage",
    }

    if event.category.value in shock_categories:
        magnitude = "high" if event.severity > 0.75 else "moderate"
        direction = "up"
        rationale = [
            "Supply uncertainty increased due to regional instability",
            "Risk premium likely widens across energy forward curves",
            "Spot market volatility expected in 24-72h window",
        ]
        range_est = "+6% to +12%" if magnitude == "high" else "+3% to +6%"
    else:
        magnitude = "low"
        direction = "mixed"
        rationale = ["No direct oil supply shock detected"]
        range_est = "+0% to +2%"

    return AgentOutput(
        agent_name="OilMarketAgent",
        impact_direction=direction,
        impact_magnitude=magnitude,
        confidence=0.82,
        rationale=rationale,
        range_estimate=range_est,
    )
