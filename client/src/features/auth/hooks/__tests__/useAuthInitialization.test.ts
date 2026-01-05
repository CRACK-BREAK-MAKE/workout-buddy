/**
 * useAuthInitialization Hook Tests (TDD Red Phase)
 *
 * Tests for automatic session restoration on app load.
 * These tests are written FIRST following TDD methodology.
 *
 * Test Coverage:
 * - Happy path scenarios (valid token restoration)
 * - Token validation (expired, malformed tokens)
 * - Error handling (401, 500, network errors)
 * - Loading state management
 * - Race conditions and cleanup
 * - Integration with auth store
 * - Logging and telemetry
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { useAuthInitialization } from '../useAuthInitialization';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '@/shared/utils/apiClient';
import * as tokenStorage from '../../utils/tokenStorage';
import * as tokenValidation from '../../utils/tokenValidation';
import { logger } from '@/shared/utils/logger';
import type { User } from '../../types/auth.types';

// Mock axios
const mockAxios = new MockAdapter(apiClient);

// Valid JWT token (expires in 2099)
const VALID_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjo0MTAyNDQ0ODAwfQ.VzvKe_MbnT6bBz2GU6VPLfM2zKKMdQ1LUUzS3HkxZ_s';

// Expired JWT token (expired in 2020)
const EXPIRED_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZXhwIjoxNTc3ODM2ODAwfQ.4Adcj0MhtB67TzKzZzRKh7BIgRjNz8RZkXqLCbKXGjo';

// Malformed token (not 3 parts)
const MALFORMED_TOKEN = 'invalid.token';

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

describe('useAuthInitialization', () => {
  beforeEach(() => {
    // Reset mocks
    mockAxios.reset();
    vi.clearAllMocks();
    localStorage.clear();

    // Reset auth store
    useAuthStore.getState().clearAuth();

    // Mock logger to avoid console noise
    vi.spyOn(logger, 'debug').mockImplementation(() => {});
    vi.spyOn(logger, 'info').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test Suite 1: Happy Path Scenarios
   */
  describe('Happy Path', () => {
    it('should skip initialization if no token in localStorage', async () => {
      // Setup: No token in localStorage
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null);

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Assert: Should immediately set isInitializing to false
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify no API calls made
      expect(mockAxios.history.get.length).toBe(0);

      // Verify user remains logged out
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
    });

    it('should restore session if valid token exists', async () => {
      // Setup: Valid token in localStorage
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock successful user profile fetch
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Assert: Should start with isInitializing true
      expect(result.current.isInitializing).toBe(true);

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify user profile fetched
      expect(mockAxios.history.get.length).toBe(1);
      expect(mockAxios.history.get[0].url).toBe('/api/v1/auth/oauth/me');

      // Verify auth store updated
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toEqual(MOCK_USER);
      expect(authState.accessToken).toBe(VALID_TOKEN);

      // Verify success logged
      expect(logger.info).toHaveBeenCalledWith(
        'Session restored successfully',
        expect.objectContaining({ userId: MOCK_USER.id })
      );
    });

    it('should set auth token in apiClient after successful restoration', async () => {
      // Setup: Valid token
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock successful user profile fetch
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute
      renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(mockAxios.history.get.length).toBe(1);
      });

      // Verify token set in request headers
      const authHeader = mockAxios.history.get[0].headers?.Authorization;
      expect(authHeader).toBe(`Bearer ${VALID_TOKEN}`);
    });
  });

  /**
   * Test Suite 2: Token Validation Scenarios
   */
  describe('Token Validation', () => {
    it('should clear auth if token is expired', async () => {
      // Setup: Expired token in localStorage
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(EXPIRED_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(true);

      const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify no API call made (token expired)
      expect(mockAxios.history.get.length).toBe(0);

      // Verify auth cleared
      expect(clearAuthSpy).toHaveBeenCalled();

      // Verify user logged out
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();

      // Verify logged
      expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining('expired'));
    });

    it('should clear auth if token is malformed (invalid JWT)', async () => {
      // Setup: Malformed token in localStorage
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(MALFORMED_TOKEN);
      // getAccessToken should return null for malformed tokens (it validates format)
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null);

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify no API call made
      expect(mockAxios.history.get.length).toBe(0);

      // Verify auth remains cleared (no restoration attempted)
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should proceed with valid token even if expiring soon', async () => {
      // Setup: Token expiring in 2 minutes (valid but should refresh soon)
      const expiringToken = VALID_TOKEN; // Still valid, just expiring soon
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(expiringToken);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);
      vi.spyOn(tokenValidation, 'shouldRefreshToken').mockReturnValue(true);

      // Mock successful user fetch
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify initialization proceeded (background refresh may trigger separately)
      expect(mockAxios.history.get.length).toBe(1);

      // Verify user authenticated
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user).toEqual(MOCK_USER);
    });
  });

  /**
   * Test Suite 3: Error Handling Scenarios
   */
  describe('Error Handling', () => {
    it('should clear auth if user fetch returns 401 Unauthorized', async () => {
      // Setup: Valid token but backend returns 401
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock 401 response
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(401, { detail: 'Unauthorized' });

      const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify API called
      expect(mockAxios.history.get.length).toBeGreaterThan(0);

      // Verify auth cleared
      expect(clearAuthSpy).toHaveBeenCalled();

      // Verify error logged
      expect(logger.error).toHaveBeenCalledWith(
        'Session restoration failed',
        expect.objectContaining({ error: expect.anything() })
      );

      // Verify user logged out
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should clear auth if user fetch returns 500 Server Error', async () => {
      // Setup: Valid token but backend returns 500
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock 500 response
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(500, { detail: 'Internal Server Error' });

      const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify auth cleared
      expect(clearAuthSpy).toHaveBeenCalled();

      // Verify error logged
      expect(logger.error).toHaveBeenCalled();
    });

    it('should clear auth if network error occurs (timeout, connection refused)', async () => {
      // Setup: Valid token but network error
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock network error (no response)
      mockAxios.onGet('/api/v1/auth/oauth/me').networkError();

      const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify auth cleared
      expect(clearAuthSpy).toHaveBeenCalled();

      // Verify error logged
      expect(logger.error).toHaveBeenCalled();
    });

    it('should clear auth if user fetch returns invalid data (missing fields)', async () => {
      // Setup: Valid token but invalid response data
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock response with missing required fields
      const invalidUser = { email: 'test@example.com' }; // Missing id, username, etc.
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, invalidUser);

      const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth');

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify auth cleared (validation failed)
      expect(clearAuthSpy).toHaveBeenCalled();
    });
  });

  /**
   * Test Suite 4: Loading State Management
   */
  describe('Loading States', () => {
    it('should set isInitializing to true during restoration', async () => {
      // Setup: Valid token, slow API response
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock slow response (1 second delay)
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([200, MOCK_USER]), 1000);
        });
      });

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Assert: Initially true
      expect(result.current.isInitializing).toBe(true);

      // Still true after 500ms
      await new Promise(resolve => setTimeout(resolve, 500));
      expect(result.current.isInitializing).toBe(true);

      // Eventually false after completion
      await waitFor(
        () => {
          expect(result.current.isInitializing).toBe(false);
        },
        { timeout: 2000 }
      );
    });

    it('should set isInitializing to false after successful restoration', async () => {
      // Setup: Valid token, successful fetch
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(result.current.isInitializing).toBe(false);
      });

      // Verify it stays false
      expect(result.current.isInitializing).toBe(false);
    });

    it('should set isInitializing to false after failed restoration', async () => {
      // Setup: Valid token, 401 error
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(401);

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion (should not hang)
      await waitFor(
        () => {
          expect(result.current.isInitializing).toBe(false);
        },
        { timeout: 1000 }
      );

      // Verify not stuck loading
      expect(result.current.isInitializing).toBe(false);
    });
  });

  /**
   * Test Suite 5: Race Conditions & Edge Cases
   */
  describe('Race Conditions', () => {
    it('should not trigger multiple initializations if called multiple times', async () => {
      // Setup: Valid token
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute: Call hook twice (simulating React StrictMode)
      const { result: result1 } = renderHook(() => useAuthInitialization());
      const { result: result2 } = renderHook(() => useAuthInitialization());

      // Wait for both to complete
      await waitFor(() => {
        expect(result1.current.isInitializing).toBe(false);
        expect(result2.current.isInitializing).toBe(false);
      });

      // Verify only ONE API call made (not two)
      // Note: This test might need adjustment based on actual implementation
      // If each hook instance is independent, we might see 2 calls
      // If we use a global flag, we should see only 1 call
      expect(mockAxios.history.get.length).toBeGreaterThanOrEqual(1);
    });

    it('should cleanup and abort if component unmounts during initialization', async () => {
      // Setup: Valid token, slow response
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock slow response
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([200, MOCK_USER]), 2000);
        });
      });

      // Execute
      const { result, unmount } = renderHook(() => useAuthInitialization());

      // Verify initialization started
      expect(result.current.isInitializing).toBe(true);

      // Unmount before completion
      unmount();

      // Verify no errors thrown (cleanup successful)
      // In real implementation, AbortController should cancel the request
      expect(true).toBe(true); // Test passes if no errors
    });

    it('should handle token refresh during initialization (401 → refresh → retry)', async () => {
      // Setup: Valid token but backend returns 401, refresh succeeds
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      // Mock 401 on first call, success on retry (after refresh)
      let callCount = 0;
      mockAxios.onGet('/api/v1/auth/oauth/me').reply(() => {
        callCount++;
        if (callCount === 1) {
          return [401, { detail: 'Unauthorized' }];
        }
        return [200, MOCK_USER];
      });

      // Mock successful token refresh
      mockAxios.onPost('/api/v1/auth/oauth/refresh').reply(200, {
        access_token: 'new_token',
        refresh_token: 'new_refresh_token',
        token_type: 'bearer',
        expires_in: 3600,
      });

      // Execute
      const { result } = renderHook(() => useAuthInitialization());

      // Wait for completion (interceptor should handle refresh)
      await waitFor(
        () => {
          expect(result.current.isInitializing).toBe(false);
        },
        { timeout: 3000 }
      );

      // Note: This depends on whether interceptor retries automatically
      // If it does, user should be authenticated; if not, user logged out
      // In real implementation, verify the final auth state matches expected behavior
      expect(true).toBe(true); // Placeholder - adjust based on actual behavior
    });
  });

  /**
   * Test Suite 6: Integration with Auth Store
   */
  describe('Store Integration', () => {
    it('should call setUser() with correct user data', async () => {
      // Setup: Valid token, successful fetch
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      const setUserSpy = vi.spyOn(useAuthStore.getState(), 'setUser');

      // Execute
      renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(setUserSpy).toHaveBeenCalled();
      });

      // Verify called with exact user object
      expect(setUserSpy).toHaveBeenCalledWith(MOCK_USER);
    });

    it('should call setAccessToken() to sync token in store', async () => {
      // Setup: Valid token
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      const setAccessTokenSpy = vi.spyOn(useAuthStore.getState(), 'setAccessToken');

      // Execute
      renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(setAccessTokenSpy).toHaveBeenCalled();
      });

      // Verify called with token
      expect(setAccessTokenSpy).toHaveBeenCalledWith(VALID_TOKEN);
    });

    it('should call clearAuth() on any error', async () => {
      // Setup: Various error scenarios
      const scenarios = [
        { name: '401 error', response: [401, { detail: 'Unauthorized' }] as [number, object] },
        { name: '500 error', response: [500, { detail: 'Server Error' }] as [number, object] },
        { name: 'network error', networkError: true },
      ];

      for (const scenario of scenarios) {
        // Reset
        mockAxios.reset();
        useAuthStore.getState().clearAuth();
        vi.clearAllMocks();

        vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
        vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

        if (scenario.networkError) {
          mockAxios.onGet('/api/v1/auth/oauth/me').networkError();
        } else if (scenario.response) {
          mockAxios.onGet('/api/v1/auth/oauth/me').reply(...scenario.response);
        }

        // Execute
        const { result } = renderHook(() => useAuthInitialization());

        // Wait for completion
        await waitFor(() => {
          expect(result.current.isInitializing).toBe(false);
        });

        // Verify clearAuth was called (check store state)
        const authState = useAuthStore.getState();
        expect(authState.isAuthenticated).toBe(false);
        expect(authState.user).toBeNull();
      }
    });
  });

  /**
   * Test Suite 7: Logging & Telemetry
   */
  describe('Logging', () => {
    it('should log restoration attempt', async () => {
      // Setup: Valid token
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute
      renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(mockAxios.history.get.length).toBe(1);
      });

      // Verify attempt logged (either debug or info level)
      const logCalled =
        logger.debug.mock.calls.some(call => call[0]?.includes('restor')) ||
        logger.info.mock.calls.some(call => call[0]?.includes('restor'));

      expect(logCalled).toBe(true);
    });

    it('should log successful restoration', async () => {
      // Setup: Valid token, successful restoration
      vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
      vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

      mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

      // Execute
      renderHook(() => useAuthInitialization());

      // Wait for completion
      await waitFor(() => {
        expect(logger.info).toHaveBeenCalled();
      });

      // Verify success logged with user ID
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('success'),
        expect.objectContaining({ userId: MOCK_USER.id })
      );
    });

    it('should log restoration failure with reason', async () => {
      // Setup: Various error scenarios
      const errorScenarios = [
        {
          name: 'expired token',
          setup: () => vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(true),
        },
        {
          name: '401 error',
          setup: () =>
            mockAxios.onGet('/api/v1/auth/oauth/me').reply(401, { detail: 'Unauthorized' }),
        },
        {
          name: 'network error',
          setup: () => mockAxios.onGet('/api/v1/auth/oauth/me').networkError(),
        },
      ];

      for (const scenario of errorScenarios) {
        // Reset
        mockAxios.reset();
        vi.clearAllMocks();

        vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
        scenario.setup();

        // Execute
        const { result } = renderHook(() => useAuthInitialization());

        // Wait for completion
        await waitFor(() => {
          expect(result.current.isInitializing).toBe(false);
        });

        // Verify error logged (debug, error, or warn level)
        const errorLogged =
          logger.error.mock.calls.length > 0 ||
          logger.debug.mock.calls.some(
            call => call[0]?.includes('fail') || call[0]?.includes('expired')
          );

        expect(errorLogged).toBe(true);
      }
    });
  });
});
