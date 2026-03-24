"""Recommendation Engine — rule-based action generation from scores.

Implements 12 business rules that map score thresholds to actionable
insurance decisions. Each rule has conditions, actions, priority, and
rationale. Rules are evaluated in priority order; multiple rules can fire.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

from app.core.enums import ActionType, ActionPriority


# ─── Business Rules ────────────────────────────────────────────

RULES = [
    # Rule 1: Claims + Underwriting combined stress
    {
        "id": "R01",
        "name": "Claims-Underwriting Combined Stress",
        "conditions": lambda s: (
            s.get("claims_pressure_score", 0) > 70
            and s.get("underwriting_risk_score", 0) > 65
        ),
        "actions": [
            {
                "action_type": ActionType.UNDERWRITING_CONTROL.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Tighten underwriting for high-frequency segment",
                "rationale": "Claims pressure and underwriting drift both exceed threshold",
            },
            {
                "action_type": ActionType.PRICING_ADJUSTMENT.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Review pricing adequacy across affected segments",
                "rationale": "Combined claims and underwriting stress suggests pricing gap",
            },
            {
                "action_type": ActionType.PORTFOLIO_REVIEW.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Escalate portfolio review for motor retail",
                "rationale": "Multiple risk dimensions elevated simultaneously",
            },
        ],
    },
    # Rule 2: High fraud exposure
    {
        "id": "R02",
        "name": "Elevated Fraud Exposure",
        "conditions": lambda s: s.get("fraud_exposure_score", 0) > 75,
        "actions": [
            {
                "action_type": ActionType.FRAUD_INVESTIGATION.value,
                "priority": ActionPriority.CRITICAL.value,
                "title": "Trigger fraud investigation on suspicious clusters",
                "rationale": "Fraud exposure score exceeds critical threshold",
            },
            {
                "action_type": ActionType.MONITORING_INCREASE.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Audit suspicious provider concentration zones",
                "rationale": "Fraud cluster density indicates organized activity",
            },
            {
                "action_type": ActionType.UNDERWRITING_CONTROL.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Pause fast-track claim approvals in flagged areas",
                "rationale": "Reducing auto-approval reduces fraud leakage",
            },
        ],
    },
    # Rule 3: Market stress + portfolio instability
    {
        "id": "R03",
        "name": "Market Stress with Portfolio Instability",
        "conditions": lambda s: (
            s.get("market_stress_score", 0) > 80
            and s.get("portfolio_stability_score", 0) < 40
        ),
        "actions": [
            {
                "action_type": ActionType.EXECUTIVE_ESCALATION.value,
                "priority": ActionPriority.CRITICAL.value,
                "title": "Executive escalation — dual stress detected",
                "rationale": "Market stress is critical while portfolio stability is dangerously low",
            },
            {
                "action_type": ActionType.RESERVE_REVIEW.value,
                "priority": ActionPriority.CRITICAL.value,
                "title": "Immediate reserve adequacy review",
                "rationale": "Combined macro and portfolio pressure threatens solvency buffer",
            },
            {
                "action_type": ActionType.CONTAINMENT_STRATEGY.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Activate containment strategy for affected portfolios",
                "rationale": "Prevent further exposure accumulation during stress period",
            },
        ],
    },
    # Rule 4: Claims pressure alone high
    {
        "id": "R04",
        "name": "High Claims Pressure",
        "conditions": lambda s: (
            s.get("claims_pressure_score", 0) > 75
            and s.get("underwriting_risk_score", 0) <= 65
        ),
        "actions": [
            {
                "action_type": ActionType.RESERVE_REVIEW.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Review IBNR and case reserves for adequacy",
                "rationale": "Claims pressure elevated — reserves may be insufficient",
            },
            {
                "action_type": ActionType.MONITORING_INCREASE.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Increase claims monitoring frequency",
                "rationale": "Early detection of severity trends through closer monitoring",
            },
        ],
    },
    # Rule 5: Underwriting drift alone
    {
        "id": "R05",
        "name": "Underwriting Drift Detected",
        "conditions": lambda s: (
            s.get("underwriting_risk_score", 0) > 70
            and s.get("claims_pressure_score", 0) <= 70
        ),
        "actions": [
            {
                "action_type": ActionType.UNDERWRITING_CONTROL.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Recalibrate underwriting guidelines",
                "rationale": "Underwriting drift detected before claims pressure materializes",
            },
            {
                "action_type": ActionType.PRICING_ADJUSTMENT.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Close pricing adequacy gap with rate adjustment",
                "rationale": "Proactive pricing correction prevents future claims stress",
            },
        ],
    },
    # Rule 6: Moderate fraud with garage network risk
    {
        "id": "R06",
        "name": "Garage Network Fraud Pattern",
        "conditions": lambda s: (
            s.get("fraud_exposure_score", 0) > 55
            and s.get("fraud_exposure_score", 0) <= 75
        ),
        "actions": [
            {
                "action_type": ActionType.MONITORING_INCREASE.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Enhance garage network monitoring",
                "rationale": "Moderate fraud signals suggest emerging pattern",
            },
            {
                "action_type": ActionType.FRAUD_INVESTIGATION.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Review top-5 suspicious providers for compliance",
                "rationale": "Targeted investigation on highest-concentration providers",
            },
        ],
    },
    # Rule 7: Portfolio lapse risk
    {
        "id": "R07",
        "name": "Portfolio Lapse Risk",
        "conditions": lambda s: s.get("portfolio_stability_score", 0) < 45,
        "actions": [
            {
                "action_type": ActionType.PORTFOLIO_REVIEW.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Review retention strategy for at-risk segments",
                "rationale": "Portfolio stability below threshold — lapse risk materializing",
            },
            {
                "action_type": ActionType.PRICING_ADJUSTMENT.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Evaluate competitive pricing position",
                "rationale": "Price sensitivity may be driving lapse behavior",
            },
        ],
    },
    # Rule 8: Market stress alone
    {
        "id": "R08",
        "name": "Market Macro Stress",
        "conditions": lambda s: (
            s.get("market_stress_score", 0) > 70
            and s.get("portfolio_stability_score", 0) >= 40
        ),
        "actions": [
            {
                "action_type": ActionType.MONITORING_INCREASE.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Increase macro indicator monitoring cadence",
                "rationale": "Market stress elevated — watchful monitoring required",
            },
            {
                "action_type": ActionType.RESERVE_REVIEW.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Stress-test reserves against macro scenario",
                "rationale": "Proactive reserve check under market stress conditions",
            },
        ],
    },
    # Rule 9: All scores moderate — general vigilance
    {
        "id": "R09",
        "name": "Multi-Dimension Moderate Risk",
        "conditions": lambda s: (
            sum(1 for v in s.values() if v > 55) >= 4
            and max(s.values()) <= 75
        ),
        "actions": [
            {
                "action_type": ActionType.MONITORING_INCREASE.value,
                "priority": ActionPriority.MEDIUM.value,
                "title": "Broad risk monitoring — multiple dimensions elevated",
                "rationale": "No single critical dimension, but cumulative risk is notable",
            },
        ],
    },
    # Rule 10: Reinsurance pressure + claims severity
    {
        "id": "R10",
        "name": "Reinsurance Treaty Stress",
        "conditions": lambda s: (
            s.get("claims_pressure_score", 0) > 65
            and s.get("market_stress_score", 0) > 60
        ),
        "actions": [
            {
                "action_type": ActionType.RESERVE_REVIEW.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Review reinsurance treaty capacity and terms",
                "rationale": "Claims and market pressure suggest reinsurance negotiation needed",
            },
        ],
    },
    # Rule 11: Low risk — all clear
    {
        "id": "R11",
        "name": "All Clear — Low Risk",
        "conditions": lambda s: max(s.values()) < 40 if s else True,
        "actions": [
            {
                "action_type": ActionType.MONITORING_INCREASE.value,
                "priority": ActionPriority.LOW.value,
                "title": "Continue standard monitoring cadence",
                "rationale": "All risk dimensions within acceptable bounds",
            },
        ],
    },
    # Rule 12: Rapid deterioration (future: compare to previous run)
    {
        "id": "R12",
        "name": "Rapid Score Deterioration",
        "conditions": lambda s: (
            s.get("claims_pressure_score", 0) > 80
            and s.get("fraud_exposure_score", 0) > 60
            and s.get("underwriting_risk_score", 0) > 60
        ),
        "actions": [
            {
                "action_type": ActionType.EXECUTIVE_ESCALATION.value,
                "priority": ActionPriority.CRITICAL.value,
                "title": "Multi-axis deterioration — executive war room",
                "rationale": "Claims, fraud, and underwriting all breaching thresholds simultaneously",
            },
            {
                "action_type": ActionType.CONTAINMENT_STRATEGY.value,
                "priority": ActionPriority.CRITICAL.value,
                "title": "Immediate portfolio containment measures",
                "rationale": "Halt new business in affected segments pending review",
            },
            {
                "action_type": ActionType.FRAUD_INVESTIGATION.value,
                "priority": ActionPriority.HIGH.value,
                "title": "Deploy full fraud sweep on open claims",
                "rationale": "High fraud signal during claims surge requires immediate action",
            },
        ],
    },
]


class RecommendationEngine:
    """Rule-based recommendation engine for GCC insurance decisions."""

    def generate_recommendations(
        self,
        scores: Dict[str, int],
        market_code: str,
        portfolio_key: str = "motor_retail",
        assessment_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Evaluate all rules and generate recommendations.

        Args:
            scores: The 5 GCC insurance scores (0-100)
            market_code: GCC market code
            portfolio_key: Portfolio identifier
            assessment_id: Optional link to prediction

        Returns:
            Recommendations with triggered rules and action items.
        """
        triggered_rules = []
        all_actions = []

        for rule in RULES:
            try:
                if rule["conditions"](scores):
                    triggered_rules.append({
                        "rule_id": rule["id"],
                        "rule_name": rule["name"],
                    })
                    for action in rule["actions"]:
                        action_record = {
                            "id": f"rec_{uuid.uuid4().hex[:8]}",
                            "rule_id": rule["id"],
                            "assessment_id": assessment_id,
                            "market_code": market_code,
                            "portfolio_key": portfolio_key,
                            **action,
                            "status": "pending",
                            "created_at": datetime.utcnow().isoformat(),
                        }
                        all_actions.append(action_record)
            except Exception:
                continue  # Skip malformed rules

        # Deduplicate by action_type + title
        seen = set()
        unique_actions = []
        for action in all_actions:
            key = f"{action['action_type']}:{action['title']}"
            if key not in seen:
                seen.add(key)
                unique_actions.append(action)

        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        unique_actions.sort(
            key=lambda x: priority_order.get(x.get("priority", "low"), 99)
        )

        return {
            "assessment_id": assessment_id,
            "market_code": market_code,
            "portfolio_key": portfolio_key,
            "triggered_rules": triggered_rules,
            "actions": unique_actions,
            "action_count": len(unique_actions),
            "highest_priority": unique_actions[0]["priority"] if unique_actions else "low",
            "timestamp": datetime.utcnow().isoformat(),
        }

    def get_rules_summary(self) -> List[Dict[str, str]]:
        """Return summary of all configured rules."""
        return [
            {"id": r["id"], "name": r["name"]}
            for r in RULES
        ]


# Singleton
recommendation_engine = RecommendationEngine()
