import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';

type Language = 'en' | 'zh' | 'zh-CN';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<Language>(
    (i18n.language && (i18n.language === 'en' || i18n.language === 'zh' || i18n.language === 'zh-CN') 
      ? i18n.language 
      : 'en') as Language
  );
  
  // Update state when i18n language changes
  useEffect(() => {
    if (i18n.language) {
      // Special handling for zh-CN which should not be split
      if (i18n.language === 'zh-CN') {
        setCurrentLanguage('zh-CN');
      } else {
        const lang = i18n.language.split('-')[0]; // Handle cases like 'en-US'
        if (lang === 'en' || lang === 'zh') {
          setCurrentLanguage(lang as Language);
        }
      }
    }
  }, [i18n.language]);
  
  const changeLanguage = useCallback((language: Language) => {
    // Force reload translations
    i18n.changeLanguage(language).then(() => {
      setCurrentLanguage(language);
      localStorage.setItem('i18nextLng', language);
      document.documentElement.lang = language;
      
      // Use timeout to ensure the change is processed
      setTimeout(() => {
        // Force refresh UI throughout the app
        window.dispatchEvent(new Event('languageChanged'));
      }, 0);
    });
  }, [i18n]);

  const getLanguageName = useCallback((code: Language) => {
    const languages = {
      en: 'English',
      zh: '繁體中文',
      'zh-CN': '简体中文'
    };
    return languages[code] || languages.en;
  }, []);

  return {
    t,
    currentLanguage,
    changeLanguage,
    getLanguageName,
    isRTL: false, // Add RTL support if needed in the future
  };
};

export default useLanguage; 