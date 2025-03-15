import { useTranslation as useTranslationOriginal } from 'react-i18next';

// Re-export the useTranslation hook with our namespaces
export const useTranslation = (ns: string | string[] = 'common') => {
  return useTranslationOriginal(ns);
};

// Export a hook to change the language
export const useLanguage = () => {
  const { i18n } = useTranslationOriginal();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return {
    currentLanguage: i18n.language,
    changeLanguage,
    languages: ['en', 'ru'],
  };
}; 