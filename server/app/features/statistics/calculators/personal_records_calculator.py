"""
Personal Records Calculator - Pure calculation logic for finding personal bests

This module finds personal records (PRs) from workout data following SRP.

Responsibilities:
- Find maximum reps by exercise type
- Find maximum duration by exercise type
- Track dates of personal records
- Pure functions with no side effects

NO database operations (service concern)
NO HTTP concerns (route concern)
ONLY calculation logic
"""

from typing import Any

from app.features.workouts.models.workout import ExerciseType, Workout


class PersonalRecordsCalculator:
    """
    Calculator for personal records (PRs).

    All methods are static and pure (no side effects).
    Testable without database or FastAPI.
    """

    @staticmethod
    def find_all_personal_records(workouts: list[Workout]) -> dict[str, Any]:
        """
        Find personal records for all exercise types.

        Args:
            workouts: List of all Workout instances

        Returns:
            Dictionary with personal records by exercise type

        Example:
            >>> records = PersonalRecordsCalculator.find_all_personal_records(workouts)
            >>> records['records']
            [{'exercise_type': 'push-up', 'max_reps': 120, ...}, ...]
        """
        # Group workouts by exercise type
        by_exercise = PersonalRecordsCalculator._group_by_exercise(workouts)

        # Find PRs for each exercise type
        records = []
        for exercise_type, exercise_workouts in by_exercise.items():
            pr = PersonalRecordsCalculator._find_exercise_pr(exercise_type.value, exercise_workouts)
            records.append(pr)

        # Sort by exercise type name
        records.sort(key=lambda x: x["exercise_type"])

        return {"records": records}

    @staticmethod
    def find_personal_record(
        exercise_type: ExerciseType, workouts: list[Workout]
    ) -> dict[str, Any]:
        """
        Find personal records for a specific exercise type.

        Args:
            exercise_type: Exercise type enum
            workouts: List of Workout instances (filtered by exercise_type)

        Returns:
            Dictionary with personal records

        Example:
            >>> pr = PersonalRecordsCalculator.find_personal_record(
            ...     ExerciseType.PUSH_UP, push_up_workouts
            ... )
        """
        return PersonalRecordsCalculator._find_exercise_pr(exercise_type.value, workouts)

    @staticmethod
    def _group_by_exercise(workouts: list[Workout]) -> dict[ExerciseType, list[Workout]]:
        """
        Group workouts by exercise type.

        Args:
            workouts: List of Workout instances

        Returns:
            Dictionary mapping ExerciseType to list of workouts
        """
        grouped: dict[ExerciseType, list[Workout]] = {}
        for workout in workouts:
            exercise_type = workout.exercise_type
            if exercise_type not in grouped:
                grouped[exercise_type] = []
            grouped[exercise_type].append(workout)
        return grouped

    @staticmethod
    def _find_exercise_pr(exercise_type_str: str, workouts: list[Workout]) -> dict[str, Any]:
        """
        Find personal records for a single exercise type.

        Args:
            exercise_type_str: Exercise type name (string)
            workouts: List of workouts for this exercise

        Returns:
            Dictionary with PR information
        """
        if not workouts:
            return {
                "exercise_type": exercise_type_str,
                "max_reps": None,
                "max_reps_date": None,
                "max_duration": None,
                "max_duration_date": None,
            }

        # Find workout with maximum reps
        max_reps_workout = max(workouts, key=lambda w: w.reps_count)
        max_reps = max_reps_workout.reps_count
        max_reps_date = max_reps_workout.created_at.date()

        # Find workout with maximum duration
        max_duration_workout = max(workouts, key=lambda w: w.duration_seconds)
        max_duration = max_duration_workout.duration_seconds
        max_duration_date = max_duration_workout.created_at.date()

        return {
            "exercise_type": exercise_type_str,
            "max_reps": max_reps,
            "max_reps_date": max_reps_date,
            "max_duration": max_duration,
            "max_duration_date": max_duration_date,
        }

    @staticmethod
    def check_is_personal_record(
        workout: Workout, previous_workouts: list[Workout]
    ) -> dict[str, bool]:
        """
        Check if a workout sets a new personal record.

        Useful for real-time notifications when user completes a workout.

        Args:
            workout: The new workout to check
            previous_workouts: List of previous workouts for same exercise type

        Returns:
            Dictionary with boolean flags:
            - is_reps_pr: bool
            - is_duration_pr: bool

        Example:
            >>> is_pr = PersonalRecordsCalculator.check_is_personal_record(
            ...     new_workout, previous_workouts
            ... )
            >>> is_pr['is_reps_pr']
            True
        """
        if not previous_workouts:
            # First workout is automatically a PR
            return {"is_reps_pr": True, "is_duration_pr": True}

        # Find previous records
        previous_max_reps = max(w.reps_count for w in previous_workouts)
        previous_max_duration = max(w.duration_seconds for w in previous_workouts)

        # Check if new workout beats previous records
        is_reps_pr = workout.reps_count > previous_max_reps
        is_duration_pr = workout.duration_seconds > previous_max_duration

        return {"is_reps_pr": is_reps_pr, "is_duration_pr": is_duration_pr}
