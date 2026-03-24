"""Schemas for economic events — the core data contract."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class EventCategory(str, Enum):
    GEOPOLITICAL_CONFLICT = "geopolitical_conflict"
    SHIPPING_DISRUPTION = "shipping_disruption"
    ENERGY_SUPPLY = "energy_supply"
    SANCTIONS = "sanctions"
    BANKING_STRESS = "banking_stress"
    INFRASTRUCTURE_DAMAGE = "infrastructure_damage"
    TRADE_POLICY = "trade_policy"
    CLIMATE_DISASTER = "climate_disaster"
    CYBER = "cyber"


class EventSeverity(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"


class EventInput(BaseModel):
    """Raw event coming from a user or the monitor feed."""

    title: str = Field(..., min_length=5, max_length=500)
    category: Optional[EventCategory] = None
    severity: EventSeverity = EventSeverity.MODERATE
    region: str = "Middle East"
    source_confidence: float = Field(default=0.75, ge=0.0, le=1.0)


class NormalizedEvent(BaseModel):
    """Event after classification and enrichment."""

    event_id: str
    title: str
    category: EventCategory
    subtype: str = "general"
    region: str
    severity: float = Field(ge=0.0, le=1.0)
    source_confidence: float = Field(ge=0.0, le=1.0)
    timestamp: datetime


class AgentOutput(BaseModel):
    """Output from a single economic agent."""

    agent_name: str
    impact_direction: str  # up | down | mixed | cautious
    impact_magnitude: str  # low | moderate | high
    confidence: float = Field(ge=0.0, le=1.0)
    rationale: list[str]
    range_estimate: Optional[str] = None


class ScenarioBundle(BaseModel):
    base_case: dict[str, str]
    elevated_case: dict[str, str]
    severe_case: dict[str, str]


class EconomicAnalysisResponse(BaseModel):
    """Full response from the Economic Layer."""

    event_summary: str
    normalized_event: NormalizedEvent
    agent_outputs: list[AgentOutput]
    causal_chain: list[str]
    scenarios: ScenarioBundle
    sector_impacts: dict
    gcc_breakdown: dict[str, str]
    decision_insight: str
