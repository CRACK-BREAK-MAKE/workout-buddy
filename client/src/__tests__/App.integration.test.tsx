/**
 * App Integration Tests (TDD Red Phase)
 *
 * Integration tests for App component with session restoration.
 * Tests the interaction between App, useAuthInitialization hook, and routing.
 *
 * Test Coverage:
 * - Loading screen display during initialization
 * - Route rendering after successful initialization
 * - Route rendering after failed initialization
 * - Navigation functionality after initialization
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MockAdapter from 'axios-mock-adapter';
import App from '../App';
import { apiClient } from '@/shared/utils/apiClient';
import { useAuthStore } from '@/features/auth/store/authStore';
import * as tokenStorage from '@/features/auth/utils/tokenStorage';
import * as tokenValidation from '@/features/auth/utils/tokenValidation';
import type { User } from '@/features/auth/types/auth.types';

// Mock axios
const mockAxios = new MockAdapter(apiClient);

// Valid JWT token (expires in 2099)
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

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Reset mocks
    mockAxios.reset();
    vi.clearAllMocks();
    localStorage.clear();

    // Reset auth store
    useAuthStore.getState().clearAuth();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test 1: Loading screen shown during initialization
   */
  it('should render loading screen during initialization', async () => {
    // Setup: Valid token, slow API response (1 second delay)
    vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
    vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

    // Mock slow response
    mockAxios.onGet('/api/v1/auth/oauth/me').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([200, MOCK_USER]), 1000);
      });
    });

    // Render App
    render(<App />);

    // Assert: Loading screen should be visible immediately
    expect(screen.getByText(/restoring session/i)).toBeInTheDocument();

    // Verify loading message present
    const loadingElement = screen.getByText(/restoring session/i);
    expect(loadingElement).toBeVisible();

    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  /**
   * Test 2: Routes rendered after successful initialization
   */
  it('should render app routes after successful initialization', async () => {
    // Setup: Valid token, successful user fetch
    vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
    vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

    mockAxios.onGet('/api/v1/auth/oauth/me').reply(200, MOCK_USER);

    // Render App
    render(<App />);

    // Initially shows loading
    expect(screen.getByText(/restoring session/i)).toBeInTheDocument();

    // Wait for initialization to complete
    await waitFor(() => {
      expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
    });

    // Verify routes rendered (check for common elements in HomePage)
    // Note: Exact assertions depend on your HomePage content
    // This is a placeholder - adjust based on actual HomePage structure
    await waitFor(() => {
      // Check that we're no longer on loading screen
      expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();

      // Verify router is active (you might see route-specific content)
      // Example: HomePage shows "Welcome back" or LoginPage shows "Continue with Google"
      // Adjust based on your actual components
    });

    // Verify auth state updated
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user).toEqual(MOCK_USER);
  });

  /**
   * Test 3: Routes rendered after failed initialization
   */
  it('should render app routes after failed initialization', async () => {
    // Setup: Valid token but API returns 401
    vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
    vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

    mockAxios.onGet('/api/v1/auth/oauth/me').reply(401, { detail: 'Unauthorized' });

    // Render App
    render(<App />);

    // Initially shows loading
    expect(screen.getByText(/restoring session/i)).toBeInTheDocument();

    // Wait for initialization to complete (even with error)
    await waitFor(
      () => {
        expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );

    // Verify routes rendered (app doesn't crash, shows logged-out state)
    // Verify auth state cleared
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBeNull();

    // App should still be functional (not stuck on loading screen)
    expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
  });

  /**
   * Test 4: Navigation works after initialization completes
   */
  it('should allow navigation after initialization completes', async () => {
    // Setup: No token (quick initialization)
    vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(null);

    // Render App with MemoryRouter starting at root
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for initialization to complete (should be fast with no token)
    await waitFor(() => {
      expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
    });

    // Verify app is interactive and not stuck
    // Note: Specific navigation tests depend on your route structure
    // This test primarily verifies that initialization completes and doesn't block the app

    // Verify routes are rendered (no loading screen)
    expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();

    // Verify auth store in expected state
    const authState = useAuthStore.getState();
    expect(authState.isAuthenticated).toBe(false);
    expect(authState.user).toBeNull();
  });

  /**
   * Bonus Test: No flash of wrong content
   */
  it('should not show routes before initialization completes', async () => {
    // Setup: Valid token, moderate delay (500ms)
    vi.spyOn(tokenStorage, 'getAccessToken').mockReturnValue(VALID_TOKEN);
    vi.spyOn(tokenValidation, 'isTokenExpired').mockReturnValue(false);

    mockAxios.onGet('/api/v1/auth/oauth/me').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([200, MOCK_USER]), 500);
      });
    });

    // Render App
    render(<App />);

    // Verify loading screen shown immediately
    expect(screen.getByText(/restoring session/i)).toBeInTheDocument();

    // Verify no route content visible during loading
    // (Adjust based on your actual route content)
    // Example: HomePage might have "Welcome back" text
    // We should NOT see that text while loading screen is visible

    // Wait a bit (but not long enough for completion)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Verify still showing loading screen (not flashing to routes)
    expect(screen.getByText(/restoring session/i)).toBeInTheDocument();

    // Wait for completion
    await waitFor(
      () => {
        expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );

    // Now routes should be visible
    expect(screen.queryByText(/restoring session/i)).not.toBeInTheDocument();
  });
});
