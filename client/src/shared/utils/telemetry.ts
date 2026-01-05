/**
 * Telemetry Utility
 *
 * SRP: Only handles event tracking and analytics
 * DRY: Centralized telemetry for consistent tracking across app
 * YAGNI: Simple implementation, ready for future analytics integration
 *
 * This is a placeholder for production analytics (Segment, Mixpanel, PostHog, etc.)
 * Currently logs to console in development, can be connected to analytics service later.
 */

import { logger } from './logger';

/**
 * Telemetry event properties (generic key-value pairs)
 */
interface TelemetryProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Track an analytics event
 *
 * @param eventName - Name of the event (e.g., 'auth.login.success')
 * @param properties - Optional event properties
 *
 * @example
 * ```typescript
 * trackEvent('auth.login.success', {
 *   provider: 'google',
 *   userId: '123',
 *   timestamp: Date.now()
 * });
 * ```
 */
export const trackEvent = (eventName: string, properties?: TelemetryProperties): void => {
  // In development: log to console
  if (import.meta.env.DEV) {
    logger.debug(`[Telemetry] ${eventName}`, properties);
  }

  // In production: send to analytics service
  // TODO: Integrate with Segment/Mixpanel/PostHog when ready
  // Example:
  // if (import.meta.env.PROD) {
  //   analytics.track(eventName, properties);
  // }
};

/**
 * Identify a user for analytics
 *
 * @param userId - Unique user identifier
 * @param traits - Optional user traits (email, name, etc.)
 *
 * @example
 * ```typescript
 * identifyUser('user-123', {
 *   email: 'user@example.com',
 *   name: 'John Doe',
 *   plan: 'free'
 * });
 * ```
 */
export const identifyUser = (userId: string, traits?: TelemetryProperties): void => {
  if (import.meta.env.DEV) {
    logger.debug('[Telemetry] Identify User', { userId, traits });
  }

  // TODO: Integrate with analytics service
  // Example:
  // if (import.meta.env.PROD) {
  //   analytics.identify(userId, traits);
  // }
};

/**
 * Reset user identity (on logout)
 */
export const resetUser = (): void => {
  if (import.meta.env.DEV) {
    logger.debug('[Telemetry] Reset User');
  }

  // TODO: Integrate with analytics service
  // Example:
  // if (import.meta.env.PROD) {
  //   analytics.reset();
  // }
};

/**
 * Track page view
 *
 * @param pageName - Name of the page
 * @param properties - Optional page properties
 */
export const trackPageView = (pageName: string, properties?: TelemetryProperties): void => {
  if (import.meta.env.DEV) {
    logger.debug('[Telemetry] Page View', { pageName, properties });
  }

  // TODO: Integrate with analytics service
  // Example:
  // if (import.meta.env.PROD) {
  //   analytics.page(pageName, properties);
  // }
};

/**
 * Auth-specific telemetry events
 */
export const authTelemetry = {
  /**
   * Track successful login
   */
  loginSuccess: (provider: string, userId?: string) => {
    trackEvent('auth.login.success', {
      provider,
      userId,
      timestamp: Date.now(),
    });
  },

  /**
   * Track login failure
   */
  loginFailure: (provider: string, error: string) => {
    trackEvent('auth.login.failure', {
      provider,
      error,
      timestamp: Date.now(),
    });
  },

  /**
   * Track successful logout
   */
  logoutSuccess: () => {
    trackEvent('auth.logout.success', {
      timestamp: Date.now(),
    });
  },

  /**
   * Track token refresh
   */
  tokenRefresh: (success: boolean, error?: string) => {
    trackEvent('auth.token.refresh', {
      success,
      error,
      timestamp: Date.now(),
    });
  },

  /**
   * Track token expiration
   */
  tokenExpired: () => {
    trackEvent('auth.token.expired', {
      timestamp: Date.now(),
    });
  },
};

/**
 * Workout-specific telemetry events (for future use)
 */
export const workoutTelemetry = {
  /**
   * Track workout started
   */
  workoutStarted: (exerciseType: string) => {
    trackEvent('workout.started', {
      exerciseType,
      timestamp: Date.now(),
    });
  },

  /**
   * Track workout completed
   */
  workoutCompleted: (exerciseType: string, reps: number, duration: number) => {
    trackEvent('workout.completed', {
      exerciseType,
      reps,
      duration,
      timestamp: Date.now(),
    });
  },

  /**
   * Track exercise rep counted
   */
  repCounted: (exerciseType: string, currentCount: number) => {
    trackEvent('workout.rep_counted', {
      exerciseType,
      currentCount,
      timestamp: Date.now(),
    });
  },
};
