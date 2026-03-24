"""Insurance Intelligence Engine — simulates insurance sector impact from economic events.

This engine models:
- Affected lines of business (marine, property, political risk, etc.)
- Claims projections (volume, severity, timeline)
- Underwriting risk posture adjustments
- IFRS 17 / PDPL regulatory flags
- GCC insurance market exposure per country
"""

from app.schemas import NormalizedEvent, AgentOutput
from app.schemas.insurance import (
    InsuranceAnalysis,
    InsuranceLineImpact,
    UnderwritingRisk,
    ClaimsProjection,
)


# ═══════════════════════════════════════════════════════
# Insurance Line Definitions
# ═══════════════════════════════════════════════════════

INSURANCE_LINES = {
    "marine_cargo": {
        "triggers": {"shipping_disruption", "geopolitical_conflict", "infrastructure_damage"},
        "base_claims_increase": 18.0,
        "base_loss_ratio_delta": 12.0,
        "base_premium_adjustment": 15.0,
        "fraud_sensitivity": 0.25,
    },
    "marine_hull": {
        "triggers": {"shipping_disruption", "geopolitical_conflict"},
        "base_claims_increase": 22.0,
        "base_loss_ratio_delta": 15.0,
        "base_premium_adjustment": 20.0,
        "fraud_sensitivity": 0.15,
    },
    "political_risk": {
        "triggers": {"geopolitical_conflict", "sanctions", "trade_policy"},
        "base_claims_increase": 30.0,
        "base_loss_ratio_delta": 20.0,
        "base_premium_adjustment": 25.0,
        "fraud_sensitivity": 0.10,
    },
    "property": {
        "triggers": {"infrastructure_damage", "climate_disaster", "geopolitical_conflict"},
        "base_claims_increase": 15.0,
        "base_loss_ratio_delta": 10.0,
        "base_premium_adjustment": 12.0,
        "fraud_sensitivity": 0.30,
    },
    "energy": {
        "triggers": {"energy_supply", "infrastructure_damage", "geopolitical_conflict"},
        "base_claims_increase": 25.0,
        "base_loss_ratio_delta": 18.0,
        "base_premium_adjustment": 22.0,
        "fraud_sensitivity": 0.12,
    },
    "trade_credit": {
        "triggers": {"sanctions", "banking_stress", "trade_policy"},
        "base_claims_increase": 12.0,
        "base_loss_ratio_delta": 8.0,
        "base_premium_adjustment": 10.0,
        "fraud_sensitivity": 0.35,
    },
    "cyber": {
        "triggers": {"cyber"},
        "base_claims_increase": 40.0,
        "base_loss_ratio_delta": 25.0,
        "base_premium_adjustment": 30.0,
        "fraud_sensitivity": 0.20,
    },
    "liability": {
        "triggers": {"infrastructure_damage", "climate_disaster", "cyber"},
        "base_claims_increase": 10.0,
        "base_loss_ratio_delta": 6.0,
        "base_premium_adjustment": 8.0,
        "fraud_sensitivity": 0.18,
    },
}

# Severity multipliers
SEVERITY_MULTIPLIER = {
    0.25: 0.5,   # low
    0.55: 1.0,   # moderate
    0.80: 1.5,   # high
    0.95: 2.2,   # critical
}

# GCC Insurance market profiles
GCC_INSURANCE_PROFILES = {
    "saudi": {
        "market_size": "largest in GCC",
        "primary_lines": ["motor", "medical", "property", "energy"],
        "regulatory_body": "SAMA",
        "sensitivity": 0.70,
    },
    "uae": {
        "market_size": "second largest, most diversified",
        "primary_lines": ["marine", "property", "motor", "trade_credit"],
        "regulatory_body": "CBUAE",
        "sensitivity": 0.80,
    },
    "kuwait": {
        "market_size": "moderate, oil-concentrated",
        "primary_lines": ["energy", "property", "motor"],
        "regulatory_body": "IRU",
        "sensitivity": 0.55,
    },
    "qatar": {
        "market_size": "growing, LNG-linked",
        "primary_lines": ["energy", "marine", "property"],
        "regulatory_body": "QCB",
        "sensitivity": 0.60,
    },
    "bahrain": {
        "market_size": "small, financial hub",
        "primary_lines": ["trade_credit", "liability", "property"],
        "regulatory_body": "CBB",
        "sensitivity": 0.75,
    },
    "oman": {
        "market_size": "small, port-dependent",
        "primary_lines": ["marine", "property", "motor"],
        "regulatory_body": "CMA",
        "sensitivity": 0.65,
    },
}


def _get_severity_multiplier(severity: float) -> float:
    """Get the closest severity multiplier."""
    closest = min(SEVERITY_MULTIPLIER.keys(), key=lambda x: abs(x - severity))
    return SEVERITY_MULTIPLIER[closest]


def _assess_line(
    line_name: str,
    line_config: dict,
    event: NormalizedEvent,
    severity_mult: float,
) -> InsuranceLineImpact | None:
    """Assess impact on a single insurance line."""
    if event.category.value not in line_config["triggers"]:
        return None

    claims_pct = round(line_config["base_claims_increase"] * severity_mult, 1)
    loss_delta = round(line_config["base_loss_ratio_delta"] * severity_mult, 1)
    premium_adj = round(line_config["base_premium_adjustment"] * severity_mult, 1)
    fraud_prob = min(round(line_config["fraud_sensitivity"] * severity_mult, 3), 0.95)
    reinsurance = claims_pct > 20.0

    if claims_pct > 35:
        severity_label = "critical"
    elif claims_pct > 20:
        severity_label = "high"
    elif claims_pct > 10:
        severity_label = "moderate"
    else:
        severity_label = "low"

    rationale = (
        f"{line_name.replace('_', ' ').title()} line exposed to {event.category.value.replace('_', ' ')}. "
        f"Estimated claims increase {claims_pct}%, loss ratio delta +{loss_delta}pp. "
        f"{'Reinsurance treaty trigger likely.' if reinsurance else 'Within retention limits.'}"
    )

    return InsuranceLineImpact(
        line=line_name,
        claims_increase_pct=claims_pct,
        loss_ratio_delta=loss_delta,
        premium_adjustment_pct=premium_adj,
        fraud_probability=fraud_prob,
        reinsurance_trigger=reinsurance,
        severity_label=severity_label,
        rationale=rationale,
    )


def _assess_underwriting(
    affected_lines: list[InsuranceLineImpact],
    event: NormalizedEvent,
) -> UnderwritingRisk:
    """Determine underwriting posture."""
    high_lines = [l for l in affected_lines if l.severity_label in ("high", "critical")]
    total_exposure = len(affected_lines) / max(len(INSURANCE_LINES), 1) * 100

    if len(high_lines) >= 3:
        posture = "restrictive"
        action = "Halt new business in affected lines. Review all pending quotes for exposed regions."
    elif len(high_lines) >= 1:
        posture = "cautious"
        action = "Apply additional underwriting scrutiny for affected lines. Increase deductibles on new quotes."
    elif affected_lines:
        posture = "normal"
        action = "Monitor affected lines. No immediate underwriting changes required."
    else:
        posture = "normal"
        action = "No underwriting action required."

    concentration = (
        f"{len(affected_lines)} of {len(INSURANCE_LINES)} lines exposed, "
        f"concentrated in {event.region} region. "
        f"{'High geographic concentration risk.' if total_exposure > 40 else 'Manageable concentration.'}"
    )

    return UnderwritingRisk(
        new_business_risk=posture,
        portfolio_exposure_pct=round(total_exposure, 1),
        concentration_risk=concentration,
        recommended_action=action,
    )


def _project_claims(
    affected_lines: list[InsuranceLineImpact],
    event: NormalizedEvent,
) -> ClaimsProjection:
    """Project claims volume and timeline."""
    if not affected_lines:
        return ClaimsProjection(
            estimated_claim_count_increase="+0%",
            average_claim_severity_change="+0%",
            catastrophe_reserve_trigger=False,
            ibnr_adjustment_needed=False,
            estimated_timeline_days=0,
        )

    avg_claims_increase = sum(l.claims_increase_pct for l in affected_lines) / len(affected_lines)
    max_claims_increase = max(l.claims_increase_pct for l in affected_lines)

    count_range = f"+{int(avg_claims_increase)}% to +{int(max_claims_increase)}%"
    severity_range = f"+{int(avg_claims_increase * 0.6)}% to +{int(max_claims_increase * 0.8)}%"

    cat_trigger = max_claims_increase > 30
    ibnr = any(l.line in ("marine_cargo", "marine_hull", "political_risk") for l in affected_lines)

    # Marine claims = fast (days). Political risk = slow (weeks). Property = medium.
    if any(l.line.startswith("marine") for l in affected_lines):
        timeline = 7
    elif any(l.line == "political_risk" for l in affected_lines):
        timeline = 45
    else:
        timeline = 21

    return ClaimsProjection(
        estimated_claim_count_increase=count_range,
        average_claim_severity_change=severity_range,
        catastrophe_reserve_trigger=cat_trigger,
        ibnr_adjustment_needed=ibnr,
        estimated_timeline_days=timeline,
    )


def _gcc_insurance_exposure(event: NormalizedEvent) -> dict[str, str]:
    """Assess per-country GCC insurance market exposure."""
    result = {}
    for country, profile in GCC_INSURANCE_PROFILES.items():
        exposure = profile["sensitivity"] * event.severity
        exposed_lines = [
            l for l in profile["primary_lines"]
            if any(l in line_cfg.get("triggers", set())
                   for line_name, line_cfg in INSURANCE_LINES.items()
                   if event.category.value in line_cfg["triggers"] and l in line_name)
        ]

        if exposure > 0.6:
            level = "HIGH"
            desc = f"Significant exposure — {profile['market_size']}. "
        elif exposure > 0.35:
            level = "MODERATE"
            desc = f"Moderate exposure — {profile['market_size']}. "
        else:
            level = "LOW"
            desc = f"Limited direct exposure — {profile['market_size']}. "

        desc += f"Regulated by {profile['regulatory_body']}. "
        desc += f"Primary affected lines: {', '.join(profile['primary_lines'][:3])}."

        result[country] = f"[{level}] {desc}"

    return result


def _regulatory_flags(
    affected_lines: list[InsuranceLineImpact],
    claims: ClaimsProjection,
    event: NormalizedEvent,
) -> list[str]:
    """Identify regulatory compliance flags."""
    flags = []

    if claims.catastrophe_reserve_trigger:
        flags.append("IFRS 17: Catastrophe reserve adequacy review required")

    if claims.ibnr_adjustment_needed:
        flags.append("IFRS 17: IBNR reserve adjustment warranted — incurred but not reported claims expected")

    if any(l.fraud_probability > 0.3 for l in affected_lines):
        flags.append("PDPL: Enhanced fraud monitoring required — elevated fraud probability detected")

    if event.severity > 0.85:
        flags.append("Solvency: Stress test recommended — critical event severity may impact capital adequacy")

    if any(l.reinsurance_trigger for l in affected_lines):
        flags.append("Reinsurance: Treaty notification required — retention limits may be breached")

    high_count = sum(1 for l in affected_lines if l.severity_label in ("high", "critical"))
    if high_count >= 3:
        flags.append("Board notification: Multiple lines at high/critical severity — requires governance escalation")

    return flags


def run_insurance_analysis(
    event: NormalizedEvent,
    agent_outputs: list[AgentOutput] | None = None,
) -> InsuranceAnalysis:
    """Run the full insurance intelligence pipeline."""

    severity_mult = _get_severity_multiplier(event.severity)

    # Assess each insurance line
    affected_lines: list[InsuranceLineImpact] = []
    for line_name, line_config in INSURANCE_LINES.items():
        impact = _assess_line(line_name, line_config, event, severity_mult)
        if impact:
            affected_lines.append(impact)

    # Sort by claims increase (highest first)
    affected_lines.sort(key=lambda x: x.claims_increase_pct, reverse=True)

    # Underwriting assessment
    underwriting = _assess_underwriting(affected_lines, event)

    # Claims projection
    claims = _project_claims(affected_lines, event)

    # GCC exposure
    gcc_exposure = _gcc_insurance_exposure(event)

    # Regulatory flags
    reg_flags = _regulatory_flags(affected_lines, claims, event)

    # Overall risk level
    if any(l.severity_label == "critical" for l in affected_lines):
        overall_risk = "critical"
    elif any(l.severity_label == "high" for l in affected_lines):
        overall_risk = "high"
    elif affected_lines:
        overall_risk = "moderate"
    else:
        overall_risk = "low"

    # Confidence based on source and number of affected lines
    confidence = round(min(event.source_confidence * 0.9 + 0.05 * len(affected_lines), 0.95), 2)

    # Decision recommendation
    if overall_risk == "critical":
        recommendation = (
            "Immediate action required: activate crisis response protocol. "
            "Review all exposed portfolios, notify reinsurers, and prepare board briefing. "
            "Consider temporary suspension of new business in highest-impact lines."
        )
    elif overall_risk == "high":
        recommendation = (
            "Elevated monitoring: convene risk committee within 24 hours. "
            "Review concentration risk in affected lines. "
            "Apply enhanced underwriting controls for new business."
        )
    elif overall_risk == "moderate":
        recommendation = (
            "Standard monitoring: track claims development in affected lines. "
            "Review pricing adequacy at next renewal cycle. "
            "No immediate portfolio action required."
        )
    else:
        recommendation = "No insurance action required. Continue routine monitoring."

    return InsuranceAnalysis(
        event_id=event.event_id,
        overall_risk_level=overall_risk,
        confidence=confidence,
        affected_lines=affected_lines,
        underwriting_risk=underwriting,
        claims_projection=claims,
        regulatory_flags=reg_flags,
        gcc_insurance_exposure=gcc_exposure,
        decision_recommendation=recommendation,
    )
