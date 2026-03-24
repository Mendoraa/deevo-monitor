"""Insurance Intelligence Layer schemas — deep insurance impact modeling."""

from __future__ import annotations
from pydantic import BaseModel, Field


class InsuranceLineImpact(BaseModel):
    """Impact assessment for a single line of business."""
    line: str                               # e.g. "marine_cargo", "property", "political_risk"
    claims_increase_pct: float = Field(ge=0)
    loss_ratio_delta: float                 # can be negative (improvement) or positive (deterioration)
    premium_adjustment_pct: float
    fraud_probability: float = Field(ge=0.0, le=1.0)
    reinsurance_trigger: bool
    severity_label: str                     # low | moderate | high | critical
    rationale: str


class UnderwritingRisk(BaseModel):
    """Underwriting risk assessment post-event."""
    new_business_risk: str                  # restrictive | cautious | normal | opportunistic
    portfolio_exposure_pct: float           # % of portfolio exposed
    concentration_risk: str                 # description of geographic/sector concentration
    recommended_action: str


class ClaimsProjection(BaseModel):
    """Claims volume and cost projection."""
    estimated_claim_count_increase: str     # e.g. "+15% to +30%"
    average_claim_severity_change: str      # e.g. "+8% to +20%"
    catastrophe_reserve_trigger: bool
    ibnr_adjustment_needed: bool            # Incurred But Not Reported
    estimated_timeline_days: int            # how many days until claims materialize


class InsuranceAnalysis(BaseModel):
    """Full insurance intelligence output."""
    event_id: str
    overall_risk_level: str                 # low | moderate | high | critical
    confidence: float = Field(ge=0.0, le=1.0)
    affected_lines: list[InsuranceLineImpact]
    underwriting_risk: UnderwritingRisk
    claims_projection: ClaimsProjection
    regulatory_flags: list[str]             # IFRS 17, PDPL, solvency ratio concerns
    gcc_insurance_exposure: dict[str, str]  # per-country insurance market impact
    decision_recommendation: str
