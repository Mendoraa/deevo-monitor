"""Decision Insight Builder — produces actionable intelligence from analysis."""

from app.schemas import AgentOutput, NormalizedEvent

CATEGORY_INSIGHTS: dict[str, str] = {
    "shipping_disruption": (
        "Monitor maritime insurance repricing, oil spot volatility, "
        "and GCC trade corridor utilization over the next 24-72 hours. "
        "Evaluate alternative routing costs and cargo delay cascades."
    ),
    "geopolitical_conflict": (
        "Track escalation indicators and diplomatic signals. "
        "Watch for secondary effects on energy infrastructure, "
        "shipping lane closures, and insurance market reactions. "
        "GCC fiscal transmission may diverge — monitor country-specific CPI data."
    ),
    "energy_supply": (
        "Watch for secondary effects on delivered energy cost, "
        "refinery throughput, and downstream sector repricing. "
        "Assess OPEC+ response signals within 48 hours."
    ),
    "sanctions": (
        "Monitor compliance requirements across affected trade corridors. "
        "Assess banking counterparty exposure and shipping rerouting costs. "
        "Watch for secondary sanctions affecting GCC intermediaries."
    ),
    "banking_stress": (
        "Monitor interbank rates, credit default swap spreads, "
        "and central bank liquidity injection signals. "
        "Assess GCC banking sector exposure to affected institutions."
    ),
    "infrastructure_damage": (
        "Assess restoration timeline and impact on throughput capacity. "
        "Monitor insurance claim activity and secondary supply disruptions. "
        "Watch for cascading effects on dependent infrastructure."
    ),
    "climate_disaster": (
        "Monitor humanitarian response coordination and infrastructure damage assessment. "
        "Watch for supply chain disruption cascades and insurance claim volumes."
    ),
    "cyber": (
        "Assess data exfiltration scope and operational system impact. "
        "Monitor for cascading failures across connected infrastructure. "
        "Watch cyber insurance market response."
    ),
}

DEFAULT_INSIGHT = (
    "Monitor first-order market reaction and reassess if "
    "cross-signal escalation appears within 48 hours."
)


def build_decision_insight(
    event: NormalizedEvent,
    agent_outputs: list[AgentOutput],
) -> str:
    """Build a decision insight string from the event and agent analysis."""
    base = CATEGORY_INSIGHTS.get(event.category.value, DEFAULT_INSIGHT)

    # If severity is critical, prepend urgency note
    if event.severity > 0.85:
        base = (
            "ELEVATED ALERT: Event severity exceeds critical threshold. "
            "Immediate review recommended for exposed portfolios. " + base
        )

    return base
