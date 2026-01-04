import { Button } from '../ui';
import { ThemeToggle } from '../ui/ThemeToggle';

export interface HeaderProps {
  isAuthenticated?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  onRegister?: () => void;
  userName?: string;
}

export const Header = ({
  isAuthenticated = false,
  onLogin,
  onLogout,
  onRegister,
  userName,
}: HeaderProps) => {
  return (
    <header className="bg-white/60 backdrop-blur-2xl shadow-sm border-b border-white/40 dark:bg-white/5 dark:border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/workout.svg" alt="Workout Buddy Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Workout Buddy
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <span className="text-neutral-600 dark:text-neutral-400">Welcome, {userName}!</span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onLogin}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={onRegister}>
                  Get Started
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
