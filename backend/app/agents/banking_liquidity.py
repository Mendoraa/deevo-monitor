"""Banking & Liquidity Agent — evaluates financial system stress and credit exposure."""

from app.schemas import NormalizedEvent, AgentOutput


def banking_liquidity_agent(event: NormalizedEvent) -> AgentOutput:
    stress_categories = {
        "banking_stress",
        "sanctions",
        "geopolitical_conflict",
    }

    if event.category.value in stress_categories and event.severity > 0.8:
        return AgentOutput(
            agent_name="BankingLiquidityAgent",
            impact_direction="cautious",
            impact_magnitude="high",
            confidence=0.76,
            rationale=[
                "Banks likely to tighten counterparty exposure",
                "Interbank lending rates may widen under uncertainty",
                "Trade finance lines for affected corridors under review",
                "Credit risk appetite shifting defensively",
            ],
            range_estimate="tightening significant",
        )
    elif event.category.value in stress_categories:
        return AgentOutput(
            agent_name="BankingLiquidityAgent",
            impact_direction="cautious",
            impact_magnitude="moderate",
            confidence=0.70,
            rationale=[
                "Banks monitoring exposure to affected regions",
                "Funding conditions stable but watchful",
            ],
            range_estimate="tightening moderate",
        )
    else:
        return AgentOutput(
            agent_name="BankingLiquidityAgent",
            impact_direction="mixed",
            impact_magnitude="low",
            confidence=0.58,
            rationale=["Banking sector impact is second-order for this event"],
            range_estimate="stable",
        )
