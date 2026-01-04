"""
Token Schemas - JWT token request/response

Pydantic schemas for authentication tokens.
"""

from pydantic import BaseModel, Field


class TokenResponse(BaseModel):
    """Schema for token response (login, OAuth callback)."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(
        ..., description="Access token expiration time in seconds (900 = 15 minutes)"
    )


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""

    refresh_token: str


class TokenPayloadSchema(BaseModel):
    """Schema for decoded JWT payload."""

    sub: str  # User ID
    type: str  # "access" or "refresh"
    exp: int  # Expiration timestamp
    iat: int  # Issued at timestamp
