"""
Statistics Schemas - Pydantic models for statistics responses

This module defines response schemas for:
- Overall summary statistics
- Weekly breakdown (last 7 days)
- Exercise-specific statistics
- Personal records
"""

from __future__ import annotations

from datetime import date as date_type

from pydantic import BaseModel, Field

from app.features.workouts.models.workout import ExerciseType

# ============================================================================
# Overall Summary Statistics
# ============================================================================


class OverallSummaryStats(BaseModel):
    """
    Overall statistics across all workouts.

    Used in GET /api/v1/statistics/summary endpoint.

    Example:
        {
            "total_workouts": 150,
            "total_reps": 7500,
            "total_duration_seconds": 18000,
            "total_calories": 3750.0,
            "average_reps_per_workout": 50.0,
            "average_duration_per_workout": 120.0
        }
    """

    total_workouts: int = Field(..., ge=0, description="Total number of workouts")
    total_reps: int = Field(..., ge=0, description="Total repetitions across all workouts")
    total_duration_seconds: int = Field(..., ge=0, description="Total workout time in seconds")
    total_calories: float = Field(..., ge=0, description="Total calories burned")
    average_reps_per_workout: float = Field(..., ge=0, description="Average reps per workout")
    average_duration_per_workout: float = Field(
        ..., ge=0, description="Average duration per workout (seconds)"
    )


# ============================================================================
# Exercise-Specific Statistics
# ============================================================================


class ExerciseStats(BaseModel):
    """
    Statistics for a specific exercise type.

    Used in GET /api/v1/statistics/exercise/:type endpoint.

    Example:
        {
            "exercise_type": "push-up",
            "total_workouts": 75,
            "total_reps": 3750,
            "total_duration_seconds": 9000,
            "total_calories": 1875.0,
            "average_reps": 50.0,
            "personal_record_reps": 120,
            "personal_record_duration": 180
        }
    """

    exercise_type: ExerciseType = Field(..., description="Exercise type")
    total_workouts: int = Field(..., ge=0, description="Total workouts for this exercise")
    total_reps: int = Field(..., ge=0, description="Total reps for this exercise")
    total_duration_seconds: int = Field(..., ge=0, description="Total duration for this exercise")
    total_calories: float = Field(..., ge=0, description="Total calories for this exercise")
    average_reps: float = Field(..., ge=0, description="Average reps per workout")
    personal_record_reps: int | None = Field(None, description="Highest reps in single workout")
    personal_record_duration: int | None = Field(
        None, description="Longest duration in single workout"
    )


# ============================================================================
# Weekly Breakdown Statistics
# ============================================================================


class DailyWorkoutStats(BaseModel):
    """
    Statistics for a single day.

    Example:
        {
            "date": "2026-01-04",
            "total_workouts": 3,
            "total_reps": 150,
            "total_duration_seconds": 360,
            "total_calories": 75.0
        }
    """

    date: date_type = Field(..., description="Date (YYYY-MM-DD)")
    total_workouts: int = Field(..., ge=0, description="Workouts on this day")
    total_reps: int = Field(..., ge=0, description="Total reps on this day")
    total_duration_seconds: int = Field(..., ge=0, description="Total duration on this day")
    total_calories: float = Field(..., ge=0, description="Total calories on this day")


class WeeklyStats(BaseModel):
    """
    Weekly breakdown for last 7 days.

    Used in GET /api/v1/statistics/weekly endpoint.

    Example:
        {
            "start_date": "2025-12-29",
            "end_date": "2026-01-04",
            "total_workouts": 21,
            "total_reps": 1050,
            "daily_breakdown": [
                {"date": "2025-12-29", "total_workouts": 3, ...},
                {"date": "2025-12-30", "total_workouts": 2, ...},
                ...
            ]
        }
    """

    start_date: date_type = Field(..., description="Start of week range")
    end_date: date_type = Field(..., description="End of week range (today)")
    total_workouts: int = Field(..., ge=0, description="Total workouts in week")
    total_reps: int = Field(..., ge=0, description="Total reps in week")
    total_duration_seconds: int = Field(..., ge=0, description="Total duration in week")
    total_calories: float = Field(..., ge=0, description="Total calories in week")
    daily_breakdown: list[DailyWorkoutStats] = Field(
        ..., description="Day-by-day breakdown (7 days)"
    )


# ============================================================================
# Personal Records
# ============================================================================


class PersonalRecord(BaseModel):
    """
    Personal record for an exercise type.

    Example:
        {
            "exercise_type": "push-up",
            "max_reps": 120,
            "max_reps_date": "2026-01-01",
            "max_duration": 180,
            "max_duration_date": "2026-01-03"
        }
    """

    exercise_type: ExerciseType = Field(..., description="Exercise type")
    max_reps: int | None = Field(None, description="Highest reps in single workout")
    max_reps_date: date_type | None = Field(None, description="Date of max reps record")
    max_duration: int | None = Field(None, description="Longest duration in seconds")
    max_duration_date: date_type | None = Field(None, description="Date of max duration record")


class PersonalRecords(BaseModel):
    """
    All personal records by exercise type.

    Example:
        {
            "records": [
                {"exercise_type": "push-up", "max_reps": 120, ...},
                {"exercise_type": "jump-rope", "max_reps": 500, ...}
            ]
        }
    """

    records: list[PersonalRecord] = Field(..., description="Personal records by exercise type")


# ============================================================================
# Exercise Type Breakdown
# ============================================================================


class ExerciseTypeCount(BaseModel):
    """
    Workout count by exercise type.

    Example:
        {
            "exercise_type": "push-up",
            "count": 75,
            "percentage": 50.0
        }
    """

    exercise_type: ExerciseType = Field(..., description="Exercise type")
    count: int = Field(..., ge=0, description="Number of workouts")
    percentage: float = Field(..., ge=0, le=100, description="Percentage of total workouts")


class ExerciseBreakdown(BaseModel):
    """
    Breakdown of workouts by exercise type.

    Example:
        {
            "total_workouts": 150,
            "breakdown": [
                {"exercise_type": "push-up", "count": 75, "percentage": 50.0},
                {"exercise_type": "jump-rope", "count": 75, "percentage": 50.0}
            ]
        }
    """

    total_workouts: int = Field(..., ge=0, description="Total workouts")
    breakdown: list[ExerciseTypeCount] = Field(..., description="Breakdown by exercise type")
