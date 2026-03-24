"""Core enums for Deevo Cortex Phase 3."""

from enum import Enum


class MarketCode(str, Enum):
    KWT = "KWT"
    SAU = "SAU"
    UAE = "UAE"
    QAT = "QAT"
    BHR = "BHR"
    OMN = "OMN"


class NodeType(str, Enum):
    MACRO = "macro"
    INSURANCE = "insurance"
    PORTFOLIO = "portfolio"
    INFRASTRUCTURE = "infrastructure"
    COMMODITY = "commodity"
    SECTOR = "sector"
    METRIC = "metric"
    COUNTRY = "country"


class RelationshipType(str, Enum):
    AFFECTS = "affects"
    DELAYS = "delays"
    REPRICES = "reprices"
    CONSTRAINS = "constrains"
    AMPLIFIES = "amplifies"
    HEDGES = "hedges"
    DISRUPTS = "disrupts"
    INCREASES = "increases"
    TRIGGERS = "triggers"
    EXPOSED_TO = "exposed_to"


class SignalCategory(str, Enum):
    MACRO = "macro"
    INSURANCE = "insurance"
    PORTFOLIO = "portfolio"


class SourceType(str, Enum):
    MANUAL = "manual"
    API = "api"
    SCHEDULED = "scheduled"
    IMPORT = "import"


class RunType(str, Enum):
    SCHEDULED = "scheduled"
    ON_DEMAND = "on_demand"
    EVENT_TRIGGERED = "event_triggered"


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"


class CalibrationMode(str, Enum):
    MANUAL = "manual"
    SEMI_AUTO = "semi_auto"
    AUTO = "auto"


class ActionType(str, Enum):
    UNDERWRITING_CONTROL = "underwriting_control"
    FRAUD_INVESTIGATION = "fraud_investigation"
    RESERVE_REVIEW = "reserve_review"
    PRICING_ADJUSTMENT = "pricing_adjustment"
    PORTFOLIO_REVIEW = "portfolio_review"
    EXECUTIVE_ESCALATION = "executive_escalation"
    CONTAINMENT_STRATEGY = "containment_strategy"
    MONITORING_INCREASE = "monitoring_increase"


class ActionPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ActionStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DISMISSED = "dismissed"


class AuditEventType(str, Enum):
    SIGNAL_INGESTED = "signal_ingested"
    SCORING_RUN = "scoring_run"
    PREDICTION_CREATED = "prediction_created"
    OUTCOME_RECORDED = "outcome_recorded"
    CALIBRATION_APPLIED = "calibration_applied"
    RECOMMENDATION_ISSUED = "recommendation_issued"
    WEIGHT_CHANGED = "weight_changed"
    MANUAL_OVERRIDE = "manual_override"


class ActorType(str, Enum):
    SYSTEM = "system"
    USER = "user"
    SCHEDULER = "scheduler"
    API = "api"
