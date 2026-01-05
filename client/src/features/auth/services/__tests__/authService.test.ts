/**
 * Auth Service Tests
 *
 * TDD: Write tests FIRST
 * SRP: Only handles OAuth business logic (no HTTP, no storage directly)
 * DIP: Depends on apiClient abstraction, not axios directly
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { apiClient } from '@/shared/utils/apiClient';
import * as authService from '../authService';
import type { User, TokenPair } from '../../types/auth.types';

// Mock logger to avoid console pollution in tests
vi.mock('@/shared/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock token refresh to prevent auto-refresh in tests
vi.mock('@/features/auth/utils/tokenRefresh', () => ({
  handleTokenRefresh: vi.fn(),
  isRefreshRequest: vi.fn(() => false),
  refreshAccessToken: vi.fn(),
}));

describe('authService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('initiateGoogleLogin', () => {
    it('should redirect to backend OAuth endpoint', () => {
      const assignSpy = vi.spyOn(window.location, 'assign');

      authService.initiateGoogleLogin();

      expect(assignSpy).toHaveBeenCalledWith(
        'http://localhost:7001/api/v1/auth/oauth/google/login'
      );
    });
  });

  describe('handleOAuthCallback', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatar.jpg',
      auth_provider: 'google',
      is_active: true,
      created_at: '2026-01-05T00:00:00Z',
      updated_at: '2026-01-05T00:00:00Z',
    };

    it('should fetch user profile with provided token', async () => {
      const token = 'test-access-token';
      mock.onGet('/auth/oauth/me').reply(200, mockUser);

      const user = await authService.handleOAuthCallback(token);

      expect(user).toEqual(mockUser);
      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0]!.headers?.Authorization).toBe(`Bearer ${token}`);
    });

    it('should throw error if API call fails', async () => {
      mock.onGet('/auth/oauth/me').reply(401, {
        detail: 'Unauthorized',
        status_code: 401,
      });

      await expect(authService.handleOAuthCallback('invalid-token')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('refreshAccessToken', () => {
    const mockTokenPair: TokenPair = {
      access_token: 'new-access-token',
      refresh_token: 'new-refresh-token',
      token_type: 'bearer',
      expires_in: 900,
    };

    it('should call refresh endpoint without request body (cookie-based)', async () => {
      mock.onPost('/auth/oauth/refresh').reply(200, mockTokenPair);

      const tokenPair = await authService.refreshAccessToken();

      expect(tokenPair).toEqual(mockTokenPair);
      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0]!.url).toBe('/auth/oauth/refresh');
      // No request body needed - refresh token sent via httpOnly cookie
      expect(mock.history.post[0]!.data).toBeUndefined();
    });

    it('should throw error if refresh fails', async () => {
      mock.onPost('/auth/oauth/refresh').reply(401, {
        detail: 'Invalid or expired refresh token',
        status_code: 401,
      });

      await expect(authService.refreshAccessToken()).rejects.toThrow(
        'Invalid or expired refresh token'
      );
    });

    it('should throw error if refresh token cookie is missing', async () => {
      mock.onPost('/auth/oauth/refresh').reply(401, {
        detail: 'Refresh token missing. Please log in again.',
        status_code: 401,
      });

      await expect(authService.refreshAccessToken()).rejects.toThrow(
        'Refresh token missing. Please log in again.'
      );
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      mock.onPost('/auth/oauth/logout').reply(204);

      await authService.logout();

      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0]!.url).toBe('/auth/oauth/logout');
    });

    it('should not throw if logout endpoint fails', async () => {
      mock.onPost('/auth/oauth/logout').reply(500);

      // Logout should not throw - best effort
      await expect(authService.logout()).resolves.not.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      username: 'testuser',
      full_name: 'Test User',
      avatar_url: null,
      auth_provider: 'google',
      is_active: true,
      created_at: '2026-01-05T00:00:00Z',
      updated_at: '2026-01-05T00:00:00Z',
    };

    it('should fetch current user profile', async () => {
      mock.onGet('/auth/oauth/me').reply(200, mockUser);

      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
    });

    it('should throw error if not authenticated', async () => {
      mock.onGet('/auth/oauth/me').reply(401, {
        detail: 'Not authenticated',
        status_code: 401,
      });

      await expect(authService.getCurrentUser()).rejects.toThrow('Not authenticated');
    });
  });
});
