"""
OAuth Schemas - OAuth-specific request/response

Pydantic schemas for OAuth operations.
"""

from pydantic import BaseModel, Field


class OAuthCallbackParams(BaseModel):
    """Schema for OAuth callback query parameters."""

    code: str = Field(..., description="Authorization code from OAuth provider")
    state: str = Field(..., description="CSRF state token")
    error: str | None = Field(None, description="Error from OAuth provider")
    error_description: str | None = Field(None, description="Error description")


class OAuthLoginResponse(BaseModel):
    """Schema for OAuth login initiation response."""

    authorization_url: str = Field(..., description="URL to redirect user to for OAuth")
    state: str = Field(..., description="CSRF state token (store in session)")
