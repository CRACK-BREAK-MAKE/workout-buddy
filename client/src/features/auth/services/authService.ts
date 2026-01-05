/**
 * Auth Service
 *
 * SRP: Only handles OAuth business logic (orchestration layer)
 * DRY: Centralized auth operations
 * YAGNI: Only implements what's needed for MVP
 *
 * This service DOES NOT:
 * - Manage state (that's auth store's job)
 * - Handle localStorage directly (that's tokenStorage's job)
 * - Make raw HTTP requests (that's apiClient's job)
 */

import { apiClient, setAuthToken } from '@/shared/utils/apiClient';
import { AUTH_ENDPOINTS, OAUTH_PROVIDERS, API_CONFIG } from '../constants/auth.constants';
import type { User, TokenPair } from '../types/auth.types';
import { logger } from '@/shared/utils/logger';
import { authTelemetry } from '@/shared/utils/telemetry';

/**
 * Initiate Google OAuth login flow
 *
 * Redirects user to backend OAuth endpoint, which then redirects to Google
 */
export const initiateGoogleLogin = (): void => {
  const loginUrl = `${API_CONFIG.SERVER_URL}${AUTH_ENDPOINTS.OAUTH_LOGIN(OAUTH_PROVIDERS.GOOGLE)}`;
  window.location.assign(loginUrl);
};

/**
 * Handle OAuth callback after redirect from backend
 *
 * @param accessToken - JWT access token from URL query params
 * @returns User profile from backend
 */
export const handleOAuthCallback = async (accessToken: string): Promise<User> => {
  try {
    // Set token in apiClient for subsequent requests
    setAuthToken(accessToken);

    // Fetch user profile
    const response = await apiClient.get<User>(AUTH_ENDPOINTS.OAUTH_ME);
    const user = response.data;

    // Track successful login
    authTelemetry.loginSuccess('google', user.id);
    logger.info('User logged in successfully', { userId: user.id });

    return user;
  } catch (error) {
    // Track login failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    authTelemetry.loginFailure('google', errorMessage);
    logger.error('Login failed', { error: errorMessage });
    throw error;
  }
};

/**
 * Refresh expired access token using refresh token from httpOnly cookie
 *
 * Security: The refresh token is automatically sent by browser in httpOnly cookie
 * (withCredentials: true in apiClient), providing XSS protection.
 *
 * Backend reads the refresh token from the cookie, not from request body,
 * and returns a new access token + updates the refresh token cookie (rotation).
 *
 * @returns New token pair (access_token in response, refresh_token updated in cookie)
 */
export const refreshAccessToken = async (): Promise<TokenPair> => {
  try {
    // No request body needed - refresh token is sent automatically via httpOnly cookie
    // Backend endpoint: POST /api/v1/auth/oauth/refresh (reads from cookie)
    const response = await apiClient.post<TokenPair>(AUTH_ENDPOINTS.OAUTH_REFRESH);

    // Track successful token refresh
    authTelemetry.tokenRefresh(true);
    logger.debug('Token refreshed successfully');

    return response.data;
  } catch (error) {
    // Track token refresh failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    authTelemetry.tokenRefresh(false, errorMessage);
    logger.error('Token refresh failed', { error: errorMessage });
    throw error;
  }
};

/**
 * Logout user (best effort - doesn't throw on failure)
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(AUTH_ENDPOINTS.OAUTH_LOGOUT);

    // Track successful logout
    authTelemetry.logoutSuccess();
    logger.info('User logged out successfully');
  } catch (error) {
    // Logout is best effort - even if backend fails, clear client-side state
    logger.warn('Logout API call failed (continuing with client-side cleanup)', { error });

    // Still track logout (best effort)
    authTelemetry.logoutSuccess();
  }
};

/**
 * Get current authenticated user profile
 *
 * @returns User profile
 * @throws Error if not authenticated
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>(AUTH_ENDPOINTS.OAUTH_ME);
  return response.data;
};
