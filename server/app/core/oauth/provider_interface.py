"""
OAuth Provider Interface - DIP: Abstract interface for OAuth providers

This module defines the abstract interface that all OAuth providers must implement.
Follows Dependency Inversion Principle (DIP) - depend on abstractions, not concrete implementations.

By defining this interface:
- Services depend on OAuthProvider (abstraction), not GoogleProvider (concrete)
- Easy to add new providers (GitHub, Discord) without modifying existing code (OCP)
- All providers are substitutable (LSP)
"""

from abc import ABC, abstractmethod

from app.core.oauth.oauth_dto import OAuthUserInfo


class OAuthProvider(ABC):
    """
    Abstract interface for OAuth providers.

    All OAuth providers (Google, GitHub, Discord) must implement this interface.
    This enables:
    - Dependency Inversion Principle (DIP): depend on abstractions
    - Open/Closed Principle (OCP): add new providers without modifying existing code
    - Liskov Substitution Principle (LSP): all providers are interchangeable
    """

    @abstractmethod
    async def get_authorization_url(self, state: str) -> str:
        """
        Generate OAuth authorization URL with CSRF state.

        Args:
            state: CSRF protection token

        Returns:
            Authorization URL to redirect user to

        Example:
            >>> provider = GoogleOAuthProvider()
            >>> url = await provider.get_authorization_url(state="random-csrf-token")
            >>> # Returns: https://accounts.google.com/o/oauth2/v2/auth?...
        """
        pass

    @abstractmethod
    async def exchange_code_for_token(self, code: str) -> str:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from OAuth callback

        Returns:
            Access token for API requests

        Raises:
            OAuthProviderError: If token exchange fails

        Example:
            >>> provider = GoogleOAuthProvider()
            >>> token = await provider.exchange_code_for_token(code="auth-code-123")
        """
        pass

    @abstractmethod
    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        """
        Get user profile information from OAuth provider.

        Args:
            access_token: Access token from token exchange

        Returns:
            OAuthUserInfo with standardized user data

        Raises:
            OAuthProviderError: If API request fails

        Example:
            >>> provider = GoogleOAuthProvider()
            >>> user_info = await provider.get_user_info(token)
            >>> print(user_info.email)
        """
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """
        Get the provider's name.

        Returns:
            Provider name ("google", "github", "discord")
        """
        pass
