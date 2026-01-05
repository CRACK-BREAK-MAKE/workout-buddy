/**
 * Token Refresh Utility
 *
 * SRP: Only handles automatic token refresh logic
 * DRY: Centralized refresh logic used by apiClient interceptor
 * YAGNI: Simple implementation without unnecessary complexity
 */

import type { AxiosInstance } from 'axios';
import { AUTH_ENDPOINTS } from '../constants/auth.constants';
import { saveAccessToken } from './tokenStorage';
import type { TokenPair } from '../types/auth.types';
import { TokenRefreshTimeoutError, TokenRefreshError } from '../types/auth.errors';
import { logger } from '@/shared/utils/logger';

/**
 * Maximum time to wait for token refresh (30 seconds)
 */
const REFRESH_TIMEOUT_MS = 30000;

/**
 * Queue for failed requests during token refresh
 */
interface QueuedRequest {
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Process queued requests after token refresh
 *
 * This function implements a request queue pattern to handle concurrent requests
 * that arrive while a token refresh is in progress. Instead of triggering multiple
 * refresh requests, we queue pending requests and resolve/reject them all at once
 * when the refresh completes.
 *
 * **Pattern Explanation:**
 * 1. When token refresh starts, `isRefreshing` flag is set to true
 * 2. Any API requests during this time are queued (added to `failedQueue`)
 * 3. When refresh completes (success or failure), this function processes the queue:
 *    - Success: All queued requests resolve with the new token
 *    - Failure: All queued requests reject with the error
 * 4. Queue is cleared after processing
 *
 * **Benefits:**
 * - Prevents duplicate refresh requests (race condition)
 * - Ensures all pending requests use the same refreshed token
 * - Maintains request order and consistency
 *
 * @param error - Error if refresh failed (null on success)
 * @param token - New access token if refresh succeeded (null on failure)
 *
 * @example
 * ```typescript
 * // On success:
 * processQueue(null, 'new-access-token');
 * // All queued requests resolve with 'new-access-token'
 *
 * // On failure:
 * processQueue(new TokenRefreshError('Refresh failed'), null);
 * // All queued requests reject with the error
 * ```
 */
const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Refresh access token using httpOnly cookie
 *
 * @param axiosInstance - Axios instance to use for refresh request
 * @returns Promise with new access token
 */
export const refreshAccessToken = async (axiosInstance: AxiosInstance): Promise<string> => {
  const response = await axiosInstance.post<TokenPair>(AUTH_ENDPOINTS.OAUTH_REFRESH);
  return response.data.access_token;
};

/**
 * Handle token refresh with queue management and timeout protection
 *
 * Ensures only one refresh request is made at a time,
 * and queues other requests until refresh completes.
 * Includes timeout protection to prevent hanging requests.
 *
 * @param axiosInstance - Axios instance to use for refresh
 * @param onAuthFailure - Callback when refresh fails (redirect to login)
 * @returns Promise with new access token
 */
export const handleTokenRefresh = async (
  axiosInstance: AxiosInstance,
  onAuthFailure: () => void
): Promise<string> => {
  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        logger.error('Token refresh timeout exceeded', {
          timeout: REFRESH_TIMEOUT_MS,
          queueLength: failedQueue.length,
        });
        reject(new TokenRefreshTimeoutError());
      }, REFRESH_TIMEOUT_MS);
    });

    // Race between refresh and timeout
    const accessToken = await Promise.race([refreshAccessToken(axiosInstance), timeoutPromise]);

    // Save new access token
    saveAccessToken(accessToken);

    // Process queued requests with new token
    processQueue(null, accessToken);

    logger.debug('Token refresh successful', {
      queueLength: failedQueue.length,
    });

    return accessToken;
  } catch (error) {
    // Log the error
    logger.error('Token refresh failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      errorType: error instanceof Error ? error.name : typeof error,
      queueLength: failedQueue.length,
    });

    // Convert to TokenRefreshError if not already an auth error
    const refreshError =
      error instanceof TokenRefreshTimeoutError
        ? error
        : new TokenRefreshError(error instanceof Error ? error.message : 'Token refresh failed');

    // Refresh failed - process queue with error and trigger logout
    processQueue(refreshError, null);

    // Clear auth state and redirect
    onAuthFailure();

    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Check if request is to refresh endpoint (to prevent infinite loop)
 *
 * @param url - Request URL
 * @returns True if request is to refresh endpoint
 */
export const isRefreshRequest = (url?: string): boolean => {
  return url?.includes(AUTH_ENDPOINTS.OAUTH_REFRESH) ?? false;
};
