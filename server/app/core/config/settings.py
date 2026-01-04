"""
Unified Settings Module - Aggregator Pattern

This module aggregates all settings from separate modules for convenience.
Each settings module maintains SRP (Single Responsibility Principle).
"""

from .base_settings import base_settings
from .oauth_settings import oauth_settings
from .security_settings import security_settings


class Settings:
    """
    Unified settings aggregator.

    This provides a single entry point to access all settings
    while maintaining SRP in individual settings modules.
    """

    def __init__(self) -> None:
        self.app = base_settings
        self.oauth = oauth_settings
        self.security = security_settings


# Singleton instance
settings = Settings()


# Convenience exports for backwards compatibility
__all__ = [
    "settings",
    "base_settings",
    "oauth_settings",
    "security_settings",
]
