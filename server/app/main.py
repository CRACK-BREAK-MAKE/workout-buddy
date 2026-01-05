"""
FastAPI Application - Main entry point

This module is ONLY responsible for application initialization:
- Create FastAPI app
- Register middleware
- Register routes
- Configure exception handlers
- Define health check endpoints

All business logic is in separate modules following SRP.
"""

from typing import Any

from fastapi import Depends, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_redoc_html, get_swagger_ui_html
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config.base_settings import base_settings
from app.core.config.security_settings import security_settings
from app.core.health.checks import get_comprehensive_health
from app.core.logging.config import get_logger, setup_logging
from app.core.middleware.error_handler import handle_errors
from app.core.middleware.request_logging import log_requests
from app.core.middleware.security import add_security_headers
from app.db.session import get_db
from app.features.auth.exceptions import (
    AuthError,
    InactiveUserError,
    InvalidCredentialsError,
    InvalidTokenError,
    UserAlreadyExistsError,
    UserNotFoundError,
)
from app.features.auth.routes import oauth_routes
from app.features.statistics.routes import statistics_routes
from app.features.workouts.routes import workout_routes

# Setup logging
setup_logging()
logger = get_logger(__name__)

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title=base_settings.APP_NAME,
    version=base_settings.VERSION,
    description="AI-powered exercise counter API with OAuth authentication",
    openapi_url=f"{base_settings.API_V1_PREFIX}/openapi.json",
    docs_url=None,  # Custom docs endpoint defined below
    redoc_url=None,  # Custom redoc endpoint defined below
    swagger_ui_parameters={"defaultModelsExpandDepth": -1},  # Hide schemas by default
)

# Mount static files for custom logo
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# ============================================================================
# Middleware
# ============================================================================

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=security_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Custom Middleware - Register imported middleware functions (SRP)
# ============================================================================

# Security headers middleware
app.middleware("http")(add_security_headers)

# Request/response logging middleware
app.middleware("http")(log_requests)

# Global error handler middleware
app.middleware("http")(handle_errors)

# ============================================================================
# Exception Handlers - DRY: Centralized error response factory
# ============================================================================


def _create_error_response(
    status_code: int,
    detail: str | list[dict[str, Any]],
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    """
    Factory for creating standardized error responses (DRY principle).

    Args:
        status_code: HTTP status code
        detail: Error detail message or validation errors
        headers: Optional HTTP headers

    Returns:
        Standardized JSON error response
    """
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
        headers=headers,
    )


# Exception handler registry - maps exception types to (status_code, headers)
_AUTH_HEADER = {"WWW-Authenticate": "Bearer"}

_EXCEPTION_REGISTRY: dict[type[Exception], tuple[int, dict[str, str] | None]] = {
    UserNotFoundError: (status.HTTP_404_NOT_FOUND, None),
    UserAlreadyExistsError: (status.HTTP_409_CONFLICT, None),
    InvalidCredentialsError: (status.HTTP_401_UNAUTHORIZED, _AUTH_HEADER),
    InvalidTokenError: (status.HTTP_401_UNAUTHORIZED, _AUTH_HEADER),
    InactiveUserError: (status.HTTP_403_FORBIDDEN, None),
    AuthError: (status.HTTP_400_BAD_REQUEST, None),
}


# Register exception handlers using registry pattern
for exc_class, (status_code, headers) in _EXCEPTION_REGISTRY.items():

    def _make_handler(
        status_code: int = status_code, headers: dict[str, str] | None = headers
    ) -> Any:
        """Closure to capture status_code and headers for each exception type."""

        async def handler(_request: Request, exc: Exception) -> JSONResponse:
            return _create_error_response(status_code, str(exc), headers)

        return handler

    app.exception_handler(exc_class)(_make_handler())


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors (different response structure)."""
    return _create_error_response(status.HTTP_422_UNPROCESSABLE_ENTITY, exc.errors())


# ============================================================================
# Custom API Documentation with Logo
# ============================================================================


@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui() -> Any:
    """Custom Swagger UI with workout logo."""
    return get_swagger_ui_html(
        openapi_url=app.openapi_url or "",
        title=f"{app.title} - Swagger UI",
        swagger_favicon_url="/static/logo.svg",
        swagger_ui_parameters=app.swagger_ui_parameters,
    )


@app.get("/redoc", include_in_schema=False)
async def custom_redoc() -> Any:
    """Custom ReDoc with workout logo."""
    return get_redoc_html(
        openapi_url=app.openapi_url or "",
        title=f"{app.title} - ReDoc",
        redoc_favicon_url="/static/logo.svg",
    )


# ============================================================================
# Routes
# ============================================================================


# Health check endpoint (public, no auth)
@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, Any]:
    """
    Basic health check endpoint.

    Returns:
        Simple health status and version
    """
    return {
        "status": "healthy",
        "version": base_settings.VERSION,
        "environment": base_settings.ENVIRONMENT,
    }


# Detailed health check (public, no auth)
@app.get("/health/detailed", tags=["Health"])
async def detailed_health_check(db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """
    Detailed health check endpoint with component status.

    Checks:
    - Database connectivity
    - OAuth provider availability
    - Overall system health

    Returns:
        Comprehensive health status of all components
    """
    health_status = await get_comprehensive_health(db)

    return {
        "version": base_settings.VERSION,
        "environment": base_settings.ENVIRONMENT,
        **health_status,
    }


# API v1 routes - Authentication
app.include_router(
    oauth_routes.router, prefix=f"{base_settings.API_V1_PREFIX}/auth", tags=["Authentication"]
)

# API v1 routes - Workouts (Phase 2)
app.include_router(workout_routes.router, prefix=base_settings.API_V1_PREFIX, tags=["Workouts"])

# API v1 routes - Statistics (Phase 3)
app.include_router(
    statistics_routes.router, prefix=base_settings.API_V1_PREFIX, tags=["Statistics"]
)

# ============================================================================
# Startup/Shutdown Events
# ============================================================================


@app.on_event("startup")
async def startup_event() -> None:
    """Run on application startup."""
    # Main startup message
    logger.info(
        f"🚀 {base_settings.APP_NAME} v{base_settings.VERSION} starting",
        extra={
            "app_name": base_settings.APP_NAME,
            "version": base_settings.VERSION,
            "environment": base_settings.ENVIRONMENT,
        },
    )

    # Environment info
    logger.info(f"📍 Environment: {base_settings.ENVIRONMENT.upper()}")

    # Documentation URLs (helpful for developers)
    logger.info(f"📚 API Docs: http://localhost:7001{app.docs_url}")
    logger.info(f"📖 ReDoc: http://localhost:7001{app.redoc_url}")
    logger.info(
        "🏥 Health Check: http://localhost:7001/health/detailed (includes DB + OAuth status)"
    )


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Run on application shutdown."""
    logger.info(f"{base_settings.APP_NAME} shutting down")
