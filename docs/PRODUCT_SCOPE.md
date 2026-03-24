# Product Scope — Kuwait Motor Adaptive Risk Engine

## Problem Statement
GCC insurance companies lack real-time adaptive risk intelligence that connects macroeconomic shifts to their insurance portfolio exposure. They rely on static actuarial models that don't respond to market changes until it's too late. When oil prices spike, repair costs inflate, or fraud patterns emerge, there is no system that propagates these signals through to actionable insurance decisions.

## Target Users
- Chief Risk Officer / Head of Risk
- Chief Underwriting Officer
- Head of Motor Insurance
- Actuarial Team Lead
- Claims Operations Director
- Fraud Investigation Lead

## Target Market
- **Country**: Kuwait (KWT)
- **Regulator**: IRU (Insurance Regulatory Unit)
- **Currency**: KWD
- **Oil Dependency**: 85%

## Product Slice
**Kuwait Motor Retail Adaptive Risk Engine**

This is NOT a generic analytics dashboard. It is a decision intelligence product that:
1. Ingests market and insurance signals
2. Reasons about their interconnected impact using a graph
3. Produces 5 insurance risk scores
4. Generates executive-grade recommendations
5. Learns from actual outcomes to improve predictions

## In Scope
- Kuwait motor insurance portfolio
- 10-15 input signals (macro + insurance + portfolio)
- 27 graph nodes, 38 edges
- 5 risk scores: Market Stress, Claims Pressure, Fraud Exposure, Underwriting Risk, Portfolio Stability
- 12 recommendation rules
- Prediction storage and outcome feedback
- Calibration with direction/magnitude/timing error analysis
- REST API v1
- Executive dashboard (4 screens)
- Audit trail

## Out of Scope (for this phase)
- Saudi Arabia, UAE, or other GCC markets
- Medical, property, marine, or energy insurance lines
- Claims processing or automation
- Underwriting workflow automation
- Machine learning or deep learning models
- Real-time streaming (batch/on-demand only)
- Mobile application
- Multi-tenant SaaS
- RBAC/authentication (stub only)

## Success Criteria
1. End-to-end signal → score → recommendation pipeline works
2. Calibration loop demonstrably adjusts weights based on outcomes
3. Explainability is actionable, not decorative
4. API response shapes match contract
5. Dashboard renders 4 functional screens
