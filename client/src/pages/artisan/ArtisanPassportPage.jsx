import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ExternalLink,
  MapPin,
  Package,
  Sparkles,
  Trash2,
} from "lucide-react";
import { getArtisanProduct, deleteArtisanProduct } from "../../api/client";
import PassportMedia from "../../components/PassportMedia";
import PageHeader from "../../components/PageHeader";
import QrCodeImage from "../../components/QrCodeImage";
import {
  artisanPassportPath,
  getArtisanToken,
  passportPublicUrl,
  statusColors,
  statusLabel,
} from "../../utils/artisanAuth";

/** Artisan-only passport view (not the public QR page). */
export default function ArtisanPassportPage() {
  const { passportId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getArtisanToken();
    if (!token || !passportId) return;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getArtisanProduct(token, passportId);
        setPassport(data);
      } catch (err) {
        setError(err?.message || t("passport.notFound"));
      } finally {
        setLoading(false);
      }
    })();
  }, [passportId, t]);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${passport?.name}"? This cannot be undone.`)) {
      return;
    }
    const token = getArtisanToken();
    if (!token) return;

    setDeleting(true);
    try {
      await deleteArtisanProduct(token, passport.passportId || passport.id);
      navigate("/artisan/products");
    } catch (err) {
      alert(err?.message || "Failed to delete passport");
      setDeleting(false);
    }
  };

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
        <PageHeader fallback="/artisan/home" />
        <div className="px-6 py-16 text-center">
          <p className="text-2xl font-bold text-[#A83E3E] mb-4">
            {error || t("passport.notFound")}
          </p>
        </div>
      </div>
    );
  }

  const colors = statusColors(passport.status);
  const buyerUrl = passportPublicUrl(passport.passportId || passport.id);

  return (
    <div className="min-h-screen bg-[#FAF3E9] text-[#2B2420]">
      <PageHeader fallback="/artisan/products" />

      <div className="max-w-xl mx-auto px-6 pb-16 space-y-6">
        <div className="rounded-3xl overflow-hidden border border-[#2B2420]/10 bg-[#FAF3E9] shadow-sm">
            <PassportMedia
              passport={passport}
              mode="detail"
              className="w-full h-full object-cover"
            />
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

        {passport.region ? (
          <p className="inline-flex items-center gap-2 text-base text-[#2B2420]/80 px-2">
            <MapPin className="w-4 h-4" />
            {passport.region}
          </p>
        ) : null}

        <section className="rounded-3xl border border-[#2B2420]/10 p-6 bg-white text-center space-y-4">
          <h2 className="text-lg font-bold text-[#3E5641]">
            {t("passport.buyerView")}
          </h2>
          <QrCodeImage value={buyerUrl} size={200} label="Buyer QR" />
          <a
            href={buyerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full bg-[#3E5641] text-[#FAF3E9] px-6 py-4 rounded-2xl text-lg font-semibold"
          >
            <ExternalLink className="w-5 h-5" />
            {t("passport.previewQr")}
          </a>
        </section>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 w-full bg-[#A83E3E] text-[#FAF3E9] px-6 py-4 rounded-2xl text-lg font-semibold hover:bg-[#8A3232] transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-5 h-5" />
          {deleting ? "Deleting Passport..." : "Delete Passport"}
        </button>

        <Link
          to="/artisan/products"
          className="block text-center text-base font-semibold text-[#C1613C] hover:underline"
        >
          ← {t("artisanPortal.myProducts")}
        </Link>
      </div>
    </div>
  );
}
