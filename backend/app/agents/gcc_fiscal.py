"""GCC Fiscal Agent — evaluates country-specific economic spillover across GCC states."""

from app.schemas import NormalizedEvent, AgentOutput


# GCC country-specific sensitivity profiles
GCC_PROFILES = {
    "saudi": {
        "oil_dependency": 0.85,
        "trade_exposure": 0.60,
        "fiscal_buffer": 0.80,
        "inflation_sensitivity": 0.55,
    },
    "uae": {
        "oil_dependency": 0.55,
        "trade_exposure": 0.90,
        "fiscal_buffer": 0.85,
        "inflation_sensitivity": 0.65,
    },
    "kuwait": {
        "oil_dependency": 0.90,
        "trade_exposure": 0.45,
        "fiscal_buffer": 0.75,
        "inflation_sensitivity": 0.50,
    },
    "qatar": {
        "oil_dependency": 0.70,
        "trade_exposure": 0.65,
        "fiscal_buffer": 0.88,
        "inflation_sensitivity": 0.55,
    },
    "bahrain": {
        "oil_dependency": 0.60,
        "trade_exposure": 0.70,
        "fiscal_buffer": 0.45,
        "inflation_sensitivity": 0.72,
    },
    "oman": {
        "oil_dependency": 0.78,
        "trade_exposure": 0.60,
        "fiscal_buffer": 0.50,
        "inflation_sensitivity": 0.65,
    },
}


def gcc_fiscal_agent(event: NormalizedEvent) -> AgentOutput:
    oil_positive = event.category.value in {
        "energy_supply",
        "shipping_disruption",
        "geopolitical_conflict",
    }

    if oil_positive and event.severity > 0.7:
        return AgentOutput(
            agent_name="GCCFiscalAgent",
            impact_direction="mixed",
            impact_magnitude="high" if event.severity > 0.85 else "moderate",
            confidence=0.77,
            rationale=[
                "Oil exporters may benefit fiscally from higher energy prices",
                "Imported inflation and logistics costs rise simultaneously",
                "Trade-dependent economies (UAE, Bahrain) face logistics headwinds",
                "Fiscal buffers in Saudi and Qatar provide resilience",
                "Oman and Bahrain have thinner margins — higher vulnerability",
            ],
            range_estimate="divergent across GCC states",
        )
    else:
        return AgentOutput(
            agent_name="GCCFiscalAgent",
            impact_direction="mixed",
            impact_magnitude="low",
            confidence=0.62,
            rationale=[
                "GCC fiscal impact contained for this event category",
                "Second-order transmission channels remain muted",
            ],
            range_estimate="limited divergence",
        )
