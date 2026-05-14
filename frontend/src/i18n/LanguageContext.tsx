import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { TRANSLATIONS, type Lang, type TKey } from "./translations";

type Ctx = {
  lang: Lang;
  dir: "rtl" | "ltr";
  t: (key: TKey | string, fallback?: string) => string;
  setLang: (l: Lang) => void;
  toggle: () => void;
};

const LanguageContext = createContext<Ctx>({} as Ctx);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = (localStorage.getItem("lang") as Lang | null) || null;
    return stored || "ar";
  });

  const dir: "rtl" | "ltr" = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("lang", lang);
  }, [lang, dir]);

  function setLang(l: Lang) { setLangState(l); }
  function toggle() { setLangState((cur) => (cur === "ar" ? "en" : "ar")); }

  const t = useMemo(
    () => (key: TKey | string, fallback?: string) => {
      const entry = (TRANSLATIONS as any)[key];
      if (entry) return entry[lang] || entry.ar || key;
      return fallback ?? key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, dir, t, setLang, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
export const useT = () => useContext(LanguageContext).t;
