/**
 * Token Validation Utility
 *
 * SRP: Only handles JWT token validation and expiration checks
 * DRY: Centralized token validation logic
 * YAGNI: Simple implementation without unnecessary complexity
 */

import { TOKEN_EXPIRATION } from '../constants/auth.constants';
import { logger } from '@/shared/utils/logger';

/**
 * Clock skew tolerance in seconds
 *
 * Added to current time when checking token expiration to account for:
 * - Time differences between client and server
 * - Network latency
 * - Slight timing variations in token validation
 */
const TOKEN_EXPIRY_BUFFER_SECONDS = 10;

/**
 * Decoded JWT payload (partial - only fields we need)
 */
interface JWTPayload {
  exp?: number; // Expiration time (seconds since epoch)
  iat?: number; // Issued at (seconds since epoch)
  sub?: string; // Subject (user ID)
}

/**
 * Decode JWT token without verification (client-side only)
 *
 * Note: This is NOT for security - only for reading expiration time.
 * Token verification happens on the backend.
 *
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode Base64URL payload
    const payload = parts[1];
    if (!payload) {
      return null;
    }

    // Base64URL decode
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    logger.debug('Failed to decode JWT token', { error });
    return null;
  }
};

/**
 * Check if token is expired
 *
 * @param token - JWT token string
 * @returns True if token is expired or invalid
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
    return true;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Check if token is expired (with buffer for clock skew)
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + TOKEN_EXPIRY_BUFFER_SECONDS;
};

/**
 * Check if token should be refreshed
 *
 * Refresh if token expires within threshold (default: 5 minutes)
 *
 * @param token - JWT token string
 * @returns True if token should be refreshed
 */
export const shouldRefreshToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return false;
  }

  // Check if token expires soon
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;

  return timeUntilExpiry <= TOKEN_EXPIRATION.REFRESH_THRESHOLD;
};

/**
 * Get time until token expiration
 *
 * @param token - JWT token string
 * @returns Seconds until expiration, or 0 if expired/invalid
 */
export const getTokenExpiresIn = (token: string | null): number => {
  if (!token) {
    return 0;
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;

  return Math.max(0, timeUntilExpiry);
};

/**
 * Validate access token
 *
 * Returns validation result with detailed information
 *
 * @param token - JWT token string
 * @returns Validation result
 */
export const validateAccessToken = (
  token: string | null
): {
  isValid: boolean;
  isExpired: boolean;
  shouldRefresh: boolean;
  expiresIn: number;
} => {
  if (!token) {
    return {
      isValid: false,
      isExpired: true,
      shouldRefresh: false,
      expiresIn: 0,
    };
  }

  const expired = isTokenExpired(token);
  const shouldRefresh = shouldRefreshToken(token);
  const expiresIn = getTokenExpiresIn(token);

  return {
    isValid: !expired,
    isExpired: expired,
    shouldRefresh,
    expiresIn,
  };
};
