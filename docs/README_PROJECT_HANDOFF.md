# Kuwait Motor Adaptive Risk Engine — Project Handoff

## Project Name
**Kuwait Motor Adaptive Risk Engine** (Deevo Cortex Phase 3)

## Objective
Build a production-grade adaptive decision intelligence engine for Kuwait motor insurance that transforms economic and insurance signals into actionable risk scores, executive recommendations, and self-calibrating predictions.

## What We Are Building Now
A single-market (Kuwait), single-portfolio (Motor Retail) adaptive risk engine with:
- Signal ingestion and normalization
- Graph-based economic reasoning with dynamic weights
- 5 GCC insurance risk scores (0-100)
- Rule-based executive recommendations (12 rules)
- Prediction persistence and outcome feedback
- Self-calibrating weight adjustment
- Full audit trail and explainability

## What We Are NOT Building Now
- Multi-market GCC deployment (Saudi, UAE, etc.)
- Global geopolitical monitoring platform
- Claims automation engine
- Full underwriting decisioning
- Machine learning models (rule-based first)
- Real-time streaming ingestion
- Mobile applications

## Architecture Layers

```
Layer A: Input Signals (macro + insurance + portfolio)
    ↓
Layer B: Graph Reasoning (dynamic weights, BFS propagation)
    ↓
Layer C: Scoring Engine (5 scores × market sensitivity)
    ↓
Layer D: Recommendation Engine (12 business rules)
    ↓
Layer E: Prediction Storage + Explainability
    ↓
Layer F: Outcome Feedback + Calibration Loop
    ↓
Layer G: Audit Trail (every action logged)
```

## Build Order (Strict)
1. Read all docs before coding
2. Lock product scope
3. Implement database models (11 tables)
4. Seed graph and market profiles
5. Implement signal ingestion service
6. Implement graph reasoning engine
7. Implement scoring engine
8. Implement recommendation engine
9. Implement prediction persistence
10. Implement outcome feedback
11. Implement calibration engine
12. Implement audit trail
13. Add API routes
14. Add tests
15. Add dashboard only after backend works

## Definition of Done
MVP is considered complete ONLY if:
- [ ] Signals can be ingested for Kuwait
- [ ] Graph nodes and edges are stored and queryable
- [ ] Scoring run returns 5 scores (0-100)
- [ ] Recommendations are generated with rationale
- [ ] Prediction record is persisted
- [ ] Actual outcomes can be submitted later
- [ ] Calibration updates weights and confidence
- [ ] Calibration history is stored
- [ ] Explainability payload is returned
- [ ] Audit events are recorded
- [ ] All API endpoints work end-to-end

## Tech Stack
- Backend: Python 3.11+ / FastAPI / Pydantic v2
- Database: PostgreSQL (MVP: in-memory)
- Frontend: Next.js + Tailwind CSS
- No ML — rule-based reasoning, graph propagation, threshold scoring
