"""
Request Logging Middleware - SRP: ONLY request/response logging

This module handles HTTP request and response logging:
- Request method, path, query parameters
- Response status code
- Request duration timing
- Client IP and metadata
- Error logging with stack traces
"""

import time
from typing import Any

from fastapi import Request, Response

from app.core.logging.config import get_logger

logger = get_logger(__name__)


async def log_requests(request: Request, call_next: Any) -> Response:
    """
    Log all HTTP requests and responses with timing information.

    Logs include:
    - Request: method, path, query params, client IP
    - Response: status code
    - Performance: request duration in milliseconds
    - Errors: exception details with stack traces

    Args:
        request: Incoming HTTP request
        call_next: Next middleware in chain

    Returns:
        Response with logging completed
    """
    start_time = time.time()

    # Extract request metadata
    method = request.method
    path = request.url.path
    query = str(request.url.query) if request.url.query else None
    client_ip = request.client.host if request.client else None

    try:
        # Process request
        response = await call_next(request)

        # Calculate duration
        duration_ms = (time.time() - start_time) * 1000

        # Log successful request
        logger.info(
            f"{method} {path}",
            extra={
                "method": method,
                "path": path,
                "query": query,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "client_ip": client_ip,
            },
        )

        return response

    except Exception as exc:
        # Calculate duration even for errors
        duration_ms = (time.time() - start_time) * 1000

        # Log error with context
        logger.error(
            f"{method} {path} - ERROR",
            extra={
                "method": method,
                "path": path,
                "query": query,
                "duration_ms": round(duration_ms, 2),
                "client_ip": client_ip,
                "error": str(exc),
            },
            exc_info=True,
        )

        # Re-raise exception to be handled by error middleware
        raise
