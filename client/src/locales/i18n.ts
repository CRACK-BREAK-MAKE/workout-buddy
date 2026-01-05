/**
 * i18n Configuration
 *
 * Configures internationalization support for the application using i18next and react-i18next.
 *
 * Features:
 * - English (en), Spanish (es), and Hindi (hi) translations
 * - Browser language detection fallback
 * - localStorage persistence of language preference
 * - Namespaces: auth, common
 * - Automatic translation loading
 *
 * Usage:
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 *
 * const { t } = useTranslation('auth');
 * const message = t('auth.loading.sessionRestoring');
 * ```
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import authEn from './en/auth.json';
import commonEn from './en/common.json';
import authEs from './es/auth.json';
import commonEs from './es/common.json';
import authHi from './hi/auth.json';
import commonHi from './hi/common.json';

// Get browser language or default to 'en'
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0] ?? 'en';
  return ['en', 'es', 'hi'].includes(browserLang) ? browserLang : 'en';
};

// Get stored language preference or fallback to browser/default
const getStoredLanguage = (): string => {
  const stored = localStorage.getItem('workout_buddy_language');
  return stored ?? getBrowserLanguage();
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      auth: authEn,
      common: commonEn,
    },
    es: {
      auth: authEs,
      common: commonEs,
    },
    hi: {
      auth: authHi,
      common: commonHi,
    },
  },
  lng: getStoredLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['auth', 'common'],

  interpolation: {
    escapeValue: false, // React already escapes values
  },

  // Store language preference in localStorage
  react: {
    useSuspense: false, // Disable suspense for now to simplify testing
  },
});

// Save language to localStorage whenever it changes
i18n.on('languageChanged', lng => {
  localStorage.setItem('workout_buddy_language', lng);
});

export default i18n;
