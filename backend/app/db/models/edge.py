"""Edge model — weighted directed relationship between nodes."""

from sqlalchemy import Column, String, Float, Boolean, Integer, DateTime, JSON, func
from app.db.base import Base


class Edge(Base):
    __tablename__ = "edges"

    id = Column(String, primary_key=True)
    edge_key = Column(String(200), unique=True, nullable=False, index=True)
    source_node_id = Column(String, nullable=False, index=True)
    target_node_id = Column(String, nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False)
    base_weight = Column(Float, nullable=False)
    current_weight = Column(Float, nullable=False)
    min_weight = Column(Float, default=0.05)
    max_weight = Column(Float, default=1.50)
    confidence_score = Column(Float, default=0.7)
    time_decay_factor = Column(Float, default=1.0)
    volatility_factor = Column(Float, default=1.0)
    lag_days = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    metadata_json = Column(JSON, nullable=True)
    last_calibrated_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class MarketEdgeProfile(Base):
    __tablename__ = "market_edge_profiles"

    id = Column(String, primary_key=True)
    edge_id = Column(String, nullable=False, index=True)
    market_code = Column(String(3), nullable=False, index=True)
    regional_sensitivity = Column(Float, default=1.0)
    override_weight = Column(Float, nullable=True)
    confidence_modifier = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
