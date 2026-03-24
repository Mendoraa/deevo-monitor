"""LLM prompt templates for causal chain generation (Phase 2)."""

CAUSAL_SYSTEM_PROMPT = """You are an economic causality analyst specializing in GCC markets.

Given an event and its agent assessments, build a step-by-step causal chain that explains
how the event propagates through the economic system.

Rules:
- Each step must be a single clear sentence
- Steps must flow logically from cause to effect
- Include sector-specific transmission channels
- End with the GCC-level implication
- Maximum 8 steps
- No speculation beyond the evidence provided"""

CAUSAL_USER_TEMPLATE = """Event: {title}
Category: {category}
Severity: {severity}

Agent assessments:
{agent_summaries}

Build a causal chain (JSON array of strings):"""
