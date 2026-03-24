"""Signal Snapshot model — every signal reading ingested."""

from sqlalchemy import Column, String, Float, DateTime, JSON, func
from app.db.base import Base


class SignalSnapshot(Base):
    __tablename__ = "signal_snapshots"

    id = Column(String, primary_key=True)
    market_code = Column(String(3), nullable=False, index=True)
    signal_key = Column(String(100), nullable=False, index=True)
    signal_category = Column(String(50), nullable=False)
    signal_value = Column(Float, nullable=False)
    normalized_value = Column(Float, nullable=True)
    source_name = Column(String(100), nullable=False)
    source_type = Column(String(50), nullable=False, default="manual")
    observed_at = Column(DateTime(timezone=True), nullable=False)
    ingested_at = Column(DateTime(timezone=True), server_default=func.now())
    metadata_json = Column(JSON, nullable=True)
