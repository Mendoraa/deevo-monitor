"""Deevo Cortex API routes — Economic, Insurance, Graph, Scoring, and Full Cortex.

Phase 2: Dynamic weights, signal binding, graph propagation
Phase 3: Live calibration, feedback loops, GCC insurance scoring
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.schemas import EventInput, EconomicAnalysisResponse
from app.schemas.insurance import InsuranceAnalysis
from app.schemas.graph import GraphPropagationResult
from app.engines import run_economic_analysis, classify_event, score_scenarios
from app.engines.insurance import run_insurance_analysis
from app.engines.graph import run_graph_simulation
from app.engines.run_full_cortex import run_full_cortex, FullCortexResponse

router = APIRouter(prefix="/api/economic-layer", tags=["Deevo Cortex"])


# ═══════════════════════════════════════════════════════
# Phase 3 Schemas
# ═══════════════════════════════════════════════════════

class SignalInput(BaseModel):
    """Live signal for calibration."""
    indicator: str
    value: float
    previous_value: float = 0.0
    change: float = 0.0
    signal_type: str = "macro"  # macro, insurance, portfolio
    region: str = "GCC"
    country: Optional[str] = None
    source: str = "manual"
    confidence: float = 0.7

class CalibrationRequest(BaseModel):
    """Batch calibration request."""
    signals: List[SignalInput]
    country: Optional[str] = None

class ScorecardRequest(BaseModel):
    """GCC insurance scorecard request."""
    event: EventInput
    country: Optional[str] = None  # None = all 6 GCC
    product: Optional[str] = None
    signals: List[SignalInput] = Field(default_factory=list)

class ScoreFactor(BaseModel):
    name: str
    contribution: float
    weight: float
    source: str
    direction: str

class InsuranceScore(BaseModel):
    name: str
    score: int
    level: str
    factors: List[ScoreFactor]
    trend: str
    confidence: float

class GCCScorecard(BaseModel):
    country: str
    product: Optional[str] = None
    timestamp: str
    market_stress: InsuranceScore
    claims_pressure: InsuranceScore
    fraud_exposure: InsuranceScore
    underwriting_risk: InsuranceScore
    overall_risk: str
    recommended_actions: List[str]


# ═══════════════════════════════════════════════════════
# FULL CORTEX — Complete Intelligence Bundle
# ═══════════════════════════════════════════════════════

@router.post("/cortex", response_model=FullCortexResponse)
async def full_cortex_analysis(event: EventInput):
    """Run the COMPLETE Deevo Cortex pipeline:
    Economic + Insurance + Graph + Explanation.
    This is the primary endpoint."""
    try:
        return run_full_cortex(event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
# ECONOMIC LAYER — Standalone
# ═══════════════════════════════════════════════════════

@router.post("/analyze", response_model=EconomicAnalysisResponse)
async def analyze_event(event: EventInput):
    """Run economic analysis only."""
    try:
        return run_economic_analysis(event)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/classify")
async def classify_only(event: EventInput):
    """Classify an event without running full analysis."""
    try:
        normalized = classify_event(event)
        return {"normalized_event": normalized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/scenario")
async def scenario_only(event: EventInput):
    """Generate scenario scores for an event."""
    try:
        normalized = classify_event(event)
        scenarios = score_scenarios(normalized)
        return {"event_id": normalized.event_id, "scenarios": scenarios}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
# INSURANCE INTELLIGENCE — Standalone
# ═══════════════════════════════════════════════════════

@router.post("/insurance", response_model=InsuranceAnalysis)
async def insurance_analysis(event: EventInput):
    """Run insurance intelligence analysis only."""
    try:
        normalized = classify_event(event)
        return run_insurance_analysis(normalized)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
# GRAPH SIMULATION — Standalone
# ═══════════════════════════════════════════════════════

@router.post("/graph", response_model=GraphPropagationResult)
async def graph_simulation(event: EventInput):
    """Run economic graph simulation only."""
    try:
        normalized = classify_event(event)
        return run_graph_simulation(normalized)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "operational",
        "service": "deevo-cortex",
        "version": "3.0.0",
        "engines": ["economic", "insurance", "graph", "explanation", "calibration", "scoring"],
        "phase": "Phase 3A — Live Calibration + GCC Insurance Scoring",
    }


# ═══════════════════════════════════════════════════════
# PHASE 3: GCC INSURANCE SCORING
# ═══════════════════════════════════════════════════════

@router.post("/scorecard")
async def gcc_insurance_scorecard(req: ScorecardRequest):
    """Compute GCC insurance scorecard (4 scores) for a country or all GCC.

    Scores:
    1. Market Stress — macro economic pressure
    2. Claims Pressure — probability of claims elevation
    3. Fraud Exposure — portfolio fraud vulnerability
    4. Underwriting Risk — pricing adequacy assessment
    """
    try:
        from app.engines.scoring import compute_gcc_scorecards

        normalized = classify_event(req.event)
        result = compute_gcc_scorecards(
            normalized,
            country=req.country,
            product=req.product,
            signals=[s.dict() for s in req.signals],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calibrate")
async def calibrate_weights(req: CalibrationRequest):
    """Phase 3 calibration endpoint.

    Accepts live signals and returns calibrated edge weights
    with drift alerts and adjustment audit trail.
    """
    try:
        from app.engines.calibration import run_calibration

        result = run_calibration(
            signals=[s.dict() for s in req.signals],
            country=req.country,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cortex-v3")
async def full_cortex_v3(req: ScorecardRequest):
    """Phase 3 full pipeline: Economic + Insurance + Graph + Scoring + Calibration.

    Returns the complete decision bundle including GCC insurance scorecards.
    """
    try:
        # Run Phase 2 full cortex
        cortex_result = run_full_cortex(req.event)

        # Run Phase 3 scoring
        from app.engines.scoring import compute_gcc_scorecards
        normalized = classify_event(req.event)
        scorecards = compute_gcc_scorecards(
            normalized,
            country=req.country,
            product=req.product,
            signals=[s.dict() for s in req.signals],
        )

        return {
            "economic": cortex_result.economic,
            "insurance": cortex_result.insurance,
            "graph": cortex_result.graph,
            "explanation": cortex_result.explanation,
            "scorecards": scorecards,
            "version": "3.0.0",
            "phase": "Phase 3A",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
