"""Shipping & Logistics Agent — evaluates maritime and supply-chain impact."""

from app.schemas import NormalizedEvent, AgentOutput


def shipping_logistics_agent(event: NormalizedEvent) -> AgentOutput:
    title_lower = event.title.lower()
    maritime_keywords = ["tanker", "shipping", "port", "strait", "hormuz", "vessel", "maritime", "suez"]
    is_maritime = any(kw in title_lower for kw in maritime_keywords)

    if is_maritime and event.severity > 0.7:
        return AgentOutput(
            agent_name="ShippingLogisticsAgent",
            impact_direction="down",
            impact_magnitude="high",
            confidence=0.85,
            rationale=[
                "Critical shipping lane faces disruption risk",
                "Transit delays may increase 15-30% in affected corridor",
                "Rerouting costs and insurance surcharges likely to spike",
            ],
            range_estimate="delay +15% to +30%",
        )
    elif is_maritime:
        return AgentOutput(
            agent_name="ShippingLogisticsAgent",
            impact_direction="down",
            impact_magnitude="moderate",
            confidence=0.78,
            rationale=[
                "Maritime activity may face localized disruption",
                "Alternative routing being evaluated by operators",
            ],
            range_estimate="delay +8% to +15%",
        )
    else:
        return AgentOutput(
            agent_name="ShippingLogisticsAgent",
            impact_direction="mixed",
            impact_magnitude="low",
            confidence=0.60,
            rationale=["Logistics impact is indirect for this event type"],
            range_estimate="delay +0% to +5%",
        )
