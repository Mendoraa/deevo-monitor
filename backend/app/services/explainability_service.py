"""Explainability Service — builds human-readable decision explanations.

Every prediction must explain itself. This service produces structured
explainability payloads containing: top drivers, impacted nodes,
strongest edges, confidence assessment, market-specific notes,
calibration status, and narrative summaries.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime

from app.services.market_profile_service import get_market_profile, get_regional_sensitivity
from app.services.graph_registry_service import graph_registry


# ─── Market Narrative Templates ────────────────────────────────

MARKET_NOTES = {
    "KWT": {
        "oil_price": "Kuwait's oil dependency ({dep}%) amplifies oil price impacts on insurance portfolios",
        "repair_cost_inflation": "Kuwait motor repair costs are import-driven and highly sensitive to supply chain disruption",
        "claims_frequency": "Kuwait's dense urban driving patterns contribute to elevated base frequency",
        "government_spending": "Kuwait fiscal policy directly influences infrastructure and construction claims",
    },
    "SAU": {
        "oil_price": "Saudi Vision 2030 diversification reduces but doesn't eliminate oil sensitivity ({dep}%)",
        "repair_cost_inflation": "Saudi repair cost inflation tracks import costs and local labor market dynamics",
        "medical_inflation": "Mandatory medical insurance creates concentrated exposure to healthcare inflation",
        "government_spending": "Giga-project spending drives construction and liability exposure",
    },
    "UAE": {
        "trade_volume": "UAE trade hub status ({open}% openness) makes trade disruption a primary risk vector",
        "real_estate_index": "Dubai/Abu Dhabi property cycles directly affect property and liability portfolios",
        "fraud_cluster_density": "High vehicle density and repair network complexity elevate fraud opportunity",
        "claims_frequency": "Urban density and multinational driving population affect frequency patterns",
    },
    "QAT": {
        "oil_price": "Qatar's gas-weighted energy mix partially insulates from oil-only shocks",
        "trade_volume": "LNG export dependency creates unique trade volume risk profile",
    },
    "BHR": {
        "interest_rate": "Bahrain's lower fiscal buffer ({buf}%) increases sensitivity to rate changes",
        "inflation_rate": "Bahrain's import dependency amplifies global inflation transmission",
        "claims_frequency": "Smaller market concentrates risk in fewer portfolio segments",
    },
    "OMN": {
        "oil_price": "Oman's oil dependency ({dep}%) is among the highest in GCC",
        "interest_rate": "Lower fiscal buffer means rate increases affect broader economy quickly",
    },
}

# Risk level narratives
RISK_NARRATIVES = {
    "Critical": "Multiple risk dimensions have breached critical thresholds. Immediate executive attention required.",
    "High": "Significant risk pressure detected across key dimensions. Active intervention recommended.",
    "Medium": "Moderate risk signals present. Enhanced monitoring and selective action warranted.",
    "Low": "Risk environment is within acceptable bounds. Standard monitoring protocols sufficient.",
}


class ExplainabilityService:
    """Builds structured explainability payloads for predictions."""

    def build_explanation(
        self,
        market_code: str,
        scores: Dict[str, int],
        risk_level: str,
        top_drivers: List[Dict[str, Any]],
        graph_outputs: Dict[str, float],
        propagation_trace: Dict[str, Dict[str, Any]],
        impact_chains: List[Dict[str, Any]],
        calibration_status: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Build a complete explainability payload.

        Args:
            market_code: GCC market code
            scores: The 5 scores
            risk_level: Overall risk level
            top_drivers: Driver details from scoring engine
            graph_outputs: Score target values
            propagation_trace: Full BFS trace
            impact_chains: Impact path chains
            calibration_status: Current calibration state

        Returns:
            Structured explainability payload.
        """
        profile = get_market_profile(market_code) or {}

        # Top drivers formatted
        formatted_drivers = self._format_drivers(top_drivers, propagation_trace)

        # Market-specific notes
        market_notes = self._build_market_notes(market_code, profile, formatted_drivers)

        # Strongest edges
        strongest_edges = self._identify_strongest_edges(market_code)

        # Impacted nodes summary
        impacted_nodes = self._summarize_impacted_nodes(propagation_trace)

        # Confidence assessment
        confidence = self._assess_confidence(scores, graph_outputs, propagation_trace)

        # Narrative summary
        narrative = self._build_narrative(
            market_code, profile, scores, risk_level, formatted_drivers, market_notes
        )

        return {
            "top_drivers": formatted_drivers,
            "market_profile_notes": market_notes,
            "confidence_score": confidence["score"],
            "confidence_factors": confidence["factors"],
            "calibration_needed": confidence["calibration_needed"],
            "calibration_status": calibration_status or "not_run",
            "strongest_edges": strongest_edges,
            "impacted_nodes": impacted_nodes,
            "impact_chains": impact_chains[:5],
            "narrative_summary": narrative,
            "risk_narrative": RISK_NARRATIVES.get(risk_level, ""),
            "scores_breakdown": self._scores_breakdown(scores),
            "timestamp": datetime.utcnow().isoformat(),
        }

    def _format_drivers(
        self,
        top_drivers: List[Dict[str, Any]],
        trace: Dict[str, Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Format top drivers with impact details."""
        formatted = []
        for driver in top_drivers[:10]:
            node_key = driver.get("node_key", "")
            trace_entry = trace.get(node_key, {})

            formatted.append({
                "node_key": node_key,
                "impact_strength": driver.get("impact_strength", driver.get("contribution", 0)),
                "direction": driver.get("direction", "positive"),
                "depth": trace_entry.get("depth", 0),
                "propagation_path": trace_entry.get("path", [node_key]),
            })

        formatted.sort(key=lambda x: abs(x.get("impact_strength", 0)), reverse=True)
        return formatted

    def _build_market_notes(
        self,
        market_code: str,
        profile: Dict,
        drivers: List[Dict],
    ) -> List[str]:
        """Generate market-specific contextual notes."""
        notes = []
        templates = MARKET_NOTES.get(market_code, {})

        driver_keys = {d["node_key"] for d in drivers}

        for node_key, template in templates.items():
            if node_key in driver_keys or len(notes) < 2:
                note = template.format(
                    dep=int(profile.get("oil_dependency", 0) * 100),
                    open=int(profile.get("trade_openness", 0) * 100),
                    buf=int(profile.get("fiscal_buffer", 0) * 100),
                )
                notes.append(note)

        # Add insurance penetration context
        penetration = profile.get("insurance_penetration", 0)
        if penetration:
            notes.append(
                f"{profile.get('name', market_code)} insurance penetration at "
                f"{penetration*100:.1f}% — "
                f"{'below' if penetration < 0.02 else 'near'} GCC average"
            )

        # Add regulatory context
        regulator = profile.get("regulatory_body", "")
        if regulator:
            notes.append(f"Regulated by {regulator} — compliance monitoring active")

        return notes

    def _identify_strongest_edges(
        self, market_code: str, top_n: int = 5
    ) -> List[Dict[str, Any]]:
        """Find the strongest active edges in the current graph state."""
        graph_registry.initialize()
        edges = graph_registry.get_all_edges()

        scored_edges = []
        for edge in edges:
            if not edge.get("active"):
                continue
            effective = graph_registry.compute_effective_weight(
                edge, market_code=market_code
            )
            scored_edges.append({
                "edge_key": edge["edge_key"],
                "source": edge["source_node_id"],
                "target": edge["target_node_id"],
                "relationship_type": edge["relationship_type"],
                "effective_weight": round(effective, 4),
                "base_weight": edge["base_weight"],
                "confidence": edge["confidence_score"],
            })

        scored_edges.sort(key=lambda x: x["effective_weight"], reverse=True)
        return scored_edges[:top_n]

    def _summarize_impacted_nodes(
        self, trace: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Summarize nodes impacted by propagation."""
        impacted = []
        for node_key, entry in trace.items():
            if entry.get("is_source"):
                continue
            impacted.append({
                "node_key": node_key,
                "impact": round(entry.get("impact", 0), 4),
                "depth": entry.get("depth", 0),
                "source_count": len(entry.get("sources", [])),
            })

        impacted.sort(key=lambda x: abs(x["impact"]), reverse=True)
        return impacted[:15]

    def _assess_confidence(
        self,
        scores: Dict[str, int],
        graph_outputs: Dict[str, float],
        trace: Dict[str, Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Assess overall confidence in the prediction."""
        factors = []

        # Factor 1: Data coverage
        nodes_with_signal = sum(1 for t in trace.values() if t.get("is_source"))
        total_possible = 19  # Approximate number of signal nodes
        data_coverage = nodes_with_signal / total_possible
        factors.append({
            "factor": "data_coverage",
            "value": round(data_coverage, 2),
            "note": f"{nodes_with_signal}/{total_possible} signal nodes populated",
        })

        # Factor 2: Graph connectivity
        total_impacted = sum(1 for t in trace.values() if not t.get("is_source"))
        connectivity = min(1.0, total_impacted / 15)
        factors.append({
            "factor": "graph_connectivity",
            "value": round(connectivity, 2),
            "note": f"{total_impacted} downstream nodes affected",
        })

        # Factor 3: Score variance
        if scores:
            values = list(scores.values())
            mean = sum(values) / len(values)
            variance = sum((v - mean) ** 2 for v in values) / len(values)
            consistency = max(0.3, 1.0 - (variance ** 0.5) / 100)
        else:
            consistency = 0.5
        factors.append({
            "factor": "score_consistency",
            "value": round(consistency, 2),
            "note": "Low variance indicates consistent risk signal",
        })

        # Composite confidence
        composite = (data_coverage * 0.4) + (connectivity * 0.3) + (consistency * 0.3)
        calibration_needed = composite < 0.6 or data_coverage < 0.3

        return {
            "score": round(max(0.3, min(1.0, composite)), 4),
            "factors": factors,
            "calibration_needed": calibration_needed,
        }

    def _build_narrative(
        self,
        market_code: str,
        profile: Dict,
        scores: Dict[str, int],
        risk_level: str,
        drivers: List[Dict],
        notes: List[str],
    ) -> str:
        """Build a human-readable narrative summary."""
        country = profile.get("name", market_code)
        top_driver = drivers[0]["node_key"] if drivers else "market conditions"
        max_score_key = max(scores, key=scores.get) if scores else "unknown"
        max_score_val = scores.get(max_score_key, 0)

        # Clean up score key for display
        score_label = max_score_key.replace("_score", "").replace("_", " ").title()

        narrative = (
            f"For {country}, the current risk assessment is {risk_level}. "
            f"The highest-scoring dimension is {score_label} at {max_score_val}/100, "
            f"primarily driven by {top_driver.replace('_', ' ')}. "
        )

        if risk_level in ("Critical", "High"):
            narrative += (
                "Immediate action is recommended to mitigate exposure. "
                "Multiple signal paths confirm the assessment."
            )
        elif risk_level == "Medium":
            narrative += (
                "Enhanced monitoring is recommended with selective interventions "
                "on the most affected segments."
            )
        else:
            narrative += "No immediate action required beyond standard monitoring."

        return narrative

    def _scores_breakdown(self, scores: Dict[str, int]) -> List[Dict[str, Any]]:
        """Break down scores into categorized display items."""
        labels = {
            "market_stress_score": ("Market Stress", "macro"),
            "claims_pressure_score": ("Claims Pressure", "insurance"),
            "fraud_exposure_score": ("Fraud Exposure", "insurance"),
            "underwriting_risk_score": ("Underwriting Risk", "insurance"),
            "portfolio_stability_score": ("Portfolio Stability", "portfolio"),
        }

        breakdown = []
        for key, value in scores.items():
            label, category = labels.get(key, (key, "unknown"))
            level = (
                "critical" if value >= 80
                else "high" if value >= 65
                else "medium" if value >= 45
                else "low"
            )
            breakdown.append({
                "score_key": key,
                "label": label,
                "value": value,
                "level": level,
                "category": category,
            })

        return breakdown


# Singleton
explainability_service = ExplainabilityService()
