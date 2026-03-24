"""Full Cortex Orchestrator — runs all three pipelines and produces the complete intelligence bundle.

Pipeline:
1. Economic Analysis (agents → causal chain → scenarios)
2. Insurance Intelligence (lines → claims → underwriting → regulatory)
3. Graph Simulation (nodes → edges → BFS propagation)
4. Explanation Engine (synthesize all into human-readable intelligence)
"""

from __future__ import annotations
from pydantic import BaseModel

from app.schemas import EventInput, EconomicAnalysisResponse
from app.schemas.insurance import InsuranceAnalysis
from app.schemas.graph import GraphPropagationResult
from app.engines.run_economic_analysis import run_economic_analysis
from app.engines.classify_event import classify_event
from app.engines.insurance import run_insurance_analysis
from app.engines.graph import run_graph_simulation
from app.engines.explanation_engine import build_explanation, ExplanationBundle


class FullCortexResponse(BaseModel):
    """Complete Deevo Cortex intelligence bundle."""
    economic: EconomicAnalysisResponse
    insurance: InsuranceAnalysis
    graph: GraphPropagationResult
    explanation: ExplanationBundle


def run_full_cortex(event_input: EventInput) -> FullCortexResponse:
    """Execute the complete Deevo Cortex pipeline."""

    # Step 1: Economic Analysis
    economic = run_economic_analysis(event_input)

    # Step 2: Get normalized event for downstream engines
    normalized = economic.normalized_event

    # Step 3: Insurance Intelligence
    insurance = run_insurance_analysis(normalized, economic.agent_outputs)

    # Step 4: Graph Simulation
    graph = run_graph_simulation(normalized)

    # Step 5: Explanation Synthesis
    explanation = build_explanation(normalized, economic, insurance, graph)

    return FullCortexResponse(
        economic=economic,
        insurance=insurance,
        graph=graph,
        explanation=explanation,
    )
