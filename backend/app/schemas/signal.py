"""Pydantic schemas for Signal Ingestion."""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


class SignalItem(BaseModel):
    signal_key: str = Field(..., min_length=1, max_length=100)
    signal_value: float
    signal_category: str = "macro"
    source_name: str = "manual"
    source_type: str = "manual"
    observed_at: datetime
    metadata: Optional[dict] = None


class SignalIngestRequest(BaseModel):
    market_code: str = Field(..., min_length=3, max_length=3)
    signals: List[SignalItem] = Field(..., min_length=1)


class SignalIngestResponse(BaseModel):
    market_code: str
    ingested_count: int
    snapshot_ids: List[str]
    timestamp: datetime


class SignalLatestResponse(BaseModel):
    market_code: str
    signals: List[dict]
    count: int
