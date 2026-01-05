/**
 * ErrorAlert Component
 *
 * SRP: Only displays error messages with dismiss action
 * YAGNI: Simple error alert without unnecessary features
 *
 * Usage:
 * ```tsx
 * <ErrorAlert message={error} onDismiss={() => setError(null)} />
 * ```
 */

interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export const ErrorAlert = ({ message, onDismiss }: ErrorAlertProps) => {
  // Don't render if no message
  if (!message || message.trim() === '') {
    return null;
  }

  return (
    <div
      role="alert"
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
    >
      {/* Error Icon */}
      <svg
        className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>

      {/* Error Message */}
      <div className="flex-1">
        <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors"
        aria-label="Dismiss error"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};
