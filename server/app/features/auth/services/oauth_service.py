"""
OAuth Service - SRP: OAuth orchestration ONLY

This module handles ONLY OAuth business logic orchestration:
- Coordinate OAuth flow
- Find or create users from OAuth data
- Generate tokens for OAuth users
NO provider API calls (that's in providers)
NO database operations (that's in user_repository.py)
"""

from app.core.oauth.oauth_dto import OAuthUserInfo
from app.core.oauth.oauth_factory import OAuthProviderFactory
from app.core.security.token_models import TokenPair
from app.features.auth.models.user import AuthProvider, User
from app.features.auth.repositories.user_repository import UserRepository
from app.features.auth.services.token_service import TokenService
from app.features.auth.transformers import generate_unique_username


class OAuthService:
    """
    OAuth orchestration service.

    Responsibilities:
    - Orchestrate OAuth flow (provider → user → tokens)
    - Find or create users from OAuth data
    - Generate JWT tokens for authenticated users

    NO OAuth provider API calls (that's in google_provider.py)
    NO database queries (that's in user_repository.py)
    NO HTTP routing (that's in oauth_routes.py)
    """

    def __init__(self, user_repo: UserRepository, token_service: TokenService):
        """
        Initialize OAuth service.

        Args:
            user_repo: User repository for data access
            token_service: Token service for JWT generation
        """
        self._user_repo = user_repo
        self._token_service = token_service

    async def handle_oauth_callback(self, provider_name: str, code: str) -> tuple[TokenPair, int]:
        """
        Handle OAuth callback and authenticate user.

        This orchestrates the complete OAuth flow:
        1. Exchange code for token (via provider)
        2. Get user info (via provider)
        3. Find or create user (via repository)
        4. Generate JWT tokens (via token service)

        Args:
            provider_name: OAuth provider ("google", "github", "discord")
            code: Authorization code from OAuth callback

        Returns:
            Tuple of (TokenPair, expires_in_seconds)

        Example:
            >>> service = OAuthService(user_repo, token_service)
            >>> tokens, expires_in = await service.handle_oauth_callback("google", code)
        """
        # 1. Create provider instance
        provider = OAuthProviderFactory.create_provider(provider_name)

        # 2. Exchange code for access token
        access_token = await provider.exchange_code_for_token(code)

        # 3. Get user info from provider
        user_info = await provider.get_user_info(access_token)

        # 4. Find or create user
        user = await self._find_or_create_user(user_info)

        # 5. Generate JWT tokens
        return self._token_service.create_tokens_for_user(user.id)

    async def generate_authorization_url(self, provider_name: str, state: str) -> str:
        """
        Generate OAuth authorization URL.

        Args:
            provider_name: OAuth provider ("google", "github", "discord")
            state: CSRF state token

        Returns:
            Authorization URL to redirect user to

        Example:
            >>> service = OAuthService(user_repo, token_service)
            >>> url = await service.generate_authorization_url("google", "csrf-token")
        """
        provider = OAuthProviderFactory.create_provider(provider_name)
        return await provider.get_authorization_url(state)

    async def _find_or_create_user(self, user_info: OAuthUserInfo) -> User:
        """
        Find existing user or create new one from OAuth data.

        Args:
            user_info: Standardized user info from OAuth provider

        Returns:
            User instance
        """
        # Convert provider name to AuthProvider enum
        auth_provider = self._get_auth_provider_enum(user_info.provider)

        # Try to find existing user by OAuth ID
        user = await self._user_repo.get_by_oauth_id(auth_provider, user_info.oauth_id)

        if user:
            # User exists, return it
            return user

        # Check if email is already registered (might be from different provider)
        existing_user = await self._user_repo.get_by_email(user_info.email)
        if existing_user:
            # TODO: In production, you might want to link accounts or require confirmation
            # For now, we'll return the existing user
            return existing_user

        # Generate unique username
        base_username = (
            user_info.full_name.replace(" ", "").lower()
            if user_info.full_name
            else user_info.email.split("@")[0]
        )
        username = await generate_unique_username(self._user_repo, base_username)

        # Create new user
        user = await self._user_repo.create_oauth_user(
            email=user_info.email,
            username=username,
            full_name=user_info.full_name,
            avatar_url=user_info.avatar_url,
            auth_provider=auth_provider,
            oauth_id=user_info.oauth_id,
        )

        return user

    def _get_auth_provider_enum(self, provider_name: str) -> AuthProvider:
        """
        Convert provider name string to AuthProvider enum.

        Args:
            provider_name: Provider name string

        Returns:
            AuthProvider enum value
        """
        provider_map = {
            "google": AuthProvider.GOOGLE,
            "github": AuthProvider.GITHUB,
            "discord": AuthProvider.DISCORD,
        }
        return provider_map.get(provider_name.lower(), AuthProvider.EMAIL)
