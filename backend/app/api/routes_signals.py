"""Signals API — ingest and query market/insurance signals."""

from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import Optional

from app.schemas.signal import (
    SignalIngestRequest,
    SignalIngestResponse,
    SignalLatestResponse,
)
from app.services.signal_ingestion_service import SignalIngestionService
from app.services.graph_registry_service import graph_registry
from app.services.audit_service import audit_service

router = APIRouter(prefix="/api/v1/signals", tags=["signals"])

# Service + in-memory signal store (production: PostgreSQL)
_ingestion = SignalIngestionService()
_signal_store: list = []


@router.post("/ingest", response_model=SignalIngestResponse)
def ingest_signals(request: SignalIngestRequest):
    """POST /api/v1/signals/ingest — batch ingest market signals."""
    signals = [
        {
            "signal_key": s.signal_key,
            "signal_value": s.signal_value,
            "signal_category": s.signal_category,
            "source_name": s.source_name,
            "source_type": s.source_type,
            "observed_at": s.observed_at.isoformat(),
        }
        for s in request.signals
    ]

    result = _ingestion.ingest_batch(
        market_code=request.market_code,
        signals=signals,
    )

    # Store snapshots for later retrieval
    _signal_store.extend(result["snapshots"])

    # Update graph nodes with latest signal values
    graph_registry.initialize()
    for snap in result["snapshots"]:
        graph_registry.update_node_value(
            snap["signal_key"],
            value=snap["signal_value"],
            normalized=snap["normalized_value"],
        )

    # Audit log
    audit_service.log_signal_ingestion(
        market_code=request.market_code,
        count=result["ingested_count"],
        snapshot_ids=result["snapshot_ids"],
    )

    return SignalIngestResponse(
        market_code=result["market_code"],
        ingested_count=result["ingested_count"],
        snapshot_ids=result["snapshot_ids"],
        timestamp=datetime.utcnow(),
    )


@router.get("/latest", response_model=SignalLatestResponse)
def get_latest_signals(market_code: str = Query(..., min_length=3, max_length=3)):
    """GET /api/v1/signals/latest?market_code=KWT — latest signals per key."""
    result = _ingestion.get_latest_signals(
        market_code=market_code,
        signal_store=_signal_store,
    )
    return SignalLatestResponse(
        market_code=result["market_code"],
        signals=result["signals"],
        count=result["count"],
    )
