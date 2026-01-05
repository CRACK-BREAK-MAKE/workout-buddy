import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';

export const Footer = () => {
  const { t } = useTranslation('common');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/60 backdrop-blur-2xl border-t border-white/40 dark:bg-white/5 dark:border-white/10 mt-auto relative z-10">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/workout.svg" alt="Workout Buddy" className="h-6 w-6" />
            <span className="text-neutral-600 dark:text-neutral-400">
              {t('common.footer.copyright', { year: currentYear })}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <div className="flex gap-6 text-sm text-neutral-600 dark:text-neutral-400">
              <a
                href="#"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t('common.footer.about')}
              </a>
              <a
                href="#"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t('common.footer.privacy')}
              </a>
              <a
                href="#"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t('common.footer.terms')}
              </a>
              <a
                href="https://github.com/CRACK-BREAK-MAKE/workout-buddy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                {t('common.footer.github')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
