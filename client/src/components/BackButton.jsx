import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BackButton({
  fallback = "/",
  className = "",
  label,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleBack() {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallback);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 text-base font-semibold px-5 py-2.5 rounded-2xl border border-[#3E5641] text-[#3E5641] hover:bg-[#3E5641] hover:text-[#FAF3E9] transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {label || t("nav.back")}
    </button>
  );
}
