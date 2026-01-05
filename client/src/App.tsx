/**
 * App Component
 *
 * Main application component with routing configuration and session restoration
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { useAuthInitialization } from './features/auth/hooks/useAuthInitialization';
import { LoadingScreen } from './shared/components/LoadingScreen';

function App() {
  // Initialize authentication state from localStorage on app load
  const { isInitializing } = useAuthInitialization();

  // Show loading screen during initialization to prevent flash of wrong content
  if (isInitializing) {
    return <LoadingScreen message="Restoring session..." />;
  }

  // Render routes after initialization completes
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
