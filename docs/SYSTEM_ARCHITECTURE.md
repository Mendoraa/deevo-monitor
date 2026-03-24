# System Architecture — Kuwait Motor Adaptive Risk Engine

## Architectural Principle
Three distinct layers, never mixed:

```
WORLD SIGNALS (Input)  →  GRAPH REASONING (Logic)  →  INSURANCE DECISIONS (Output)
```

## Layer A: Input Signals
**Purpose**: Normalize and store incoming economic and insurance signals.

**Components**:
- `SignalIngestionService` — batch ingest with normalization
- `SignalNormalization` — bounded scaling per signal type (0-100)
- `SignalSnapshot` — immutable record of every ingested signal

**Signal Categories**:
- Macro: oil_price, inflation_rate, interest_rate, credit_growth, government_spending, real_estate_index, trade_volume, fx_rate
- Insurance: claims_frequency, claims_severity, repair_cost_inflation, medical_inflation, fraud_alert_rate, reinsurance_pressure, premium_adequacy
- Portfolio: loss_ratio, policy_lapse_rate, suspicious_provider_concentration, underwriting_rejection_rate

## Layer B: Graph Reasoning Engine
**Purpose**: Propagate signal impacts through an interconnected economic graph.

**Components**:
- `GraphRegistryService` — node/edge storage with effective weight computation
- `MarketProfileService` — GCC market profiles and regional sensitivity
- `ReasoningEngine` — BFS propagation with hop decay, attenuation, threshold cutoff

**Dynamic Weight Formula**:
```
effective_weight = base_weight × regional_sensitivity × confidence × time_decay × volatility × live_adjustment
```
Clamped to [min_weight, max_weight].

**Propagation Config**:
- Max depth: 5
- Hop decay: 0.15/hop
- Attenuation: 0.75
- Threshold cutoff: 0.03

## Layer C: Scoring Engine
**Purpose**: Convert graph outputs into 5 bounded insurance risk scores.

**5 Scores** (0-100 each):
1. Market Stress Score — macro-driven economic pressure
2. Claims Pressure Score — claims frequency + severity + cost inflation
3. Fraud Exposure Score — fraud clusters + suspicious providers + garage risk
4. Underwriting Risk Score — pricing drift + adequacy gap + reinsurance pressure
5. Portfolio Stability Score — loss ratio + lapse risk + segment growth

**Risk Level Mapping**:
- 0-39: Low
- 40-64: Medium
- 65-79: High
- 80-100: Critical

## Layer D: Recommendation Engine
**Purpose**: Translate scores into actionable executive decisions.

**Components**:
- 12 business rules
- Priority levels: critical, high, medium, low
- Action types: underwriting_control, fraud_investigation, reserve_review, pricing_adjustment, portfolio_review, executive_escalation, containment_strategy, monitoring_increase

## Layer E: Prediction + Explainability
**Purpose**: Persist predictions and explain every score.

**Explainability Payload**:
- Top drivers with impact strength
- Market-specific notes
- Confidence assessment
- Strongest graph edges
- Narrative summary
- Calibration status

## Layer F: Feedback + Calibration Loop
**Purpose**: Compare predictions to actual outcomes and self-correct.

**Error Metrics**:
- Direction accuracy: was the prediction directionally correct?
- Magnitude error: how far off?
- Timing error: did it happen when expected?

**Calibration Strategy**:
- Direction wrong → weight ×0.90, confidence ×0.85
- Direction right, magnitude > 20% → weight ×0.95
- Good prediction → weight ×1.01, confidence ×1.02
- EMA smoothing (α=0.3) for stable transitions

## Layer G: Audit Trail
**Purpose**: Immutable log of every significant system action.

**Logged Events**: signal_ingested, scoring_run, prediction_created, outcome_recorded, calibration_applied, recommendation_issued, weight_changed, manual_override

## Data Flow

```
External Signals → Signal Ingestion → Normalization → Graph Node Update
→ Reasoning Engine (BFS) → Score Target Nodes
→ Scoring Engine → 5 Scores → Risk Level
→ Recommendation Engine → Executive Actions
→ Prediction Record + Score Record + Recommendation Record + Audit Event
... time passes ...
→ Actual Outcomes Arrive → Feedback Service → Error Metrics
→ Calibration Engine → Weight + Confidence Update → Graph Updated
→ Next scoring cycle is more accurate
```
