"""Math utility functions for Deevo Cortex."""

import math
from typing import List, Optional


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp value between min and max."""
    return max(min_val, min(max_val, value))


def normalize_to_range(
    value: float, min_val: float, max_val: float, target_min: float = 0, target_max: float = 100
) -> float:
    """Normalize value from [min_val, max_val] to [target_min, target_max]."""
    if max_val == min_val:
        return (target_min + target_max) / 2
    ratio = (value - min_val) / (max_val - min_val)
    return target_min + ratio * (target_max - target_min)


def exponential_decay(initial: float, decay_rate: float, time_units: float) -> float:
    """Compute exponential decay: initial * e^(-decay_rate * time_units)."""
    return initial * math.exp(-decay_rate * time_units)


def ema_smooth(current: float, previous: float, alpha: float = 0.3) -> float:
    """Exponential moving average smoothing."""
    return (alpha * current) + ((1 - alpha) * previous)


def weighted_average(values: List[float], weights: List[float]) -> float:
    """Compute weighted average. Returns 0 if weights sum to 0."""
    total_weight = sum(weights)
    if total_weight == 0:
        return 0.0
    return sum(v * w for v, w in zip(values, weights)) / total_weight


def sigmoid(x: float, midpoint: float = 50, steepness: float = 0.1) -> float:
    """Sigmoid function for smooth threshold transitions."""
    return 1.0 / (1.0 + math.exp(-steepness * (x - midpoint)))


def bounded_score(value: float) -> int:
    """Convert float to bounded 0-100 integer score."""
    return int(round(clamp(value, 0, 100)))
