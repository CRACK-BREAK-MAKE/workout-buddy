"""
Weekly Calculator - Pure calculation logic for weekly breakdown

This module calculates weekly statistics from workout data following SRP.

Responsibilities:
- Group workouts by date
- Calculate daily statistics
- Calculate weekly totals
- Pure functions with no side effects

NO database operations (service concern)
NO HTTP concerns (route concern)
ONLY calculation logic
"""

from datetime import date, timedelta
from typing import Any

from app.features.workouts.models.workout import Workout


class WeeklyCalculator:
    """
    Calculator for weekly statistics and daily breakdown.

    All methods are static and pure (no side effects).
    Testable without database or FastAPI.
    """

    @staticmethod
    def calculate_weekly_stats(
        workouts: list[Workout], end_date: date | None = None
    ) -> dict[str, Any]:
        """
        Calculate weekly statistics for last 7 days with daily breakdown.

        Args:
            workouts: List of Workout instances (should cover last 7 days)
            end_date: End date for the week (default: today)

        Returns:
            Dictionary with weekly statistics:
            - start_date: date
            - end_date: date
            - total_workouts: int
            - total_reps: int
            - total_duration_seconds: int
            - total_calories: float
            - daily_breakdown: list[dict]

        Example:
            >>> stats = WeeklyCalculator.calculate_weekly_stats(workouts)
            >>> len(stats['daily_breakdown'])
            7
        """
        if end_date is None:
            end_date = date.today()

        start_date = end_date - timedelta(days=6)  # Last 7 days including today

        # Filter workouts within date range (if not pre-filtered)
        filtered_workouts = [w for w in workouts if start_date <= w.created_at.date() <= end_date]

        # Group workouts by date
        workouts_by_date = WeeklyCalculator._group_by_date(filtered_workouts)

        # Calculate daily breakdown for all 7 days (including days with no workouts)
        daily_breakdown = []
        current_date = start_date
        for _ in range(7):
            day_workouts = workouts_by_date.get(current_date, [])
            day_stats = WeeklyCalculator._calculate_daily_stats(current_date, day_workouts)
            daily_breakdown.append(day_stats)
            current_date += timedelta(days=1)

        # Calculate weekly totals
        total_workouts = len(filtered_workouts)
        total_reps = sum(w.reps_count for w in filtered_workouts)
        total_duration = sum(w.duration_seconds for w in filtered_workouts)
        total_calories = sum(w.calories_burned or 0.0 for w in filtered_workouts)

        return {
            "start_date": start_date,
            "end_date": end_date,
            "total_workouts": total_workouts,
            "total_reps": total_reps,
            "total_duration_seconds": total_duration,
            "total_calories": total_calories,
            "daily_breakdown": daily_breakdown,
        }

    @staticmethod
    def _group_by_date(workouts: list[Workout]) -> dict[date, list[Workout]]:
        """
        Group workouts by date.

        Args:
            workouts: List of Workout instances

        Returns:
            Dictionary mapping date to list of workouts

        Example:
            >>> grouped = WeeklyCalculator._group_by_date(workouts)
            >>> grouped[date(2026, 1, 4)]
            [workout1, workout2, ...]
        """
        grouped: dict[date, list[Workout]] = {}
        for workout in workouts:
            workout_date = workout.created_at.date()
            if workout_date not in grouped:
                grouped[workout_date] = []
            grouped[workout_date].append(workout)
        return grouped

    @staticmethod
    def _calculate_daily_stats(day_date: date, workouts: list[Workout]) -> dict[str, Any]:
        """
        Calculate statistics for a single day.

        Args:
            day_date: Date for the day
            workouts: List of workouts on that day

        Returns:
            Dictionary with daily statistics

        Example:
            >>> day_stats = WeeklyCalculator._calculate_daily_stats(
            ...     date(2026, 1, 4), [workout1, workout2]
            ... )
        """
        if not workouts:
            return {
                "date": day_date,
                "total_workouts": 0,
                "total_reps": 0,
                "total_duration_seconds": 0,
                "total_calories": 0.0,
            }

        total_workouts = len(workouts)
        total_reps = sum(w.reps_count for w in workouts)
        total_duration = sum(w.duration_seconds for w in workouts)
        total_calories = sum(w.calories_burned or 0.0 for w in workouts)

        return {
            "date": day_date,
            "total_workouts": total_workouts,
            "total_reps": total_reps,
            "total_duration_seconds": total_duration,
            "total_calories": total_calories,
        }

    @staticmethod
    def get_date_range(days: int = 7) -> tuple[date, date]:
        """
        Get date range for last N days.

        Args:
            days: Number of days to include (default: 7)

        Returns:
            Tuple of (start_date, end_date)

        Example:
            >>> start, end = WeeklyCalculator.get_date_range(7)
            >>> (end - start).days
            6
        """
        end_date = date.today()
        start_date = end_date - timedelta(days=days - 1)
        return start_date, end_date
