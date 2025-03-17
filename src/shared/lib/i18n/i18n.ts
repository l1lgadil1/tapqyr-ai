import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Create i18next instance
const i18n = i18next;

// Configure i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    defaultNS: 'common',
    ns: ['common', 'todo', 'landing', 'onboarding'],
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    initImmediate: false,
  })
  .catch((err) => console.error('Error initializing i18n:', err));

// Load all namespaces for all languages
i18n.loadNamespaces(['common', 'todo', 'landing', 'onboarding']).catch(console.error);

export { i18n }; 