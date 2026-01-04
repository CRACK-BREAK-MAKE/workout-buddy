"""
Statistics Service - Business logic orchestration for statistics

This module coordinates statistics calculations following SOLID principles (SRP, DIP).

Responsibilities:
- Fetch workout data from repository
- Delegate calculations to calculators
- Transform results to response schemas
- Handle business logic errors

NO database queries (delegated to repository)
NO HTTP concerns (delegated to routes)
NO calculation logic (delegated to calculators)
ONLY orchestration
"""

from datetime import date
from uuid import UUID

from app.features.statistics.calculators.personal_records_calculator import (
    PersonalRecordsCalculator,
)
from app.features.statistics.calculators.summary_calculator import SummaryCalculator
from app.features.statistics.calculators.weekly_calculator import WeeklyCalculator
from app.features.statistics.schemas.statistics_schemas import (
    ExerciseBreakdown,
    ExerciseStats,
    OverallSummaryStats,
    PersonalRecords,
    WeeklyStats,
)
from app.features.workouts.models.workout import ExerciseType
from app.features.workouts.repositories.workout_repository import WorkoutRepository


class StatisticsService:
    """
    Statistics service for orchestrating calculations.

    Depends on WorkoutRepository for data access (DIP).
    Delegates calculations to pure calculator functions (SRP).
    Testable without database or FastAPI.
    """

    def __init__(self, workout_repo: WorkoutRepository):
        """
        Initialize service with injected repository.

        Args:
            workout_repo: Workout repository for data access
        """
        self._workout_repo = workout_repo

    async def get_overall_summary(self, user_id: UUID) -> OverallSummaryStats:
        """
        Get overall summary statistics for a user.

        Fetches all workouts and delegates calculation to SummaryCalculator.

        Args:
            user_id: User ID

        Returns:
            Overall summary statistics
        """
        # Fetch all workouts for user (no pagination needed for stats)
        workouts = await self._workout_repo.get_user_workouts(
            user_id=user_id,
            skip=0,
            limit=10000,  # Large limit to get all
        )

        # Delegate calculation to calculator (pure function - SRP)
        stats_dict = SummaryCalculator.calculate_overall_stats(workouts)

        # Transform to response schema
        return OverallSummaryStats(**stats_dict)

    async def get_exercise_stats(self, user_id: UUID, exercise_type: ExerciseType) -> ExerciseStats:
        """
        Get statistics for a specific exercise type.

        Args:
            user_id: User ID
            exercise_type: Exercise type

        Returns:
            Exercise-specific statistics
        """
        # Fetch workouts filtered by exercise type
        workouts = await self._workout_repo.get_user_workouts(
            user_id=user_id, exercise_type=exercise_type, skip=0, limit=10000
        )

        # Delegate calculation to calculator
        stats_dict = SummaryCalculator.calculate_exercise_specific_stats(
            workouts, exercise_type.value
        )

        # Transform to response schema
        return ExerciseStats(**stats_dict)

    async def get_weekly_stats(self, user_id: UUID, end_date: date | None = None) -> WeeklyStats:
        """
        Get weekly breakdown for last 7 days.

        Args:
            user_id: User ID
            end_date: End date for the week (default: today)

        Returns:
            Weekly statistics with daily breakdown
        """
        # Determine date range
        if end_date is None:
            end_date = date.today()
        start_date, _ = WeeklyCalculator.get_date_range(7)

        # Fetch workouts for the week
        # Note: Repository returns workouts ordered by created_at desc
        # We'll fetch all and let the calculator filter by date
        workouts = await self._workout_repo.get_user_workouts(user_id=user_id, skip=0, limit=10000)

        # Delegate calculation to calculator
        stats_dict = WeeklyCalculator.calculate_weekly_stats(workouts, end_date)

        # Transform to response schema
        return WeeklyStats(**stats_dict)

    async def get_personal_records(self, user_id: UUID) -> PersonalRecords:
        """
        Get personal records for all exercise types.

        Args:
            user_id: User ID

        Returns:
            Personal records by exercise type
        """
        # Fetch all workouts
        workouts = await self._workout_repo.get_user_workouts(user_id=user_id, skip=0, limit=10000)

        # Delegate calculation to calculator
        records_dict = PersonalRecordsCalculator.find_all_personal_records(workouts)

        # Transform to response schema
        return PersonalRecords(**records_dict)

    async def get_exercise_breakdown(self, user_id: UUID) -> ExerciseBreakdown:
        """
        Get workout count by exercise type with percentages.

        Args:
            user_id: User ID

        Returns:
            Exercise type breakdown
        """
        # Fetch all workouts
        workouts = await self._workout_repo.get_user_workouts(user_id=user_id, skip=0, limit=10000)

        # Delegate calculation to calculator
        breakdown_dict = SummaryCalculator.calculate_exercise_breakdown(workouts)

        # Transform to response schema
        return ExerciseBreakdown(**breakdown_dict)
