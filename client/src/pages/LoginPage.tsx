/**
 * LoginPage Component
 *
 * SRP: Only handles login UI (no business logic)
 * Simple page with Google OAuth button
 */

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PageLayout } from '@/shared/components/layout';
import { Card, Button, ErrorAlert } from '@/shared/components/ui';

export const LoginPage = () => {
  const { t } = useTranslation('auth');
  const { loginWithGoogle, isLoading, error, clearError } = useAuth();

  return (
    <PageLayout isAuthenticated={false}>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card padding="lg" className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="text-8xl animate-bounce-slow">💪</div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50">
              {t('auth.login.title')}
            </h1>
            <p className="text-lg text-neutral-700 dark:text-neutral-300">
              {t('auth.login.subtitle')}
            </p>
          </div>

          {/* Error Display */}
          {error && <ErrorAlert message={error} onDismiss={clearError} />}

          {/* Google Login Button */}
          <div className="space-y-4">
            <Button
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50 border-2 border-neutral-300 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-all flex items-center justify-center gap-3 font-semibold text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? t('auth.callback.processing') : t('auth.login.googleButton')}
            </Button>

            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {t('auth.login.termsNotice')}
            </p>
          </div>

          {/* Features */}
          <div className="pt-6 space-y-3 text-left">
            <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <span className="text-2xl">✨</span>
              <span>{t('auth.login.feature1')}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <span className="text-2xl">📊</span>
              <span>{t('auth.login.feature2')}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
              <span className="text-2xl">🔒</span>
              <span>{t('auth.login.feature3')}</span>
            </div>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};
