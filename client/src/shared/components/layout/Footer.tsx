export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💪</span>
            <span className="text-gray-600">
              © {new Date().getFullYear()} Workout Buddy. Built with ❤️
            </span>
          </div>

          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Terms
            </a>
            <a
              href="https://github.com/CRACK-BREAK-MAKE/workout-buddy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-600 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
