/**
 * AuthCallbackPage Component
 *
 * SRP: Only handles OAuth callback (extract token, redirect, error handling)
 * Receives user after OAuth redirect from backend
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLayout } from '@/shared/components/layout';
import { Loading, ErrorAlert, Button } from '@/shared/components/ui';

type CallbackState = 'processing' | 'success' | 'error';

/**
 * Map backend error codes to user-friendly messages
 */
const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    oauth_failed: 'OAuth authentication failed. Please try again.',
    invalid_state: 'Invalid authentication state. Please try logging in again.',
    access_denied: 'You denied access. Please grant permissions to continue.',
    server_error: 'Server error occurred. Please try again later.',
  };

  return errorMessages[errorCode] || 'Authentication failed. Please try again.';
};

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  const [state, setState] = useState<CallbackState>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Extract token and error from URL query params
      const token = searchParams.get('token');
      const backendError = searchParams.get('error');

      // Handle error from backend
      if (backendError) {
        setState('error');
        setErrorMessage(getErrorMessage(backendError));
        return;
      }

      // Handle missing token
      if (!token) {
        setState('error');
        setErrorMessage('Authentication token missing. Please try logging in again.');
        return;
      }

      try {
        // Complete authentication
        await handleCallback(token);

        setState('success');

        // Redirect to dashboard after brief success message
        setTimeout(() => {
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
  }, [searchParams, navigate, handleCallback]);

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
                  Completing sign in...
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Please wait while we verify your account
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
                  Sign in successful!
                </h2>
                <p className="text-neutral-700 dark:text-neutral-300">
                  Redirecting to dashboard...
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
                  Sign in failed
                </h2>
              </div>

              <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />

              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} variant="primary" className="w-full">
                  Try Again
                </Button>
                <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                  Return to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
