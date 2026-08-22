import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { t as dict, tr } from "../i18n/translations";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("sq_lang") || "ru");

  const changeLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem("sq_lang", code);
  }, []);

  const t = useCallback((key) => tr(dict[key], lang), [lang]);
  // for data objects shaped like { ru, kz, en }
  const l = useCallback((obj) => tr(obj, lang), [lang]);

  const value = useMemo(() => ({ lang, setLang: changeLang, t, l }), [lang, changeLang, t, l]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}
