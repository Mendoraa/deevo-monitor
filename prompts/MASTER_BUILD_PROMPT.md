# Master Build Prompt — Kuwait Motor Adaptive Risk Engine

## Instructions for AI Builder / Co-work

You are building a production-grade MVP called **Kuwait Motor Adaptive Risk Engine**.

Before writing ANY code, you MUST read these files in this order:
1. `docs/README_PROJECT_HANDOFF.md`
2. `docs/PRODUCT_SCOPE.md`
3. `docs/SYSTEM_ARCHITECTURE.md`
4. `specs/GRAPH_SPEC.yaml`
5. `docs/SCORING_RULES.md`
6. `docs/RECOMMENDATION_RULEBOOK.md`
7. `docs/DATA_CONTRACT.md`
8. `specs/SEED_DATA.json`

## Build Order (Strict — do not deviate)
1. Backend skeleton (FastAPI + project structure)
2. Database models (11 tables)
3. Seed graph and market profiles (from GRAPH_SPEC.yaml)
4. Signal ingestion service + normalization
5. Graph registry service + effective weight computation
6. Reasoning engine (BFS propagation)
7. Scoring engine (5 scores)
8. Recommendation engine (12 rules from RECOMMENDATION_RULEBOOK.md)
9. Prediction storage + explainability service
10. Feedback service (outcome ingestion)
11. Calibration engine (direction/magnitude/timing errors)
12. Audit trail
13. API routes (from DATA_CONTRACT.md)
14. Tests
15. Dashboard (only after backend works end-to-end)

## Non-Negotiable Rules
- Build real code, not pseudocode
- No placeholder comments like "implement later"
- No incomplete skeletons
- Every service must be fully functional
- All imports must resolve
- Schemas and models must match
- API responses must match DATA_CONTRACT.md
- Graph structure must match GRAPH_SPEC.yaml exactly
- All 12 recommendation rules from RECOMMENDATION_RULEBOOK.md
- Calibration must update weights and store records

## Tech Stack
- Python 3.11+ / FastAPI / Pydantic v2
- PostgreSQL (MVP: in-memory stores acceptable)
- Next.js + Tailwind for dashboard

## Acceptance Criteria
The build is NOT complete until:
- [ ] POST /api/v1/signals/ingest works with Kuwait signals
- [ ] POST /api/v1/scoring/run returns 5 scores + risk_level + recommendations
- [ ] GET /api/v1/predictions/{id} returns stored prediction
- [ ] POST /api/v1/feedback/outcomes accepts actual outcomes
- [ ] POST /api/v1/calibration/run updates edge weights
- [ ] GET /api/v1/calibration/history shows calibration audit trail
- [ ] GET /api/v1/recommendations/{id} returns actionable items
- [ ] Explainability payload includes top_drivers, narrative, and confidence
- [ ] All response shapes match DATA_CONTRACT.md
- [ ] End-to-end test passes: ingest → score → feedback → calibrate

## Continuation Prompt
If you stop partway, resume with:
```
Continue from where you stopped. No summaries, no placeholders.
Complete each file properly. Ensure imports match.
Ensure the code is runnable. Resume from the next missing file.
```
