/**
 * LoadingScreen Component
 *
 * SRP: Only displays a full-screen loading indicator
 * YAGNI: Simple implementation without unnecessary features
 *
 * Full-screen loading component shown during app initialization or other
 * async operations that require blocking the UI.
 *
 * Usage:
 * ```tsx
 * <LoadingScreen message="Loading your workout data..." />
 * ```
 */

interface LoadingScreenProps {
  /**
   * Optional message to display below the spinner
   * @default "Loading..."
   */
  message?: string;
}

/**
 * Full-screen loading component with spinner and message
 *
 * @param {LoadingScreenProps} props - Component props
 * @returns {JSX.Element} Full-screen loading UI
 *
 * @example
 * ```tsx
 * // Default message
 * <LoadingScreen />
 *
 * // Custom message with constant
 * import { AUTH_MESSAGES } from '@/features/auth/constants/auth.constants';
 * <LoadingScreen message={AUTH_MESSAGES.SESSION_RESTORING} />
 * ```
 */
export const LoadingScreen = ({ message = 'Loading...' }: LoadingScreenProps): JSX.Element => {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="text-center space-y-4">
        {/* Spinning loader */}
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"
          aria-hidden="true"
        />

        {/* Loading message */}
        <p className="text-gray-600 dark:text-gray-400 font-medium">{message}</p>
      </div>
    </div>
  );
};
