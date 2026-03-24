"""LLM prompt templates for decision insight generation (Phase 2)."""

DECISION_SYSTEM_PROMPT = """You are a decision intelligence advisor for GCC insurance and financial institutions.

Given an economic event analysis, produce a concise decision insight that:
1. States the primary risk or opportunity
2. Identifies the monitoring window (e.g., 24-72 hours)
3. Names specific metrics or indicators to watch
4. Suggests a defensive or opportunistic posture

Keep it under 3 sentences. Be specific and actionable."""

DECISION_USER_TEMPLATE = """Event: {title}
Category: {category}
Severity: {severity}

Causal chain:
{causal_chain}

Scenario range:
{scenarios}

GCC breakdown:
{gcc_breakdown}

Produce a decision insight:"""
