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
import homeEn from '../locales/en/home.json';
import exercisesEn from '../locales/en/exercises.json';
import statisticsEn from '../locales/en/statistics.json';
import authEs from '../locales/es/auth.json';
import commonEs from '../locales/es/common.json';
import homeEs from '../locales/es/home.json';
import exercisesEs from '../locales/es/exercises.json';
import statisticsEs from '../locales/es/statistics.json';
import authHi from '../locales/hi/auth.json';
import commonHi from '../locales/hi/common.json';
import homeHi from '../locales/hi/home.json';
import exercisesHi from '../locales/hi/exercises.json';
import statisticsHi from '../locales/hi/statistics.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['auth', 'common', 'home', 'exercises', 'statistics'],
  resources: {
    en: {
      auth: authEn,
      common: commonEn,
      home: homeEn,
      exercises: exercisesEn,
      statistics: statisticsEn,
    },
    es: {
      auth: authEs,
      common: commonEs,
      home: homeEs,
      exercises: exercisesEs,
      statistics: statisticsEs,
    },
    hi: {
      auth: authHi,
      common: commonHi,
      home: homeHi,
      exercises: exercisesHi,
      statistics: statisticsHi,
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
