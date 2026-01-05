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
 * @param error - Error if refresh failed
 * @param token - New access token if refresh succeeded
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
 * Handle token refresh with queue management
 *
 * Ensures only one refresh request is made at a time,
 * and queues other requests until refresh completes
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
    const accessToken = await refreshAccessToken(axiosInstance);

    // Save new access token
    saveAccessToken(accessToken);

    // Process queued requests with new token
    processQueue(null, accessToken);

    return accessToken;
  } catch (error) {
    // Refresh failed - process queue with error and trigger logout
    processQueue(error as Error, null);

    // Clear auth state and redirect
    onAuthFailure();

    throw error;
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
