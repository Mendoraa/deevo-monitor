"""Pytest fixtures for Kuwait Motor Adaptive Risk Engine tests."""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from app.services.graph_registry_service import GraphRegistryService
from app.services.signal_ingestion_service import SignalIngestionService
from app.services.reasoning_engine import ReasoningEngine
from app.services.scoring_engine import ScoringEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.feedback_service import FeedbackService
from app.services.calibration_engine import CalibrationEngine
from app.services.explainability_service import ExplainabilityService
from app.services.audit_service import AuditService


@pytest.fixture
def fresh_registry():
    """A fresh graph registry for each test."""
    reg = GraphRegistryService()
    reg.initialize()
    return reg


@pytest.fixture
def ingestion():
    return SignalIngestionService()


@pytest.fixture
def reasoning(fresh_registry):
    return ReasoningEngine(registry=fresh_registry)


@pytest.fixture
def scoring():
    return ScoringEngine()


@pytest.fixture
def recommendations():
    return RecommendationEngine()


@pytest.fixture
def feedback():
    return FeedbackService()


@pytest.fixture
def calibration(fresh_registry):
    return CalibrationEngine(registry=fresh_registry)


@pytest.fixture
def explainability():
    return ExplainabilityService()


@pytest.fixture
def audit():
    return AuditService()


@pytest.fixture
def kwt_signals():
    """Standard Kuwait motor test signals."""
    return [
        {"signal_key": "oil_price", "signal_value": 92, "signal_category": "macro"},
        {"signal_key": "inflation_rate", "signal_value": 4.2, "signal_category": "macro"},
        {"signal_key": "repair_cost_inflation", "signal_value": 8.5, "signal_category": "insurance"},
        {"signal_key": "claims_frequency", "signal_value": 1.8, "signal_category": "insurance"},
        {"signal_key": "claims_severity", "signal_value": 8.0, "signal_category": "insurance"},
        {"signal_key": "fraud_cluster_density", "signal_value": 0.65, "signal_category": "insurance"},
        {"signal_key": "garage_network_risk", "signal_value": 0.55, "signal_category": "portfolio"},
        {"signal_key": "underwriting_drift", "signal_value": 0.45, "signal_category": "insurance"},
        {"signal_key": "pricing_adequacy_gap", "signal_value": 0.35, "signal_category": "portfolio"},
    ]
