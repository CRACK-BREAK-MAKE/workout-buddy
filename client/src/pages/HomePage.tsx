import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getDisplayName } from '@/features/auth/utils/userHelpers';
import { PageLayout } from '../shared/components/layout';
import { Card, Loading, ErrorAlert } from '../shared/components/ui';
import { ExerciseSelector } from '../features/exercises/components/ExerciseSelector';
import { StatsSummary } from '../features/statistics/components/StatsSummary';

// Mock data for demonstration
const MOCK_STATS = {
  total_workouts: 42,
  total_reps: 1250,
  total_duration_seconds: 3600,
  total_calories_burned: 450.5,
  average_reps_per_workout: 30,
  personal_records: {
    'push-up': 50,
    'jump-rope': 200,
  },
  workout_count_by_type: {
    'push-up': 25,
    'jump-rope': 17,
  },
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, logout, clearError } = useAuth();

  const handleSelectExercise = (exerciseId: string) => {
    // TODO: Navigate to workout page when implemented
    alert(`Starting ${exerciseId} workout! (Workout page coming soon)`);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    logout();
  };

  const handleRegister = () => {
    navigate('/login');
  };

  return (
    <PageLayout
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onRegister={handleRegister}
      userName={getDisplayName(user)}
    >
      {/* Loading State */}
      {isLoading && isAuthenticated && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loading />
            <p className="text-neutral-700 dark:text-neutral-300">Loading your dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="max-w-2xl mx-auto mb-8">
          <ErrorAlert message={error} onDismiss={clearError} />
        </div>
      )}

      {/* Authenticated View */}
      {!isLoading && isAuthenticated ? (
        /* Authenticated View - Dashboard */
        <div className="space-y-12 animate-fade-in">
          {/* Welcome Section with Gradient */}
          <Card
            padding="lg"
            className="text-center bg-gradient-to-br from-primary-50 via-white to-primary-50/50 dark:from-primary-950/30 dark:via-transparent dark:to-transparent border-2 border-primary-200 dark:border-primary-800/30"
          >
            <div className="space-y-4">
              <div className="text-6xl mb-2 animate-bounce-slow">👋</div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 dark:from-primary-400 dark:via-primary-300 dark:to-primary-400 bg-clip-text text-transparent">
                Welcome back, {getDisplayName(user)}!
              </h1>
              <p className="text-xl text-neutral-700 dark:text-neutral-300 font-medium">
                Ready to crush your workout today?
              </p>
            </div>
          </Card>

          {/* Statistics Summary */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
                Your Progress
              </h2>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-white/10 px-4 py-2 rounded-full">
                Last 30 days
              </span>
            </div>
            <StatsSummary stats={MOCK_STATS} />
          </div>

          {/* Exercise Selector */}
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-2">
                Start Your Workout
              </h2>
              <p className="text-neutral-700 dark:text-neutral-300 text-lg">
                Choose an exercise and let AI count your reps
              </p>
            </div>
            <ExerciseSelector onSelectExercise={handleSelectExercise} />
          </div>
        </div>
      ) : (
        /* Guest View - Welcome/Hero */
        <div className="space-y-20 animate-fade-in">
          {/* Hero Section */}
          <div className="text-center max-w-5xl mx-auto">
            <div className="relative inline-block mb-8">
              <div className="text-8xl md:text-9xl animate-float">💪</div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-2 bg-primary-300 dark:bg-primary-500/30 rounded-full blur-xl"></div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-neutral-900 dark:text-neutral-50 mb-6 leading-tight">
              Your AI-Powered
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:via-primary-500 dark:to-primary-600 bg-clip-text text-transparent">
                Workout Companion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-neutral-700 dark:text-neutral-300 mb-10 leading-relaxed max-w-3xl mx-auto font-medium">
              Count your reps automatically with{' '}
              <span className="font-bold text-primary-700 dark:text-primary-400">
                computer vision
              </span>
              .
              <br />
              No wearables. No manual tracking. Just you and your workout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleRegister}
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-lg rounded-xl hover:from-primary-600 hover:to-primary-700 hover:scale-105 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
              <button
                onClick={handleLogin}
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-primary-600 dark:bg-white/10 dark:text-primary-400 font-bold text-lg rounded-xl border-2 border-primary-200 dark:border-primary-500/30 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-white dark:hover:bg-white/20 transition-all shadow-md"
              >
                Try Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-neutral-200 dark:border-white/10">
                <span className="text-2xl">⭐</span>
                <span>95%+ Accuracy</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-neutral-200 dark:border-white/10">
                <span className="text-2xl">🔒</span>
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-2 rounded-full border border-neutral-200 dark:border-white/10">
                <span className="text-2xl">⚡</span>
                <span>Real-time</span>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
                Why Choose Workout Buddy?
              </h2>
              <p className="text-xl font-medium text-neutral-700 dark:text-neutral-300">
                Cutting-edge technology meets simplicity
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card
                hover
                padding="lg"
                className="text-center space-y-4 group hover:scale-105 transition-transform"
              >
                <div className="relative inline-block">
                  <div className="text-6xl group-hover:scale-110 transition-transform">🤖</div>
                  <div className="absolute inset-0 bg-primary-200 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  AI-Powered
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  MediaPipe pose detection counts your reps with{' '}
                  <span className="font-bold text-primary-700 dark:text-primary-400">
                    95%+ accuracy
                  </span>
                </p>
                <div className="pt-4">
                  <span className="inline-block px-4 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                    Real-time tracking
                  </span>
                </div>
              </Card>

              <Card
                hover
                padding="lg"
                className="text-center space-y-4 group hover:scale-105 transition-transform"
              >
                <div className="relative inline-block">
                  <div className="text-6xl group-hover:scale-110 transition-transform">🔒</div>
                  <div className="absolute inset-0 bg-green-200 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Privacy First
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  All processing happens in your browser.{' '}
                  <span className="font-bold text-green-700 dark:text-green-400">
                    Your video never leaves
                  </span>{' '}
                  your device.
                </p>
                <div className="pt-4">
                  <span className="inline-block px-4 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                    100% Secure
                  </span>
                </div>
              </Card>

              <Card
                hover
                padding="lg"
                className="text-center space-y-4 group hover:scale-105 transition-transform"
              >
                <div className="relative inline-block">
                  <div className="text-6xl group-hover:scale-110 transition-transform">📊</div>
                  <div className="absolute inset-0 bg-blue-200 blur-2xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
                  Track Progress
                </h3>
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  Monitor your improvements with{' '}
                  <span className="font-bold text-blue-700 dark:text-blue-400">
                    detailed statistics
                  </span>{' '}
                  and personal records
                </p>
                <div className="pt-4">
                  <span className="inline-block px-4 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                    Analytics dashboard
                  </span>
                </div>
              </Card>
            </div>
          </div>

          {/* Exercises Preview */}
          <Card padding="lg" className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50 mb-4">
              Supported Exercises
            </h2>
            <p className="text-neutral-700 dark:text-neutral-300 mb-8 text-lg">
              Start with push-ups and jump rope. More exercises coming soon!
            </p>
            <div className="flex justify-center gap-12">
              <div className="group cursor-pointer">
                <div className="text-7xl mb-2 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                  💪
                </div>
                <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Push-ups
                </p>
              </div>
              <div className="group cursor-pointer">
                <div className="text-7xl mb-2 transform group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">
                  🦘
                </div>
                <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  Jump Rope
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-white/5 py-2 px-4 rounded-full inline-block">
              🚀 More exercises coming soon!
            </p>
          </Card>

          {/* CTA Section */}
          <Card
            padding="lg"
            className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-center text-white relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="text-5xl mb-6">🚀</div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-white">
                Ready to Get Started?
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-primary-50 max-w-2xl mx-auto">
                Join thousands of users tracking their workouts with AI
              </p>
              <button
                onClick={handleRegister}
                className="group px-10 py-5 bg-white text-primary-600 font-bold text-xl rounded-xl hover:bg-neutral-50 hover:scale-105 transition-all shadow-2xl"
              >
                Create Free Account
                <span className="inline-block ml-2 group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </button>
              <p className="mt-6 text-sm text-primary-100">
                ✨ No credit card required • Start in 30 seconds
              </p>
            </div>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};
