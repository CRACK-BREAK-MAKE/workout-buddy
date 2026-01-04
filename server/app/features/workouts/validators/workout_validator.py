"""
Workout Validator - Business rule validation for workouts

This module validates workout data according to business rules following SRP.

Responsibilities:
- Validate workout field constraints
- Enforce business rules
- Raise clear validation errors

NO database operations (repository concern)
NO business logic orchestration (service concern)
ONLY validation logic
"""

from app.features.workouts.models.workout import ExerciseType


class WorkoutValidator:
    """
    Workout validator for business rule enforcement.

    Follows Single Responsibility Principle - ONLY validates workout data.
    Separated from model (data structure) and service (orchestration).
    """

    @staticmethod
    def validate_workout_data(
        exercise_type: ExerciseType,
        reps_count: int,
        duration_seconds: int,
        calories_burned: float | None = None,
    ) -> None:
        """
        Validate workout data against business rules.

        Business Rules:
        - reps_count must be >= 0 (can't have negative reps)
        - duration_seconds must be >= 0 (can't have negative duration)
        - calories_burned must be >= 0 if provided (can't burn negative calories)
        - exercise_type must be valid enum value (enforced by Pydantic)

        Args:
            exercise_type: Type of exercise performed
            reps_count: Number of repetitions
            duration_seconds: Duration in seconds
            calories_burned: Calories burned (optional)

        Raises:
            ValueError: If any validation rule is violated

        Example:
            >>> WorkoutValidator.validate_workout_data(
            ...     ExerciseType.PUSH_UP, 50, 120, 25.5
            ... )  # Passes validation
            >>> WorkoutValidator.validate_workout_data(
            ...     ExerciseType.PUSH_UP, -10, 120, 25.5
            ... )  # Raises ValueError
        """
        # Validate reps_count
        if reps_count < 0:
            raise ValueError(
                f"reps_count must be >= 0, got {reps_count}. Cannot have negative repetitions."
            )

        # Validate duration_seconds
        if duration_seconds < 0:
            raise ValueError(
                f"duration_seconds must be >= 0, got {duration_seconds}. "
                "Cannot have negative duration."
            )

        # Validate calories_burned (if provided)
        if calories_burned is not None and calories_burned < 0:
            raise ValueError(
                f"calories_burned must be >= 0, got {calories_burned}. "
                "Cannot burn negative calories."
            )

        # Note: exercise_type validation is handled by Pydantic enum validation
        # at the schema level, so we don't need to validate it here

    @staticmethod
    def validate_reps_count(reps_count: int) -> None:
        """
        Validate reps_count independently.

        Useful for partial updates where only reps_count is being changed.

        Args:
            reps_count: Number of repetitions

        Raises:
            ValueError: If reps_count < 0
        """
        if reps_count < 0:
            raise ValueError(f"reps_count must be >= 0, got {reps_count}")

    @staticmethod
    def validate_duration(duration_seconds: int) -> None:
        """
        Validate duration independently.

        Useful for partial updates where only duration is being changed.

        Args:
            duration_seconds: Duration in seconds

        Raises:
            ValueError: If duration_seconds < 0
        """
        if duration_seconds < 0:
            raise ValueError(f"duration_seconds must be >= 0, got {duration_seconds}")

    @staticmethod
    def validate_calories(calories_burned: float) -> None:
        """
        Validate calories independently.

        Useful for partial updates where only calories is being changed.

        Args:
            calories_burned: Calories burned

        Raises:
            ValueError: If calories_burned < 0
        """
        if calories_burned < 0:
            raise ValueError(f"calories_burned must be >= 0, got {calories_burned}")

    @staticmethod
    def validate_workout_update(
        reps_count: int | None = None,
        duration_seconds: int | None = None,
        calories_burned: float | None = None,
    ) -> None:
        """
        Validate partial workout update data.

        Only validates fields that are being updated (not None).

        Args:
            reps_count: Number of repetitions (optional)
            duration_seconds: Duration in seconds (optional)
            calories_burned: Calories burned (optional)

        Raises:
            ValueError: If any provided field violates business rules
        """
        if reps_count is not None:
            WorkoutValidator.validate_reps_count(reps_count)

        if duration_seconds is not None:
            WorkoutValidator.validate_duration(duration_seconds)

        if calories_burned is not None:
            WorkoutValidator.validate_calories(calories_burned)
