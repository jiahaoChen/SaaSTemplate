import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

type Language = 'en' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: any) => string;
}

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguageContext = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguageState] = useState<Language>(
    (localStorage.getItem('i18nextLng') as Language) || defaultLanguage
  );

  const setLanguage = useCallback((lang: Language) => {
    // Force reload translations to make sure all components update
    i18n.changeLanguage(lang).then(() => {
      setLanguageState(lang);
      localStorage.setItem('i18nextLng', lang);
      document.documentElement.lang = lang;
      
      // Force UI refresh by triggering an event
      window.dispatchEvent(new Event('languageChanged'));
    });
  }, [i18n]);

  // Set initial language from localStorage or browser preference
  useEffect(() => {
    const storedLang = localStorage.getItem('i18nextLng') as Language;
    if (storedLang && (storedLang === 'en' || storedLang === 'zh')) {
      setLanguage(storedLang);
    } else {
      const browserLang = navigator.language;
      if (browserLang.startsWith('zh')) {
        setLanguage('zh');
      } else {
        setLanguage('en');
      }
    }
  }, [setLanguage]);

  // Listen for language changes from i18next
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      if (lng === 'en' || lng === 'zh') {
        setLanguageState(lng as Language);
        document.documentElement.lang = lng;
      }
    };

    i18n.on('languageChanged', handleLanguageChanged);

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Create a context value with the latest translations
  const contextValue = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}; 