"""
Auth Dependencies - FastAPI dependency injection

This module provides FastAPI dependencies for:
- Database sessions
- Repository instances
- Service instances
- Current user authentication
"""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security.jwt_handler import jwt_handler
from app.db.session import get_db
from app.features.auth.models.user import User
from app.features.auth.repositories.user_repository import UserRepository
from app.features.auth.services.oauth_service import OAuthService
from app.features.auth.services.token_service import TokenService, token_service
from app.features.auth.services.user_service import UserService

# HTTP Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)


# ============================================================================
# Repository Dependencies
# ============================================================================


def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    """
    Dependency: User repository.

    Args:
        db: Database session

    Returns:
        UserRepository instance
    """
    return UserRepository(db)


# ============================================================================
# Service Dependencies
# ============================================================================


def get_token_service() -> TokenService:
    """
    Dependency: Token service (singleton).

    Returns:
        TokenService instance
    """
    return token_service


def get_user_service(user_repo: UserRepository = Depends(get_user_repository)) -> UserService:
    """
    Dependency: User service.

    Args:
        user_repo: User repository

    Returns:
        UserService instance
    """
    return UserService(user_repo)


def get_oauth_service(
    user_repo: UserRepository = Depends(get_user_repository),
    token_svc: TokenService = Depends(get_token_service),
) -> OAuthService:
    """
    Dependency: OAuth service.

    Args:
        user_repo: User repository
        token_svc: Token service

    Returns:
        OAuthService instance
    """
    return OAuthService(user_repo, token_svc)


# ============================================================================
# Authentication Dependencies
# ============================================================================


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    user_repo: UserRepository = Depends(get_user_repository),
) -> User:
    """
    Dependency: Get current authenticated user from JWT token.

    Args:
        credentials: HTTP Bearer credentials from Authorization header
        user_repo: User repository

    Returns:
        Current authenticated user

    Raises:
        HTTPException: 401 if token invalid, 403 if user inactive, 404 if user not found
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Decode token
    payload = jwt_handler.decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify it's an access token
    if not jwt_handler.validate_token_type(token, "access"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID
    try:
        user_id = UUID(payload["sub"])
    except (KeyError, ValueError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        ) from e

    # Get user from database
    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Check if user is active
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")

    return user


# Type alias for convenience
CurrentUser = Annotated[User, Depends(get_current_user)]
