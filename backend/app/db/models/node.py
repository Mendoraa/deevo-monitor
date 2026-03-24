"""Node model — economic/insurance/portfolio variable in the graph."""

from sqlalchemy import Column, String, Float, DateTime, JSON, func
from app.db.base import Base


class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True)
    node_key = Column(String(100), unique=True, nullable=False, index=True)
    label = Column(String(200), nullable=False)
    node_type = Column(String(50), nullable=False)
    market_code = Column(String(3), nullable=True, index=True)
    sector = Column(String(100), nullable=True)
    base_value = Column(Float, default=0.0)
    current_value = Column(Float, default=0.0)
    normalized_value = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.7)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
