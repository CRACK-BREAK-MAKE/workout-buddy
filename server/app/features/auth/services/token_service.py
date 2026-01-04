"""
Token Service - SRP: Token generation ONLY

This module handles ONLY token generation:
- Create access tokens
- Create refresh tokens
- Return token pairs
NO OAuth logic, NO user operations
"""

from uuid import UUID

from app.core.config.security_settings import security_settings
from app.core.security.jwt_handler import jwt_handler
from app.core.security.token_models import TokenPair


class TokenService:
    """
    Token generation service.

    Responsibilities:
    - Generate JWT access tokens
    - Generate JWT refresh tokens
    - Return token pairs with expiration info

    NO OAuth provider logic (that's in oauth_service.py)
    NO user database operations (that's in user_repository.py)
    """

    def __init__(self) -> None:
        self._jwt_handler = jwt_handler
        self._access_token_expire_minutes = security_settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def create_tokens_for_user(self, user_id: UUID) -> tuple[TokenPair, int]:
        """
        Create access and refresh tokens for a user.

        Args:
            user_id: User's unique identifier

        Returns:
            Tuple of (TokenPair, expires_in_seconds)

        Example:
            >>> service = TokenService()
            >>> tokens, expires_in = service.create_tokens_for_user(user_id)
            >>> print(tokens.access_token)
            >>> print(f"Expires in {expires_in} seconds")
        """
        access_token = self._jwt_handler.create_access_token(user_id)
        refresh_token = self._jwt_handler.create_refresh_token(user_id)

        token_pair = TokenPair(access_token=access_token, refresh_token=refresh_token)

        expires_in = self._access_token_expire_minutes * 60  # Convert to seconds

        return token_pair, expires_in

    def validate_refresh_token(self, refresh_token: str) -> UUID | None:
        """
        Validate a refresh token and extract user ID.

        Args:
            refresh_token: Refresh token to validate

        Returns:
            User ID if valid, None if invalid/expired

        Example:
            >>> service = TokenService()
            >>> user_id = service.validate_refresh_token(token)
            >>> if user_id:
            ...     # Token is valid, create new access token
        """
        payload = self._jwt_handler.decode_token(refresh_token)
        if payload is None:
            return None

        # Verify it's a refresh token
        if not self._jwt_handler.validate_token_type(refresh_token, "refresh"):
            return None

        try:
            return UUID(payload["sub"])
        except (KeyError, ValueError):
            return None


# Singleton instance
token_service = TokenService()
