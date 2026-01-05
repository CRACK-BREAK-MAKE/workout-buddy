/**
 * API Client
 *
 * DRY: Single axios instance for all API calls across the app
 * SRP: Only handles HTTP configuration and interceptors (no business logic)
 * YAGNI: Simple setup with token injection and error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/features/auth/constants/auth.constants';
import { getAccessToken } from '@/features/auth/utils/tokenStorage';
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
 * Response interceptor: Handle errors consistently
 */
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Extract error message from backend response
    // Always prefer backend's detail field; otherwise use generic error
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
