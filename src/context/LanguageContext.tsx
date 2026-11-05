import React, { createContext, useContext, useState, useEffect } from 'react';
import enCatalog from '../../locales/en.json';
import filCatalog from '../../locales/fil.json';
import hilCatalog from '../../locales/hil.json';

export type Language = 'en' | 'fil' | 'hil';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const catalogs: Record<Language, any> = {
  en: enCatalog,
  fil: filCatalog,
  hil: hilCatalog,
};

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('enterseed_language');
    if (saved === 'en' || saved === 'fil' || saved === 'hil') return saved;
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('enterseed_language', lang);
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    // Check in current language catalog under messages
    let val = getNestedValue(catalogs[language]?.messages, path);
    // Fallback to English catalog
    if (!val && language !== 'en') {
      val = getNestedValue(catalogs.en?.messages, path);
    }
    // Check root legacy or direct path if not found under messages
    if (!val) {
      val = getNestedValue(catalogs[language], path);
    }
    if (!val && language !== 'en') {
      val = getNestedValue(catalogs.en, path);
    }

    if (!val) {
      // Return last part of path capitalized or the path itself
      const parts = path.split('.');
      return parts[parts.length - 1];
    }

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        val = (val as string).replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
