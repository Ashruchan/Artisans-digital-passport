import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", labelKey: "language.en" },
  { code: "hi", labelKey: "language.hi" },
  { code: "or", labelKey: "language.or" },
];

export default function LanguageSwitcher({ className = "" }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  function selectLanguage(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 text-base font-semibold px-4 py-2.5 rounded-2xl border border-[#2F4A32]/30 text-[#2F4A32] bg-white/70 hover:bg-white transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="language-menu"
      >
        <Globe className="w-4 h-4 shrink-0" />
        <span className="whitespace-nowrap">{t("language.button")}</span>
      </button>

      {open ? (
        <div
          id="language-menu"
          role="listbox"
          aria-label={t("language.title")}
          className="absolute top-full right-0 z-50 mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-[#FAF3E9] border border-[#2B2420]/15 shadow-lg p-2"
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#2B2420]/60">
            {t("language.title")}
          </p>
          <div className="space-y-1">
            {LANGUAGES.map(({ code, labelKey }) => {
              const active =
                i18n.language === code ||
                i18n.language?.startsWith(`${code}-`);
              return (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => selectLanguage(code)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-3 rounded-xl text-base font-semibold transition-colors ${
                    active
                      ? "bg-[#2F4A32] text-[#FAF3E9]"
                      : "text-[#2B2420] hover:bg-[#2F4A32]/10"
                  }`}
                >
                  <span className="truncate">{t(labelKey)}</span>
                  {active ? <Check className="w-4 h-4 shrink-0" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
