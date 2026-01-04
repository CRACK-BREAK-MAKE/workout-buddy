"""
Base Application Settings - SRP: App-level configuration ONLY

This module contains ONLY application-level settings:
- App name, version, environment
- No OAuth, no security, no database
"""

from pydantic_settings import BaseSettings


class BaseAppSettings(BaseSettings):
    """Base application settings"""

    # Application metadata
    APP_NAME: str = "Workout Buddy API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # API configuration
    API_V1_PREFIX: str = "/api/v1"

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


# Singleton instance
base_settings = BaseAppSettings()
