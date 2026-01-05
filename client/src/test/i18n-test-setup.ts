/**
 * i18n Test Setup
 *
 * Initializes i18next for testing environment with all language translations
 * and synchronous operation (no language detection or lazy loading)
 *
 * Import this in test files that use components with useTranslation
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import authEn from '../locales/en/auth.json';
import commonEn from '../locales/en/common.json';
import authEs from '../locales/es/auth.json';
import commonEs from '../locales/es/common.json';
import authHi from '../locales/hi/auth.json';
import commonHi from '../locales/hi/common.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['auth', 'common'],
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
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
