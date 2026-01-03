import { Button } from '../ui';

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
    <header className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-3xl">💪</span>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
              Workout Buddy
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-neutral-700 dark:text-neutral-300">Welcome, {userName}!</span>
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
