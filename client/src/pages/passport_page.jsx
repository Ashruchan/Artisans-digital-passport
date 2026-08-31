import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  MapPin,
  Package,
  Sparkles,
  User,
} from "lucide-react";
import { getPublicPassport, reportPublicPassport } from "../api/client";
import QrCodeImage from "../components/QrCodeImage";
import PageHeader from "../components/PageHeader";
import {
  passportPublicUrl,
  statusColors,
  statusLabel,
} from "../utils/artisanAuth";

/** Public buyer view — linked from QR codes. */
export default function PassportPage() {
  const { passportId } = useParams();
  const { t } = useTranslation();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  useEffect(() => {
    if (!passportId) return;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPublicPassport(passportId);
        setPassport(data);
      } catch (err) {
        setError(err?.message || t("passport.notFound"));
      } finally {
        setLoading(false);
      }
    })();
  }, [passportId, t]);

  async function handleReport() {
    if (!passportId || reporting) return;

    setReporting(true);
    setReportMessage("");
    try {
      const res = await reportPublicPassport(passportId);
      setPassport(res?.passport || passport);
      setReportMessage(
        res?.alreadyReported
          ? t("passport.reportAlready")
          : t("passport.reportSuccess")
      );
    } catch (err) {
      setReportMessage(err?.message || t("common.error"));
    } finally {
      setReporting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF3E9] flex items-center justify-center text-[#3E5641] text-xl font-semibold">
        {t("passport.loading")}
      </div>
    );
  }

  if (error || !passport) {
    return (
      <div className="min-h-screen bg-[#FAF3E9]">
        <PageHeader fallback="/" />
        <div className="px-6 py-16 text-center">
          <p className="text-2xl font-bold text-[#A83E3E] mb-4">
            {error || t("passport.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const colors = statusColors(passport.status);
  const url = passportPublicUrl(passport.passportId || passport.id);

  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">
      <PageHeader fallback="/" />

      <div className="max-w-xl mx-auto px-6 pb-16 space-y-6">
        <div className="rounded-3xl overflow-hidden border border-[#2B2420]/10 bg-[#FAF3E9] shadow-sm">
          <div className="aspect-[4/3] bg-[#3E5641]/10 flex items-center justify-center">
            {passport.imageUrl ? (
              <img
                src={passport.imageUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-16 h-16 text-[#3E5641]/40" />
            )}
          </div>
          <div className="p-6 space-y-3">
            <span
              className="inline-flex px-3 py-1.5 rounded-full text-sm font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.fg }}
            >
              {statusLabel(passport.status)}
            </span>
            <h1 className="text-3xl font-bold text-[#3E5641] leading-tight">
              {passport.name}
            </h1>
            {passport.category ? (
              <p className="text-lg text-[#2B2420]/80">{passport.category}</p>
            ) : null}
            <p className="text-sm text-[#2B2420]/60 break-all">
              {t("passport.passportId")}: {passport.passportId || passport.id}
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-[#2B2420]/10 p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#C1613C]/15 flex items-center justify-center shrink-0">
              {passport.artisan?.photoUrl ? (
                <img
                  src={passport.artisan.photoUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-[#C1613C]" />
              )}
            </div>
            <div>
              <p className="text-sm text-[#2B2420]/70">{t("passport.madeBy")}</p>
              <p className="text-xl font-bold">
                {passport.artisan?.name || "Artisan"}
              </p>
              {passport.artisan?.phoneVerified ? (
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#3E5641] mt-1">
                  <BadgeCheck className="w-4 h-4" />
                  {t("passport.verifiedArtisan")}
                </span>
              ) : null}
            </div>
          </div>
          {passport.region || passport.artisan?.region ? (
            <p className="inline-flex items-center gap-2 text-base text-[#2B2420]/80">
              <MapPin className="w-4 h-4" />
              {passport.region || passport.artisan?.region}
            </p>
          ) : null}
          {passport.cooperative?.name ? (
            <p className="text-base text-[#2B2420]/80">
              {t("passport.cooperative")}:{" "}
              <span className="font-semibold">{passport.cooperative.name}</span>
            </p>
          ) : null}
        </section>

        {passport.craftStory || passport.description ? (
          <section className="rounded-3xl border border-[#2B2420]/10 p-6">
            <div className="flex items-center gap-2 mb-3 text-[#C1613C]">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-bold text-[#2B2420]">
                {t("passport.craftStory")}
              </h2>
            </div>
            <p className="text-base leading-relaxed text-[#2B2420]/90 whitespace-pre-wrap">
              {passport.craftStory || passport.description}
            </p>
          </section>
        ) : null}

        {passport.materialsUsed ? (
          <section className="rounded-3xl border border-[#2B2420]/10 p-6">
            <h2 className="text-lg font-bold mb-2">{t("passport.materials")}</h2>
            <p className="text-base text-[#2B2420]/90">{passport.materialsUsed}</p>
          </section>
        ) : null}

        <section className="rounded-3xl border border-[#2B2420]/10 p-6 bg-white text-center">
          <h2 className="text-lg font-bold mb-4 text-[#3E5641]">
            {t("passport.scanAgain")}
          </h2>
          <QrCodeImage value={url} size={200} label="Passport QR" />
        </section>

        <div className="space-y-3">
          {reportMessage ? (
            <p
              className={`rounded-2xl px-4 py-3 text-base font-semibold text-center ${
                passport.status === "Reported"
                  ? "bg-[#A83E3E] text-[#FAF3E9]"
                  : "bg-[#3E5641] text-[#FAF3E9]"
              }`}
            >
              {reportMessage}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleReport}
            disabled={reporting || passport.status === "Reported"}
            className="w-full bg-[#A83E3E] text-[#FAF3E9] px-6 py-4 rounded-2xl text-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {reporting ? t("passport.reporting") : t("passport.reportItem")}
          </button>
        </div>
      </div>
    </div>
  );
}
