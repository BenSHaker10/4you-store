import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import en from "@/i18n/en";
import ar from "@/i18n/ar";
import type { Translations } from "@/i18n/en";

type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isRTL: boolean;
}

const translations: Record<Language, Translations> = { en, ar };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("4you-lang");
      if (saved === "ar" || saved === "en") return saved;
    }
    return "ar"; // Default to Arabic
  });

  const isRTL = lang === "ar";
  const t = translations[lang];

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("4you-lang", newLang);
  };

  const toggleLang = () => {
    setLang(lang === "ar" ? "en" : "ar");
  };

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
    if (isRTL) {
      document.body.style.fontFamily = "'Tajawal', 'Noto Sans Arabic', sans-serif";
    } else {
      document.body.style.fontFamily = "'DM Sans', sans-serif";
    }
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
