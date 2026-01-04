"""
Workout Schemas - Pydantic models for request/response validation

This module defines Pydantic schemas for:
- Creating new workouts
- Reading workout data
- Listing workouts with pagination/filtering
"""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.features.workouts.models.workout import ExerciseType

# ============================================================================
# Base Schema
# ============================================================================


class WorkoutBase(BaseModel):
    """Base workout schema with common fields"""

    exercise_type: ExerciseType = Field(..., description="Type of exercise performed")
    reps_count: int = Field(..., ge=0, description="Number of repetitions completed")
    duration_seconds: int = Field(..., ge=0, description="Duration of workout in seconds")
    calories_burned: float | None = Field(
        None, ge=0, description="Estimated calories burned (optional)"
    )


# ============================================================================
# Request Schemas
# ============================================================================


class WorkoutCreate(WorkoutBase):
    """
    Schema for creating a new workout.

    Used in POST /api/v1/workouts endpoint.
    User ID will be extracted from JWT token, not from request body.

    Example:
        {
            "exercise_type": "push-up",
            "reps_count": 50,
            "duration_seconds": 120,
            "calories_burned": 25.5
        }
    """

    pass


class WorkoutUpdate(BaseModel):
    """
    Schema for updating an existing workout (optional fields).

    Used in PUT/PATCH /api/v1/workouts/:id endpoint.
    All fields are optional to support partial updates.

    Example:
        {
            "reps_count": 60,
            "calories_burned": 30.0
        }
    """

    exercise_type: ExerciseType | None = None
    reps_count: int | None = Field(None, ge=0)
    duration_seconds: int | None = Field(None, ge=0)
    calories_burned: float | None = Field(None, ge=0)


# ============================================================================
# Response Schemas
# ============================================================================


class WorkoutRead(WorkoutBase):
    """
    Schema for reading workout data (response).

    Includes all workout fields plus metadata (id, timestamps).
    Used in GET /api/v1/workouts/:id and GET /api/v1/workouts responses.

    Example:
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "user_id": "987fcdeb-51a2-43f7-8765-123456789abc",
            "exercise_type": "push-up",
            "reps_count": 50,
            "duration_seconds": 120,
            "calories_burned": 25.5,
            "created_at": "2026-01-04T10:30:00Z",
            "updated_at": "2026-01-04T10:30:00Z"
        }
    """

    id: UUID = Field(..., description="Unique workout identifier")
    user_id: UUID = Field(..., description="User who performed the workout")
    created_at: datetime = Field(..., description="When workout was recorded")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Pagination & Filtering Schemas
# ============================================================================


class WorkoutFilters(BaseModel):
    """
    Query parameters for filtering workouts.

    Used in GET /api/v1/workouts endpoint.

    Example:
        GET /api/v1/workouts?exercise_type=push-up&skip=0&limit=20
    """

    exercise_type: ExerciseType | None = Field(None, description="Filter by exercise type")
    skip: int = Field(0, ge=0, description="Number of records to skip (pagination)")
    limit: int = Field(20, ge=1, le=100, description="Max number of records to return")


class WorkoutListResponse(BaseModel):
    """
    Response schema for listing workouts (paginated).

    Includes workouts array and pagination metadata.

    Example:
        {
            "workouts": [...],
            "total": 150,
            "skip": 0,
            "limit": 20
        }
    """

    workouts: list[WorkoutRead] = Field(..., description="List of workouts")
    total: int = Field(..., description="Total number of workouts (before pagination)")
    skip: int = Field(..., description="Number of records skipped")
    limit: int = Field(..., description="Max records returned")


# ============================================================================
# Statistics Schemas (for Phase 3)
# ============================================================================


class WorkoutStats(BaseModel):
    """
    Basic workout statistics (placeholder for Phase 3).

    Example:
        {
            "total_workouts": 150,
            "total_reps": 7500,
            "total_duration_seconds": 18000,
            "total_calories": 3750.0
        }
    """

    total_workouts: int = Field(..., description="Total number of workouts")
    total_reps: int = Field(..., description="Total repetitions across all workouts")
    total_duration_seconds: int = Field(..., description="Total workout time in seconds")
    total_calories: float = Field(..., description="Total calories burned")
