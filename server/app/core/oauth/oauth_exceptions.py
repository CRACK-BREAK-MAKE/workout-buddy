"""
OAuth Exceptions - SRP: OAuth-specific exceptions ONLY

Custom exceptions for OAuth provider operations.
"""


class OAuthError(Exception):
    """Base exception for OAuth-related errors."""

    pass


class OAuthProviderError(OAuthError):
    """OAuth provider API communication failed."""

    def __init__(self, provider: str, message: str) -> None:
        self.provider = provider
        super().__init__(f"{provider} OAuth error: {message}")


class OAuthStateValidationError(OAuthError):
    """CSRF state validation failed."""

    def __init__(self, message: str = "Invalid OAuth state token") -> None:
        super().__init__(message)


class OAuthUserInfoError(OAuthError):
    """Failed to retrieve user information from OAuth provider."""

    def __init__(self, provider: str, message: str) -> None:
        self.provider = provider
        super().__init__(f"Failed to get {provider} user info: {message}")
