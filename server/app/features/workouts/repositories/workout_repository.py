"""
Workout Repository - Data access layer for workouts

This module provides database operations for workout records following
the Repository pattern and SOLID principles (SRP, LSP).

Responsibilities:
- CRUD operations for workouts
- Filtering and pagination
- User-scoped queries (ensure users only access their own workouts)
"""

from typing import Any
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.auth.repositories.base_repository import BaseRepository
from app.features.workouts.models.workout import ExerciseType, Workout


class WorkoutRepository(BaseRepository[Workout]):
    """
    Workout repository for database operations.

    Inherits generic CRUD operations from BaseRepository and adds
    workout-specific queries like filtering by user, exercise type, etc.

    All methods enforce user ownership to prevent unauthorized access.
    """

    def __init__(self, db: AsyncSession):
        """Initialize repository with database session"""
        super().__init__(Workout, db)

    async def create_workout(
        self,
        user_id: UUID,
        exercise_type: ExerciseType,
        reps_count: int,
        duration_seconds: int,
        calories_burned: float | None = None,
    ) -> Workout:
        """
        Create a new workout for a user.

        Args:
            user_id: ID of user who performed the workout
            exercise_type: Type of exercise (push-up, jump-rope)
            reps_count: Number of repetitions
            duration_seconds: Workout duration
            calories_burned: Estimated calories (optional)

        Returns:
            Created workout instance
        """
        workout = Workout(
            user_id=user_id,
            exercise_type=exercise_type,
            reps_count=reps_count,
            duration_seconds=duration_seconds,
            calories_burned=calories_burned,
        )
        return await self.create(workout)

    async def get_user_workouts(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20,
        exercise_type: ExerciseType | None = None,
    ) -> list[Workout]:
        """
        Get workouts for a specific user with pagination and filtering.

        Args:
            user_id: User ID (ensures user only sees their workouts)
            skip: Number of records to skip (for pagination)
            limit: Maximum number of records to return
            exercise_type: Optional filter by exercise type

        Returns:
            List of workouts (most recent first)
        """
        query = select(Workout).where(Workout.user_id == user_id)

        # Apply exercise type filter if provided
        if exercise_type:
            query = query.where(Workout.exercise_type == exercise_type)

        # Order by created_at descending (most recent first)
        query = query.order_by(Workout.created_at.desc())

        # Apply pagination
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_workout_by_id(self, workout_id: UUID, user_id: UUID) -> Workout | None:
        """
        Get a specific workout by ID (user-scoped).

        Args:
            workout_id: Workout ID to retrieve
            user_id: User ID (ensures user can only access their own workouts)

        Returns:
            Workout if found and belongs to user, None otherwise
        """
        result = await self.db.execute(
            select(Workout).where(Workout.id == workout_id, Workout.user_id == user_id)
        )
        return result.scalars().first()

    async def count_user_workouts(
        self, user_id: UUID, exercise_type: ExerciseType | None = None
    ) -> int:
        """
        Count total workouts for a user (for pagination metadata).

        Args:
            user_id: User ID
            exercise_type: Optional filter by exercise type

        Returns:
            Total count of workouts
        """
        query = select(func.count(Workout.id)).where(Workout.user_id == user_id)

        if exercise_type:
            query = query.where(Workout.exercise_type == exercise_type)

        result = await self.db.execute(query)
        return result.scalar() or 0

    async def delete_workout(self, workout_id: UUID, user_id: UUID) -> bool:
        """
        Delete a workout (user-scoped).

        Args:
            workout_id: Workout ID to delete
            user_id: User ID (ensures user can only delete their own workouts)

        Returns:
            True if workout was deleted, False if not found or unauthorized
        """
        result = await self.db.execute(
            delete(Workout).where(Workout.id == workout_id, Workout.user_id == user_id)
        )
        await self.db.commit()
        # Check rowcount attribute exists and is greater than 0
        return hasattr(result, "rowcount") and (result.rowcount or 0) > 0

    async def get_workout_stats(self, user_id: UUID) -> dict[str, Any]:
        """
        Get basic workout statistics for a user (Phase 3 preview).

        Args:
            user_id: User ID

        Returns:
            Dictionary with total workouts, reps, duration, calories
        """
        result = await self.db.execute(
            select(
                func.count(Workout.id).label("total_workouts"),
                func.sum(Workout.reps_count).label("total_reps"),
                func.sum(Workout.duration_seconds).label("total_duration"),
                func.sum(Workout.calories_burned).label("total_calories"),
            ).where(Workout.user_id == user_id)
        )

        stats = result.first()

        if stats is None:
            return {
                "total_workouts": 0,
                "total_reps": 0,
                "total_duration_seconds": 0,
                "total_calories": 0.0,
            }

        return {
            "total_workouts": stats.total_workouts or 0,
            "total_reps": stats.total_reps or 0,
            "total_duration_seconds": stats.total_duration or 0,
            "total_calories": float(stats.total_calories or 0.0),
        }
