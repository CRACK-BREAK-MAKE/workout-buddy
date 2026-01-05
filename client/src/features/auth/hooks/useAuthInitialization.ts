/**
 * useAuthInitialization Hook
 *
 * SRP: Only manages session restoration initialization state
 * DRY: Reuses existing auth utilities (tokenStorage, tokenValidation, authService)
 * YAGNI: Simple implementation without unnecessary complexity
 *
 * This hook automatically restores user session on app load by:
 * 1. Checking for existing access token in localStorage
 * 2. Validating token expiration before trusting it
 * 3. Fetching user profile if token is valid
 * 4. Updating auth store with user data
 * 5. Handling errors gracefully (clear auth, show logged-out state)
 *
 * Usage:
 * ```tsx
 * function App() {
 *   const { isInitializing } = useAuthInitialization();
 *
 *   if (isInitializing) {
 *     return <LoadingScreen message="Restoring session..." />;
 *   }
 *
 *   return <Routes>...</Routes>;
 * }
 * ```
 */

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { getAccessToken } from '../utils/tokenStorage';
import { isTokenExpired } from '../utils/tokenValidation';
import { getCurrentUser } from '../services/authService';
import { setAuthToken } from '@/shared/utils/apiClient';
import { logger } from '@/shared/utils/logger';
import { AUTH_MESSAGES } from '../constants/auth.constants';

/**
 * Auth initialization state
 */
interface AuthInitializationState {
  isInitializing: boolean;
}

/**
 * Hook to automatically restore user session on app load
 *
 * This hook runs once on app mount and:
 * 1. Checks for existing access token in localStorage
 * 2. Validates token expiration before trusting it
 * 3. Fetches user profile if token is valid
 * 4. Updates auth store with user data
 * 5. Handles errors gracefully (clear auth, show logged-out state)
 *
 * @returns {AuthInitializationState} - Object containing isInitializing flag
 *
 * @see {@link getAccessToken} - Retrieves token from localStorage with validation
 * @see {@link isTokenExpired} - Checks JWT expiration before trusting token
 * @see {@link getCurrentUser} - Fetches user profile from backend
 * @see {@link useAuthStore} - Zustand store for auth state management
 *
 * @example
 * ```tsx
 * import { AUTH_MESSAGES } from '@/features/auth/constants/auth.constants';
 *
 * function App() {
 *   const { isInitializing } = useAuthInitialization();
 *
 *   if (isInitializing) {
 *     return <LoadingScreen message={AUTH_MESSAGES.SESSION_RESTORING} />;
 *   }
 *
 *   return <Routes>...</Routes>;
 * }
 * ```
 */
export const useAuthInitialization = (): AuthInitializationState => {
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    /**
     * Initialize authentication state from localStorage
     *
     * Flow:
     * 1. Check for token in localStorage
     * 2. Validate token expiration
     * 3. If valid, fetch user profile
     * 4. Update auth store
     * 5. Handle errors gracefully
     */
    const initializeAuth = async () => {
      // Get store functions inside useEffect to satisfy eslint exhaustive-deps
      // Zustand store functions are stable and don't cause re-renders
      const { setUser, setAccessToken, clearAuth } = useAuthStore.getState();

      // Prevent duplicate initialization in React 18+ StrictMode
      // StrictMode intentionally calls effects twice in development to help detect bugs
      // This guard ensures we only initialize once per app lifecycle
      // See: https://react.dev/reference/react/StrictMode#fixing-bugs-found-by-double-rendering-in-development
      if (hasInitialized.current) {
        return;
      }
      hasInitialized.current = true;

      try {
        // Step 1: Check for access token in localStorage
        const token = getAccessToken();

        if (!token) {
          logger.debug(AUTH_MESSAGES.NO_TOKEN);
          setIsInitializing(false);
          return;
        }

        logger.debug(AUTH_MESSAGES.TOKEN_FOUND);

        // Step 2: Validate token expiration
        if (isTokenExpired(token)) {
          logger.debug(AUTH_MESSAGES.TOKEN_EXPIRED_INIT);
          clearAuth();
          setIsInitializing(false);
          return;
        }

        logger.debug(AUTH_MESSAGES.TOKEN_VALID);

        // Step 3: Set token in apiClient for subsequent requests
        setAuthToken(token);

        // Step 4: Fetch user profile from backend
        const user = await getCurrentUser();

        // Step 5: Update auth store with user data and token
        setUser(user);
        setAccessToken(token);

        logger.info(AUTH_MESSAGES.SESSION_RESTORED, {
          userId: user.id,
          username: user.username,
          email: user.email,
        });
      } catch (error) {
        // Handle errors gracefully - clear auth and continue
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(AUTH_MESSAGES.SESSION_FAILED, {
          error: errorMessage,
        });

        // Clear auth state (user will need to re-login)
        clearAuth();
      } finally {
        // Always set isInitializing to false (never leave app stuck loading)
        setIsInitializing(false);
      }
    };

    // Execute initialization
    initializeAuth();

    // Cleanup function (prevents memory leaks if component unmounts during initialization)
    return () => {
      // In future, could use AbortController to cancel in-flight API requests
      // For now, the finally block ensures state is always cleaned up
    };
  }, []); // Empty dependency array - run once on mount

  return { isInitializing };
};
