# Recommendation Rulebook — Kuwait Motor Adaptive Risk Engine

## Rule Engine Design
- 12 business rules evaluated in priority order
- Multiple rules can fire simultaneously
- Actions are deduplicated by type + title
- Sorted by priority: critical → high → medium → low

## Rules

### R01: Claims-Underwriting Combined Stress
**Conditions**: claims_pressure > 70 AND underwriting_risk > 65
**Actions**:
1. [HIGH] Tighten underwriting for high-frequency segment
2. [HIGH] Review pricing adequacy across affected segments
3. [MEDIUM] Escalate portfolio review for motor retail

### R02: Elevated Fraud Exposure
**Conditions**: fraud_exposure > 75
**Actions**:
1. [CRITICAL] Trigger fraud investigation on suspicious clusters
2. [HIGH] Audit suspicious provider concentration zones
3. [HIGH] Pause fast-track claim approvals in flagged areas

### R03: Market Stress with Portfolio Instability
**Conditions**: market_stress > 80 AND portfolio_stability < 40
**Actions**:
1. [CRITICAL] Executive escalation — dual stress detected
2. [CRITICAL] Immediate reserve adequacy review
3. [HIGH] Activate containment strategy for affected portfolios

### R04: High Claims Pressure (standalone)
**Conditions**: claims_pressure > 75 AND underwriting_risk <= 65
**Actions**:
1. [HIGH] Review IBNR and case reserves for adequacy
2. [MEDIUM] Increase claims monitoring frequency

### R05: Underwriting Drift Detected
**Conditions**: underwriting_risk > 70 AND claims_pressure <= 70
**Actions**:
1. [HIGH] Recalibrate underwriting guidelines
2. [MEDIUM] Close pricing adequacy gap with rate adjustment

### R06: Garage Network Fraud Pattern
**Conditions**: fraud_exposure between 55 and 75
**Actions**:
1. [MEDIUM] Enhance garage network monitoring
2. [MEDIUM] Review top-5 suspicious providers for compliance

### R07: Portfolio Lapse Risk
**Conditions**: portfolio_stability < 45
**Actions**:
1. [HIGH] Review retention strategy for at-risk segments
2. [MEDIUM] Evaluate competitive pricing position

### R08: Market Macro Stress (standalone)
**Conditions**: market_stress > 70 AND portfolio_stability >= 40
**Actions**:
1. [MEDIUM] Increase macro indicator monitoring cadence
2. [MEDIUM] Stress-test reserves against macro scenario

### R09: Multi-Dimension Moderate Risk
**Conditions**: 4+ scores above 55 AND max score <= 75
**Actions**:
1. [MEDIUM] Broad risk monitoring — multiple dimensions elevated

### R10: Reinsurance Treaty Stress
**Conditions**: claims_pressure > 65 AND market_stress > 60
**Actions**:
1. [HIGH] Review reinsurance treaty capacity and terms

### R11: All Clear — Low Risk
**Conditions**: max(all scores) < 40
**Actions**:
1. [LOW] Continue standard monitoring cadence

### R12: Rapid Score Deterioration
**Conditions**: claims_pressure > 80 AND fraud_exposure > 60 AND underwriting_risk > 60
**Actions**:
1. [CRITICAL] Multi-axis deterioration — executive war room
2. [CRITICAL] Immediate portfolio containment measures
3. [HIGH] Deploy full fraud sweep on open claims

## Action Types
- underwriting_control: Tighten or modify UW guidelines
- fraud_investigation: Trigger formal fraud investigation
- reserve_review: IBNR, case reserves, catastrophe reserves
- pricing_adjustment: Rate changes, technical pricing review
- portfolio_review: Portfolio composition and concentration
- executive_escalation: C-level notification and war room
- containment_strategy: Halt new business, restrict growth
- monitoring_increase: Increase surveillance cadence

## Escalation Logic
- Any CRITICAL action → immediate notification to CRO
- 2+ HIGH actions from different rules → escalate to ExCo
- CRITICAL + portfolio_stability < 30 → board notification
