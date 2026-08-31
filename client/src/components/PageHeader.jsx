import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BackButton from "./BackButton";
import LanguageSwitcher from "./LanguageSwitcher";

export default function PageHeader({
  fallback = "/",
  showBrand = true,
  className = "",
}) {
  const { t } = useTranslation();

  return (
    <nav
      className={`flex items-center justify-between gap-3 px-5 sm:px-8 py-4 ${className}`}
    >
      {showBrand ? (
        <Link
          to="/"
          className="text-2xl font-bold text-[#2F4A32] font-display shrink-0"
        >
          {t("common.karigar")}
        </Link>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <BackButton fallback={fallback} />
      </div>
    </nav>
  );
}
