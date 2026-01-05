/**
 * Logger Utility
 *
 * SRP: Only handles logging (structured, environment-aware)
 * DRY: Single logging interface throughout app
 * YAGNI: Simple implementation without unnecessary features
 *
 * Usage:
 * ```ts
 * import { logger } from '@/shared/utils/logger';
 *
 * logger.info('User logged in', { userId: '123' });
 * logger.error('API call failed', { error, endpoint: '/api/users' });
 * logger.warn('Deprecated API used');
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Structured logger with environment-aware behavior
 */
class Logger {
  private isDevelopment =
    ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV as boolean | undefined) ??
    true;

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log informational message
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    } else {
      // In production, you could send to a logging service like Sentry
      this.sendToLoggingService('info', message, context);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');

    if (!this.isDevelopment) {
      this.sendToLoggingService('warn', message, context);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : error;

    console.error(`[ERROR] ${message}`, errorDetails, context || '');

    if (!this.isDevelopment) {
      this.sendToLoggingService('error', message, { error: errorDetails, ...context });
    }
  }

  /**
   * Send logs to external service (placeholder for future implementation)
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private sendToLoggingService(_level: LogLevel, _message: string, _context?: LogContext): void {
    // TODO: Implement Sentry or similar logging service integration
    // For now, this is a no-op in production
    // Example:
    // Sentry.captureMessage(_message, { level: _level, extra: _context });
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
