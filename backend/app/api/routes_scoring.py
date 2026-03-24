"""Scoring API — run full reasoning + scoring pipeline."""

from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.schemas.scoring import ScoringRunRequest, ScoringRunResponse, Scores
from app.services.graph_registry_service import graph_registry
from app.services.signal_ingestion_service import SignalIngestionService
from app.services.reasoning_engine import reasoning_engine
from app.services.scoring_engine import scoring_engine
from app.services.recommendation_engine import recommendation_engine
from app.services.explainability_service import explainability_service
from app.services.feedback_service import feedback_service
from app.services.market_profile_service import get_market_profile
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/v1/scoring", tags=["scoring"])


@router.post("/run", response_model=ScoringRunResponse)
def run_scoring(request: ScoringRunRequest):
    """POST /api/v1/scoring/run — full reasoning + scoring + recommendations."""
    # Validate market
    profile = get_market_profile(request.market_code)
    if not profile:
        raise HTTPException(
            status_code=404,
            detail=f"Market {request.market_code} not found",
        )

    graph_registry.initialize()

    # Step 1: Collect current signal values from graph nodes
    signal_values = {}
    for node in graph_registry.get_all_nodes():
        if node.get("normalized_value", 0) > 0:
            signal_values[node["node_key"]] = node["normalized_value"]

    # Step 2: Run reasoning engine
    reasoning_result = reasoning_engine.run_reasoning(
        market_code=request.market_code,
        signal_values=signal_values,
    )

    # Step 3: Collect node values for scoring
    node_values = {}
    for node in graph_registry.get_all_nodes():
        node_values[node["node_key"]] = node.get("current_value", 0.0)

    # Step 4: Run scoring engine
    scoring_result = scoring_engine.calculate_scores(
        graph_outputs=reasoning_result["graph_outputs"],
        node_values=node_values,
        market_code=request.market_code,
        portfolio_key=request.portfolio_key,
    )

    # Step 5: Generate recommendations
    rec_result = recommendation_engine.generate_recommendations(
        scores=scoring_result["scores"],
        market_code=request.market_code,
        portfolio_key=request.portfolio_key,
        assessment_id=scoring_result["assessment_id"],
    )

    # Step 6: Build explainability
    explain = explainability_service.build_explanation(
        market_code=request.market_code,
        scores=scoring_result["scores"],
        risk_level=scoring_result["risk_level"],
        top_drivers=scoring_result.get("driver_details", []),
        graph_outputs=reasoning_result["graph_outputs"],
        propagation_trace=reasoning_result.get("propagation_trace", {}),
        impact_chains=reasoning_result.get("impact_chains", []),
    )

    # Step 7: Store prediction for future feedback
    prediction_record = {
        "assessment_id": scoring_result["assessment_id"],
        "market_code": request.market_code,
        "portfolio_key": request.portfolio_key,
        "product_key": request.product_key,
        "run_type": request.run_type,
        "scores": scoring_result["scores"],
        "risk_level": scoring_result["risk_level"],
        "top_drivers": scoring_result["top_drivers"],
        "confidence_score": scoring_result["confidence_score"],
        "recommendations": rec_result["actions"],
        "explainability": explain,
        "prediction_date": datetime.utcnow().isoformat(),
    }
    feedback_service.store_prediction(prediction_record)

    # Audit log
    trace_id = f"trace_{scoring_result['assessment_id']}"
    audit_service.log_scoring_run(
        assessment_id=scoring_result["assessment_id"],
        market_code=request.market_code,
        scores=scoring_result["scores"],
        risk_level=scoring_result["risk_level"],
        trace_id=trace_id,
    )
    audit_service.log_prediction_created(
        assessment_id=scoring_result["assessment_id"],
        market_code=request.market_code,
        trace_id=trace_id,
    )
    audit_service.log_recommendation_generated(
        assessment_id=scoring_result["assessment_id"],
        action_count=rec_result["action_count"],
        highest_priority=rec_result["highest_priority"],
        trace_id=trace_id,
    )

    # Build response
    scores = scoring_result["scores"]
    return ScoringRunResponse(
        assessment_id=scoring_result["assessment_id"],
        market_code=request.market_code,
        portfolio_key=request.portfolio_key,
        product_key=request.product_key,
        scores=Scores(
            market_stress_score=scores["market_stress_score"],
            claims_pressure_score=scores["claims_pressure_score"],
            fraud_exposure_score=scores["fraud_exposure_score"],
            underwriting_risk_score=scores["underwriting_risk_score"],
            portfolio_stability_score=scores["portfolio_stability_score"],
        ),
        risk_level=scoring_result["risk_level"],
        top_drivers=scoring_result["top_drivers"],
        confidence_score=scoring_result["confidence_score"],
        explainability=explain,
        recommendations=rec_result["actions"],
        timestamp=datetime.utcnow().isoformat(),
    )
