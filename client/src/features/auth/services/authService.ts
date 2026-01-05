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
  // Set token in apiClient for subsequent requests
  setAuthToken(accessToken);

  // Fetch user profile
  const response = await apiClient.get<User>(AUTH_ENDPOINTS.OAUTH_ME);
  return response.data;
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
  // No request body needed - refresh token is sent automatically via httpOnly cookie
  // Backend endpoint: POST /api/v1/auth/oauth/refresh (reads from cookie)
  const response = await apiClient.post<TokenPair>(AUTH_ENDPOINTS.OAUTH_REFRESH);
  return response.data;
};

/**
 * Logout user (best effort - doesn't throw on failure)
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post(AUTH_ENDPOINTS.OAUTH_LOGOUT);
  } catch (error) {
    // Logout is best effort - even if backend fails, clear client-side state
    logger.warn('Logout API call failed (continuing with client-side cleanup)', { error });
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
