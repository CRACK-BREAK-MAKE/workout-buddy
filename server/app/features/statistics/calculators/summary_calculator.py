"""
Summary Calculator - Pure calculation logic for overall statistics

This module calculates overall summary statistics from workout data following SRP.

Responsibilities:
- Calculate total workouts, reps, duration, calories
- Calculate average reps and duration per workout
- Pure functions with no side effects

NO database operations (service concern)
NO HTTP concerns (route concern)
ONLY calculation logic
"""

from typing import Any

from app.features.workouts.models.workout import Workout


class SummaryCalculator:
    """
    Calculator for overall summary statistics.

    All methods are static and pure (no side effects).
    Testable without database or FastAPI.
    """

    @staticmethod
    def calculate_overall_stats(workouts: list[Workout]) -> dict[str, Any]:
        """
        Calculate overall statistics from a list of workouts.

        Args:
            workouts: List of Workout instances

        Returns:
            Dictionary with overall statistics:
            - total_workouts: int
            - total_reps: int
            - total_duration_seconds: int
            - total_calories: float
            - average_reps_per_workout: float
            - average_duration_per_workout: float

        Example:
            >>> workouts = [workout1, workout2, workout3]
            >>> stats = SummaryCalculator.calculate_overall_stats(workouts)
            >>> stats['total_workouts']
            3
        """
        if not workouts:
            # Handle empty list - return zeros
            return {
                "total_workouts": 0,
                "total_reps": 0,
                "total_duration_seconds": 0,
                "total_calories": 0.0,
                "average_reps_per_workout": 0.0,
                "average_duration_per_workout": 0.0,
            }

        total_workouts = len(workouts)
        total_reps = sum(w.reps_count for w in workouts)
        total_duration = sum(w.duration_seconds for w in workouts)
        total_calories = sum(w.calories_burned or 0.0 for w in workouts)

        # Calculate averages
        average_reps = total_reps / total_workouts if total_workouts > 0 else 0.0
        average_duration = total_duration / total_workouts if total_workouts > 0 else 0.0

        return {
            "total_workouts": total_workouts,
            "total_reps": total_reps,
            "total_duration_seconds": total_duration,
            "total_calories": total_calories,
            "average_reps_per_workout": round(average_reps, 2),
            "average_duration_per_workout": round(average_duration, 2),
        }

    @staticmethod
    def calculate_exercise_specific_stats(
        workouts: list[Workout], exercise_type: str
    ) -> dict[str, Any]:
        """
        Calculate statistics for a specific exercise type.

        Args:
            workouts: List of Workout instances (filtered by exercise_type)
            exercise_type: Exercise type name (for response)

        Returns:
            Dictionary with exercise-specific statistics

        Example:
            >>> push_up_workouts = [w for w in workouts if w.exercise_type == ExerciseType.PUSH_UP]
            >>> stats = SummaryCalculator.calculate_exercise_specific_stats(
            ...     push_up_workouts, "push-up"
            ... )
        """
        if not workouts:
            return {
                "exercise_type": exercise_type,
                "total_workouts": 0,
                "total_reps": 0,
                "total_duration_seconds": 0,
                "total_calories": 0.0,
                "average_reps": 0.0,
                "personal_record_reps": None,
                "personal_record_duration": None,
            }

        total_workouts = len(workouts)
        total_reps = sum(w.reps_count for w in workouts)
        total_duration = sum(w.duration_seconds for w in workouts)
        total_calories = sum(w.calories_burned or 0.0 for w in workouts)

        # Calculate averages
        average_reps = total_reps / total_workouts if total_workouts > 0 else 0.0

        # Find personal records
        max_reps = max(w.reps_count for w in workouts) if workouts else None
        max_duration = max(w.duration_seconds for w in workouts) if workouts else None

        return {
            "exercise_type": exercise_type,
            "total_workouts": total_workouts,
            "total_reps": total_reps,
            "total_duration_seconds": total_duration,
            "total_calories": total_calories,
            "average_reps": round(average_reps, 2),
            "personal_record_reps": max_reps,
            "personal_record_duration": max_duration,
        }

    @staticmethod
    def calculate_exercise_breakdown(workouts: list[Workout]) -> dict[str, Any]:
        """
        Calculate workout count by exercise type with percentages.

        Args:
            workouts: List of all Workout instances

        Returns:
            Dictionary with total and breakdown by exercise type

        Example:
            >>> breakdown = SummaryCalculator.calculate_exercise_breakdown(workouts)
            >>> breakdown['total_workouts']
            150
            >>> breakdown['breakdown']
            [{'exercise_type': 'push-up', 'count': 75, 'percentage': 50.0}, ...]
        """
        if not workouts:
            return {"total_workouts": 0, "breakdown": []}

        total_workouts = len(workouts)

        # Count by exercise type
        counts: dict[str, int] = {}
        for workout in workouts:
            exercise_type = workout.exercise_type.value
            counts[exercise_type] = counts.get(exercise_type, 0) + 1

        # Calculate percentages
        breakdown = []
        for exercise_type, count in counts.items():
            percentage = (count / total_workouts * 100) if total_workouts > 0 else 0.0
            breakdown.append(
                {
                    "exercise_type": exercise_type,
                    "count": count,
                    "percentage": round(percentage, 2),
                }
            )

        # Sort by count descending (x["count"] is guaranteed to be int from our logic above)
        breakdown.sort(key=lambda x: x["count"], reverse=True)  # type: ignore[arg-type,return-value]

        return {"total_workouts": total_workouts, "breakdown": breakdown}
