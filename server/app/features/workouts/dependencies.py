"""
Workout Dependencies - FastAPI dependency injection for workouts

This module provides dependency injection functions for:
- WorkoutRepository
- WorkoutService

Following DIP (Dependency Inversion Principle).
"""

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.features.workouts.repositories.workout_repository import WorkoutRepository
from app.features.workouts.services.workout_service import WorkoutService

# ============================================================================
# Repository Dependencies
# ============================================================================


async def get_workout_repository(db: AsyncSession = Depends(get_db)) -> WorkoutRepository:
    """
    Provide WorkoutRepository instance with database session.

    Args:
        db: Database session (injected)

    Returns:
        WorkoutRepository instance
    """
    return WorkoutRepository(db)


# ============================================================================
# Service Dependencies
# ============================================================================


async def get_workout_service(
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
) -> WorkoutService:
    """
    Provide WorkoutService instance with injected repository.

    Args:
        workout_repo: WorkoutRepository instance (injected)

    Returns:
        WorkoutService instance
    """
    return WorkoutService(workout_repo)
