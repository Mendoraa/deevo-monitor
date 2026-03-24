"""Causal Chain Builder — constructs a step-by-step impact propagation narrative."""

from app.schemas import AgentOutput, NormalizedEvent

# Each agent contributes a causal step based on its assessment
AGENT_CHAIN_TEMPLATES: dict[str, dict[str, str]] = {
    "ShippingLogisticsAgent": {
        "high": "Shipping lanes face severe disruption — transit delays and rerouting costs spike",
        "moderate": "Maritime logistics under elevated stress — localized delays expected",
        "low": "Shipping impact remains contained to indirect channels",
    },
    "InsuranceRiskAgent": {
        "high": "Marine and political risk insurance repricing accelerated across exposed lines",
        "moderate": "Insurance market signals selective repricing in affected corridors",
        "low": "Insurance pricing stable — monitoring for secondary triggers",
    },
    "OilMarketAgent": {
        "high": "Oil supply uncertainty elevated — risk premium widens in energy markets",
        "moderate": "Energy price expectations adjust upward on supply concern",
        "low": "Oil market impact limited — no material supply disruption detected",
    },
    "BankingLiquidityAgent": {
        "high": "Banks tighten counterparty exposure and trade finance lines under stress",
        "moderate": "Banking sector adopts cautious stance — monitoring funding conditions",
        "low": "Banking liquidity impact negligible for current event profile",
    },
    "GCCFiscalAgent": {
        "high": "GCC fiscal effects diverge sharply — oil exporters gain while importers face inflation headwinds",
        "moderate": "GCC economies experience mixed fiscal transmission — country-specific monitoring warranted",
        "low": "GCC fiscal impact contained — second-order channels remain muted",
    },
}


def build_causal_chain(
    event: NormalizedEvent,
    agent_outputs: list[AgentOutput],
) -> list[str]:
    """Build an ordered causal chain from agent outputs."""
    chain: list[str] = [f"Event detected: {event.title}"]

    for output in agent_outputs:
        templates = AGENT_CHAIN_TEMPLATES.get(output.agent_name)
        if templates:
            step = templates.get(output.impact_magnitude, templates.get("low", ""))
            if step:
                chain.append(step)

    chain.append(
        f"Economic transmission analysis complete — {len(agent_outputs)} agents evaluated"
    )

    return chain
