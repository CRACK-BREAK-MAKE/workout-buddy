export const Footer = () => {
  return (
    <footer className="bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              © {new Date().getFullYear()} Workout Buddy. Built with ❤️
            </span>
          </div>

          <div className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/CRACK-BREAK-MAKE/workout-buddy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
