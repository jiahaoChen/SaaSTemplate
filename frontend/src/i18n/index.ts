import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations (we'll create these files next)
import enTranslation from './locales/en/translation.json';
import zhTranslation from './locales/zh/translation.json';
import zhCNTranslation from './locales/zh-CN/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  zh: {
    translation: zhTranslation
  },
  'zh-CN': {
    translation: zhCNTranslation
  }
};

i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Detect user language
  .use(LanguageDetector)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false, // Not needed for React as it escapes by default
    },

    // Detection options
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    // Ensure language changes are applied immediately
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed'
    },
    
    // Ensure changes are immediately available
    load: 'currentOnly'
  });

// Listen for language changes and notify components
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.setAttribute('data-lang', lng);
  
  // Dispatch event to notify components about language change
  window.dispatchEvent(new Event('languageChanged'));
});

export default i18n; 