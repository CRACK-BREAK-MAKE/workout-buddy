"""
Token Domain Models - SRP: Token data structures ONLY

This module defines ONLY data structures for tokens:
- TokenPair (access + refresh)
- TokenPayload (decoded token data)
NO logic, NO operations
"""

from dataclasses import dataclass
from typing import Any, Optional
from uuid import UUID


@dataclass(frozen=True)
class TokenPair:
    """
    Pair of access and refresh tokens.

    Used when issuing new tokens to a user (login, OAuth callback, refresh).

    Attributes:
        access_token: Short-lived token (15 minutes)
        refresh_token: Long-lived token (7 days)
    """

    access_token: str
    refresh_token: str


@dataclass(frozen=True)
class TokenPayload:
    """
    Decoded JWT token payload.

    Represents the data stored in a JWT token.

    Attributes:
        user_id: User's unique identifier
        token_type: Type of token ("access" or "refresh")
        exp: Expiration timestamp
        iat: Issued at timestamp
    """

    user_id: UUID
    token_type: str
    exp: int
    iat: int

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Optional["TokenPayload"]:
        """
        Create TokenPayload from decoded JWT dictionary.

        Args:
            data: Decoded JWT payload dictionary

        Returns:
            TokenPayload instance if valid, None otherwise
        """
        try:
            return cls(
                user_id=UUID(data["sub"]),
                token_type=data["type"],
                exp=data["exp"],
                iat=data["iat"],
            )
        except (KeyError, ValueError):
            return None
