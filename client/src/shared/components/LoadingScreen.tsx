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
 * import { useTranslation } from 'react-i18next';
 *
 * const { t } = useTranslation('common');
 * <LoadingScreen message={t('common.loading')} />
 * ```
 */

import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  /**
   * Optional message to display below the spinner
   * If not provided, uses default translation from common.loading
   */
  message?: string;
}

/**
 * Full-screen loading component with spinner and message
 *
 * @param {LoadingScreenProps} props - Component props
 * @returns Full-screen loading UI
 *
 * @example
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * import { AUTH_MESSAGES } from '@/features/auth/constants/auth.constants';
 *
 * // Default message (uses translation)
 * <LoadingScreen />
 *
 * // Custom translated message
 * const { t } = useTranslation('auth');
 * <LoadingScreen message={t(AUTH_MESSAGES.SESSION_RESTORING)} />
 * ```
 */
export const LoadingScreen = ({ message }: LoadingScreenProps) => {
  const { t } = useTranslation('common');
  const displayMessage = message || t('common.loading');

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
    >
      <div className="text-center space-y-4">
        {/* Spinning loader */}
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"
          aria-hidden="true"
        />

        {/* Loading message */}
        <p className="text-gray-600 dark:text-gray-400 font-medium">{displayMessage}</p>
      </div>
    </div>
  );
};
