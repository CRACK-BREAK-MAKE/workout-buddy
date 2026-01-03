import { useState } from 'react';
import { PageLayout } from '../shared/components/layout';
import { Button } from '../shared/components/ui';
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
  // Mock auth state - will be replaced with real auth later
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName] = useState('John');

  const handleSelectExercise = (exerciseId: string) => {
    console.log('Selected exercise:', exerciseId);
    // TODO: Navigate to workout page
    alert(`Starting ${exerciseId} workout! (Workout page coming soon)`);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleRegister = () => {
    console.log('Register clicked');
    // TODO: Navigate to register page
    alert('Registration page coming soon!');
  };

  return (
    <PageLayout
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogout={handleLogout}
      onRegister={handleRegister}
      userName={userName}
    >
      {isAuthenticated ? (
        /* Authenticated View - Dashboard */
        <div className="space-y-12">
          {/* Welcome Section */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, {userName}! 👋
            </h1>
            <p className="text-xl text-gray-600">Ready to crush your workout today?</p>
          </div>

          {/* Statistics Summary */}
          <StatsSummary stats={MOCK_STATS} />

          {/* Exercise Selector */}
          <ExerciseSelector onSelectExercise={handleSelectExercise} />
        </div>
      ) : (
        /* Guest View - Welcome/Hero */
        <div className="space-y-16">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-8xl mb-6">💪</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Your AI-Powered
              <br />
              <span className="text-indigo-600">Workout Companion</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Count your reps automatically with computer vision.
              <br />
              No wearables. No manual tracking. Just you and your workout.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleRegister}>
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={handleLogin}>
                Try Demo
              </Button>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
              <div className="text-5xl">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900">AI-Powered</h3>
              <p className="text-gray-600">
                MediaPipe pose detection counts your reps with 95%+ accuracy
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-5xl">🔒</div>
              <h3 className="text-2xl font-bold text-gray-900">Privacy First</h3>
              <p className="text-gray-600">
                All processing happens in your browser. Your video never leaves your device.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="text-5xl">📊</div>
              <h3 className="text-2xl font-bold text-gray-900">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your improvements with detailed statistics and personal records
              </p>
            </div>
          </div>

          {/* Exercises Preview */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Supported Exercises</h2>
            <p className="text-gray-600 mb-8">
              Start with push-ups and jump rope. More exercises coming soon!
            </p>
            <div className="flex justify-center gap-8 text-6xl">
              <div className="transform hover:scale-110 transition-transform">💪</div>
              <div className="transform hover:scale-110 transition-transform">🦘</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-indigo-600 rounded-2xl p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-indigo-100">
              Join thousands of users tracking their workouts with AI
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleRegister}
              className="bg-white text-indigo-600 hover:bg-gray-100"
            >
              Create Free Account
            </Button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
