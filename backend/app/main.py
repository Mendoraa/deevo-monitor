"""Deevo Cortex — Kuwait Motor Adaptive Risk Engine API."""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Legacy Phase 1/2 routes
from app.routes import economic_router

# Phase 3 Production API v1 routes
from app.api.routes_health import router as health_router
from app.api.routes_signals import router as signals_router
from app.api.routes_graph import router as graph_router
from app.api.routes_scoring import router as scoring_router
from app.api.routes_predictions import router as predictions_router
from app.api.routes_feedback import router as feedback_router
from app.api.routes_calibration import router as calibration_router
from app.api.routes_recommendations import router as recommendations_router

app = FastAPI(
    title="Deevo Cortex",
    description=(
        "Kuwait Motor Adaptive Risk Engine — "
        "GCC insurance decision intelligence with graph reasoning, "
        "dynamic weighting, calibration, and executive recommendations."
    ),
    version="3.0.0",
)

# CORS — configurable via ALLOWED_ORIGINS env var
_default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]
_env_origins = os.getenv("ALLOWED_ORIGINS", "")
_origins = [o.strip() for o in _env_origins.split(",") if o.strip()] if _env_origins else _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Legacy Routes (Phase 1/2) ─────────────────────────────────
app.include_router(economic_router)

# ─── Phase 3 Production API v1 Routes ──────────────────────────
app.include_router(health_router)
app.include_router(signals_router)
app.include_router(graph_router)
app.include_router(scoring_router)
app.include_router(predictions_router)
app.include_router(feedback_router)
app.include_router(calibration_router)
app.include_router(recommendations_router)


@app.get("/")
async def root():
    return {
        "name": "Deevo Cortex",
        "version": "3.0.0",
        "product": "Kuwait Motor Adaptive Risk Engine",
        "phase": "3-production",
        "api": {
            "v1_health": "GET /api/v1/health",
            "v1_signals": "POST /api/v1/signals/ingest",
            "v1_scoring": "POST /api/v1/scoring/run",
            "v1_predictions": "GET /api/v1/predictions/{id}",
            "v1_feedback": "POST /api/v1/feedback/outcomes",
            "v1_calibration": "POST /api/v1/calibration/run",
            "v1_recommendations": "GET /api/v1/recommendations/{id}",
            "v1_graph": "GET /api/v1/graph/nodes",
        },
        "legacy": {
            "analyze": "POST /api/economic-layer/analyze",
            "classify": "POST /api/economic-layer/classify",
            "scenario": "POST /api/economic-layer/scenario",
        },
    }
