"""
OAuth Settings - SRP: OAuth configuration ONLY

This module contains ONLY OAuth-related settings:
- Google OAuth credentials and configuration
- No JWT, no database, no CORS
"""

from pydantic_settings import BaseSettings


class OAuthSettings(BaseSettings):
    """OAuth provider settings"""

    # Google OAuth (Free, unlimited users)
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    GOOGLE_REDIRECT_URI: str = "http://localhost:7001/api/v1/auth/oauth/google/callback"
    GOOGLE_SCOPES: list[str] = ["openid", "email", "profile"]

    # Frontend URL for OAuth redirects
    FRONTEND_URL: str = "http://localhost:7002"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Singleton instance
oauth_settings = OAuthSettings()
