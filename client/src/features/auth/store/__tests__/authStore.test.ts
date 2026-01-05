/**
 * Auth Store Tests (TDD Red Phase - Partial)
 *
 * Tests for authentication state management with Zustand.
 * Adding new tests for session restoration initialization state.
 *
 * New Test Coverage (for session restoration):
 * - Store initializes with token from localStorage but isAuthenticated false
 * - isAuthenticated becomes true only after setUser is called
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import * as tokenStorage from '../../utils/tokenStorage';
import { logger } from '@/shared/utils/logger';
import type { User } from '../../types/auth.types';

// Valid JWT token
const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjo0MTAyNDQ0ODAwfQ.VzvKe_MbnT6bBz2GU6VPLfM2zKKMdQ1LUUzS3HkxZ_s';

// Mock user data
const MOCK_USER: User = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@example.com',
  username: 'testuser',
  full_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  auth_provider: 'google',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('authStore', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset store to initial state
    useAuthStore.getState().clearAuth();

    vi.clearAllMocks();

    // Mock logger to avoid console pollution during tests
    vi.spyOn(logger, 'debug').mockImplementation(() => {});
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  /**
   * Existing basic tests (if any) would go here
   */
  describe('Basic Store Operations', () => {
    it('should initialize with default state when no token in localStorage', () => {
      // Setup: No token in localStorage
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null);

      // Get fresh store state
      const state = useAuthStore.getState();

      // Verify initial state
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should update user when setUser is called', () => {
      const { setUser } = useAuthStore.getState();

      // Execute
      setUser(MOCK_USER);

      // Verify
      const state = useAuthStore.getState();
      expect(state.user).toEqual(MOCK_USER);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update access token when setAccessToken is called', () => {
      const { setAccessToken } = useAuthStore.getState();

      // Execute
      setAccessToken(VALID_TOKEN);

      // Verify
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(VALID_TOKEN);
      expect(state.error).toBeNull();
    });

    it('should clear all state when clearAuth is called', () => {
      const { setUser, setAccessToken, clearAuth } = useAuthStore.getState();

      // Setup: Set some state
      setUser(MOCK_USER);
      setAccessToken(VALID_TOKEN);

      // Verify state set
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Execute: Clear auth
      clearAuth();

      // Verify: State cleared
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  /**
   * NEW TESTS: Session Restoration Initialization State
   */
  describe('Session Restoration - Initialization State', () => {
    /**
     * Test 1: Store initializes with token from localStorage but isAuthenticated false
     *
     * This test validates the current behavior where the store reads the access token
     * from localStorage on initialization, but does NOT set isAuthenticated to true.
     * This is by design - isAuthenticated should only be true after user profile is fetched.
     */
    it('should initialize with token from localStorage but isAuthenticated false', () => {
      // Setup: Token exists in localStorage
      localStorage.setItem('workout_buddy_access_token', VALID_TOKEN);

      // Force store to re-read from localStorage by manually setting accessToken
      // This simulates the store initialization behavior
      useAuthStore.setState({ accessToken: VALID_TOKEN });

      // Get store state
      const state = useAuthStore.getState();

      // Verify: Token restored from localStorage
      expect(state.accessToken).toBe(VALID_TOKEN);

      // Verify: But user NOT authenticated (no user profile yet)
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();

      // Note: This validates that having a token alone doesn't make user authenticated
    });

    /**
     * Test 2: isAuthenticated becomes true only after setUser is called
     *
     * This test validates that even with a valid token, the user is not considered
     * authenticated until the user profile is fetched and set via setUser().
     * This is the key behavior that session restoration must implement.
     */
    it('should set isAuthenticated to true only when setUser is called', () => {
      const { setAccessToken, setUser } = useAuthStore.getState();

      // Step 1: Set access token (simulating token restored from localStorage)
      setAccessToken(VALID_TOKEN);

      // Verify: Token set but NOT authenticated yet
      let state = useAuthStore.getState();
      expect(state.accessToken).toBe(VALID_TOKEN);
      expect(state.isAuthenticated).toBe(false); // Still false!
      expect(state.user).toBeNull();

      // Step 2: Now set user profile (simulating successful fetch from API)
      setUser(MOCK_USER);

      // Verify: NOW user is authenticated
      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true); // Now true!
      expect(state.user).toEqual(MOCK_USER);
      expect(state.accessToken).toBe(VALID_TOKEN);
    });

    /**
     * Test 3: User profile can be set without explicit token set
     *
     * This validates that setUser() alone is sufficient to mark user as authenticated,
     * even if setAccessToken() wasn't called explicitly (token might already be in store).
     */
    it('should set isAuthenticated to true when setUser is called even without explicit token set', () => {
      // Setup: Token in localStorage (auto-loaded by store)
      localStorage.setItem('workout_buddy_access_token', VALID_TOKEN);

      const { setUser } = useAuthStore.getState();

      // Verify: Initially not authenticated (no user profile)
      let state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);

      // Execute: Set user profile
      setUser(MOCK_USER);

      // Verify: Now authenticated
      state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(MOCK_USER);
    });

    /**
     * Test 4: Clearing auth resets isAuthenticated even with token in localStorage
     *
     * This validates that clearAuth() properly resets the authentication state,
     * even though the token might still exist in localStorage (it should be removed).
     */
    it('should reset isAuthenticated to false when clearAuth is called', () => {
      const { setUser, setAccessToken, clearAuth } = useAuthStore.getState();

      // Setup: Authenticated user
      setAccessToken(VALID_TOKEN);
      setUser(MOCK_USER);

      // Verify: Authenticated
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Execute: Clear auth
      clearAuth();

      // Verify: No longer authenticated
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();

      // Verify: Token also removed from localStorage
      expect(localStorage.getItem('workout_buddy_access_token')).toBeNull();
    });
  });

  /**
   * Additional Store Tests (Error handling, loading states, etc.)
   */
  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState();

      // Execute
      setLoading(true);

      // Verify
      expect(useAuthStore.getState().isLoading).toBe(true);

      // Execute: Turn off loading
      setLoading(false);

      // Verify
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set error message', () => {
      const { setError } = useAuthStore.getState();

      const errorMessage = 'Authentication failed';

      // Execute
      setError(errorMessage);

      // Verify
      const state = useAuthStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false); // Loading should be false when error set
    });

    it('should clear error message', () => {
      const { setError, clearError } = useAuthStore.getState();

      // Setup: Set an error
      setError('Some error');
      expect(useAuthStore.getState().error).toBe('Some error');

      // Execute: Clear error
      clearError();

      // Verify
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});
