"""Main orchestrator — runs the full Economic Layer analysis pipeline."""

from app.schemas import (
    AgentOutput,
    EconomicAnalysisResponse,
    EventInput,
)
from app.agents import AGENT_REGISTRY
from .classify_event import classify_event
from .route_agents import route_agents
from .build_causal_chain import build_causal_chain
from .score_scenarios import score_scenarios
from .build_decision_insight import build_decision_insight

# GCC country breakdown templates
GCC_BREAKDOWN_TEMPLATES: dict[str, dict[str, str]] = {
    "shipping_disruption": {
        "saudi": "Mixed — fiscal upside from oil offset by logistics cost pressure",
        "uae": "Negative — trade hub sensitivity elevated, port throughput at risk",
        "kuwait": "Moderate positive — oil revenue supportive, logistics exposure limited",
        "qatar": "Mixed — LNG revenue stable but shipping rerouting adds cost",
        "bahrain": "Negative — import dependency and thin fiscal buffer amplify impact",
        "oman": "Negative — port and shipping corridor exposure elevated",
    },
    "geopolitical_conflict": {
        "saudi": "Mixed — fiscal benefit from oil but security spending and inflation risk rise",
        "uae": "Cautious — diversified economy provides buffer but trade exposure rises",
        "kuwait": "Moderate positive — oil fiscal strength but proximity risk factors increase",
        "qatar": "Resilient — strong fiscal buffers and LNG demand insulation",
        "bahrain": "Vulnerable — thinnest fiscal margins and highest inflation sensitivity in GCC",
        "oman": "Cautious — oil revenue supports but fiscal buffer insufficient for prolonged stress",
    },
    "energy_supply": {
        "saudi": "Positive — direct fiscal benefit from energy price uplift",
        "uae": "Mixed — partial oil benefit offset by higher input costs for diversified sectors",
        "kuwait": "Positive — highly leveraged to oil price upside",
        "qatar": "Positive — gas and LNG portfolio benefits from energy uncertainty",
        "bahrain": "Mixed — modest oil benefit but downstream costs rise",
        "oman": "Positive — oil revenue improvement supports fiscal position",
    },
}

DEFAULT_GCC_BREAKDOWN = {
    "saudi": "Monitoring — no material fiscal transmission detected",
    "uae": "Monitoring — trade diversification provides buffer",
    "kuwait": "Monitoring — oil fiscal position stable",
    "qatar": "Monitoring — LNG revenue insulated",
    "bahrain": "Monitoring — fiscal sensitivity elevated but contained",
    "oman": "Monitoring — watching for second-order effects",
}


def run_economic_analysis(event_input: EventInput) -> EconomicAnalysisResponse:
    """Execute the full economic analysis pipeline."""

    # Step 1: Classify
    normalized = classify_event(event_input)

    # Step 2: Route to agents
    agent_names = route_agents(normalized)

    # Step 3: Execute agents
    agent_outputs: list[AgentOutput] = []
    for name in agent_names:
        agent_fn = AGENT_REGISTRY.get(name)
        if agent_fn:
            agent_outputs.append(agent_fn(normalized))

    # Step 4: Build causal chain
    causal_chain = build_causal_chain(normalized, agent_outputs)

    # Step 5: Score scenarios
    scenarios = score_scenarios(normalized)

    # Step 6: Build decision insight
    decision_insight = build_decision_insight(normalized, agent_outputs)

    # Step 7: Assemble sector impacts
    sector_impacts = {}
    for output in agent_outputs:
        key = output.agent_name.replace("Agent", "").lower()
        sector_impacts[key] = {
            "direction": output.impact_direction,
            "magnitude": output.impact_magnitude,
            "range": output.range_estimate,
            "confidence": output.confidence,
        }

    # Step 8: GCC breakdown
    gcc_breakdown = GCC_BREAKDOWN_TEMPLATES.get(
        normalized.category.value, DEFAULT_GCC_BREAKDOWN
    )

    return EconomicAnalysisResponse(
        event_summary=normalized.title,
        normalized_event=normalized,
        agent_outputs=agent_outputs,
        causal_chain=causal_chain,
        scenarios=scenarios,
        sector_impacts=sector_impacts,
        gcc_breakdown=gcc_breakdown,
        decision_insight=decision_insight,
    )
