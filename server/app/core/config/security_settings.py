"""
Security Settings - SRP: Security configuration ONLY

This module contains ONLY security-related settings:
- JWT configuration
- Database connection
- CORS origins
- No OAuth provider details
"""

from pydantic_settings import BaseSettings


class SecuritySettings(BaseSettings):
    """Security and authentication settings"""

    # JWT configuration - MUST be set in .env
    SECRET_KEY: str = ""  # Must be provided in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database - MUST be set in .env
    DATABASE_URL: str = ""  # Must be provided in .env

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:7002"]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Singleton instance
security_settings = SecuritySettings()
