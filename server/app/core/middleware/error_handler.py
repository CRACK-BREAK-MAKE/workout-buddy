"""
Global Error Handler Middleware - SRP: ONLY unhandled exception handling

This module catches and handles all unhandled exceptions:
- Logs errors with full context
- Returns standardized error responses
- Hides internal details in production
- Provides detailed errors in development
"""

from typing import Any

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse

from app.core.config.base_settings import base_settings
from app.core.logging.config import get_logger

logger = get_logger(__name__)


async def handle_errors(request: Request, call_next: Any) -> Response:
    """
    Catch and handle all unhandled exceptions globally.

    Provides:
    - Comprehensive error logging with request context
    - Standardized error response format
    - Environment-aware error messages (detailed in dev, safe in prod)

    Args:
        request: Incoming HTTP request
        call_next: Next middleware in chain

    Returns:
        Response (normal or error response)
    """
    try:
        return await call_next(request)

    except Exception as exc:
        # Log unhandled exception with full context
        logger.error(
            "Unhandled exception",
            extra={
                "method": request.method,
                "path": request.url.path,
                "error_type": type(exc).__name__,
                "error_message": str(exc),
            },
            exc_info=True,  # Include full stack trace
        )

        # Determine error message based on environment
        if base_settings.ENVIRONMENT == "development":
            # Development: Show detailed error for debugging
            error_detail = f"{type(exc).__name__}: {str(exc)}"
        else:
            # Production: Hide internal details for security
            error_detail = "An internal error occurred. Please try again later."

        # Return standardized error response
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": error_detail,
                "type": "internal_server_error",
            },
        )
