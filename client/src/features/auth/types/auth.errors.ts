/**
 * Auth Error Types
 *
 * SRP: Only defines auth-related error types
 * DRY: Centralized error types for consistent error handling
 * YAGNI: Only includes errors needed for auth flows
 */

/**
 * Base auth error class
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Token has expired
 */
export class TokenExpiredError extends AuthError {
  constructor() {
    super('Token expired', 'TOKEN_EXPIRED', 401);
    this.name = 'TokenExpiredError';
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

/**
 * Token is invalid or malformed
 */
export class InvalidTokenError extends AuthError {
  constructor(message = 'Invalid token format') {
    super(message, 'INVALID_TOKEN', 401);
    this.name = 'InvalidTokenError';
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}

/**
 * Token refresh failed
 */
export class TokenRefreshError extends AuthError {
  constructor(message = 'Failed to refresh token') {
    super(message, 'TOKEN_REFRESH_FAILED', 401);
    this.name = 'TokenRefreshError';
    Object.setPrototypeOf(this, TokenRefreshError.prototype);
  }
}

/**
 * Token refresh timeout
 */
export class TokenRefreshTimeoutError extends AuthError {
  constructor() {
    super('Token refresh timed out', 'TOKEN_REFRESH_TIMEOUT', 408);
    this.name = 'TokenRefreshTimeoutError';
    Object.setPrototypeOf(this, TokenRefreshTimeoutError.prototype);
  }
}

/**
 * Network error during auth operation
 */
export class AuthNetworkError extends AuthError {
  constructor(message = 'Network error during authentication') {
    super(message, 'AUTH_NETWORK_ERROR', 503);
    this.name = 'AuthNetworkError';
    Object.setPrototypeOf(this, AuthNetworkError.prototype);
  }
}

/**
 * Unauthorized access
 */
export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
