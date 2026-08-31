import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import hi from "./locales/hi.json";
import or from "./locales/or.json";

const STORAGE_KEY = "karigar_lang";
const savedLang =
  typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY)
    : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    or: { translation: or },
  },
  lng: savedLang || "en",
  fallbackLng: "en",
  supportedLngs: ["en", "hi", "or"],
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    document.documentElement.lang = lng;
  } catch {
    // ignore
  }
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language;
}

export default i18n;
