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
import type { ApiError } from '@/features/auth/types/auth.types';

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
 * Request interceptor: Automatically inject JWT token from localStorage
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle errors and automatic token refresh on 401
 */
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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
