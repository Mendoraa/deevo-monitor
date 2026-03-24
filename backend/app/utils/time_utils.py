"""Time utility functions for Deevo Cortex."""

from datetime import datetime, timedelta
from typing import Optional
import math


def utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.utcnow()


def utc_now_iso() -> str:
    """Return current UTC as ISO string."""
    return datetime.utcnow().isoformat()


def hours_since(dt: datetime) -> float:
    """Hours elapsed since a given datetime."""
    delta = datetime.utcnow() - dt
    return delta.total_seconds() / 3600


def days_since(dt: datetime) -> float:
    """Days elapsed since a given datetime."""
    delta = datetime.utcnow() - dt
    return delta.total_seconds() / 86400


def compute_time_decay(hours_elapsed: float, half_life_hours: float = 168) -> float:
    """Compute time decay factor (0-1). Default half-life: 7 days."""
    if hours_elapsed <= 0:
        return 1.0
    decay_rate = math.log(2) / half_life_hours
    return math.exp(-decay_rate * hours_elapsed)


def parse_date(date_str: str) -> Optional[datetime]:
    """Parse ISO date string to datetime."""
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return None
