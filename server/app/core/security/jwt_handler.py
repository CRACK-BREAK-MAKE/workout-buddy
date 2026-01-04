"""
JWT Handler - SRP: JWT operations ONLY

This module handles ONLY JWT token operations:
- Create access tokens
- Create refresh tokens
- Decode tokens
- Validate token types
NO password operations, NO OAuth logic
"""

from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import UUID

from jose import JWTError, jwt

from app.core.config.security_settings import security_settings


class JWTHandler:
    """
    JWT token handler following Single Responsibility Principle.

    Responsibilities:
    - Create JWT access tokens
    - Create JWT refresh tokens
    - Decode and validate JWT tokens

    NO password handling (see password_handler.py)
    NO OAuth logic (see oauth providers)
    """

    def __init__(self) -> None:
        self._secret_key = security_settings.SECRET_KEY
        self._algorithm = security_settings.ALGORITHM
        self._access_token_expire_minutes = security_settings.ACCESS_TOKEN_EXPIRE_MINUTES
        self._refresh_token_expire_days = security_settings.REFRESH_TOKEN_EXPIRE_DAYS

    def create_access_token(self, user_id: UUID) -> str:
        """
        Create a short-lived access token (15 minutes).

        Args:
            user_id: User's unique identifier

        Returns:
            Encoded JWT access token

        Example:
            >>> handler = JWTHandler()
            >>> token = handler.create_access_token(user_id=UUID(...))
        """
        expire = datetime.now(UTC) + timedelta(minutes=self._access_token_expire_minutes)

        payload = {
            "sub": str(user_id),
            "type": "access",
            "exp": expire,
            "iat": datetime.now(UTC),
        }

        encoded_jwt: str = jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
        return encoded_jwt

    def create_refresh_token(self, user_id: UUID) -> str:
        """
        Create a long-lived refresh token (7 days).

        Args:
            user_id: User's unique identifier

        Returns:
            Encoded JWT refresh token

        Example:
            >>> handler = JWTHandler()
            >>> token = handler.create_refresh_token(user_id=UUID(...))
        """
        expire = datetime.now(UTC) + timedelta(days=self._refresh_token_expire_days)

        payload = {
            "sub": str(user_id),
            "type": "refresh",
            "exp": expire,
            "iat": datetime.now(UTC),
        }

        encoded_jwt: str = jwt.encode(payload, self._secret_key, algorithm=self._algorithm)
        return encoded_jwt

    def decode_token(self, token: str) -> dict[str, Any] | None:
        """
        Decode and validate a JWT token.

        Args:
            token: Encoded JWT token string

        Returns:
            Token payload if valid, None if invalid/expired

        Example:
            >>> handler = JWTHandler()
            >>> payload = handler.decode_token(token)
            >>> if payload:
            ...     user_id = payload['sub']
        """
        try:
            decoded_payload: dict[str, Any] = jwt.decode(
                token, self._secret_key, algorithms=[self._algorithm]
            )
            return decoded_payload
        except JWTError:
            return None

    def validate_token_type(self, token: str, expected_type: str) -> bool:
        """
        Validate that a token is of the expected type (access/refresh).

        Args:
            token: Encoded JWT token string
            expected_type: Expected token type ("access" or "refresh")

        Returns:
            True if token type matches, False otherwise

        Example:
            >>> handler = JWTHandler()
            >>> is_valid = handler.validate_token_type(token, "access")
        """
        payload = self.decode_token(token)
        if payload is None:
            return False

        return payload.get("type") == expected_type


# Singleton instance
jwt_handler = JWTHandler()
