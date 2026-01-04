"""
Statistics Dependencies - FastAPI dependency injection for statistics

This module provides dependency injection functions for:
- StatisticsService

Following DIP (Dependency Inversion Principle).
"""

from fastapi import Depends

from app.features.statistics.services.statistics_service import StatisticsService
from app.features.workouts.dependencies import get_workout_repository
from app.features.workouts.repositories.workout_repository import WorkoutRepository

# ============================================================================
# Service Dependencies
# ============================================================================


async def get_statistics_service(
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
) -> StatisticsService:
    """
    Provide StatisticsService instance with injected repository.

    Args:
        workout_repo: WorkoutRepository instance (injected)

    Returns:
        StatisticsService instance
    """
    return StatisticsService(workout_repo)
