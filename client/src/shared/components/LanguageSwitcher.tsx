/**
 * LanguageSwitcher Component
 *
 * SRP: Only handles language switching
 * DRY: Reuses i18n configuration
 *
 * Dropdown component for switching between available languages.
 * Persists language preference to localStorage via i18n configuration.
 *
 * Usage:
 * ```tsx
 * import { LanguageSwitcher } from '@/shared/components/LanguageSwitcher';
 *
 * function Header() {
 *   return (
 *     <nav>
 *       <LanguageSwitcher />
 *     </nav>
 *   );
 * }
 * ```
 */

import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
];

/**
 * Language switcher dropdown component
 *
 * @returns Language switcher UI
 *
 * @example
 * ```tsx
 * // In navigation or header
 * <LanguageSwitcher />
 * ```
 */
export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) ?? LANGUAGES[0];

  return (
    <div className="relative inline-block">
      <select
        value={currentLanguage!.code}
        onChange={e => handleLanguageChange(e.target.value)}
        className="appearance-none bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Select language"
      >
        {LANGUAGES.map(language => (
          <option key={language.code} value={language.code}>
            {language.nativeName}
          </option>
        ))}
      </select>

      {/* Dropdown arrow icon */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};
