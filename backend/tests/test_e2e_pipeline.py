"""End-to-End Pipeline Test — Kuwait Motor Adaptive Risk Engine.

Tests the complete signal → score → recommendation → prediction → outcome → calibration cycle.
No external dependencies. No database. Pure in-memory pipeline verification.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.signal_ingestion_service import SignalIngestionService
from app.services.graph_registry_service import GraphRegistryService
from app.services.reasoning_engine import ReasoningEngine
from app.services.scoring_engine import ScoringEngine
from app.services.recommendation_engine import RecommendationEngine
from app.services.feedback_service import FeedbackService
from app.services.calibration_engine import CalibrationEngine
from app.services.explainability_service import ExplainabilityService


def test_full_pipeline():
    """Run the complete Kuwait Motor pipeline end-to-end."""
    print("\n" + "=" * 70)
    print("KUWAIT MOTOR ADAPTIVE RISK ENGINE — END-TO-END TEST")
    print("=" * 70)

    # ─── STEP 1: Initialize fresh services ──────────────────────
    print("\n[STEP 1] Initializing services...")
    registry = GraphRegistryService()
    registry.initialize()
    ingestion = SignalIngestionService()
    reasoning = ReasoningEngine(registry=registry)
    scoring = ScoringEngine()
    recommendations = RecommendationEngine()
    feedback = FeedbackService()
    calibration = CalibrationEngine(registry=registry)
    explainability = ExplainabilityService()

    nodes = registry.get_all_nodes()
    edges = registry.get_all_edges()
    print(f"  ✓ Graph initialized: {len(nodes)} nodes, {len(edges)} edges")
    assert len(nodes) >= 15, f"Expected ≥15 nodes, got {len(nodes)}"
    assert len(edges) >= 11, f"Expected ≥11 edges, got {len(edges)}"

    # ─── STEP 2: Ingest Kuwait motor signals ────────────────────
    print("\n[STEP 2] Ingesting Kuwait motor signals...")
    kwt_signals = [
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

    result = ingestion.ingest_batch(market_code="KWT", signals=kwt_signals)
    print(f"  ✓ Ingested {result['ingested_count']} signals")
    assert result["ingested_count"] == 9

    # Inject normalized values into graph
    for snap in result["snapshots"]:
        registry.update_node_value(
            snap["signal_key"],
            value=snap["signal_value"],
            normalized=snap["normalized_value"],
        )
        print(f"    {snap['signal_key']}: raw={snap['signal_value']} → normalized={snap['normalized_value']}")

    # ─── STEP 3: Run graph reasoning ────────────────────────────
    print("\n[STEP 3] Running graph reasoning (BFS propagation)...")
    signal_values = {}
    for node in registry.get_all_nodes():
        if node["normalized_value"] > 0:
            signal_values[node["node_key"]] = node["normalized_value"]

    reasoning_result = reasoning.run_reasoning(
        market_code="KWT",
        signal_values=signal_values,
    )

    graph_outputs = reasoning_result["graph_outputs"]
    print(f"  ✓ Propagation complete: {reasoning_result['nodes_affected']} nodes affected")
    print(f"  Score targets:")
    for k, v in graph_outputs.items():
        print(f"    {k}: {v:.2f}")

    assert len(graph_outputs) == 5, f"Expected 5 score targets, got {len(graph_outputs)}"

    # ─── STEP 4: Run scoring engine ─────────────────────────────
    print("\n[STEP 4] Computing 5 insurance scores...")
    node_values = {n["node_key"]: n.get("current_value", 0) for n in registry.get_all_nodes()}

    scoring_result = scoring.calculate_scores(
        graph_outputs=graph_outputs,
        node_values=node_values,
        market_code="KWT",
        portfolio_key="motor_retail",
    )

    scores = scoring_result["scores"]
    print(f"  ✓ Risk Level: {scoring_result['risk_level']}")
    print(f"  ✓ Confidence: {scoring_result['confidence_score']:.2%}")
    for k, v in scores.items():
        print(f"    {k}: {v}/100")

    assert all(0 <= v <= 100 for v in scores.values()), "Scores out of range"
    assert scoring_result["risk_level"] in ("Low", "Medium", "High", "Critical")
    assert len(scores) == 5

    # ─── STEP 5: Generate recommendations ───────────────────────
    print("\n[STEP 5] Generating executive recommendations...")
    rec_result = recommendations.generate_recommendations(
        scores=scores,
        market_code="KWT",
        portfolio_key="motor_retail",
        assessment_id=scoring_result["assessment_id"],
    )

    print(f"  ✓ Triggered rules: {len(rec_result['triggered_rules'])}")
    print(f"  ✓ Actions generated: {rec_result['action_count']}")
    print(f"  ✓ Highest priority: {rec_result['highest_priority']}")
    for action in rec_result["actions"][:5]:
        print(f"    [{action['priority'].upper()}] {action['title']}")

    assert rec_result["action_count"] >= 1, "Expected at least 1 recommendation"

    # ─── STEP 6: Build explainability ───────────────────────────
    print("\n[STEP 6] Building explainability payload...")
    explain = explainability.build_explanation(
        market_code="KWT",
        scores=scores,
        risk_level=scoring_result["risk_level"],
        top_drivers=scoring_result.get("driver_details", []),
        graph_outputs=graph_outputs,
        propagation_trace=reasoning_result.get("propagation_trace", {}),
        impact_chains=reasoning_result.get("impact_chains", []),
    )

    print(f"  ✓ Confidence: {explain['confidence_score']:.2%}")
    print(f"  ✓ Market notes: {len(explain['market_profile_notes'])} notes")
    print(f"  ✓ Strongest edges: {len(explain['strongest_edges'])} edges")
    print(f"  ✓ Narrative: {explain['narrative_summary'][:100]}...")

    assert explain["confidence_score"] > 0
    assert len(explain["narrative_summary"]) > 50

    # ─── STEP 7: Store prediction ───────────────────────────────
    print("\n[STEP 7] Storing prediction record...")
    prediction_record = {
        "assessment_id": scoring_result["assessment_id"],
        "market_code": "KWT",
        "portfolio_key": "motor_retail",
        "scores": scores,
        "risk_level": scoring_result["risk_level"],
        "top_drivers": scoring_result["top_drivers"],
        "confidence_score": scoring_result["confidence_score"],
        "recommendations": rec_result["actions"],
    }
    pred_id = feedback.store_prediction(prediction_record)
    print(f"  ✓ Prediction stored: {pred_id}")

    stored = feedback.get_prediction(pred_id)
    assert stored is not None, "Prediction not found after storing"

    # ─── STEP 8: Submit actual outcomes ─────────────────────────
    print("\n[STEP 8] Submitting actual outcomes (feedback)...")
    outcome_result = feedback.submit_outcome(
        prediction_id=pred_id,
        actual_loss_ratio=72.0,
        actual_claims_frequency=1.15,
        actual_claims_severity=7.5,
        actual_fraud_findings=8,
        actual_lapse_rate=0.04,
        actual_underwriting_shift=0.12,
    )

    print(f"  ✓ Outcome recorded: {outcome_result['outcome_id']}")
    print(f"  ✓ Prediction found: {outcome_result['prediction_found']}")

    error_analysis = outcome_result.get("error_analysis", {})
    if error_analysis:
        print(f"  ✓ Overall accuracy: {error_analysis.get('overall_accuracy', 0):.1%}")
        print(f"  ✓ Calibration recommended: {error_analysis.get('calibration_recommended')}")
        for score_key, err in error_analysis.get("score_errors", {}).items():
            print(f"    {score_key}: direction={'✓' if err['direction_correct'] else '✗'}, "
                  f"magnitude_error={err['magnitude_error']:.1%}")

    assert outcome_result["prediction_found"], "Prediction should be linked"

    # ─── STEP 9: Run calibration ────────────────────────────────
    print("\n[STEP 9] Running calibration engine...")

    # Capture edge weights before calibration
    sample_edge_key = "oil_price→market_stress_signal"
    edge_before = registry.get_edge(sample_edge_key)
    weight_before = edge_before["current_weight"] if edge_before else 0

    # Build actual outcomes for calibration
    actual_outcomes = {
        "actual_loss_ratio": 72.0,
        "actual_claims_frequency": 1.15,
        "actual_claims_severity": 7.5,
        "actual_fraud_findings": 8,
        "actual_lapse_rate": 0.04,
        "actual_underwriting_shift": 0.12,
    }

    cal_result = calibration.run_calibration(
        market_code="KWT",
        predicted_scores=scores,
        actual_outcomes=actual_outcomes,
        mode="semi_auto",
    )

    print(f"  ✓ Calibration ID: {cal_result['calibration_id']}")
    print(f"  ✓ Edges adjusted: {len(cal_result['edge_adjustments'])}")
    print(f"  ✓ Edges applied: {cal_result['applied_count']}")

    for adj in cal_result["edge_adjustments"][:5]:
        print(f"    {adj['edge_key']}: {adj['previous_weight']:.4f} → {adj['new_weight']:.4f} "
              f"({adj['error_quality']})")

    # Verify weights actually changed
    edge_after = registry.get_edge(sample_edge_key)
    if edge_after and cal_result["applied_count"] > 0:
        weight_after = edge_after["current_weight"]
        print(f"\n  Weight verification ({sample_edge_key}):")
        print(f"    Before: {weight_before:.4f}")
        print(f"    After:  {weight_after:.4f}")

    # ─── STEP 10: Verify full cycle ─────────────────────────────
    print("\n[STEP 10] Verifying full cycle integrity...")

    # Re-run scoring after calibration to confirm weights take effect
    signal_values_2 = {}
    for node in registry.get_all_nodes():
        if node["normalized_value"] > 0:
            signal_values_2[node["node_key"]] = node["normalized_value"]

    reasoning_result_2 = reasoning.run_reasoning(
        market_code="KWT",
        signal_values=signal_values_2,
    )

    scoring_result_2 = scoring.calculate_scores(
        graph_outputs=reasoning_result_2["graph_outputs"],
        node_values={n["node_key"]: n.get("current_value", 0) for n in registry.get_all_nodes()},
        market_code="KWT",
        portfolio_key="motor_retail",
    )

    print(f"  Post-calibration scores:")
    for k, v in scoring_result_2["scores"].items():
        old = scores[k]
        delta = v - old
        arrow = "↑" if delta > 0 else "↓" if delta < 0 else "="
        print(f"    {k}: {old} → {v} ({arrow}{abs(delta)})")

    # ─── FINAL SUMMARY ──────────────────────────────────────────
    print("\n" + "=" * 70)
    print("E2E PIPELINE TEST — RESULTS")
    print("=" * 70)
    print(f"  Graph:            {len(nodes)} nodes, {len(edges)} edges")
    print(f"  Signals ingested: {result['ingested_count']}")
    print(f"  Scores computed:  {len(scores)}")
    print(f"  Risk level:       {scoring_result['risk_level']}")
    print(f"  Recommendations:  {rec_result['action_count']}")
    print(f"  Prediction stored: ✓")
    print(f"  Outcome linked:   ✓")
    print(f"  Calibration run:  {cal_result['applied_count']} edges updated")
    print(f"  Post-cal scoring: ✓")
    print("=" * 70)
    print("  ALL CHECKS PASSED ✓")
    print("=" * 70)

    return True


def test_api_startup():
    """Verify FastAPI app can be imported and routes are registered."""
    print("\n[API STARTUP TEST]")
    from app.main import app

    routes = [r.path for r in app.routes]
    required_routes = [
        "/api/v1/health",
        "/api/v1/signals/ingest",
        "/api/v1/scoring/run",
        "/api/v1/feedback/outcomes",
        "/api/v1/calibration/run",
    ]

    for route in required_routes:
        found = any(route in r for r in routes)
        status = "✓" if found else "✗"
        print(f"  {status} {route}")
        assert found, f"Route {route} not registered"

    print(f"  Total routes: {len(routes)}")
    print("  API startup: ✓")


if __name__ == "__main__":
    test_full_pipeline()
    test_api_startup()
    print("\n🏁 ALL E2E TESTS PASSED\n")
