/**
 * API Client
 *
 * DRY: Single axios instance for all API calls across the app
 * SRP: Only handles HTTP configuration and interceptors (no business logic)
 * YAGNI: Simple setup with token injection and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/features/auth/constants/auth.constants';
import { getAccessToken, removeAccessToken } from '@/features/auth/utils/tokenStorage';
import { handleTokenRefresh, isRefreshRequest } from '@/features/auth/utils/tokenRefresh';
import { isTokenExpired, shouldRefreshToken } from '@/features/auth/utils/tokenValidation';
import type { ApiError } from '@/features/auth/types/auth.types';
import { logger } from '@/shared/utils/logger';
import { authTelemetry } from '@/shared/utils/telemetry';

/**
 * Network retry configuration
 */
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
const RETRY_BACKOFF_MULTIPLIER = 2;

/**
 * CSRF token cookie name (must match backend configuration)
 */
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Check if error is a network error that should be retried
 *
 * @param error - Axios error
 * @returns True if error is retryable
 */
const isNetworkError = (error: AxiosError): boolean => {
  // Network errors (connection refused, timeout, DNS errors)
  if (!error.response) {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ENETUNREACH' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error')
    );
  }
  return false;
};

/**
 * Sleep for exponential backoff
 *
 * @param retryCount - Current retry attempt number
 */
const sleep = (retryCount: number): Promise<void> => {
  const delay = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, retryCount);
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Get CSRF token from cookies
 *
 * Provides defense-in-depth CSRF protection alongside JWT + SameSite=Lax
 *
 * @returns CSRF token or null if not found
 */
const getCSRFToken = (): string | null => {
  const cookie = document.cookie.split('; ').find(row => row.startsWith(`${CSRF_COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  return cookie.split('=')[1] || null;
};

/**
 * Axios instance configured for backend API
 *
 * withCredentials: true enables sending httpOnly cookies with requests
 * (required for cookie-based refresh token strategy)
 */
export const apiClient = axios.create({
  baseURL: API_CONFIG.SERVER_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with CORS requests
});

/**
 * Request interceptor: Proactively check token expiration and refresh if needed
 *
 * This prevents sending requests with expired tokens, improving UX by
 * refreshing tokens before they cause 401 errors.
 * Also adds CSRF token for defense-in-depth protection.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add CSRF token if available (defense-in-depth alongside JWT + SameSite)
    const csrfToken = getCSRFToken();
    if (csrfToken && config.headers) {
      config.headers[CSRF_HEADER_NAME] = csrfToken;
      logger.debug('Added CSRF token to request', {
        url: config.url,
      });
    }

    // Skip token logic for refresh endpoint to prevent infinite loop
    if (isRefreshRequest(config.url)) {
      return config;
    }

    const token = getAccessToken();
    if (!token) {
      return config;
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      logger.info('Token expired, refreshing before request', {
        url: config.url,
      });

      // Track token expiration
      authTelemetry.tokenExpired();

      try {
        // Token expired, refresh before making request
        const newToken = await handleTokenRefresh(apiClient, () => {
          removeAccessToken();
          clearAuthToken();
          window.location.href = '/login';
        });

        // Update request with new token
        if (config.headers) {
          config.headers.Authorization = `Bearer ${newToken}`;
        }
      } catch (error) {
        // Refresh failed, request will fail with 401
        logger.error('Token refresh failed in request interceptor', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return Promise.reject(error);
      }
    } else if (shouldRefreshToken(token)) {
      // Token expiring soon, refresh in background (don't block request)
      logger.debug('Token expiring soon, refreshing in background', {
        url: config.url,
      });

      // Fire and forget - don't block the current request
      handleTokenRefresh(apiClient, () => {
        // On failure, do nothing - next request will trigger refresh
      }).catch(error => {
        logger.warn('Background token refresh failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      });

      // Use current token for this request
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      // Token still valid, use it
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors, token refresh, and network retries
 */
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      _retryCount?: number;
    };

    // If no config (shouldn't happen, but be defensive), reject immediately
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Initialize retry count if not present
    if (!originalRequest._retryCount) {
      originalRequest._retryCount = 0;
    }

    // Handle network errors with retry logic (NOT for 4xx/5xx HTTP errors)
    if (isNetworkError(error) && originalRequest._retryCount < MAX_RETRIES) {
      originalRequest._retryCount++;

      logger.warn('Network error, retrying request', {
        url: originalRequest.url,
        retryCount: originalRequest._retryCount,
        maxRetries: MAX_RETRIES,
        errorCode: error.code,
        errorMessage: error.message,
      });

      // Wait with exponential backoff
      await sleep(originalRequest._retryCount - 1);

      // Retry the request
      return apiClient(originalRequest);
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        // Refresh token and get new access token
        const accessToken = await handleTokenRefresh(apiClient, () => {
          // On refresh failure: clear auth and redirect to login
          removeAccessToken();
          clearAuthToken();
          window.location.href = '/login';
        });

        // Update request with new token and retry
        setAuthToken(accessToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - error already handled in handleTokenRefresh
        return Promise.reject(refreshError);
      }
    }

    // Log failed request for debugging
    if (error.response) {
      logger.error('API request failed', {
        url: originalRequest.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (isNetworkError(error)) {
      logger.error('Network error after retries exhausted', {
        url: originalRequest.url,
        retries: originalRequest._retryCount,
        errorCode: error.code,
        errorMessage: error.message,
      });
    }

    // Extract error message from backend response
    const errorMessage = error.response?.data?.detail || 'An unexpected error occurred';

    // Create enhanced error with backend message
    const enhancedError = new Error(errorMessage) as Error & {
      statusCode?: number;
      originalError?: AxiosError<ApiError>;
    };
    enhancedError.statusCode = error.response?.status;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

/**
 * Set Authorization header manually (used after login)
 *
 * @param token - JWT access token
 */
export const setAuthToken = (token: string): void => {
  apiClient.defaults.headers.Authorization = `Bearer ${token}`;
};

/**
 * Clear Authorization header (used after logout)
 */
export const clearAuthToken = (): void => {
  delete apiClient.defaults.headers.Authorization;
};
