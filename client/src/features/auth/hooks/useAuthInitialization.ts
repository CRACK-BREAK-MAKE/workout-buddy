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

/**
 * Auth initialization state
 */
interface AuthInitializationState {
  isInitializing: boolean;
}

/**
 * Hook to automatically restore user session on app load
 *
 * @returns {AuthInitializationState} - Object containing isInitializing flag
 *
 * @example
 * ```tsx
 * const { isInitializing } = useAuthInitialization();
 *
 * if (isInitializing) {
 *   return <LoadingScreen />;
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
      // Prevent duplicate initialization (e.g., React StrictMode, multiple instances)
      if (hasInitialized.current) {
        return;
      }
      hasInitialized.current = true;

      try {
        // Step 1: Check for access token in localStorage
        const token = getAccessToken();

        if (!token) {
          logger.debug('No access token found - user not logged in');
          setIsInitializing(false);
          return;
        }

        logger.debug('Access token found, validating expiration');

        // Step 2: Validate token expiration
        if (isTokenExpired(token)) {
          logger.debug('Token expired during initialization - clearing auth');
          clearAuth();
          setIsInitializing(false);
          return;
        }

        logger.debug('Token valid, attempting session restoration');

        // Step 3: Set token in apiClient for subsequent requests
        setAuthToken(token);

        // Step 4: Fetch user profile from backend
        const user = await getCurrentUser();

        // Step 5: Update auth store with user data and token
        setUser(user);
        setAccessToken(token);

        logger.info('Session restored successfully', {
          userId: user.id,
          username: user.username,
          email: user.email,
        });
      } catch (error) {
        // Handle errors gracefully - clear auth and continue
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Session restoration failed', {
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
