/**
 * Token Storage Utility
 *
 * SRP: Single responsibility - ONLY handles localStorage access token operations
 * DRY: Centralized token storage logic
 * YAGNI: Only implements what's needed (no complex JWT parsing, expiry checks, etc.)
 *
 * NOTE: Refresh token is stored in httpOnly cookie by backend (not accessible to JS)
 */

import { TOKEN_STORAGE_KEYS } from '../constants/auth.constants';

/**
 * Save access token to localStorage
 *
 * @param accessToken - JWT access token from backend
 */
export const saveAccessToken = (accessToken: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
};

/**
 * Get access token from localStorage
 *
 * @returns Access token or null if not found
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Remove access token from localStorage (logout)
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Check if a valid access token exists in localStorage
 *
 * @returns True if access token exists and is not empty
 */
export const hasValidAccessToken = (): boolean => {
  const token = getAccessToken();
  return token !== null && token.trim() !== '';
};
