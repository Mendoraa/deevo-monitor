"""Agent Router — determines which economic agents to activate for a given event."""

from app.schemas import EventCategory, NormalizedEvent

# Maps each event category to the agents that should evaluate it
CATEGORY_AGENT_MAP: dict[str, list[str]] = {
    "geopolitical_conflict": [
        "OilMarketAgent",
        "ShippingLogisticsAgent",
        "InsuranceRiskAgent",
        "BankingLiquidityAgent",
        "GCCFiscalAgent",
    ],
    "shipping_disruption": [
        "ShippingLogisticsAgent",
        "InsuranceRiskAgent",
        "OilMarketAgent",
        "GCCFiscalAgent",
    ],
    "energy_supply": [
        "OilMarketAgent",
        "InsuranceRiskAgent",
        "BankingLiquidityAgent",
        "GCCFiscalAgent",
    ],
    "sanctions": [
        "BankingLiquidityAgent",
        "ShippingLogisticsAgent",
        "OilMarketAgent",
        "GCCFiscalAgent",
    ],
    "banking_stress": [
        "BankingLiquidityAgent",
        "InsuranceRiskAgent",
        "GCCFiscalAgent",
    ],
    "infrastructure_damage": [
        "OilMarketAgent",
        "InsuranceRiskAgent",
        "ShippingLogisticsAgent",
        "GCCFiscalAgent",
    ],
    "climate_disaster": [
        "InsuranceRiskAgent",
        "ShippingLogisticsAgent",
        "GCCFiscalAgent",
    ],
    "cyber": [
        "BankingLiquidityAgent",
        "InsuranceRiskAgent",
        "GCCFiscalAgent",
    ],
    "trade_policy": [
        "ShippingLogisticsAgent",
        "BankingLiquidityAgent",
        "GCCFiscalAgent",
    ],
}


def route_agents(event: NormalizedEvent) -> list[str]:
    """Return ordered list of agent names that should evaluate this event."""
    return CATEGORY_AGENT_MAP.get(event.category.value, ["GCCFiscalAgent"])
