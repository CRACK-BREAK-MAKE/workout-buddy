"""
FastAPI Application - Main entry point

This module initializes the FastAPI application with:
- CORS middleware
- API routes
- Exception handlers
- Health check endpoints
"""

from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config.base_settings import base_settings
from app.core.config.security_settings import security_settings
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

# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title=base_settings.APP_NAME,
    version=base_settings.VERSION,
    description="AI-powered exercise counter API with OAuth authentication",
    openapi_url=f"{base_settings.API_V1_PREFIX}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

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
# Exception Handlers
# ============================================================================


@app.exception_handler(UserNotFoundError)
async def user_not_found_handler(request: Request, exc: UserNotFoundError) -> JSONResponse:
    """Handle UserNotFoundError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


@app.exception_handler(UserAlreadyExistsError)
async def user_already_exists_handler(
    request: Request, exc: UserAlreadyExistsError
) -> JSONResponse:
    """Handle UserAlreadyExistsError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc)},
    )


@app.exception_handler(InvalidCredentialsError)
async def invalid_credentials_handler(
    request: Request, exc: InvalidCredentialsError
) -> JSONResponse:
    """Handle InvalidCredentialsError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(InvalidTokenError)
async def invalid_token_handler(request: Request, exc: InvalidTokenError) -> JSONResponse:
    """Handle InvalidTokenError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={"detail": str(exc)},
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(InactiveUserError)
async def inactive_user_handler(request: Request, exc: InactiveUserError) -> JSONResponse:
    """Handle InactiveUserError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"detail": str(exc)},
    )


@app.exception_handler(AuthError)
async def auth_error_handler(request: Request, exc: AuthError) -> JSONResponse:
    """Handle generic AuthError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handle Pydantic validation errors."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


# ============================================================================
# Routes
# ============================================================================


# Health check endpoint (public, no auth)
@app.get("/health", tags=["Health"])
async def health_check() -> dict[str, Any]:
    """
    Public health check endpoint.

    Returns:
        Health status and version
    """
    return {
        "status": "healthy",
        "version": base_settings.VERSION,
        "environment": base_settings.ENVIRONMENT,
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
    print(f"🚀 {base_settings.APP_NAME} v{base_settings.VERSION} starting...")
    print("📝 API Documentation: http://localhost:7001/docs")
    print(f"🔐 Environment: {base_settings.ENVIRONMENT}")


@app.on_event("shutdown")
async def shutdown_event() -> None:
    """Run on application shutdown."""
    print(f"👋 {base_settings.APP_NAME} shutting down...")
