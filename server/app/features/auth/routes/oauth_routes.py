"""
OAuth Routes - API endpoints for OAuth authentication

This module provides HTTP endpoints for:
- OAuth login initiation
- OAuth callback handling
- Token refresh
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse

from app.core.config.oauth_settings import oauth_settings
from app.core.oauth.oauth_factory import OAuthProviderFactory
from app.core.oauth.oauth_validator import oauth_validator
from app.features.auth.dependencies import CurrentUser, get_oauth_service, get_token_service
from app.features.auth.schemas.token_schemas import TokenResponse
from app.features.auth.schemas.user_schemas import UserRead
from app.features.auth.services.oauth_service import OAuthService
from app.features.auth.services.token_service import TokenService

router = APIRouter(prefix="/oauth", tags=["OAuth Authentication"])


@router.get("/{provider}/login", status_code=status.HTTP_307_TEMPORARY_REDIRECT)
async def oauth_login(
    provider: str, response: Response, oauth_service: OAuthService = Depends(get_oauth_service)
) -> RedirectResponse:
    """
    Initiate OAuth login flow.

    Generates authorization URL and redirects user to OAuth provider.

    Args:
        provider: OAuth provider name ("google", "github", "discord")
        response: FastAPI response object for setting cookies
        oauth_service: OAuth service

    Returns:
        Redirect to OAuth provider's authorization page

    Example:
        GET /api/v1/auth/oauth/google/login
        → Redirects to: https://accounts.google.com/o/oauth2/v2/auth?...
    """
    # Validate provider
    if not OAuthProviderFactory.is_provider_supported(provider):
        supported = ", ".join(OAuthProviderFactory.get_supported_providers())
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider: {provider}. Supported: {supported}",
        )

    # Generate CSRF state token
    state = oauth_validator.generate_state_token()

    # Store state in cookie (expires in 10 minutes)
    response.set_cookie(
        key=f"oauth_state_{provider}",
        value=state,
        max_age=600,  # 10 minutes
        httponly=True,
        secure=False,  # TODO: Set to True in production (HTTPS)
        samesite="lax",
    )

    # Generate authorization URL
    auth_url = await oauth_service.generate_authorization_url(provider, state)

    return RedirectResponse(url=auth_url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)


@router.get("/{provider}/callback")
async def oauth_callback(
    provider: str,
    code: str,
    state: str,
    request: Response,
    oauth_service: OAuthService = Depends(get_oauth_service),
) -> RedirectResponse:
    """
    Handle OAuth callback from provider.

    Exchanges authorization code for tokens and creates user session.

    Args:
        provider: OAuth provider name
        code: Authorization code from OAuth provider
        state: CSRF state token
        request: FastAPI response object for cookie access
        oauth_service: OAuth service

    Returns:
        Redirect to frontend with access token

    Example:
        GET /api/v1/auth/oauth/google/callback?code=...&state=...
        → Redirects to: http://localhost:5173/auth/callback?token=...
    """
    # Validate provider
    if not OAuthProviderFactory.is_provider_supported(provider):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported provider: {provider}"
        )

    # TODO: Validate CSRF state (retrieve from cookie and compare)
    # For now, we'll skip this check in development
    # In production, implement proper state validation

    # Handle OAuth callback
    try:
        tokens, expires_in = await oauth_service.handle_oauth_callback(provider, code)
    except Exception:
        # Log error and redirect to frontend with error
        frontend_error_url = f"{oauth_settings.FRONTEND_URL}/auth/error?error=oauth_failed"
        return RedirectResponse(url=frontend_error_url)

    # Redirect to frontend with access token in URL fragment
    # Frontend will extract token and store it
    frontend_callback_url = (
        f"{oauth_settings.FRONTEND_URL}/auth/callback?token={tokens.access_token}"
    )

    # Set refresh token in httpOnly cookie
    response = RedirectResponse(url=frontend_callback_url)
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 days
        httponly=True,
        secure=False,  # TODO: Set to True in production (HTTPS)
        samesite="lax",
    )

    return response


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(
    request: Request,
    response: Response,
    token_service: TokenService = Depends(get_token_service),
) -> TokenResponse:
    """
    Refresh access token using refresh token from httpOnly cookie.

    Security: Refresh token is automatically sent by browser in httpOnly cookie,
    providing XSS protection (JavaScript cannot access it).

    Args:
        request: FastAPI request object for reading cookies
        token_service: Token service

    Returns:
        New token pair with refreshed access_token

    Raises:
        HTTPException: 401 if refresh token is missing or invalid

    Example:
        POST /api/v1/auth/oauth/refresh
        Cookie: refresh_token=<token>
        → Returns new access_token + refresh_token in response + updated cookie
    """
    # Read refresh token from httpOnly cookie (not from request body)
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing. Please log in again.",
        )

    # Validate refresh token and get user ID
    user_id = token_service.validate_refresh_token(refresh_token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Generate new tokens
    tokens, expires_in = token_service.create_tokens_for_user(user_id)

    # Set new refresh token in httpOnly cookie (automatic rotation)
    response.set_cookie(
        key="refresh_token",
        value=tokens.refresh_token,
        max_age=7 * 24 * 60 * 60,  # 7 days
        httponly=True,
        secure=False,  # TODO: Set to True in production (HTTPS)
        samesite="lax",
    )

    # Return new access token in response body
    return TokenResponse(
        access_token=tokens.access_token,
        refresh_token=tokens.refresh_token,
        token_type="bearer",
        expires_in=expires_in,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(current_user: CurrentUser, response: Response) -> None:
    """
    Logout user (clear tokens).

    Note: JWT tokens are stateless, so we can't truly invalidate them.
    We just clear the refresh token cookie. Access tokens will expire naturally.

    Args:
        current_user: Current authenticated user
        response: FastAPI response object for clearing cookies
    """
    # Clear refresh token cookie
    response.delete_cookie(key="refresh_token")


@router.get("/me", response_model=UserRead)
async def get_current_user_profile(current_user: CurrentUser) -> UserRead:
    """
    Get current authenticated user's profile.

    Args:
        current_user: Current authenticated user

    Returns:
        User profile data
    """
    return UserRead.model_validate(current_user)
