"""
OAuth Factory - OCP: Provider factory for extensibility

This module implements the Factory Pattern for OAuth providers.
Follows Open/Closed Principle (OCP) - open for extension, closed for modification.

To add a new provider (e.g., GitHub):
1. Create github_provider.py implementing OAuthProvider interface
2. Register it here: _providers = {"google": ..., "github": GithubOAuthProvider}
3. NO changes needed to services or routes!
"""

from app.core.oauth.google_provider import GoogleOAuthProvider
from app.core.oauth.provider_interface import OAuthProvider


class OAuthProviderFactory:
    """
    Factory for creating OAuth provider instances.

    Implements Factory Pattern for extensibility:
    - Add new providers without modifying existing code (OCP)
    - All providers implement same interface (DIP)
    - Providers are interchangeable (LSP)

    Example:
        >>> factory = OAuthProviderFactory()
        >>> provider = factory.create_provider("google")
        >>> url = await provider.get_authorization_url("state")
    """

    # Registry of available providers
    # To add a new provider: add entry here + create provider class
    _providers: dict[str, type[OAuthProvider]] = {
        "google": GoogleOAuthProvider,
        # Future providers:
        # "github": GitHubOAuthProvider,
        # "discord": DiscordOAuthProvider,
    }

    @classmethod
    def create_provider(cls, provider_name: str) -> OAuthProvider:
        """
        Create an OAuth provider instance by name.

        Args:
            provider_name: Provider identifier ("google", "github", "discord")

        Returns:
            OAuth provider instance

        Raises:
            ValueError: If provider not supported

        Example:
            >>> provider = OAuthProviderFactory.create_provider("google")
            >>> isinstance(provider, OAuthProvider)  # True
        """
        provider_class = cls._providers.get(provider_name.lower())

        if provider_class is None:
            supported = ", ".join(cls._providers.keys())
            raise ValueError(
                f"Unsupported OAuth provider: {provider_name}. Supported providers: {supported}"
            )

        return provider_class()

    @classmethod
    def get_supported_providers(cls) -> list[str]:
        """
        Get list of supported OAuth provider names.

        Returns:
            List of provider names

        Example:
            >>> OAuthProviderFactory.get_supported_providers()
            ['google']
        """
        return list(cls._providers.keys())

    @classmethod
    def is_provider_supported(cls, provider_name: str) -> bool:
        """
        Check if a provider is supported.

        Args:
            provider_name: Provider identifier to check

        Returns:
            True if supported, False otherwise

        Example:
            >>> OAuthProviderFactory.is_provider_supported("google")
            True
            >>> OAuthProviderFactory.is_provider_supported("facebook")
            False
        """
        return provider_name.lower() in cls._providers
