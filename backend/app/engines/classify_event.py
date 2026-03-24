"""Event Classifier — normalizes raw input into a typed NormalizedEvent."""

from datetime import datetime, timezone
from uuid import uuid4

from app.schemas import EventCategory, EventInput, EventSeverity, NormalizedEvent

SEVERITY_MAP = {
    EventSeverity.LOW: 0.25,
    EventSeverity.MODERATE: 0.55,
    EventSeverity.HIGH: 0.80,
    EventSeverity.CRITICAL: 0.95,
}

# Keyword-based classification rules (Phase 1 — deterministic)
KEYWORD_RULES: list[tuple[list[str], EventCategory, str]] = [
    (["tanker", "shipping", "vessel", "maritime", "port blockade"],
     EventCategory.SHIPPING_DISRUPTION, "maritime_attack"),
    (["hormuz", "strait", "bab el-mandeb", "suez"],
     EventCategory.SHIPPING_DISRUPTION, "chokepoint_disruption"),
    (["refinery", "oil facility", "pipeline", "aramco", "energy infrastructure"],
     EventCategory.ENERGY_SUPPLY, "energy_infrastructure_attack"),
    (["sanction", "embargo", "trade restriction", "blacklist"],
     EventCategory.SANCTIONS, "trade_restriction"),
    (["bank run", "liquidity crisis", "credit freeze", "interbank"],
     EventCategory.BANKING_STRESS, "financial_stress"),
    (["cyberattack", "ransomware", "data breach", "cyber"],
     EventCategory.CYBER, "cyber_incident"),
    (["flood", "earthquake", "hurricane", "wildfire", "drought"],
     EventCategory.CLIMATE_DISASTER, "natural_disaster"),
    (["war", "military", "attack", "missile", "conflict", "invasion"],
     EventCategory.GEOPOLITICAL_CONFLICT, "armed_conflict"),
]


def classify_event(raw: EventInput) -> NormalizedEvent:
    """Classify and normalize a raw event input."""
    title_lower = raw.title.lower()

    # Use explicit category if provided; otherwise infer
    category = raw.category
    subtype = "general"

    if category is None:
        for keywords, cat, sub in KEYWORD_RULES:
            if any(kw in title_lower for kw in keywords):
                category = cat
                subtype = sub
                break
        else:
            category = EventCategory.GEOPOLITICAL_CONFLICT

    severity_score = SEVERITY_MAP.get(raw.severity, 0.55)

    return NormalizedEvent(
        event_id=str(uuid4()),
        title=raw.title,
        category=category,
        subtype=subtype,
        region=raw.region,
        severity=severity_score,
        source_confidence=raw.source_confidence,
        timestamp=datetime.now(timezone.utc),
    )
