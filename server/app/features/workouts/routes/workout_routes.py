"""
Workout Routes - API endpoints for workout management

This module provides HTTP endpoints for:
- Creating workouts (POST /workouts)
- Listing workouts with pagination/filtering (GET /workouts)
- Getting specific workout (GET /workouts/:id)
- Deleting workouts (DELETE /workouts/:id)
- Getting workout statistics (GET /workouts/stats)

Thin controllers - HTTP concerns only, business logic delegated to service.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.features.auth.dependencies import CurrentUser
from app.features.workouts.dependencies import get_workout_service
from app.features.workouts.models.workout import ExerciseType
from app.features.workouts.schemas.workout_schemas import (
    WorkoutCreate,
    WorkoutListResponse,
    WorkoutRead,
    WorkoutStats,
)
from app.features.workouts.services.workout_service import WorkoutService

router = APIRouter(prefix="/workouts", tags=["Workouts"])


# ============================================================================
# Endpoints
# ============================================================================


@router.post("", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout_data: WorkoutCreate,
    current_user: CurrentUser,
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutRead:
    """
    Create a new workout for the authenticated user.

    **Authentication required**: Yes (JWT token)

    **Request body:**
    ```json
    {
        "exercise_type": "push-up",
        "reps_count": 50,
        "duration_seconds": 120,
        "calories_burned": 25.5
    }
    ```

    **Response:** Created workout with ID and timestamps

    **Status codes:**
    - 201: Workout created successfully
    - 401: Unauthorized (no valid JWT token)
    - 422: Validation error (invalid data)
    """
    try:
        workout = await workout_service.create_workout(
            user_id=current_user.id, workout_data=workout_data
        )
        return workout
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)) from e


@router.get("", response_model=WorkoutListResponse)
async def list_workouts(
    current_user: CurrentUser,
    workout_service: WorkoutService = Depends(get_workout_service),
    exercise_type: ExerciseType | None = Query(
        None, description="Filter by exercise type (push-up, jump-rope)"
    ),
    skip: int = Query(0, ge=0, description="Number of records to skip (pagination)"),
    limit: int = Query(20, ge=1, le=100, description="Max records to return"),
) -> WorkoutListResponse:
    """
    Get paginated list of workouts for authenticated user.

    **Authentication required**: Yes (JWT token)

    **Query parameters:**
    - `exercise_type`: Optional filter (push-up, jump-rope)
    - `skip`: Records to skip (default: 0)
    - `limit`: Max records to return (default: 20, max: 100)

    **Example:**
    ```
    GET /api/v1/workouts?exercise_type=push-up&skip=0&limit=20
    ```

    **Response:**
    ```json
    {
        "workouts": [...],
        "total": 150,
        "skip": 0,
        "limit": 20
    }
    ```

    **Status codes:**
    - 200: Success
    - 401: Unauthorized (no valid JWT token)
    """
    return await workout_service.get_user_workouts(
        user_id=current_user.id, skip=skip, limit=limit, exercise_type=exercise_type
    )


@router.get("/stats", response_model=WorkoutStats)
async def get_workout_stats(
    current_user: CurrentUser,
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutStats:
    """
    Get workout statistics for authenticated user.

    **Authentication required**: Yes (JWT token)

    **Response:**
    ```json
    {
        "total_workouts": 150,
        "total_reps": 7500,
        "total_duration_seconds": 18000,
        "total_calories": 3750.0
    }
    ```

    **Status codes:**
    - 200: Success
    - 401: Unauthorized (no valid JWT token)
    """
    return await workout_service.get_workout_stats(user_id=current_user.id)


@router.get("/{workout_id}", response_model=WorkoutRead)
async def get_workout(
    workout_id: UUID,
    current_user: CurrentUser,
    workout_service: WorkoutService = Depends(get_workout_service),
) -> WorkoutRead:
    """
    Get a specific workout by ID.

    **Authentication required**: Yes (JWT token)
    **Authorization**: User can only access their own workouts

    **Path parameters:**
    - `workout_id`: UUID of workout to retrieve

    **Status codes:**
    - 200: Success
    - 401: Unauthorized (no valid JWT token)
    - 404: Workout not found or unauthorized
    """
    workout = await workout_service.get_workout_by_id(
        workout_id=workout_id, user_id=current_user.id
    )

    if workout is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout {workout_id} not found or unauthorized",
        )

    return workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(
    workout_id: UUID,
    current_user: CurrentUser,
    workout_service: WorkoutService = Depends(get_workout_service),
) -> None:
    """
    Delete a workout.

    **Authentication required**: Yes (JWT token)
    **Authorization**: User can only delete their own workouts

    **Path parameters:**
    - `workout_id`: UUID of workout to delete

    **Status codes:**
    - 204: Workout deleted successfully (no content)
    - 401: Unauthorized (no valid JWT token)
    - 404: Workout not found or unauthorized
    """
    deleted = await workout_service.delete_workout(workout_id=workout_id, user_id=current_user.id)

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workout {workout_id} not found or unauthorized",
        )
