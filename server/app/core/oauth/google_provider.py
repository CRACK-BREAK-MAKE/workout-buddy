"""
Google OAuth Provider - SRP: Google OAuth implementation ONLY

This module implements ONLY Google OAuth logic:
- Google authorization URL generation
- Google token exchange
- Google user info retrieval
NO business logic, NO database operations, NO JWT
"""

from typing import cast
from urllib.parse import urlencode

import httpx

from app.core.config.oauth_settings import oauth_settings
from app.core.oauth.oauth_dto import OAuthUserInfo
from app.core.oauth.oauth_exceptions import OAuthProviderError, OAuthUserInfoError
from app.core.oauth.provider_interface import OAuthProvider


class GoogleOAuthProvider(OAuthProvider):
    """
    Google OAuth 2.0 provider implementation.

    Implements the OAuthProvider interface for Google Sign-In.

    Responsibilities:
    - Generate Google authorization URLs
    - Exchange authorization codes for tokens
    - Fetch user profile from Google API

    NO business logic (that's in oauth_service.py)
    NO database operations (that's in user_repository.py)
    """

    # Google OAuth 2.0 endpoints
    AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    def __init__(self) -> None:
        self._client_id = oauth_settings.GOOGLE_CLIENT_ID
        self._client_secret = oauth_settings.GOOGLE_CLIENT_SECRET
        self._redirect_uri = oauth_settings.GOOGLE_REDIRECT_URI
        self._scopes = oauth_settings.GOOGLE_SCOPES

        if not self._client_id or not self._client_secret:
            raise ValueError(
                "Google OAuth credentials not configured. "
                "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env"
            )

    @property
    def provider_name(self) -> str:
        """Provider name identifier."""
        return "google"

    async def get_authorization_url(self, state: str) -> str:
        """
        Generate Google OAuth authorization URL.

        Args:
            state: CSRF protection token

        Returns:
            Full authorization URL with all required parameters

        Example:
            >>> provider = GoogleOAuthProvider()
            >>> url = await provider.get_authorization_url("csrf-token-123")
            >>> # Returns: https://accounts.google.com/o/oauth2/v2/auth?...
        """
        params = {
            "client_id": self._client_id,
            "redirect_uri": self._redirect_uri,
            "response_type": "code",
            "scope": " ".join(self._scopes),
            "state": state,
            "access_type": "offline",  # Get refresh token
            "prompt": "consent",  # Always show consent screen
        }

        return f"{self.AUTHORIZATION_URL}?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> str:
        """
        Exchange authorization code for access token.

        Args:
            code: Authorization code from Google callback

        Returns:
            Access token for Google API requests

        Raises:
            OAuthProviderError: If token exchange fails
        """
        data = {
            "code": code,
            "client_id": self._client_id,
            "client_secret": self._client_secret,
            "redirect_uri": self._redirect_uri,
            "grant_type": "authorization_code",
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.TOKEN_URL, data=data)
                response.raise_for_status()

                token_data = response.json()
                return cast(str, token_data["access_token"])

            except httpx.HTTPStatusError as e:
                raise OAuthProviderError(
                    provider=self.provider_name,
                    message=f"Token exchange failed: {e.response.text}",
                ) from e
            except KeyError as e:
                raise OAuthProviderError(
                    provider=self.provider_name,
                    message="Invalid token response from Google",
                ) from e

    async def get_user_info(self, access_token: str) -> OAuthUserInfo:
        """
        Get user profile from Google API.

        Args:
            access_token: Access token from token exchange

        Returns:
            OAuthUserInfo with user profile data

        Raises:
            OAuthUserInfoError: If API request fails
        """
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(self.USER_INFO_URL, headers=headers)
                response.raise_for_status()

                user_data = response.json()

                return OAuthUserInfo(
                    oauth_id=user_data["sub"],  # Google user ID
                    email=user_data["email"],
                    full_name=user_data.get("name"),
                    avatar_url=user_data.get("picture"),
                    provider=self.provider_name,
                )

            except httpx.HTTPStatusError as e:
                raise OAuthUserInfoError(
                    provider=self.provider_name,
                    message=f"Failed to get user info: {e.response.text}",
                ) from e
            except KeyError as e:
                raise OAuthUserInfoError(
                    provider=self.provider_name,
                    message=f"Missing required field in Google response: {e}",
                ) from e
