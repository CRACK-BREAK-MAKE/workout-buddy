/**
 * useAuth Hook
 *
 * SRP: Only provides auth state and actions (wrapper around store)
 * DRY: Single hook for all auth operations throughout app
 * YAGNI: Simple hook without unnecessary abstractions
 */

import { useAuthStore } from '../store/authStore';
import * as authService from '../services/authService';
import type { User } from '../types/auth.types';
import { logger } from '@/shared/utils/logger';

/**
 * Auth hook - provides auth state and actions
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export const useAuth = () => {
  const {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setAccessToken,
    clearAuth,
    setLoading,
    setError,
    clearError,
  } = useAuthStore();

  /**
   * Initiate Google OAuth login
   */
  const loginWithGoogle = () => {
    authService.initiateGoogleLogin();
  };

  /**
   * Handle OAuth callback (extract token from URL)
   *
   * Note: Refresh token is set by backend in httpOnly cookie, not accessible to JS
   */
  const handleCallback = async (token: string): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile with token
      const user = await authService.handleOAuthCallback(token);

      // Update store with access token only
      // Refresh token is already in httpOnly cookie from backend
      setUser(user);
      setAccessToken(token);

      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    setLoading(true);

    try {
      await authService.logout();
      logger.info('User logged out successfully');
    } catch (err) {
      // Logout is best effort - continue even if API fails
      logger.warn('Logout encountered an error (continuing with local cleanup)', { error: err });
    } finally {
      clearAuth();
      setLoading(false);
    }
  };

  /**
   * Refresh access token using refresh token from httpOnly cookie
   *
   * The refresh token is automatically sent by browser in cookie,
   * and backend updates it with a new one (refresh token rotation).
   */
  const refresh = async (): Promise<void> => {
    setLoading(true);

    try {
      const tokenPair = await authService.refreshAccessToken();
      // Only update access token - refresh token is in httpOnly cookie
      setAccessToken(tokenPair.access_token);
    } catch (err) {
      // If refresh fails, clear auth (force re-login)
      clearAuth();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,

    // Actions
    loginWithGoogle,
    handleCallback,
    logout,
    refresh,
    clearError,
  };
};
