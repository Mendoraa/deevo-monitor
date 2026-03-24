"""Pydantic schemas for Recommendation Engine."""

from typing import Optional, List
from pydantic import BaseModel


class Recommendation(BaseModel):
    action_type: str
    priority: str
    title: str
    rationale: str
    action_payload: Optional[dict] = None
    status: str = "pending"


class RecommendationListResponse(BaseModel):
    assessment_id: str
    recommendations: List[Recommendation]
    total: int
