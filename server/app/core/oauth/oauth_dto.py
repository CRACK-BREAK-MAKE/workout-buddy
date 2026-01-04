"""
OAuth DTOs - SRP: Data Transfer Objects ONLY

This module defines ONLY data structures for OAuth:
- OAuthUserInfo (standardized user info from providers)
NO logic, NO operations
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class OAuthUserInfo:
    """
    Data Transfer Object for OAuth user information.

    Standardized user info structure across all OAuth providers.

    Attributes:
        oauth_id: Provider's unique user ID
        email: User's email address
        full_name: User's full name (optional)
        avatar_url: URL to user's avatar image (optional)
        provider: Provider name ("google", "github", "discord")
    """

    oauth_id: str
    email: str
    full_name: str | None
    avatar_url: str | None
    provider: str
