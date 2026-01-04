"""
Statistics Routes - API endpoints for statistics and analytics

This module provides HTTP endpoints for:
- Overall summary statistics (GET /statistics/summary)
- Weekly breakdown (GET /statistics/weekly)
- Exercise-specific stats (GET /statistics/exercise/:type)

Thin controllers - HTTP concerns only, business logic delegated to service.
"""

from fastapi import APIRouter, Depends

from app.features.auth.dependencies import CurrentUser
from app.features.statistics.dependencies import get_statistics_service
from app.features.statistics.schemas.statistics_schemas import (
    ExerciseStats,
    OverallSummaryStats,
    WeeklyStats,
)
from app.features.statistics.services.statistics_service import StatisticsService
from app.features.workouts.models.workout import ExerciseType

router = APIRouter(prefix="/statistics", tags=["Statistics"])


# ============================================================================
# Endpoints
# ============================================================================


@router.get("/summary", response_model=OverallSummaryStats)
async def get_overall_summary(
    current_user: CurrentUser,
    statistics_service: StatisticsService = Depends(get_statistics_service),
) -> OverallSummaryStats:
    """
    Get overall summary statistics for authenticated user.

    **Authentication required**: Yes (JWT token)

    **Response:**
    ```json
    {
        "total_workouts": 150,
        "total_reps": 7500,
        "total_duration_seconds": 18000,
        "total_calories": 3750.0,
        "average_reps_per_workout": 50.0,
        "average_duration_per_workout": 120.0
    }
    ```

    **Status codes:**
    - 200: Success
    - 401: Unauthorized (no valid JWT token)
    """
    return await statistics_service.get_overall_summary(user_id=current_user.id)


@router.get("/weekly", response_model=WeeklyStats)
async def get_weekly_stats(
    current_user: CurrentUser,
    statistics_service: StatisticsService = Depends(get_statistics_service),
) -> WeeklyStats:
    """
    Get weekly breakdown for last 7 days.

    **Authentication required**: Yes (JWT token)

    **Response:**
    ```json
    {
        "start_date": "2025-12-29",
        "end_date": "2026-01-04",
        "total_workouts": 21,
        "total_reps": 1050,
        "total_duration_seconds": 2520,
        "total_calories": 525.0,
        "daily_breakdown": [
            {
                "date": "2025-12-29",
                "total_workouts": 3,
                "total_reps": 150,
                "total_duration_seconds": 360,
                "total_calories": 75.0
            },
            ...
        ]
    }
    ```

    **Status codes:**
    - 200: Success
    - 401: Unauthorized (no valid JWT token)
    """
    return await statistics_service.get_weekly_stats(user_id=current_user.id)


@router.get("/exercise/{exercise_type}", response_model=ExerciseStats)
async def get_exercise_stats(
    exercise_type: ExerciseType,
    current_user: CurrentUser,
    statistics_service: StatisticsService = Depends(get_statistics_service),
) -> ExerciseStats:
    """
    Get statistics for a specific exercise type.

    **Authentication required**: Yes (JWT token)

    **Path parameters:**
    - `exercise_type`: Exercise type (push-up, jump-rope)

    **Example:**
    ```
    GET /api/v1/statistics/exercise/push-up
    ```

    **Response:**
    ```json
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
    ```

    **Status codes:**
    - 200: Success
    - 401: Unauthorized (no valid JWT token)
    - 404: Exercise type not found
    """
    return await statistics_service.get_exercise_stats(
        user_id=current_user.id, exercise_type=exercise_type
    )
