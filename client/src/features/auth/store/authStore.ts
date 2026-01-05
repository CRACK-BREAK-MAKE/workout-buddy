/**
 * Auth Store (Zustand)
 *
 * SRP: Only manages auth state (no business logic, no API calls)
 * DRY: Centralized auth state for entire app
 * YAGNI: Simple state management without unnecessary complexity
 *
 * NOTE: Refresh token is managed by backend via httpOnly cookie (not in state)
 */

import { create } from 'zustand';
import type { AuthStore, User } from '../types/auth.types';
import { saveAccessToken, removeAccessToken, getAccessToken } from '../utils/tokenStorage';
import { setAuthToken, clearAuthToken } from '@/shared/utils/apiClient';
import { logger } from '@/shared/utils/logger';

/**
 * Initial auth state
 */
const initialState = {
  user: null,
  accessToken: getAccessToken(),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Auth Store
 *
 * Manages authentication state for the entire application
 */
export const useAuthStore = create<AuthStore>(set => ({
  ...initialState,

  /**
   * Set user profile after successful auth
   */
  setUser: (user: User) => {
    logger.debug('Setting user in auth store', {
      userId: user.id,
      username: user.username,
      full_name: user.full_name,
      email: user.email,
    });

    set({
      user,
      isAuthenticated: true,
      error: null,
    });
  },

  /**
   * Set access token after login/refresh
   *
   * Note: Refresh token is in httpOnly cookie, managed by backend
   */
  setAccessToken: (accessToken: string) => {
    // Save to localStorage
    saveAccessToken(accessToken);

    // Set in apiClient for future requests
    setAuthToken(accessToken);

    // Update store
    set({
      accessToken,
      error: null,
    });
  },

  /**
   * Clear all auth state (logout)
   */
  clearAuth: () => {
    // Remove from localStorage
    removeAccessToken();

    // Clear from apiClient
    clearAuthToken();

    // Reset store to initial state
    set(initialState);
  },

  /**
   * Set loading state during async operations
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  /**
   * Clear error message
   */
  clearError: () => {
    set({ error: null });
  },
}));
