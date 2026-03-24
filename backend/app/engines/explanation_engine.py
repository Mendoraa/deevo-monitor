"""Explanation Engine — generates human-readable causal explanations.

This engine takes the outputs from all three pipelines (economic, insurance, graph)
and synthesizes a structured explanation that answers:
- WHAT happened
- WHY it matters
- HOW it propagates
- WHAT to do about it
"""

from __future__ import annotations
from pydantic import BaseModel
from app.schemas import NormalizedEvent, AgentOutput, EconomicAnalysisResponse
from app.schemas.insurance import InsuranceAnalysis
from app.schemas.graph import GraphPropagationResult


class ExplanationBundle(BaseModel):
    """Structured explanation output — the 'brain' of Deevo Cortex."""
    event_id: str
    what_happened: str
    why_it_matters: str
    how_it_propagates: list[str]
    economic_narrative: str
    insurance_narrative: str
    gcc_narrative: str
    what_to_do: str
    confidence_assessment: str
    systemic_risk_summary: str


def build_explanation(
    event: NormalizedEvent,
    economic: EconomicAnalysisResponse,
    insurance: InsuranceAnalysis,
    graph: GraphPropagationResult,
) -> ExplanationBundle:
    """Build a full explanation bundle from all analysis pipelines."""

    # ─── WHAT HAPPENED ────────────────────────────────────
    severity_word = "critical" if event.severity > 0.85 else "high" if event.severity > 0.65 else "moderate"
    what_happened = (
        f"A {severity_word}-severity {event.category.value.replace('_', ' ')} event has been detected: "
        f'"{event.title}". '
        f"Region: {event.region}. Source confidence: {event.source_confidence * 100:.0f}%."
    )

    # ─── WHY IT MATTERS ───────────────────────────────────
    agent_count = len(economic.agent_outputs)
    line_count = len(insurance.affected_lines)
    graph_steps = graph.total_steps
    critical_nodes = sum(1 for n in graph.nodes if n.current_state == "critical")

    why_parts = []
    why_parts.append(f"This event activates {agent_count} economic agents and impacts {line_count} insurance lines.")
    if critical_nodes > 0:
        why_parts.append(f"{critical_nodes} nodes in the economic graph have reached critical state.")
    why_parts.append(f"The causal propagation chain spans {graph_steps} steps across {graph.max_depth_reached} depth layers.")
    if graph.systemic_risk_score > 0.5:
        why_parts.append(f"Systemic risk score is elevated at {graph.systemic_risk_score:.2f} — cross-sector contagion is material.")

    why_it_matters = " ".join(why_parts)

    # ─── HOW IT PROPAGATES ────────────────────────────────
    how_steps = []
    for step in graph.propagation_trace[:8]:  # cap at 8 for readability
        how_steps.append(step.explanation)

    # ─── ECONOMIC NARRATIVE ───────────────────────────────
    sector_descriptions = []
    for sector_key, impact in economic.sector_impacts.items():
        direction = impact.get("direction", "mixed")
        magnitude = impact.get("magnitude", "unknown")
        range_est = impact.get("range", "")
        sector_descriptions.append(
            f"{sector_key.replace('_', ' ').title()}: {direction} ({magnitude})"
            + (f" — {range_est}" if range_est else "")
        )

    economic_narrative = (
        f"The economic analysis indicates {len(economic.agent_outputs)} sectors are affected. "
        + ". ".join(sector_descriptions) + ". "
        + f"Under the severe scenario, impacts could reach: "
        + ", ".join(f"{k}: {v}" for k, v in economic.scenarios.severe_case.items())
        + "."
    )

    # ─── INSURANCE NARRATIVE ──────────────────────────────
    if insurance.affected_lines:
        top_line = insurance.affected_lines[0]
        insurance_narrative = (
            f"Insurance impact is assessed as {insurance.overall_risk_level.upper()}. "
            f"The most exposed line is {top_line.line.replace('_', ' ')} "
            f"(claims +{top_line.claims_increase_pct}%, loss ratio +{top_line.loss_ratio_delta}pp). "
            f"Claims are expected to materialize within {insurance.claims_projection.estimated_timeline_days} days. "
        )
        if insurance.claims_projection.catastrophe_reserve_trigger:
            insurance_narrative += "Catastrophe reserve triggers are ACTIVATED. "
        if insurance.regulatory_flags:
            insurance_narrative += f"Regulatory flags: {'; '.join(insurance.regulatory_flags[:3])}."
    else:
        insurance_narrative = "No material insurance impact detected for this event."

    # ─── GCC NARRATIVE ────────────────────────────────────
    gcc_parts = []
    for country, assessment in economic.gcc_breakdown.items():
        gcc_parts.append(f"{country.upper()}: {assessment}")
    gcc_narrative = "GCC-specific impact: " + ". ".join(gcc_parts) + "."

    # ─── WHAT TO DO ───────────────────────────────────────
    what_to_do = economic.decision_insight
    if insurance.overall_risk_level in ("high", "critical"):
        what_to_do += f" Insurance action: {insurance.decision_recommendation}"

    # ─── CONFIDENCE ASSESSMENT ────────────────────────────
    avg_confidence = (
        sum(a.confidence for a in economic.agent_outputs) / max(len(economic.agent_outputs), 1)
    )
    confidence_assessment = (
        f"Overall analysis confidence: {avg_confidence:.0%} (economic) / "
        f"{insurance.confidence:.0%} (insurance). "
        f"Source confidence: {event.source_confidence:.0%}. "
        f"{'Analysis is high-confidence and actionable.' if avg_confidence > 0.7 else 'Analysis has moderate confidence — corroborate with additional signals.'}"
    )

    # ─── SYSTEMIC RISK ────────────────────────────────────
    if graph.systemic_risk_score > 0.6:
        systemic_summary = (
            f"ELEVATED SYSTEMIC RISK ({graph.systemic_risk_score:.2f}). "
            f"Critical path: {' → '.join(graph.critical_path[:6])}. "
            "Cross-sector contagion is material — monitor for cascade effects."
        )
    elif graph.systemic_risk_score > 0.3:
        systemic_summary = (
            f"Moderate systemic risk ({graph.systemic_risk_score:.2f}). "
            f"Primary transmission path: {' → '.join(graph.critical_path[:4])}. "
            "Localized impact with potential for broader transmission."
        )
    else:
        systemic_summary = (
            f"Low systemic risk ({graph.systemic_risk_score:.2f}). "
            "Event impact is contained within primary sector."
        )

    return ExplanationBundle(
        event_id=event.event_id,
        what_happened=what_happened,
        why_it_matters=why_it_matters,
        how_it_propagates=how_steps,
        economic_narrative=economic_narrative,
        insurance_narrative=insurance_narrative,
        gcc_narrative=gcc_narrative,
        what_to_do=what_to_do,
        confidence_assessment=confidence_assessment,
        systemic_risk_summary=systemic_summary,
    )
