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
import { logger } from '@/shared/utils/logger';

/**
 * Save access token to localStorage
 *
 * @param accessToken - JWT access token from backend
 */
export const saveAccessToken = (accessToken: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
};

/**
 * Validate JWT token format (3 parts separated by dots)
 *
 * @param token - Token to validate
 * @returns True if token has valid JWT structure
 */
const isValidJWTFormat = (token: string): boolean => {
  // JWT must have 3 parts: header.payload.signature
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Each part must be non-empty
  return parts.every(part => part.length > 0);
};

/**
 * Get access token from localStorage
 *
 * Validates token format and clears corrupted tokens automatically
 *
 * @returns Access token or null if not found/invalid
 */
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);

  if (!token) {
    return null;
  }

  // Validate JWT format
  if (!isValidJWTFormat(token)) {
    logger.warn('Invalid JWT format in localStorage, clearing token', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 10),
    });
    removeAccessToken();
    return null;
  }

  return token;
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
