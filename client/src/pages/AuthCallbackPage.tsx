/**
 * AuthCallbackPage Component
 *
 * SRP: Only handles OAuth callback (extract token, redirect, error handling)
 * Receives user after OAuth redirect from backend
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLayout } from '@/shared/components/layout';
import { Loading, ErrorAlert, Button } from '@/shared/components/ui';

type CallbackState = 'processing' | 'success' | 'error';

/**
 * Map backend error codes to user-friendly messages
 */
const getErrorMessage = (t: (key: string) => string, errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    oauth_failed: t('auth.callback.errors.oauthFailed'),
    invalid_state: t('auth.callback.errors.invalidState'),
    access_denied: t('auth.callback.errors.accessDenied'),
    server_error: t('auth.callback.errors.serverError'),
  };

  return errorMessages[errorCode] || t('auth.callback.error');
};

export const AuthCallbackPage = () => {
  const { t } = useTranslation('auth');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Prevent duplicate processing with ref
  const hasProcessedRef = useRef(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Prevent duplicate processing (StrictMode, hot reload, etc.)
    if (hasProcessedRef.current) {
      return;
    }
    hasProcessedRef.current = true;

    const processCallback = async () => {
      // Extract token and error from URL query params
      const token = searchParams.get('token');
      const backendError = searchParams.get('error');

      // Handle error from backend
      if (backendError) {
        setState('error');
        setErrorMessage(getErrorMessage(t, backendError));
        return;
      }

      // Handle missing token
      if (!token) {
        setState('error');
        setErrorMessage(t('auth.callback.errors.tokenMissing'));
        return;
      }

      try {
        // Complete authentication
        await handleCallback(token);

        setState('success');

        // Redirect to dashboard after brief success message
        redirectTimeoutRef.current = setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      } catch (err) {
        // Handle authentication failure
        setState('error');
        const message = err instanceof Error ? err.message : 'Authentication failed';
        setErrorMessage(message);
      }
    };

    processCallback();

    // Cleanup: clear timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [searchParams, navigate, handleCallback, t]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  return (
    <PageLayout isAuthenticated={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full space-y-6">
          {/* Processing State */}
          {state === 'processing' && (
            <div className="text-center space-y-6">
              <Loading />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  {t('auth.callback.completing')}
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {t('auth.callback.pleaseWait')}
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center space-y-6">
              <div className="text-6xl">✓</div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {t('auth.callback.success')}
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300">
                  {t('auth.callback.redirecting')}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">✕</div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                  {t('auth.callback.failed')}
                </h2>
              </div>

              <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} variant="primary" className="w-full">
                  {t('auth.callback.tryAgain')}
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  {t('auth.callback.returnHome')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
