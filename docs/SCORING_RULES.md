# Scoring Rules — Kuwait Motor Adaptive Risk Engine

## 5 Risk Scores

### 1. Market Stress Score (0-100)
**What it measures**: Macro-economic pressure on the Kuwait insurance market.
**Key drivers**: Oil price, inflation rate, credit growth, interest rate, FX rate, trade volume.
**Interpretation**:
- 0-39 (Low): Stable macro environment, no intervention needed
- 40-64 (Medium): Some macro pressure building, monitor closely
- 65-79 (High): Significant macro stress, activate hedging and reserve checks
- 80-100 (Critical): Severe macro disruption, executive escalation required

### 2. Claims Pressure Score (0-100)
**What it measures**: Likelihood and severity of claims volume increase.
**Key drivers**: Claims frequency, claims severity, repair cost inflation, medical inflation, real estate activity, high-risk segment growth.
**Interpretation**:
- 0-39 (Low): Claims within historical norms
- 40-64 (Medium): Upward trend in claims, review reserves
- 65-79 (High): Claims surge likely, tighten approvals and review pricing
- 80-100 (Critical): Claims crisis, immediate reserve action and UW halt

### 3. Fraud Exposure Score (0-100)
**What it measures**: Vulnerability to organized and opportunistic fraud.
**Key drivers**: Fraud cluster density, suspicious provider concentration, garage network risk, claims frequency, underwriting drift.
**Interpretation**:
- 0-39 (Low): Standard fraud monitoring sufficient
- 40-64 (Medium): Emerging patterns detected, increase surveillance
- 65-79 (High): Active fraud clusters, trigger investigation
- 80-100 (Critical): Systemic fraud risk, pause fast-track approvals

### 4. Underwriting Risk Score (0-100)
**What it measures**: Drift between underwriting standards and actual risk.
**Key drivers**: Underwriting drift, pricing adequacy gap, premium adequacy, loss ratio, reinsurance pressure.
**Interpretation**:
- 0-39 (Low): Underwriting guidelines adequate
- 40-64 (Medium): Some drift detected, review guidelines
- 65-79 (High): Pricing gap widening, recalibrate pricing models
- 80-100 (Critical): Severe UW drift, halt new business in affected segments

### 5. Portfolio Stability Score (0-100)
**What it measures**: Overall health and retention of the motor portfolio.
**Key drivers**: Loss ratio, policy lapse risk, high-risk segment growth, pricing adequacy gap, underwriting drift.
**Interpretation**:
- 0-39 (Low): Portfolio healthy and stable
- 40-64 (Medium): Some instability signals, review retention strategy
- 65-79 (High): Portfolio under stress, activate containment measures
- 80-100 (Critical): Portfolio crisis, executive war room

## Overall Risk Level
Computed from composite of max score (60% weight) and average score (40% weight):
- Composite < 45: **Low**
- Composite 45-64: **Medium**
- Composite 65-79: **High**
- Composite >= 80: **Critical**

## Score Computation Method
Each score uses weighted average of contributing node values:
```
score = Σ(node_value × weight) / Σ(weights) × market_modifier
```
Bounded to integer 0-100.

## Market Modifiers (Kuwait)
- Market Stress: ×1.15 (high oil dependency amplifies)
- Fraud Exposure: ×1.10 (concentrated garage networks)
