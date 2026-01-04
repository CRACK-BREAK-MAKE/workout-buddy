"""
Workout Service - Business logic layer for workout operations

This module orchestrates workout-related business operations following
SOLID principles (SRP, DIP).

Responsibilities:
- Coordinate between repository and API layer
- Enforce business rules and validation
- Handle workout creation, retrieval, updates, deletion
- Provide workout statistics

NO database queries (delegated to repository)
NO HTTP concerns (delegated to routes)
"""

from uuid import UUID

from app.features.workouts.models.workout import ExerciseType
from app.features.workouts.repositories.workout_repository import WorkoutRepository
from app.features.workouts.schemas.workout_schemas import (
    WorkoutCreate,
    WorkoutListResponse,
    WorkoutRead,
    WorkoutStats,
)
from app.features.workouts.validators.workout_validator import WorkoutValidator


class WorkoutService:
    """
    Workout service for business logic.

    Depends on WorkoutRepository for data access (DIP).
    Testable without database or FastAPI.
    """

    def __init__(self, workout_repo: WorkoutRepository):
        """
        Initialize service with injected repository.

        Args:
            workout_repo: Workout repository for data access
        """
        self._workout_repo = workout_repo

    async def create_workout(self, user_id: UUID, workout_data: WorkoutCreate) -> WorkoutRead:
        """
        Create a new workout for a user.

        Business rules:
        - Validate workout data (delegated to WorkoutValidator - SRP)
        - Ensure reps_count >= 0
        - Ensure duration_seconds >= 0
        - Ensure calories_burned >= 0 if provided

        Args:
            user_id: ID of user creating workout
            workout_data: Workout creation data

        Returns:
            Created workout data

        Raises:
            ValueError: If validation fails
        """
        # Validate workout data (business rule enforcement - delegated to validator)
        WorkoutValidator.validate_workout_data(
            exercise_type=workout_data.exercise_type,
            reps_count=workout_data.reps_count,
            duration_seconds=workout_data.duration_seconds,
            calories_burned=workout_data.calories_burned,
        )

        # Create workout via repository
        workout = await self._workout_repo.create_workout(
            user_id=user_id,
            exercise_type=workout_data.exercise_type,
            reps_count=workout_data.reps_count,
            duration_seconds=workout_data.duration_seconds,
            calories_burned=workout_data.calories_burned,
        )

        return WorkoutRead.model_validate(workout)

    async def get_user_workouts(
        self,
        user_id: UUID,
        skip: int = 0,
        limit: int = 20,
        exercise_type: ExerciseType | None = None,
    ) -> WorkoutListResponse:
        """
        Get paginated list of workouts for a user.

        Args:
            user_id: User ID
            skip: Records to skip (pagination)
            limit: Max records to return (pagination)
            exercise_type: Optional filter by exercise type

        Returns:
            Paginated workout list with metadata
        """
        # Get workouts from repository
        workouts = await self._workout_repo.get_user_workouts(
            user_id=user_id, skip=skip, limit=limit, exercise_type=exercise_type
        )

        # Get total count for pagination metadata
        total = await self._workout_repo.count_user_workouts(
            user_id=user_id, exercise_type=exercise_type
        )

        # Convert to response schema
        workout_reads = [WorkoutRead.model_validate(w) for w in workouts]

        return WorkoutListResponse(workouts=workout_reads, total=total, skip=skip, limit=limit)

    async def get_workout_by_id(self, workout_id: UUID, user_id: UUID) -> WorkoutRead | None:
        """
        Get a specific workout by ID.

        Ensures user can only access their own workouts (authorization).

        Args:
            workout_id: Workout ID to retrieve
            user_id: User ID (for authorization)

        Returns:
            Workout data if found and authorized, None otherwise
        """
        workout = await self._workout_repo.get_workout_by_id(workout_id=workout_id, user_id=user_id)

        if workout is None:
            return None

        return WorkoutRead.model_validate(workout)

    async def delete_workout(self, workout_id: UUID, user_id: UUID) -> bool:
        """
        Delete a workout.

        Ensures user can only delete their own workouts (authorization).

        Args:
            workout_id: Workout ID to delete
            user_id: User ID (for authorization)

        Returns:
            True if deleted, False if not found or unauthorized
        """
        return await self._workout_repo.delete_workout(workout_id=workout_id, user_id=user_id)

    async def get_workout_stats(self, user_id: UUID) -> WorkoutStats:
        """
        Get basic workout statistics for a user.

        Aggregates total workouts, reps, duration, and calories.
        (Foundation for Phase 3 statistics feature)

        Args:
            user_id: User ID

        Returns:
            Workout statistics
        """
        stats = await self._workout_repo.get_workout_stats(user_id=user_id)
        return WorkoutStats(**stats)
