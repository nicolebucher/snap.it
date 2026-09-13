"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translations, type Locale } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof translations)["en"];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "snapit-locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    // Reading the persisted/browser-derived locale after mount (not during the initial
    // render) is intentional: it keeps server and first client render both at the "en"
    // default, avoiding a hydration mismatch, then syncs from these external sources.
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      // localStorage unavailable (private mode etc.)
    }
    if (stored === "en" || stored === "de") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(stored);
      return;
    }
    // No stored preference yet (first-ever visit) - default to the browser's language
    // setting instead of always assuming English, so a German-language browser lands on
    // the German UI without the visitor having to switch it manually.
    const browserLocale: Locale = navigator.language?.toLowerCase().startsWith("de") ? "de" : "en";
    setLocaleState(browserLocale);
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore - per-viewer convenience only
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
