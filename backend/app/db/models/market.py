"""Market model — represents a GCC insurance market."""

from sqlalchemy import Column, String, Boolean, DateTime, func
from app.db.base import Base


class Market(Base):
    __tablename__ = "markets"

    id = Column(String, primary_key=True)
    code = Column(String(3), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
